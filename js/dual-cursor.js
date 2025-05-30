/**
 * Dual Cursor System for ErgoArena
 * Implements 2-player multitasking with distinct cursors for Jaybers8 (purple) and FLIGHTx12 (green)
 */

class DualCursorManager {
    constructor() {
        this.players = {
            player1: {
                name: 'Jaybers8',
                color: '#8e44ad', // Purple from CSS variables
                cursor: null,
                mouseId: null,
                active: false
            },
            player2: {
                name: 'FLIGHTx12',
                color: '#27ae60', // Green from CSS variables  
                cursor: null,
                mouseId: null,
                active: false
            }
        };
        
        this.detectedMice = [];
        this.cursorsInitialized = false;
        this.gameActive = false;
        
        this.init();
    }

    init() {
        this.createCustomCursors();
        this.detectMultipleMice();
        this.setupEventListeners();
        this.updateCursorDisplay();
        
        // Initialize on game start
        this.bindToGameEvents();
    }

    /**
     * Create custom cursor elements for each player
     */
    createCustomCursors() {
        const cursorContainer = document.createElement('div');
        cursorContainer.id = 'dual-cursor-container';
        cursorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;

        // Player 1 cursor (Jaybers8 - Purple)
        const player1Cursor = document.createElement('div');
        player1Cursor.id = 'player1-cursor';
        player1Cursor.className = 'custom-cursor';
        player1Cursor.innerHTML = `
            <div class="cursor-pointer"></div>
            <div class="cursor-label">Jaybers8</div>
        `;
        player1Cursor.style.cssText = `
            position: absolute;
            pointer-events: none;
            transform: translate(-50%, -50%);
            display: none;
            z-index: 10000;
        `;

        // Player 2 cursor (FLIGHTx12 - Green)
        const player2Cursor = document.createElement('div');
        player2Cursor.id = 'player2-cursor';
        player2Cursor.className = 'custom-cursor';
        player2Cursor.innerHTML = `
            <div class="cursor-pointer"></div>
            <div class="cursor-label">FLIGHTx12</div>
        `;
        player2Cursor.style.cssText = `
            position: absolute;
            pointer-events: none;
            transform: translate(-50%, -50%);
            display: none;
            z-index: 10000;
        `;

        cursorContainer.appendChild(player1Cursor);
        cursorContainer.appendChild(player2Cursor);
        document.body.appendChild(cursorContainer);

        this.players.player1.cursor = player1Cursor;
        this.players.player2.cursor = player2Cursor;

        // Add CSS styles
        this.addCursorStyles();
    }

    /**
     * Add CSS styles for custom cursors
     */
    addCursorStyles() {
        if (document.getElementById('dual-cursor-styles')) return;

        const style = document.createElement('style');
        style.id = 'dual-cursor-styles';
        style.textContent = `
            .custom-cursor {
                transition: all 0.1s ease;
            }
            
            .cursor-pointer {
                width: 20px;
                height: 20px;
                border: 3px solid;
                border-radius: 50%;
                position: relative;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(2px);
            }
            
            .cursor-pointer::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 8px;
                height: 8px;
                background: currentColor;
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }
            
            .cursor-label {
                position: absolute;
                top: 25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
                text-shadow: none;
            }
            
            #player1-cursor {
                color: var(--player1-color, #8e44ad);
            }
            
            #player1-cursor .cursor-pointer {
                border-color: var(--player1-color, #8e44ad);
                box-shadow: 0 0 10px rgba(142, 68, 173, 0.5);
            }
            
            #player2-cursor {
                color: var(--player2-color, #27ae60);
            }
            
            #player2-cursor .cursor-pointer {
                border-color: var(--player2-color, #27ae60);
                box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
            }
            
            /* Hide default cursor when dual cursors are active */
            body.dual-cursors-active {
                cursor: none;
            }
            
            body.dual-cursors-active * {
                cursor: none !important;
            }
            
            /* Game area specific styling */
            .game-container.dual-cursors-active {
                cursor: none;
            }
            
            /* Pulse animation for active cursor */
            .custom-cursor.active .cursor-pointer {
                animation: cursorPulse 1.5s infinite;
            }
            
            @keyframes cursorPulse {
                0%, 100% { 
                    transform: scale(1);
                    opacity: 1;
                }
                50% { 
                    transform: scale(1.2);
                    opacity: 0.8;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Detect multiple mice using various methods
     */
    detectMultipleMice() {
        // Method 1: Check for multiple pointer devices
        this.checkPointerDevices();
        
        // Method 2: Monitor for multiple simultaneous mouse events
        this.monitorMouseEvents();
        
        // Method 3: Use Navigator API if available
        this.checkNavigatorDevices();
        
        // For demo purposes, assume 2 mice are available if game is accessed
        // In a real implementation, this would be based on actual hardware detection
        this.simulateMultipleMice();
    }

    /**
     * Check for pointer devices using PointerEvent API
     */
    checkPointerDevices() {
        if (window.PointerEvent) {
            let detectedPointers = new Set();
            
            document.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse') {
                    detectedPointers.add(e.pointerId);
                    this.updateDetectedMice(Array.from(detectedPointers));
                }
            });
            
            document.addEventListener('pointerup', (e) => {
                // Keep track of recently used pointers
                setTimeout(() => {
                    if (detectedPointers.has(e.pointerId)) {
                        detectedPointers.delete(e.pointerId);
                        this.updateDetectedMice(Array.from(detectedPointers));
                    }
                }, 5000); // Keep pointer ID for 5 seconds after last use
            });
        }
    }

    /**
     * Monitor mouse events for multiple simultaneous actions
     */
    monitorMouseEvents() {
        let mouseEvents = [];
        const timeWindow = 100; // ms
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            mouseEvents.push({
                x: e.clientX,
                y: e.clientY,
                time: now
            });
            
            // Clean old events
            mouseEvents = mouseEvents.filter(event => now - event.time < timeWindow);
            
            // Check for simultaneous events (different positions at similar times)
            if (mouseEvents.length >= 2) {
                const recent = mouseEvents.slice(-2);
                const distance = Math.sqrt(
                    Math.pow(recent[1].x - recent[0].x, 2) + 
                    Math.pow(recent[1].y - recent[0].y, 2)
                );
                
                if (distance > 100) { // Significant distance suggests multiple mice
                    this.detectedMice = ['mouse1', 'mouse2'];
                    this.updateCursorDisplay();
                }
            }
        });
    }

    /**
     * Check Navigator API for input devices
     */
    checkNavigatorDevices() {
        if (navigator.getGamepads) {
            // Check for HID devices that might indicate multiple mice
            // This is a placeholder for more advanced device detection
            const gamepads = navigator.getGamepads();
            if (gamepads.length > 0) {
                console.log('Multiple input devices detected');
            }
        }
    }

    /**
     * Simulate multiple mice for demo/development purposes
     */
    simulateMultipleMice() {
        // For ErgoArena, we'll assume dual mouse setup when the game starts
        // This can be made more sophisticated with actual hardware detection
        this.detectedMice = ['primaryMouse', 'secondaryMouse'];
        this.updateCursorDisplay();
    }

    /**
     * Update detected mice count
     */
    updateDetectedMice(mice) {
        this.detectedMice = mice;
        this.updateCursorDisplay();
        console.log(`Detected ${mice.length} mouse devices:`, mice);
    }

    /**
     * Update cursor display based on detected mice
     */
    updateCursorDisplay() {
        const miceCount = this.detectedMice.length;
        
        if (miceCount >= 2 && this.gameActive) {
            this.enableDualCursors();
        } else if (miceCount === 1) {
            this.enableSingleCursor();
        } else {
            this.disableDualCursors();
        }
        
        this.updateGameUI();
    }

    /**
     * Enable dual cursor mode
     */
    enableDualCursors() {
        console.log('Enabling dual cursor mode for 2-player multitasking');
        
        document.body.classList.add('dual-cursors-active');
        
        // Assign mice to players
        this.players.player1.mouseId = this.detectedMice[0];
        this.players.player2.mouseId = this.detectedMice[1];
        this.players.player1.active = true;
        this.players.player2.active = true;
        
        // Show custom cursors
        this.players.player1.cursor.style.display = 'block';
        this.players.player2.cursor.style.display = 'block';
        
        this.cursorsInitialized = true;
        
        // Track mouse movements for each cursor
        this.trackDualMouse();
        
        // Notify game system
        this.notifyGameSystem('dual-cursors-enabled');
    }

    /**
     * Enable single cursor mode  
     */
    enableSingleCursor() {
        console.log('Single mouse detected - using standard cursor');
        
        document.body.classList.remove('dual-cursors-active');
        this.players.player1.cursor.style.display = 'none';
        this.players.player2.cursor.style.display = 'none';
        
        this.players.player1.active = true;
        this.players.player2.active = false;
        
        this.notifyGameSystem('single-cursor-mode');
    }

    /**
     * Disable dual cursor system
     */
    disableDualCursors() {
        document.body.classList.remove('dual-cursors-active');
        
        if (this.players.player1.cursor) {
            this.players.player1.cursor.style.display = 'none';
        }
        if (this.players.player2.cursor) {
            this.players.player2.cursor.style.display = 'none';
        }
        
        this.players.player1.active = false;
        this.players.player2.active = false;
        this.cursorsInitialized = false;
    }

    /**
     * Track mouse movements for dual cursor display
     */
    trackDualMouse() {
        if (!this.cursorsInitialized) return;
        
        let lastPlayer1Update = 0;
        let lastPlayer2Update = 0;
        const alternateThreshold = 50; // ms between cursor updates
        
        document.addEventListener('mousemove', (e) => {
            if (!this.cursorsInitialized) return;
            
            const now = Date.now();
            
            // Alternate between cursors based on timing and movement patterns
            if (now - lastPlayer1Update > alternateThreshold) {
                this.updateCursorPosition(this.players.player1.cursor, e.clientX, e.clientY);
                this.players.player1.cursor.classList.add('active');
                this.players.player2.cursor.classList.remove('active');
                lastPlayer1Update = now;
            } else if (now - lastPlayer2Update > alternateThreshold) {
                this.updateCursorPosition(this.players.player2.cursor, e.clientX, e.clientY);
                this.players.player2.cursor.classList.add('active');
                this.players.player1.cursor.classList.remove('active');
                lastPlayer2Update = now;
            }
        });
        
        // Handle clicks for each player
        document.addEventListener('click', (e) => {
            this.handlePlayerClick(e);
        });
    }

    /**
     * Update cursor position
     */
    updateCursorPosition(cursor, x, y) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    }

    /**
     * Handle player clicks with cursor identification
     */
    handlePlayerClick(e) {
        if (!this.cursorsInitialized) return;
        
        // Determine which player clicked based on cursor position or timing
        const activePlayer = this.determineActivePlayer(e);
        
        // Add visual feedback for the click
        this.showClickFeedback(activePlayer, e.clientX, e.clientY);
        
        // Notify game system of player action
        this.notifyGameSystem('player-click', {
            player: activePlayer,
            x: e.clientX,
            y: e.clientY,
            target: e.target
        });
    }

    /**
     * Determine which player is currently active
     */
    determineActivePlayer(e) {
        // Simple alternating logic - can be made more sophisticated
        const player1Distance = this.getDistanceFromCursor(this.players.player1.cursor, e.clientX, e.clientY);
        const player2Distance = this.getDistanceFromCursor(this.players.player2.cursor, e.clientX, e.clientY);
        
        return player1Distance < player2Distance ? 'player1' : 'player2';
    }

    /**
     * Get distance from cursor to point
     */
    getDistanceFromCursor(cursor, x, y) {
        const rect = cursor.getBoundingClientRect();
        const cursorX = rect.left + rect.width / 2;
        const cursorY = rect.top + rect.height / 2;
        
        return Math.sqrt(Math.pow(x - cursorX, 2) + Math.pow(y - cursorY, 2));
    }

    /**
     * Show visual feedback for clicks
     */
    showClickFeedback(player, x, y) {
        const feedback = document.createElement('div');
        const color = this.players[player].color;
        
        feedback.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 30px;
            height: 30px;
            border: 3px solid ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            animation: clickRipple 0.6s ease-out forwards;
            transform: translate(-50%, -50%);
        `;
        
        // Add ripple animation if not already defined
        if (!document.getElementById('click-feedback-styles')) {
            const style = document.createElement('style');
            style.id = 'click-feedback-styles';
            style.textContent = `
                @keyframes clickRipple {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 600);
    }

    /**
     * Update game UI to reflect cursor status
     */
    updateGameUI() {
        // Find game status elements and update them
        const statusElement = document.getElementById('cursor-status') || this.createStatusElement();
        
        if (this.cursorsInitialized && this.detectedMice.length >= 2) {
            statusElement.innerHTML = `
                <div class="dual-cursor-status">
                    <span class="player1-indicator">🟣 Jaybers8</span>
                    <span class="player2-indicator">🟢 FLIGHTx12</span>
                    <span class="status-text">Dual Mouse Mode Active</span>
                </div>
            `;
            statusElement.style.display = 'block';
        } else if (this.detectedMice.length === 1) {
            statusElement.innerHTML = `
                <div class="single-cursor-status">
                    <span class="status-text">Single Mouse Detected</span>
                </div>
            `;
            statusElement.style.display = 'block';
        } else {
            statusElement.style.display = 'none';
        }
    }

    /**
     * Create status element for cursor information
     */
    createStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'cursor-status';
        statusElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 10000;
            display: none;
        `;
        
        // Add styles for status indicators
        const style = document.createElement('style');
        style.textContent = `
            .dual-cursor-status {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .player1-indicator, .player2-indicator {
                font-weight: bold;
            }
            
            .status-text {
                font-size: 10px;
                color: #ccc;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(statusElement);
        return statusElement;
    }    /**
     * Bind to game events
     */
    bindToGameEvents() {
        // Wait for game to load
        document.addEventListener('DOMContentLoaded', () => {
            // Check if we're on the ErgoArena page
            if (window.location.pathname.includes('ErgoArena.html')) {
                this.gameActive = true;
                
                // Automatically enable dual cursors for ErgoArena
                this.simulateMultipleMice();
                this.enableDualCursors();
                
                // Monitor for game start (when monster is selected)
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length > 0) {
                            // Check if game containers are being created
                            const gameContainer = document.querySelector('.game-container');
                            if (gameContainer && gameContainer.style.display !== 'none') {
                                this.gameActive = true;
                                this.updateCursorDisplay();
                            }
                            
                            // Check if monster containers become visible (game starts)
                            const visibleMonsterContainer = Array.from(document.querySelectorAll('.monster-container')).find(c => c.style.display === 'block');
                            if (visibleMonsterContainer && !this.cursorsInitialized) {
                                console.log('Game started - activating dual cursors');
                                this.simulateMultipleMice();
                                this.enableDualCursors();
                            }
                        }
                    });
                });
                
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for game state changes
        document.addEventListener('gameStateChanged', (e) => {
            this.gameActive = e.detail.active;
            this.updateCursorDisplay();
        });
        
        // Listen for window focus/blur to manage cursor display
        window.addEventListener('focus', () => {
            if (this.gameActive) {
                this.updateCursorDisplay();
            }
        });
        
        window.addEventListener('blur', () => {
            this.disableDualCursors();
        });
    }

    /**
     * Notify game system of cursor events
     */
    notifyGameSystem(eventType, data = {}) {
        const event = new CustomEvent('dualCursorEvent', {
            detail: {
                type: eventType,
                data: data,
                cursorsActive: this.cursorsInitialized,
                activePlayers: {
                    player1: this.players.player1.active,
                    player2: this.players.player2.active
                }
            }
        });
        
        document.dispatchEvent(event);
        
        // Also update window object for game access
        window.dualCursorStatus = {
            active: this.cursorsInitialized,
            players: this.players,
            miceCount: this.detectedMice.length
        };
    }

    /**
     * Public method to toggle dual cursor mode
     */
    toggleDualCursors() {
        if (this.cursorsInitialized) {
            this.disableDualCursors();
        } else {
            this.simulateMultipleMice();
            this.enableDualCursors();
        }
    }

    /**
     * Public method to get current status
     */
    getStatus() {
        return {
            active: this.cursorsInitialized,
            gameActive: this.gameActive,
            detectedMice: this.detectedMice.length,
            players: {
                player1: {
                    name: this.players.player1.name,
                    active: this.players.player1.active,
                    color: this.players.player1.color
                },
                player2: {
                    name: this.players.player2.name,
                    active: this.players.player2.active,
                    color: this.players.player2.color
                }
            }
        };
    }
}

// Initialize the dual cursor system
let dualCursorManager;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dualCursorManager = new DualCursorManager();
    });
} else {
    dualCursorManager = new DualCursorManager();
}

// Export for global access
window.DualCursorManager = DualCursorManager;
window.dualCursorManager = dualCursorManager;
