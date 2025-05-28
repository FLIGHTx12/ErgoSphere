document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.getElementById('calculate-ducats');
    const summaryResultsDiv = document.getElementById('summary-results');
    const totalDucatsSpan = document.getElementById('total-ducats');

    const zoneInputs = [
        { id: 'zone1-time', multiplier: 1, name: 'Zone 1 (Low Intensity)' },
        { id: 'zone2-time', multiplier: 2, name: 'Zone 2 (Weight Control)' },
        { id: 'zone3-time', multiplier: 3, name: 'Zone 3 (Aerobic)' },
        { id: 'zone4-time', multiplier: 4, name: 'Zone 4 (Anaerobic)' },
        { id: 'zone5-time', multiplier: 5, name: 'Zone 5 (Maximum)' }
    ];

    if (calculateButton) {
        calculateButton.addEventListener('click', () => {
            let totalPayout = 0;
            let summaryHTML = '';

            zoneInputs.forEach(zone => {
                const timeInput = document.getElementById(zone.id);
                const time = parseInt(timeInput.value, 10) || 0;

                if (time < 0) {
                    summaryHTML += `<p class="error-message">Time for ${zone.name} cannot be negative. Please enter a valid time.</p>`;
                    timeInput.value = 0; // Reset negative value
                    // No payout for this zone if time is negative
                } else if (time > 0) {
                    const ducatsEarned = time * zone.multiplier;
                    totalPayout += ducatsEarned;
                    summaryHTML += `<p>${zone.name}: ${time} minutes x ${zone.multiplier} = <span class="accent-text">${ducatsEarned} Ducats</span></p>`;
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