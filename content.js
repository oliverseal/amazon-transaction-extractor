// Amazon Transaction Extractor Content Script

(function() {
    'use strict';

    // wait for page to load completely
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => waitForElement(selector, callback), 100);
        }
    }

    // extract unique text values from transaction containers
    function extractFilterValues() {
        const containers = document.querySelectorAll('.apx-transactions-line-item-component-container');
        const values = new Set();

        containers.forEach(container => {
            const sections = container.querySelectorAll('.a-section');

            // find merchant text by looking for text that's not order number or amount
            let merchantText = '';
            sections.forEach(section => {
                const text = section.textContent.trim();

                // skip if it's order number, amount, or date
                if (!text.includes('Order #') &&
                    !text.includes('$') &&
                    !text.includes('Pending') &&
                    text.length > 0) {
                    merchantText = text;
                }
            });

            if (merchantText) {
                values.add(merchantText);
            }
        });

        return Array.from(values).sort();
    }

    // create dropdown filter
    function createDropdown() {
        // check if dropdown already exists
        if (document.getElementById('amazon-transaction-filter')) return;

        // try different selectors to find the right container
        let widgetSection = document.querySelector('.pmts-widget-section');
        if (!widgetSection) {
            widgetSection = document.querySelector('form[action*="yourpayments/transactions"]');
        }
        if (!widgetSection) {
            widgetSection = document.querySelector('.a-box-group');
        }
        if (!widgetSection) return;

        const filterContainer = document.createElement('div');
        filterContainer.id = 'amazon-transaction-filter';
        filterContainer.innerHTML = `
            <div style="margin-bottom: 10px; padding: 10px; background: #f0f0f0; border-radius: 4px;">
                <label for="transaction-filter" style="font-weight: bold; margin-right: 10px;">Filter by:</label>
                <select id="transaction-filter" style="padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
                    <option value="">All transactions</option>
                </select>
            </div>
        `;

        // insert at the top of the container
        widgetSection.insertBefore(filterContainer, widgetSection.firstChild);

        const select = document.getElementById('transaction-filter');
        const filterValues = extractFilterValues();

        filterValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });

        // add filter functionality
        select.addEventListener('change', function() {
            const selectedValue = this.value;
            const containers = document.querySelectorAll('.apx-transactions-line-item-component-container');

            containers.forEach(container => {
                const sections = container.querySelectorAll('.a-section');
                let shouldShow = true;

                if (selectedValue) {
                    // find merchant text in this container
                    let merchantText = '';
                    sections.forEach(section => {
                        const text = section.textContent.trim();
                        if (!text.includes('Order #') &&
                            !text.includes('$') &&
                            !text.includes('Pending') &&
                            !text.includes('September') &&
                            !text.includes('August') &&
                            text.length > 0) {
                            merchantText = text;
                        }
                    });

                    shouldShow = merchantText === selectedValue;
                }

                container.style.display = shouldShow ? 'block' : 'none';
            });
        });
    }

    // add preview button to order links
    function addPreviewButtons() {
        const links = document.querySelectorAll('a[href*="/gp/css/summary/edit.html?orderID="], a[href*="/gp/css/order-details?orderID="]');

        links.forEach(link => {
            // check if button already exists
            if (link.nextElementSibling && link.nextElementSibling.classList.contains('preview-button')) {
                return;
            }

            const button = document.createElement('button');
            button.textContent = '(Preview Items)';
            button.className = 'preview-button';
            button.style.cssText = `
                margin-left: 8px;
                padding: 2px 6px;
                font-size: 11px;
                background: #0073e6;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            `;

            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showOrderPreview(link.href);
            });

            link.parentNode.insertBefore(button, link.nextSibling);
        });
    }

    // show order preview popup
    function showOrderPreview(orderUrl) {
        // create popup container
        const popup = document.createElement('div');
        popup.id = 'order-preview-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #ccc;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333;">Order Items Preview</h3>
                <button id="close-preview" style="background: #ff4444; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer;">×</button>
            </div>
            <div id="preview-content" style="color: #666;">Loading...</div>
        `;

        document.body.appendChild(popup);

        // close button functionality
        document.getElementById('close-preview').addEventListener('click', function() {
            document.body.removeChild(popup);
        });

        // close on outside click
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                document.body.removeChild(popup);
            }
        });

        // fetch order details
        fetchOrderDetails(orderUrl, popup);
    }

    // fetch order details from the order page
    function fetchOrderDetails(orderUrl, popup) {
        fetch(orderUrl)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const items = [];

                // try different selectors for order details pages
                let itemContainers = doc.querySelectorAll('.a-fixed-left-grid-inner');

                // if no items found, try other common selectors
                if (itemContainers.length === 0) {
                    itemContainers = doc.querySelectorAll('[data-component="itemTitle"]');
                }

                itemContainers.forEach(container => {
                    let titleElement, priceElement;

                    if (container.querySelector) {
                        // if container is .a-fixed-left-grid-inner
                        titleElement = container.querySelector('[data-component="itemTitle"]');
                        priceElement = container.querySelector('[data-component="unitPrice"]');
                    } else {
                        // if container is the title element itself
                        titleElement = container;
                        priceElement = container.parentElement?.querySelector('[data-component="unitPrice"]');
                    }

                    if (titleElement && priceElement) {
                        // get visible price only (not the screen reader version)
                        const visiblePriceSpan = priceElement.querySelector('span[aria-hidden="true"]');
                        const priceText = visiblePriceSpan ? visiblePriceSpan.textContent.trim() : priceElement.textContent.trim();

                        items.push({
                            title: titleElement.textContent.trim(),
                            price: priceText
                        });
                    }
                });

                displayOrderItems(items, popup);
            })
            .catch(error => {
                console.error('Error fetching order details:', error);
                document.getElementById('preview-content').innerHTML =
                    '<p style="color: #ff4444;">Error loading order details. Please try again.</p>';
            });
    }

    // display order items in popup
    function displayOrderItems(items, popup) {
        const content = document.getElementById('preview-content');

        if (items.length === 0) {
            content.innerHTML = '<p>No items found in this order.</p>';
            return;
        }

        let html = '<div style="max-height: 300px; overflow-y: auto;">';
        items.forEach((item, index) => {
            html += `
                <div style="padding: 8px; border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                    <div style="font-weight: bold; margin-bottom: 4px;">${item.title}</div>
                    <div style="color: #0073e6; font-size: 14px;">${item.price}</div>
                </div>
            `;
        });
        html += '</div>';

        content.innerHTML = html;
    }

    // initialize when page loads
    function init() {
        // try different selectors to find the page
        const selectors = ['.pmts-widget-section', 'form[action*="yourpayments/transactions"]', '.a-box-group'];
        let foundSelector = null;

        for (let selector of selectors) {
            if (document.querySelector(selector)) {
                foundSelector = selector;
                break;
            }
        }

        if (!foundSelector) {
            waitForElement('.pmts-widget-section', function() {
                createDropdown();
                addPreviewButtons();
            });
            return;
        }

        waitForElement(foundSelector, function() {
            createDropdown();
            addPreviewButtons();

            // re-add preview buttons when new content loads
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        addPreviewButtons();
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
