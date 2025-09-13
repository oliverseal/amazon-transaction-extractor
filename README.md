# Amazon Transaction Extractor

A Firefox extension that adds filtering and preview features to Amazon payment transactions page.

## Features

- **Transaction Filtering**: Filter transactions by merchant type (AMZN Mktp US, Whole Foods, Prime Video, etc.)
- **Order Preview**: Click "(Preview Items)" buttons to see order details without leaving the page

## Installation

### Method 1: Temporary (Developer Mode)
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this folder

### Method 2: From Zip File
1. Download `amazon-transaction-extractor.zip`
2. Go to `about:addons` in Firefox
3. Click the gear icon → "Install Add-on From File..."
4. Select the zip file

## Usage

1. Navigate to https://www.amazon.com/cpe/yourpayments/transactions
2. Use the dropdown filter at the top to filter transactions by merchant
3. Click "(Preview Items)" buttons next to order links to see order details

## Development

- `manifest.json` - Extension configuration
- `content.js` - Main functionality
- `styles.css` - Styling

## License

MIT License - use however you want!
