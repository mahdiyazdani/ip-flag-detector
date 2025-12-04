/* global chrome */

'use strict';

const CHECK_INTERVAL_SECONDS = 10;

let currentIp = null;
let currentCountry = '';
let currentCountryCode = '';
let hasGeoForCurrentIp = false;

/**
 * Keep the extension service worker alive.
 *
 * Calls a harmless Chrome API on an interval.
 */
function keepAlive() {
	setInterval(
		function () {
			chrome.runtime.getPlatformInfo(
				function () {
					// Intentionally empty.
				}
			);
		},
		20000
	);
}

chrome.runtime.onStartup.addListener( keepAlive );
chrome.runtime.onInstalled.addListener(
	function () {
		chrome.action.setBadgeText( { text: '' } );
	}
);

// Run once when the background script starts.
keepAlive();

/**
 * Update the extension icon to the country flag if available.
 *
 * @param {string} countryCode ISO 3166-1 alpha-2 code (e.g. "us", "de").
 */
function updateIconForCountry( countryCode ) {
	if ( ! countryCode ) {
		chrome.action.setIcon(
			{
				path: 'icon.png'
			}
		);

		return;
	}

	const flagPath = 'flags/' + countryCode + '.png';

	chrome.action.setIcon(
		{
			path: {
				16: flagPath,
				32: flagPath,
				48: flagPath,
				128: flagPath
			}
		}
	);
}

/**
 * Fetch geolocation data for the given IP.
 *
 * @param {string} ip IP address to look up.
 */
function fetchGeoForIp( ip ) {
	return fetch( 'https://ipwho.is/' + ip )
		.then(
			function ( response ) {
				if ( ! response.ok ) {
					throw new Error( 'Geo lookup failed with status ' + response.status );
				}

				return response.json();
			}
		);
}

/**
 * Fetch the current public IP.
 * Only when the IP changes, perform geolocation + update the icon.
 */
function checkIp() {
	fetch( 'https://api.ipify.org?format=json' )
		.then(
			function ( response ) {
				if ( ! response.ok ) {
					throw new Error( 'IP fetch failed with status ' + response.status );
				}

				return response.json();
			}
		)
		.then(
			function ( data ) {
				if ( ! data || ! data.ip ) {
					throw new Error( 'IP not found in ipify response.' );
				}

				const ip = data.ip;

				// If the IP did not change and we already have geo, skip.
				if ( currentIp === ip && hasGeoForCurrentIp ) {
					return null;
				}

				const previousIp = currentIp;
				currentIp = ip;
				hasGeoForCurrentIp = false;

				// Now fetch geolocation.
				return fetchGeoForIp( ip )
					.then(
						function ( geo ) {
							return {
								geo: geo,
								ip: ip,
								previousIp: previousIp
							};
						}
					);
			}
		)
		.then(
			function ( result ) {
				// null means no change.
				if ( ! result ) {
					return;
				}

				const geo = result.geo || {};
				const previousIp = result.previousIp;
				const ip = result.ip;

				const rawCountryCode = geo.country_code || '';
				const countryCode = rawCountryCode.toLowerCase();
				const country = geo.country || '';

				// Notify only if this is an actual change and not first load.
				if ( previousIp && previousIp !== ip ) {
					chrome.notifications.create(
						{
							type: 'basic',
							iconUrl: 'icon.png',
							title: 'IP Change Detected',
							message: 'Your IP has changed to ' + ip + ( country ? ' (' + country + ')' : '' )
						}
					);
				}

				currentCountry = country;
				currentCountryCode = countryCode;
				hasGeoForCurrentIp = true;

				updateIconForCountry( countryCode );
			}
		)
		.catch(
			function ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'IP check error:', error );
			}
		);
}

// Initial check and repeating interval.
checkIp();
setInterval( checkIp, CHECK_INTERVAL_SECONDS * 1000 );

/**
 * Handle popup messages.
 */
chrome.runtime.onMessage.addListener(
	function ( request, sender, sendResponse ) {
		if ( request.type === 'getIP' ) {
			sendResponse(
				{
					ip: currentIp,
					country: currentCountry,
					country_code: currentCountryCode
				}
			);
		}

		return true;
	}
);