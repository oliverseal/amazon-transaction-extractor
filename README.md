# Amazon Transaction Extractor

A browser extension that adds filtering and preview features to Amazon payment transactions page. Available for both Firefox and Chrome.

## Features

- **Transaction Filtering**: Filter transactions by merchant type (AMZN Mktp US, Whole Foods, Prime Video, etc.)
- **Order Preview**: Click "(Preview Items)" buttons to see order details without leaving the page

## Installation

### Firefox
#### Method 1: Temporary (Developer Mode)
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from the `firefox/` folder

#### Method 2: From Zip File
1. Download `amazon-transaction-extractor-firefox.zip`
2. Go to `about:addons` in Firefox
3. Click the gear icon → "Install Add-on From File..."
4. Select the zip file

### Chrome
#### Method 1: Developer Mode
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `chrome/` folder

#### Method 2: From Zip File
1. Download `amazon-transaction-extractor-chrome.zip`
2. Extract the zip file
3. Go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

## Usage

1. Navigate to https://www.amazon.com/cpe/yourpayments/transactions
2. Use the dropdown filter at the top to filter transactions by merchant
3. Click "(Preview Items)" buttons next to order links to see order details

## Development

### File Structure
```
amazon-transaction-extractor/
├── firefox/           # Firefox extension (manifest v2)
│   ├── manifest.json
│   ├── content.js
│   └── styles.css
├── chrome/            # Chrome extension (manifest v3)
│   ├── manifest.json
│   ├── content.js
│   └── styles.css
└── README.md
```

### Key Differences
- **Firefox**: Uses manifest v2 with permissions array
- **Chrome**: Uses manifest v3 with separate host_permissions and web_accessible_resources structure
- **Content Scripts**: Identical functionality in both versions

## License

MIT License - use however you want!
