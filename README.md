# **IP Flag Detector – Chrome Extension**

Displays your current public IP address, country, and country flag.
Automatically updates the extension icon to match the country of your detected IP.
A notification is shown when your IP changes.

---

## **Features**

* Shows your current public IP address in the popup.
* Detects your country and displays a flag next to it.
* Updates the **extension toolbar icon** to the country flag.
* Sends a notification when the IP changes.
* Optimized network usage:

  * Checks IP every 10 seconds
  * Only triggers geolocation lookup when the IP actually changes

---

## **File Structure**

```
/background.js
/popup.js
/popup.html
/manifest.json
/icon.png
/flags/
  us.png
  de.png
  tr.png
  ...
```

`/flags/` contains 128×128 square PNG flags named using lowercase ISO-2 codes.

---

## **Installation (Developer Mode)**

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the extension folder

The extension icon will immediately show your current country flag.

---

## **Notes**

* Uses **api.ipify.org** to fetch your current public IP.
* Uses **ipwho.is** *only* when the IP changes (geolocation).
* Designed to follow **WordPress JavaScript coding standards** (camelCase, 2-space indent, no arrow functions).

---

## **License**

This project is for personal use.
Flag icons © their respective authors (Flagpedia / 128×128 PNG versions).
