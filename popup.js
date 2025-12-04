/* global chrome */

'use strict';

document.addEventListener(
	'DOMContentLoaded',
	function () {
		var ipElement = document.getElementById( 'ip' );
		var countryElement = document.getElementById( 'country' );
		var flagElement = document.getElementById( 'flag' );

		chrome.runtime.sendMessage(
			{ type: 'getIP' },
			function ( response ) {
				if ( chrome.runtime.lastError ) {
					if ( ipElement ) {
						ipElement.textContent = 'Unavailable';
					}

					if ( countryElement ) {
						countryElement.textContent = '';
					}

					if ( flagElement ) {
						flagElement.style.display = 'none';
					}

					return;
				}

				if ( response && response.ip ) {
					ipElement.textContent = response.ip;
				} else {
					ipElement.textContent = 'Not detected yet';
				}

				if ( countryElement ) {
					countryElement.textContent = response && response.country ? response.country : '';
				}

				if ( ! flagElement ) {
					return;
				}

				if ( response && response.countryCode ) {
					var countryCode = response.countryCode.toLowerCase();
					flagElement.src = chrome.runtime.getURL( 'flags/' + countryCode + '.png' );
					flagElement.alt = response.country || '';
					flagElement.style.display = 'inline-block';
				} else {
					flagElement.style.display = 'none';
				}
			}
		);
	}
);
