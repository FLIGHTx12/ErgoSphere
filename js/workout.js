document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.getElementById('calculate-ducats');
    const summaryResultsDiv = document.getElementById('summary-results');
    const totalDucatsSpan = document.getElementById('total-ducats');

    // Order reversed to match HTML and desired display order in summary
    const zoneInputs = [
        { id: 'zone5-time', multiplier: 5, name: 'Zone 5 (Maximum)' },
        { id: 'zone4-time', multiplier: 4, name: 'Zone 4 (Anaerobic)' },
        { id: 'zone3-time', multiplier: 3, name: 'Zone 3 (Aerobic)' },
        { id: 'zone2-time', multiplier: 2, name: 'Zone 2 (Weight Control)' },
        { id: 'zone1-time', multiplier: 1, name: 'Zone 1 (Low Intensity)' }
    ];

    if (calculateButton) {
        calculateButton.addEventListener('click', () => {
            let totalPayout = 0;
            let summaryHTML = '';

            zoneInputs.forEach(zone => {
                const timeInput = document.getElementById(zone.id);
                // Use parseFloat to handle decimals, then Math.ceil to round up.
                const time = Math.ceil(parseFloat(timeInput.value) || 0);

                if (parseFloat(timeInput.value) < 0) { // Check original value for negativity
                    summaryHTML += `<p class="error-message">Time for ${zone.name} cannot be negative. Please enter a valid time.</p>`;
                    timeInput.value = '0'; // Reset negative value
                } else if (time > 0) {
                    const ducatsEarned = time * zone.multiplier;
                    totalPayout += ducatsEarned;
                    summaryHTML += `<p>${zone.name}: ${timeInput.value} (rounds to ${time}) minutes x ${zone.multiplier} = <span class="accent-text">${ducatsEarned} Ducats</span></p>`;
                }
            });

            if (summaryHTML === '') {
                summaryHTML = '<p>No time entered for any zone.</p>';
            }

            summaryResultsDiv.innerHTML = summaryHTML;
            totalDucatsSpan.textContent = totalPayout;
        });
    } else {
        console.error("Calculate button not found.");
    }
});