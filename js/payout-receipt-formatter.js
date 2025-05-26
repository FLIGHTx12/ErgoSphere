/**
 * Payout Receipt Formatter
 * Enhances the layout of payout receipts to match the desired design
 */

document.addEventListener('DOMContentLoaded', () => {
    // Observer to watch for new payout receipts being added to the document
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('payout-receipt')) {
                        enhancePayoutReceipt(node);
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Function to enhance the layout of a payout receipt
    function enhancePayoutReceipt(receiptElement) {
        // Fix bet list item layout
        const betItems = receiptElement.querySelectorAll('.bet-details li');
        betItems.forEach(item => {
            // Mark winning bets
            if (item.textContent.includes('WON')) {
                item.classList.add('bet-won');
            }
            
            // Set optimal height for list items
            item.style.minHeight = '30px';
            
            // Adjust bet text and status positioning
            const betText = item.querySelector('.bet-text');
            const betStatus = item.querySelector('.bet-status');
            
            if (betText && betStatus) {
                betText.style.fontSize = '0.95em';
                
                // Make WON indicator more prominent
                const wonIndicator = betStatus.querySelector('b');
                if (wonIndicator && wonIndicator.textContent === 'WON') {
                    wonIndicator.style.backgroundColor = 'rgba(0, 180, 0, 0.7)';
                }
                
                // Make bet amounts more styled
                const betAmounts = betStatus.querySelector('div');
                if (betAmounts) {
                    betAmounts.style.textAlign = 'right';
                }
            }
        });
        
        // Enhance the payout value styling
        const payoutValue = receiptElement.querySelector('.payout-value');
        if (payoutValue) {
            payoutValue.style.fontWeight = 'bold';
            payoutValue.style.fontStyle = 'italic';
            payoutValue.style.letterSpacing = '0.5px';
        }
    }
});
