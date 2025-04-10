let choices = [];
let currentPool = 'LOOT';
let currentCycleId = null;
let spinning = false;
let stopInitiated = false;
let delay = 1000;
let rampStartTime = null;
let powerDownPlayed = false; // Add this with other state variables at the top
let currentlyDisplayedChoice = null; // Add this with other state variables at top
let godParticles = 0; // Current amount of God Particles the user has
let isSelectingParticles = false; // Flag to track if we're in particle selection mode
let isSubsequentSpin = false; // Track if this is a subsequent spin
let probabilityBoosts = {}; // Track probability boosts

const choiceDisplay = document.getElementById("choice-display");
const choiceImage = document.getElementById("choice-image");
const choiceText = document.getElementById("choice-text");
const controlButton = document.getElementById("control-button");
const rewardDisplay = document.getElementById("reward-display");
const staticRewards = document.getElementById("static-rewards");
const choiceContent = document.getElementById("choice-content");
const lootButton = document.getElementById("loot-button");
const pvpButton = document.getElementById("pvp-button");
const coopButton = document.getElementById("coop-button");
const godParticlesCounter = document.getElementById("god-particles-count");
const spinsRemainingDisplay = document.getElementById("spins-remaining-display");
const particlesInputModal = document.getElementById("particles-input-modal");
const particlesInput = document.getElementById("particles-input");
const confirmParticlesBtn = document.getElementById("confirm-particles");
const cancelParticlesBtn = document.getElementById("cancel-particles");
const acceptButton = document.getElementById("accept-button");

const AUDIO = {
    click: new Audio('../assets/audio/click.mp3'),
    cycle: new Audio('../assets/audio/cycle.mp3'),
    slowdown: new Audio('../assets/audio/slowdown.mp3'),
    popup: new Audio('../assets/audio/popup.mp3'),
    spinUp: new Audio('../assets/audio/HCMC spin up.mp3'),
    powerDown: new Audio('../assets/audio/Power down.mp3'), // Add power down sound
    mouseClick: new Audio('../assets/audio/mouse-click-normal.mp3'),
    hazzard: new Audio('../assets/audio/hazzard.mp3'),
    helper: new Audio('../assets/audio/healer.mp3'),
    weekMod: new Audio('../assets/audio/Week Mod.mp3'),
    want: new Audio('../assets/audio/happy-logo-13397.mp3')
};

// Initialize audio settings
Object.values(AUDIO).forEach(audio => {
    audio.preload = 'auto';
    audio.volume = 0.5;
});

function playSound(soundName) {
    const sound = AUDIO[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Update the click sound to include both sounds
function playClickSounds() {
    playSound('mouseClick');
    playSound('click');
}

// Add the missing stopAllAudio function
function stopAllAudio() {
    Object.values(AUDIO).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

// Improve loadChoices with better error handling
function loadChoices(pool) {
    console.log(`Loading choices for pool: ${pool}`);
    resetCycle();
    currentPool = pool.toUpperCase();
    currentCycleId = Math.random();
    
    return fetch(`../data/${pool}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${pool}.json: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(async data => {
            console.log(`Successfully loaded ${data.length} choices for pool ${pool}`);
            choices = data;
            await preloadAllImages(choices);
            populateStaticRewards();
        })
        .catch(error => {
            console.error('Error loading choices:', error);
            alert(`Failed to load ${pool} data. Please check the console for more information.`);
        });
}

function createInfoOverlay(choice) {
    const overlay = document.createElement('div');
    overlay.className = 'info-overlay';
    
    // Create HTML content based on available choice properties
    let content = `<h4>${choice.text}</h4>`;
    
    // Add each available property to the overlay
    const properties = [
        { key: 'mode', label: 'Mode' },
        { key: 'details', label: 'Details' },
        { key: 'genre', label: 'Genre' },
        { key: 'type', label: 'Type' },
        { key: 'cost', label: 'Cost' },
        { key: 'console', label: 'Console' },
        { key: 'time to beat', label: 'Time to Beat' },
        { key: 'owned', label: 'Owned', transform: val => val ? 'Yes' : 'No' },
        { key: 'completed', label: 'Completed', transform: val => val ? 'Yes' : 'No' },
        { key: 'after spin', label: 'After Spin' }
    ];

    content += properties
        .filter(prop => choice[prop.key] !== undefined && choice[prop.key] !== '')
        .map(prop => {
            const value = prop.transform ? prop.transform(choice[prop.key]) : choice[prop.key];
            return `<p><strong>${prop.label}:</strong> ${value}</p>`;
        })
        .join('');

    overlay.innerHTML = content;
    return overlay;
}

function populateStaticRewards() {
    // Calculate total copies for percentage calculations (still needed for info display)
    const totalCopies = choices.reduce((sum, choice) => sum + Math.max(0, choice.copies || 0), 0);
    
    staticRewards.innerHTML = `<h3 style="text-align: center;">Available Rewards: ${currentPool}</h3><hr><ul>` +
        choices.filter(choice => choice.copies > 0)
            .map(choice => {
                const boostBadge = probabilityBoosts[choice.text] ? 
                    `<span class="boost-badge">+${probabilityBoosts[choice.text] * 5}%</span>` : '';
                    
                return `<li class="reward-item" data-text="${choice.text.trim()}">
                    <div class="reward-content">
                        ${choice.text.trim()}
                        <br>
                        <span style="font-size: 0.3em;">${'🟢'.repeat(choice.copies)}</span>
                        ${boostBadge}
                    </div>
                    <button class="boost-btn" data-text="${choice.text.trim()}" title="Boost chance (+5%) - Costs 0.5 GP">+</button>
                </li>`;
            })
            .join("") +
        "</ul>" +
        `<select id="filter-dropdown">
            <option value="active">Active</option>
            <option value="selectable">Selectable</option>
            <option value="wants">Wants</option>
            <option value="modifiers">Modifiers</option>
            <option value="helpers">Helpers</option>
            <option value="hazzards">Hazzards</option>
        </select>`;
    staticRewards.style.fontSize = ".6em";

    document.getElementById("filter-dropdown").addEventListener("change", filterChoices);

    // Add click handler for reward items that also shows preview
    staticRewards.querySelectorAll('.reward-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if the boost button was clicked
            if (e.target.classList.contains('boost-btn')) return;
            
            const choice = choices.find(c => c.text === item.dataset.text);
            if (choice) {
                // First, highlight this item
                syncChoiceAndReward(choice);
                
                // Then show the detailed info
                showRewardInfo(choice);
                
                // Only show image preview if not spinning
                if (!spinning && !stopInitiated) {
                    choiceImage.style.display = "block";
                }
            }
        });
    });
    
    // Add click handlers for boost buttons
    staticRewards.querySelectorAll('.boost-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering parent click
            const itemText = btn.dataset.text;
            boostProbability(itemText);
        });
    });
}

function showRewardInfo(choice) {
    const infoDisplay = document.getElementById('reward-info-display');
    const infoContent = document.getElementById('reward-info-content');
    
    // Get image URL from choice
    let backgroundImageUrl;
    if (choice.image) {
        if (Array.isArray(choice.image)) {
            backgroundImageUrl = normalizePath(choice.image[0]); // Use first image if array
        } else {
            backgroundImageUrl = normalizePath(choice.image);
        }
    } else if (choice.imageUrl) {
        backgroundImageUrl = choice.imageUrl;
    }
    
    // Set background image
    if (backgroundImageUrl) {
        infoDisplay.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${backgroundImageUrl}')`;
        infoDisplay.style.backgroundSize = 'cover';
        infoDisplay.style.backgroundPosition = 'center';
    } else {
        infoDisplay.style.backgroundImage = 'none';
    }

    // Add title and copies information
    let titleContent = choice.text;
    if (choice.link && choice.link.trim() !== '') {
        titleContent = `<a href="${choice.link}" target="_blank" style="color: #4CAF50; text-decoration: none; hover: underline;">${choice.text}</a>`;
    }
    
    // Add copies information with percentage chance
    const totalCopies = choices.reduce((sum, c) => sum + Math.max(0, c.copies || 0), 0);
    const percentage = totalCopies > 0 ? ((choice.copies || 0) / totalCopies * 100).toFixed(2) : 0;
    let content = `<h4>${titleContent}</h4>`;
    content += `<p><strong>Copies:</strong> ${choice.copies || 0} (${percentage}% chance)</p>`;
    
    // Add details if available
    if (choice.details && choice.details.trim() !== '') {
        content += `<p><strong>Details:</strong> ${choice.details}</p>`;
    }
    
    // Add cost if available
    if (choice.cost && choice.cost.trim() !== '') {
        content += `<p><strong>Cost:</strong> ${choice.cost}</p>`;
    }
    
    // Add genre-specific information 
    if (choice.genre === 'ERGOvillians' && choice.Escape) {
        content += `<p><strong>Escape Cost:</strong> ${choice.Escape}</p>`;
    }

    // Add description if available
    if (choice.description && choice.description.trim() !== '') {
        content += `<p><strong>Description:</strong> ${choice.description}</p>`;
    }

    // Add reward if available
    if (choice.reward && choice.reward.trim() !== '') {
        content += `<p><strong>Reward:</strong> ${choice.reward}</p>`;
    }

    // Add punishment if available
    if (choice.punishment && choice.punishment.trim() !== '') {
        content += `<p><strong>Punishment:</strong> ${choice.punishment}</p>`;
    }

    // Rest of properties display (removing 'details' and 'cost' from the list since they're displayed above)
    const properties = [
        { key: 'mode', label: 'Mode' },
        { key: 'genre', label: 'Genre' },
        { key: 'type', label: 'Type' },
        // Removed 'cost' from here since we're showing it explicitly above
        { key: 'console', label: 'Console' },
        { key: 'time to beat', label: 'Time to Beat' },
        { key: 'owned', label: 'Owned', transform: val => val ? 'Yes' : 'No' },
        { key: 'completed', label: 'Completed', transform: val => val ? 'Yes' : 'No' },
        { key: 'after spin', label: 'After Spin' }
    ];

    content += properties
        .filter(prop => choice[prop.key] !== undefined && choice[prop.key] !== '')
        .map(prop => {
            const value = prop.transform ? prop.transform(choice[prop.key]) : choice[prop.key];
            return `<p><strong>${prop.label}:</strong> ${value}</p>`;
        })
        .join('');

    infoContent.innerHTML = content;
    infoDisplay.classList.remove('hidden');
}

// Add close button handler
document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('reward-info-display').classList.add('hidden');
});

function filterChoices() {
    resetCycle();
    const filterValue = document.getElementById("filter-dropdown").value;
    let filteredChoices = choices;

    switch (filterValue) {
        case "active":
            filteredChoices = choices.filter(choice => 
                choice.copies > 0 && choice.text.trim() !== '');
            break;
        case "selectable":
            filteredChoices = choices.filter(choice => 
                choice.copies === 0 && choice.text.trim() !== '');
            break;
        case "wants":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'want');
            break;
        case "modifiers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'week modifiers');
            break;
        case "helpers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'helper');
            break;
        case "hazzards":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'hazzard');
            break;
        default:
            filteredChoices = choices.filter(choice => choice.copies > 0);
    }

    // Calculate total copies for percentage calculations (still needed for info display)
    const totalCopies = filteredChoices.reduce((sum, choice) => sum + Math.max(0, choice.copies || 0), 0);

    staticRewards.querySelector("ul").innerHTML = filteredChoices
        .map(choice => {
            const boostBadge = probabilityBoosts[choice.text] ? 
                `<span class="boost-badge">+${probabilityBoosts[choice.text] * 5}%</span>` : '';
                
            return `<li class="reward-item" data-text="${choice.text}">
                <div class="reward-content">
                    ${choice.text}
                    <br>
                    <span style="font-size: 0.3em;">${'🟢'.repeat(choice.copies)}</span>
                    ${boostBadge}
                </div>
                <button class="boost-btn" data-text="${choice.text}" title="Boost chance (+5%) - Costs 0.5 GP">+</button>
            </li>`;
        })
        .join("");
        
    // Re-add click handlers for boost buttons after filtering
    staticRewards.querySelectorAll('.boost-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering parent click
            const itemText = btn.dataset.text;
            boostProbability(itemText);
        });
    });
    
    // Re-add click handlers for items
    staticRewards.querySelectorAll('.reward-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if the boost button was clicked
            if (e.target.classList.contains('boost-btn')) return;
            
            const choice = choices.find(c => c.text === item.dataset.text);
            if (choice) {
                syncChoiceAndReward(choice);
                showRewardInfo(choice);
                if (!spinning && !stopInitiated) {
                    choiceImage.style.display = "block";
                }
            }
        });
    });
}

// Add function to boost probability
function boostProbability(itemText) {
    // Check if user has enough God Particles
    if (godParticles < 0.5) {
        alert("Not enough God Particles! You need 0.5 GP to boost an item.");
        return;
    }
    
    // Deduct particles
    godParticles -= 0.5;
    updateGodParticlesDisplay();
    saveGodParticles();
    
    // Add boost (each level adds 5% chance)
    probabilityBoosts[itemText] = (probabilityBoosts[itemText] || 0) + 1;
    
    // Play a sound
    playSound('click');
    
    // Refresh the display
    if (document.getElementById("filter-dropdown")) {
        filterChoices();
    } else {
        populateStaticRewards();
    }
}

// Add a new function to synchronize image and active reward
function syncChoiceAndReward(choice) {
    if (!choice) return;
    
    // Update the active item in the sidebar
    updateActiveReward(choice);
    
    // Store the current choice for reference
    currentlyDisplayedChoice = choice;
    
    // Update the displayed image based on state
    if (spinning || stopInitiated) {
        updateChoiceImage(choice);
    } else {
        // When not spinning, show the image clearly
        displayFinalImage(choice);
    }
}

// Fix the displayFinalImage function to always use 50% opacity
function displayFinalImage(choice) {
    if (!choice) return;
    
    const imageUrl = getRandomImage(choice);
    if (!imageUrl) return;
    
    // Ensure immediate display without fading
    choiceImage.src = imageUrl;
    choiceImage.style.display = "block";
    choiceImage.style.opacity = "0.5"; // Always 50% opacity until explicitly accepted
    lastImageUrl = imageUrl;
}

// Modify the updateChoiceImage function to use consistent opacity
async function updateChoiceImage(choice) {
    if (currentlyLoading) return; // Prevent multiple simultaneous updates
    
    try {
        currentlyLoading = true;
        const imageUrl = getRandomImage(choice);
        
        // Skip if no image
        if (!imageUrl) {
            currentlyLoading = false;
            return;
        }
        
        // Wait for image to load
        await preloadImage(imageUrl);
        
        // Show image with appropriate opacity based on state
        choiceImage.style.opacity = '0';
        setTimeout(() => {
            choiceImage.style.display = "block";
            choiceImage.src = imageUrl;
            
            // Always use 50% opacity
            choiceImage.style.opacity = '0.5';
            lastImageUrl = imageUrl;
        }, 100);
    } catch (error) {
        console.error('Error updating choice image:', error);
        choiceImage.style.display = "none"; // Hide image on error
    } finally {
        currentlyLoading = false;
    }
}

// Update accept button event listener to remove all God Particles
acceptButton.addEventListener("click", () => {
    playClickSounds();
    if (currentlyDisplayedChoice) {
        // Show the image at full opacity when accepted
        choiceImage.style.opacity = '1.0';
        
        // Remove all God Particles when accepting a choice
        godParticles = 0;
        updateGodParticlesDisplay();
        saveGodParticles();
        
        // Reset probability boosts
        probabilityBoosts = {};
        
        showOptionPopup(currentlyDisplayedChoice);
        acceptButton.classList.add('hidden');
        // Reset for next spin
        controlButton.textContent = "Start";
        currentlyDisplayedChoice = null;
        
        // Reset the subsequent spin flag for the next game
        isSubsequentSpin = false;
    }
});

function selectWeightedChoice(choices) {
    // Create array of choices where each copy is a separate instance
    const weightedArray = choices.reduce((acc, choice) => {
        let copies = Math.max(0, choice.copies || 0);
        
        // Add 15% more copies if this was the displayed choice when stopping
        if (stopInitiated && currentlyDisplayedChoice && 
            choice.text === currentlyDisplayedChoice.text) {
            copies = Math.ceil(copies * 1.15); // 15% more copies
        }
        
        // Add boost if any
        const boostFactor = probabilityBoosts[choice.text] || 0;
        if (boostFactor > 0) {
            copies = copies * (1 + (boostFactor * 0.05)); // 5% boost per level
        }
        
        // Add this choice to array once for each copy
        for (let i = 0; i < copies; i++) {
            acc.push(choice);
        }
        return acc;
    }, []);

    if (weightedArray.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * weightedArray.length);
    return weightedArray[randomIndex];
}

function updateActiveReward(currentChoice) {
    const rewardItems = staticRewards.querySelectorAll(".reward-item");
    rewardItems.forEach(item => item.classList.remove("active"));
    const activeItem = staticRewards.querySelector(`.reward-item[data-text="${currentChoice.text}"]`);
    if (activeItem) activeItem.classList.add("active");
}

function updateVibrationIntensity() {
    if (!spinning) return;
    
    const timeSinceStart = Date.now() - rampStartTime;
    const baseIntensity = 8.8; // Starting duration in seconds
    const minIntensity = 0.05; // Fastest vibration duration
    
    // Create exponential decrease over time
    const timeRatio = Math.min(timeSinceStart / 30000, 1); // 30 seconds to reach max intensity
    const newDuration = baseIntensity * Math.pow(0.1, timeRatio);
    
    // Clamp the duration between min and baseIntensity
    const clampedDuration = Math.max(minIntensity, Math.min(baseIntensity, newDuration));
    document.body.style.animationDuration = `${clampedDuration}s`;
}

function startVibration() {
    rampStartTime = Date.now();
    setTimeout(() => {
        document.body.classList.add('vibrating');
        document.body.style.animationDuration = '8.8s'; // Start very slow
    }, 2000); // 5 second delay before vibration starts
}

function stopVibration() {
    document.body.classList.remove('vibrating');
    document.body.style.animationDuration = '';
}

function showFlashEffect() {
    document.body.classList.add('flashing');
    setTimeout(() => {
        document.body.classList.remove('flashing');
    }, 7000); // Total flash effect duration (3s intense + 4s fade)
}

function getRandomImage(choice) {
    if (!choice || (!choice.image && !choice.imageUrl)) {
        console.warn('No image found for choice:', choice);
        return null;
    }
    
    if (choice.imageUrl) return choice.imageUrl;
    
    if (Array.isArray(choice.image)) {
        if (choice.image.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * choice.image.length);
        return normalizePath(choice.image[randomIndex]);
    }
    return normalizePath(choice.image);
}

function normalizePath(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('../') ? path : `../${path.replace(/^\.\.\//, '')}`;
}

// Expand imageCache system to handle all types of images
const imageCache = new Map();
let lastImageUrl = null;
let currentlyLoading = false;
const backgroundImages = [
    "../assets/img/backgrounds/CERN_detailed.jpeg",
    "../assets/img/backgrounds/Hadron_Collider_inside.jpg",
    "../assets/img/backgrounds/Hadron_Collider_Pipe.jpg",
    "../assets/img/backgrounds/classicBlackHole.jpg",
    "../assets/img/backgrounds/mixingGalaxy.jpg"
];

function preloadImage(url) {
    if (!url) return Promise.reject(new Error('No image URL provided'));
    if (imageCache.has(url)) {
        return imageCache.get(url);
    }

    const img = new Image();
    const promise = new Promise((resolve, reject) => {
        img.onload = () => {
            imageCache.set(url, img);
            resolve(url);
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            imageCache.delete(url);
            reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
    });
    imageCache.set(url, promise);
    return promise;
}

async function preloadAllImages(choices) {
    const urls = new Set();
    
    // Add background images
    backgroundImages.forEach(url => urls.add(url));
    
    // Add all choice images
    choices.forEach(choice => {
        if (choice.imageUrl) {
            urls.add(choice.imageUrl);
        }
        if (choice.image) {
            if (Array.isArray(choice.image)) {
                choice.image.forEach(url => urls.add(normalizePath(url)));
            } else {
                urls.add(normalizePath(choice.image));
            }
        }
    });

    // Preload all images concurrently
    const preloadPromises = Array.from(urls).map(url => preloadImage(url));
    try {
        await Promise.allSettled(preloadPromises);
    } catch (error) {
        console.warn('Some images failed to preload:', error);
    }
}

// Improve image preloading system
async function updateChoiceImage(choice) {
    if (currentlyLoading) return; // Prevent multiple simultaneous updates
    
    try {
        currentlyLoading = true;
        const imageUrl = getRandomImage(choice);
        
        // Skip if same image or no image
        if (!imageUrl || imageUrl === lastImageUrl) {
            currentlyLoading = false;
            return;
        }
        
        // Wait for image to load
        await preloadImage(imageUrl);
        
        // Only update if we're still spinning
        if (spinning || stopInitiated) {
            choiceImage.style.opacity = '0';
            setTimeout(() => {
                choiceImage.style.display = "block";
                choiceImage.src = imageUrl;
                choiceImage.style.opacity = '0.5';
                lastImageUrl = imageUrl;
            }, 100);
        }
    } catch (error) {
        console.error('Error updating choice image:', error);
        choiceImage.style.display = "none"; // Hide image on error
    } finally {
        currentlyLoading = false;
    }
}

// Update the control button click handler for different costs
controlButton.addEventListener("click", () => {
    // Calculate required particles
    const requiredParticles = isSubsequentSpin ? 3 : 2;
    
    if (controlButton.classList.contains('disabled')) {
        alert(`You need at least ${requiredParticles} God Particles to spin again!`);
        return;
    }
    
    if (!spinning && !stopInitiated) {
        // Starting a new spin - check if user has enough GP
        if (godParticles >= requiredParticles) {
            // Deduct appropriate God Particles and start spinning
            godParticles -= requiredParticles;
            updateGodParticlesDisplay();
            saveGodParticles();
            
            playClickSounds();
            playSound('spinUp');
            resetCycle();
            
            // These flags should be set AFTER resetCycle to ensure proper start
            spinning = true;
            startVibration();
            controlButton.textContent = "Stop";
            controlButton.classList.add('stopping');
            acceptButton.classList.add('hidden');
            
            // Use a timeout before starting spin to ensure UI updates first
            setTimeout(() => {
                const cycleId = currentCycleId;
                spin(cycleId);
            }, 100);
        } else {
            // Not enough GP
            alert(`You need at least ${requiredParticles} God Particles to spin!`);
        }
    } else if (spinning) {
        // User pressed Stop during spinning - initiate slowdown
        stopInitiated = true;
        rampStartTime = Date.now();
        playClickSounds();
        
        // Set the flag for subsequent spin
        isSubsequentSpin = true;
        
        // Stop all audio except click sounds - but DON'T stop power down which we need
        Object.entries(AUDIO).forEach(([key, audio]) => {
            if (!['mouseClick', 'click', 'powerDown'].includes(key)) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        controlButton.textContent = "Stopping...";
    }
    // Button does nothing in other states
});

// Update utility function to consider different required particle counts
function updateButtonStates() {
    // Calculate required particles for current state
    const requiredParticles = isSubsequentSpin ? 3 : 2;
    
    // Only show Spin Again if we have enough God Particles
    if (godParticles >= requiredParticles && !spinning && !stopInitiated && currentlyDisplayedChoice) {
        controlButton.textContent = "Spin Again";
        controlButton.classList.remove('hidden');
        controlButton.classList.remove('disabled');
    } else if (!spinning && !stopInitiated && currentlyDisplayedChoice) {
        // If we have a choice but not enough particles, show disabled button
        controlButton.textContent = `Need ${requiredParticles} Particles`;
        controlButton.classList.add('disabled');
    } else if (!spinning && !stopInitiated) {
        // Default state - no spin in progress, no choice selected
        controlButton.textContent = "Start";
        controlButton.classList.remove('disabled');
    }
}

// Simplify how we handle the spin completion
function spin(cycleId) {
    if (cycleId !== currentCycleId) return;

    // Add debug logging to help diagnose issues
    console.log("Spinning with cycle ID:", cycleId);
    
    const filterValue = document.getElementById("filter-dropdown").value;
    let filteredChoices = choices;

    // Filter choices based on dropdown selection
    switch (filterValue) {
        case "active":
            filteredChoices = choices.filter(choice => 
                choice.copies > 0 && choice.text?.trim() !== '');
            break;
        case "selectable":
            filteredChoices = choices.filter(choice => 
                choice.copies === 0 && choice.text?.trim() !== '');
            break;
        case "wants":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'want');
            break;
        case "modifiers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'week modifiers');
            break;
        case "helpers":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'helper');
            break;
        case "hazzards":
            filteredChoices = choices.filter(choice => 
                choice.genre?.toLowerCase() === 'hazzard');
            break;
        default:
            filteredChoices = choices.filter(choice => choice.copies > 0);
    }

    // Check if we have any valid choices - improved error handling
    if (!filteredChoices || filteredChoices.length === 0) {
        console.error("No valid choices found for spinning");
        resetCycle();
        alert("No choices available in current filter!");
        return;
    }

    // Ensure we have valid choices with copies > 0
    const hasValidChoices = filteredChoices.some(choice => choice.copies > 0);
    if (!hasValidChoices) {
        console.error("No choices with copies > 0");
        resetCycle();
        alert("No choices with copies available in current filter!");
        return;
    }

    const choice = selectWeightedChoice(filteredChoices);
    if (!choice) {
        console.error("selectWeightedChoice returned null");
        resetCycle();
        return;
    }

    // Replace these three lines:
    // currentlyDisplayedChoice = choice;
    // updateChoiceImage(choice);
    // updateActiveReward(choice);
    
    // With the new synchronized function:
    syncChoiceAndReward(choice);

    if (spinning && !stopInitiated) {
        // Normal spinning - continue at increasing speed
        playSound('cycle');
        delay = delay * 0.98; // Speed up slightly
        powerDownPlayed = false; // Reset flag when spinning
        updateVibrationIntensity();
        setTimeout(() => spin(cycleId), delay);
    } else if (stopInitiated) {
        if (Date.now() - rampStartTime < 5000) {
            // During slowdown period
            if (!powerDownPlayed) {
                // Play power down sound once
                playSound('powerDown');
                powerDownPlayed = true;
                showFlashEffect();
                stopVibration();
            }
            
            // Slow down spin rate
            delay = delay * 1.2;
            setTimeout(() => spin(cycleId), delay);
        } else {
            // After the 5-second slowdown period, fully stop
            spinning = false;
            stopInitiated = false;
            
            // Make sure the final image is displayed with 50% opacity
            displayFinalImage(choice);
            
            // Play genre-specific sound before showing popup
            if (choice.genre) {
                const genreSound = {
                    'hazzard': 'hazzard',
                    'helper': 'helper',
                    'week modifiers': 'weekMod',
                    'want': 'want'
                }[choice.genre.toLowerCase()];
                
                if (genreSound) {
                    playSound(genreSound);
                }
            }
            
            // Always show the accept button
            acceptButton.classList.remove('hidden');
            
            // Only show "Spin Again" if we have enough God Particles
            const requiredParticles = isSubsequentSpin ? 3 : 2;
            if (godParticles >= requiredParticles) {
                controlButton.textContent = "Spin Again";
                controlButton.classList.remove('disabled');
            } else {
                controlButton.textContent = `Need ${requiredParticles} Particles`;
                controlButton.classList.add('disabled');
            }
            
            controlButton.classList.remove('stopping');
        }
    }
}

// Add the missing saveGodParticles function
function saveGodParticles() {
    localStorage.setItem('godParticles', godParticles);
}

// Reset isSubsequentSpin flag when starting fresh
function resetCycle() {
    spinning = false;
    stopInitiated = false;
    delay = 1000;
    rampStartTime = null;
    choiceImage.src = "";
    choiceImage.style.display = "none";
    choiceText.textContent = "";
    controlButton.textContent = "Start";
    controlButton.classList.remove('stopping');
    acceptButton.classList.add('hidden');
    
    const rewardItems = staticRewards.querySelectorAll(".reward-item");
    rewardItems.forEach(item => item.classList.remove("active"));
    
    const existingPopup = document.getElementById("optionPopup");
    if (existingPopup) {
        existingPopup.remove();
    }
    powerDownPlayed = false; // Reset the flag when resetting cycle
    stopVibration();
    imageCache.clear();
    lastImageUrl = null;
    currentlyLoading = false; // Reset loading state
    choiceImage.style.opacity = '0';
    currentlyDisplayedChoice = null; // Reset the tracked choice
    
    // Only reset subsequent spin flag if no choice is displayed
    if (!currentlyDisplayedChoice) {
        isSubsequentSpin = false;
    }
    
    // Only clear boosts if no choice is displayed (e.g., on pool change)
    if (!currentlyDisplayedChoice) {
        probabilityBoosts = {};
    }
    
    // Always keep spins remaining hidden
    spinsRemainingDisplay.classList.add('hidden');
    updateButtonStates(); // Update button states after reset
}

async function capturePopupScreenshot(element) {
    try {
        // Show loading toast
        const loadingToast = document.createElement('div');
        loadingToast.textContent = 'Capturing screenshot...';
        loadingToast.style.position = 'fixed';
        loadingToast.style.bottom = '20px';
        loadingToast.style.left = '50%';
        loadingToast.style.transform = 'translateX(-50%)';
        loadingToast.style.background = 'rgba(0, 0, 0, 0.8)';
        loadingToast.style.color = 'white';
        loadingToast.style.padding = '10px 20px';
        loadingToast.style.borderRadius = '5px';
        loadingToast.style.zIndex = '9999';
        document.body.appendChild(loadingToast);

        // Save original styles
        const originalStyles = {
            transform: element.style.transform,
            position: element.style.position,
            left: element.style.left,
            top: element.style.top
        };

        // Temporarily modify element for screenshot
        element.style.transform = 'none';
        element.style.position = 'fixed';
        element.style.left = '0';
        element.style.top = '0';

        // Use dom-to-image to capture the screenshot
        const blob = await domtoimage.toBlob(element, {
            bgcolor: null,
            quality: 0.95,
            scale: 2,
            height: element.scrollHeight,
            width: element.scrollWidth,
            style: {
                'transform': 'none',
                'transform-origin': '0 0'
            }
        });

        // Restore original styles
        element.style.transform = originalStyles.transform;
        element.style.position = originalStyles.position;
        element.style.left = originalStyles.left;
        element.style.top = originalStyles.top;

        // Copy to clipboard using ClipboardItem API
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        
        // Remove loading toast
        loadingToast.remove();
        
        // Show success toast
        const toast = document.createElement('div');
        toast.textContent = 'Screenshot copied to clipboard!';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(0, 255, 0, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '9999';
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    } catch (error) {
        console.error('Screenshot failed:', error);
        
        // Show error toast
        const errorToast = document.createElement('div');
        errorToast.textContent = `Screenshot failed: ${error.message}`;
        errorToast.style.position = 'fixed';
        errorToast.style.bottom = '20px';
        errorToast.style.left = '50%';
        errorToast.style.transform = 'translateX(-50%)';
        errorToast.style.background = 'rgba(255, 0, 0, 0.8)';
        errorToast.style.color = 'white';
        errorToast.style.padding = '10px 20px';
        errorToast.style.borderRadius = '5px';
        errorToast.style.zIndex = '9999';
        
        document.body.appendChild(errorToast);
        setTimeout(() => errorToast.remove(), 3000);
    }
}

function showOptionPopup(choice) {
    playSound('popup');
    
    const popup = document.createElement("div");
    popup.id = "optionPopup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.maxWidth = "90vw";
    popup.style.maxHeight = "90vh";
    popup.style.width = "75%";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    popup.style.padding = "20px";
    popup.style.border = "2px solid white";
    popup.style.borderRadius = "15px"; // Added rounded corners
    popup.style.zIndex = "2000";
    popup.style.boxSizing = "border-box";
    popup.style.overflow = "hidden"; // Prevent scrolling
    popup.style.cursor = "pointer"; // Indicate clickable
    
    popup.classList.add('glow-effect');
    popup.addEventListener('animationend', () => {
        popup.classList.remove('glow-effect');
    });
    
    const img = document.createElement("img");
    img.src = getRandomImage(choice); // Use getRandomImage for popup as well
    img.style.width = "100%";
    img.style.maxHeight = "60vh"; // Ensure image doesn't overflow
    img.style.objectFit = "contain"; // Keep aspect ratio
    
    const textDiv = document.createElement("div");
    textDiv.textContent = choice.text;
    textDiv.style.color = "white";
    textDiv.style.textAlign = "center";
    textDiv.style.marginTop = "10px";
    
    const extraDiv = document.createElement("div");
    extraDiv.id = "extraText";
    extraDiv.style.color = "white";
    extraDiv.style.textAlign = "center";
    extraDiv.style.marginTop = "10px";
    extraDiv.textContent = "";
    
    popup.appendChild(img);
    popup.appendChild(textDiv);
    popup.appendChild(extraDiv);
    
    let infoTimeout;
    const overlay = createInfoOverlay(choice);
    popup.appendChild(overlay);

    // Improved positioning of the info overlay
    overlay.style.position = 'absolute';
    
    // Detect if we're on a small screen and position accordingly
    const isSmallScreen = window.innerWidth < 1200;
    if (isSmallScreen) {
        // Position below on small screens
        overlay.style.top = 'auto';
        overlay.style.bottom = '-300px';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.width = '100%';
        overlay.style.maxHeight = '280px';
    } else {
        // Position to the right on larger screens
        overlay.style.right = '-270px';
        overlay.style.top = '50px';
        overlay.style.width = '250px';
    }

    // Show info with delay for popup
    const showInfo = () => {
        infoTimeout = setTimeout(() => {
            overlay.style.display = 'block';
            setTimeout(() => overlay.classList.add('visible'), 10);
        }, 1000); // Reduced delay from 2000ms to 1000ms for better UX
    };

    const hideInfo = () => {
        clearTimeout(infoTimeout);
        overlay.classList.remove('visible');
        setTimeout(() => overlay.style.display = 'none', 300);
    };

    popup.addEventListener('mouseenter', showInfo);
    popup.addEventListener('mouseleave', hideInfo);
    popup.addEventListener('touchstart', showInfo);
    popup.addEventListener('touchend', hideInfo);

    // Add click handler for screenshot
    popup.addEventListener('click', () => capturePopupScreenshot(popup));
    
    document.body.appendChild(popup);
    
    function handleOutsideClick(event) {
        if (!popup.contains(event.target)) {
            popup.remove();
            document.removeEventListener("click", handleOutsideClick);
        }
    }
    
    setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
    }, 0);
}

// Simplify particle handling functions
function addGodParticles(amount) {
    godParticles += amount;
    updateGodParticlesDisplay(); // This now calls updateButtonStates with correct cost
    saveGodParticles();
}

// Load God Particles from localStorage
function loadGodParticles() {
    const savedParticles = localStorage.getItem('godParticles');
    if (savedParticles !== null) {
        godParticles = parseInt(savedParticles);
        updateGodParticlesDisplay();
    }
}

// Only keep updateGodParticlesDisplay and hide the spinsRemaining display
function updateGodParticlesDisplay() {
    godParticlesCounter.textContent = godParticles;
    updateButtonStates();
}

lootButton.addEventListener("click", async () => {
    console.log("LOOT button clicked");
    stopAllAudio();
    playClickSounds();
    highlightActiveButton(lootButton);
    await loadChoices('loot');
    localStorage.setItem('currentPool', 'loot'); // Save current selection
});

pvpButton.addEventListener("click", async () => {
    console.log("PVP button clicked");
    stopAllAudio();
    playClickSounds();
    highlightActiveButton(pvpButton);
    await loadChoices('pvp');
    localStorage.setItem('currentPool', 'pvp'); // Save current selection
});

coopButton.addEventListener("click", async () => {
    console.log("COOP button clicked");
    stopAllAudio();
    playClickSounds();
    highlightActiveButton(coopButton);
    await loadChoices('coop');
    localStorage.setItem('currentPool', 'coop'); // Save current selection
});

function highlightActiveButton(activeButton) {
  [lootButton, pvpButton, coopButton].forEach(button => {
    button.classList.remove('active');
    stopGlossyAnimation(button);
  });
  activeButton.classList.add('active');
  startGlossyAnimation(activeButton);
  
  // Save current selection immediately
  const buttonId = activeButton.id;
  const poolName = buttonId.replace('-button', '');
  localStorage.setItem('currentPool', poolName);
}

// Add glossy animation functions
function startGlossyAnimation(button) {
  // Initial animation
  applyGlossyEffect(button);
  
  // Set up repeating animation every 35 seconds instead of 5
  button.glossyInterval = setInterval(() => {
    applyGlossyEffect(button);
  }, 35000);
}

function stopGlossyAnimation(button) {
  if (button.glossyInterval) {
    clearInterval(button.glossyInterval);
    button.glossyInterval = null;
  }
}

function applyGlossyEffect(button) {
  if (!button.classList.contains('active')) return;
  
  button.classList.add('glossy');
  setTimeout(() => {
    button.classList.remove('glossy');
  }, 2000); // Animation duration
}

// Update setRandomBackground to use cached images
function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const selectedBg = backgroundImages[randomIndex];
    
    if (imageCache.has(selectedBg)) {
        document.body.style.backgroundImage = `url(${selectedBg})`;
    } else {
        preloadImage(selectedBg).then(() => {
            document.body.style.backgroundImage = `url(${selectedBg})`;
        });
    }
}

setRandomBackground();

document.addEventListener('DOMContentLoaded', () => {
  loadGodParticles();
  const savedPool = localStorage.getItem('currentPool') || 'loot';
  loadChoices(savedPool);
  
  // Make sure we highlight the correct button
  const buttonId = `${savedPool}-button`;
  const activeButton = document.getElementById(buttonId);
  if (activeButton) {
    highlightActiveButton(activeButton);
  } else {
    // Fallback to loot button if the saved button doesn't exist
    highlightActiveButton(lootButton);
  }
  
  // Add test buttons for adding God Particles (for development)
  const testButtonsContainer = document.createElement("div");
  testButtonsContainer.style.position = "fixed";
  testButtonsContainer.style.bottom = "10px";
  testButtonsContainer.style.right = "10px";
  testButtonsContainer.style.zIndex = "1000";
  
  const addHalfButton = document.createElement("button");
  addHalfButton.textContent = "+0.5 GP";
  addHalfButton.addEventListener("click", () => addGodParticles(0.5));
  
  const addOneButton = document.createElement("button");
  addOneButton.textContent = "+1 GP";
  addOneButton.addEventListener("click", () => addGodParticles(1));
  
  const addFiveButton = document.createElement("button");
  addFiveButton.textContent = "+5 GP";
  addFiveButton.addEventListener("click", () => addGodParticles(5));
  
  const addTenButton = document.createElement("button");
  addTenButton.textContent = "+10 GP";
  addTenButton.addEventListener("click", () => addGodParticles(10));
  
  testButtonsContainer.appendChild(addHalfButton);
  testButtonsContainer.appendChild(addOneButton);
  testButtonsContainer.appendChild(addFiveButton);
  testButtonsContainer.appendChild(addTenButton);
  
  document.body.appendChild(testButtonsContainer);

  // Hide the spins remaining display on load
  spinsRemainingDisplay.classList.add('hidden');
});

function toggleSidebar() {
  const staticRewards = document.getElementById("static-rewards");
  staticRewards.classList.toggle("visible");
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.innerWidth <= 600) {
    const staticRewards = document.getElementById("static-rewards");
    let touchstartX = 0;
    let touchendX = 0;

    function handleGesture() {
      if (touchendX < touchstartX) {
        staticRewards.classList.add('visible');
      }
      if (touchendX > touchstartX) {
        staticRewards.classList.remove('visible');
      }
    }

    document.addEventListener('touchstart', function(e) {
      touchstartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', function(e) {
      touchendX = e.changedTouches[0].screenX;
      handleGesture();
    });
  }
});

// Add navbar hide on scroll
let lastScrollPosition = window.pageYOffset;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    if (lastScrollPosition < currentScrollPosition) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    lastScrollPosition = currentScrollPosition;
});