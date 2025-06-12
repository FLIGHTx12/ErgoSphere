/**
 * CSS Debug Helper
 * Utility for debugging CSS and styling issues in ErgoSphere
 */

// CSS Debug Helper for ErgoSphere
class CSSDebugHelper {
  constructor() {
    this.debugMode = false;
    this.init();
  }

  init() {
    // Check if debug mode is enabled via URL parameter or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    this.debugMode = urlParams.has('debug') || localStorage.getItem('ergosphere-debug') === 'true';
    
    if (this.debugMode) {
      console.log('🎨 CSS Debug Helper initialized');
      this.addDebugControls();
    }
  }

  /**
   * Add debug controls to the page
   */
  addDebugControls() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'css-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      max-width: 200px;
      display: none;
    `;

    debugPanel.innerHTML = `
      <h4>CSS Debug</h4>
      <button onclick="cssDebugHelper.toggleOutlines()">Toggle Outlines</button>
      <button onclick="cssDebugHelper.showThemeInfo()">Theme Info</button>
      <button onclick="cssDebugHelper.checkResponsive()">Responsive Check</button>
    `;

    document.body.appendChild(debugPanel);

    // Toggle debug panel with Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        this.toggleDebugPanel();
      }
    });
  }

  /**
   * Toggle debug panel visibility
   */
  toggleDebugPanel() {
    const panel = document.getElementById('css-debug-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Toggle element outlines for layout debugging
   */
  toggleOutlines() {
    const style = document.getElementById('debug-outlines');
    if (style) {
      style.remove();
    } else {
      const debugStyle = document.createElement('style');
      debugStyle.id = 'debug-outlines';
      debugStyle.textContent = `
        * { outline: 1px solid red !important; }
        div { outline-color: blue !important; }
        section { outline-color: green !important; }
        .modern-container { outline-color: purple !important; }
        .user-purchases { outline-color: orange !important; }
      `;
      document.head.appendChild(debugStyle);
    }
  }

  /**
   * Show current theme information
   */
  showThemeInfo() {
    const root = document.documentElement;
    const activeTheme = getComputedStyle(root).getPropertyValue('--active-user-theme').trim();
    const activeThemeDark = getComputedStyle(root).getPropertyValue('--active-user-theme-dark').trim();
    const flightColor = getComputedStyle(root).getPropertyValue('--flight-color').trim();
    const jaybersColor = getComputedStyle(root).getPropertyValue('--jaybers-color').trim();
    
    console.group('🎨 Theme Information');
    console.log('Active Theme:', activeTheme);
    console.log('Active Theme Dark:', activeThemeDark);
    console.log('Flight Color:', flightColor);
    console.log('Jaybers Color:', jaybersColor);
    console.log('Current User:', window.currentUser || 'Not set');
    console.groupEnd();
    
    alert(`Current Theme Info:\nActive: ${activeTheme}\nFlight: ${flightColor}\nJaybers: ${jaybersColor}\nUser: ${window.currentUser || 'Not set'}`);
  }

  /**
   * Check responsive design
   */
  checkResponsive() {
    const width = window.innerWidth;
    const breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
    
    let currentBreakpoint = 'large-desktop';
    if (width <= breakpoints.mobile) {
      currentBreakpoint = 'mobile';
    } else if (width <= breakpoints.tablet) {
      currentBreakpoint = 'tablet';
    } else if (width <= breakpoints.desktop) {
      currentBreakpoint = 'desktop';
    }
    
    console.log(`📱 Responsive Info: ${width}px (${currentBreakpoint})`);
    alert(`Screen: ${width}px\nBreakpoint: ${currentBreakpoint}`);
  }

  /**
   * Log CSS property values for debugging
   */
  logCSSProperty(element, property) {
    if (!this.debugMode) return;
    
    const computed = getComputedStyle(element);
    console.log(`${property}: ${computed.getPropertyValue(property)}`);
  }

  /**
   * Highlight elements with specific classes
   */
  highlightElements(selector, color = 'yellow') {
    if (!this.debugMode) return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.backgroundColor = color;
      el.style.opacity = '0.7';
      setTimeout(() => {
        el.style.backgroundColor = '';
        el.style.opacity = '';
      }, 2000);
    });
  }
}

// Initialize CSS Debug Helper
const cssDebugHelper = new CSSDebugHelper();

// Export for global access
window.cssDebugHelper = cssDebugHelper;

// Utility functions for quick debugging
window.debugCSS = {
  highlight: (selector, color) => cssDebugHelper.highlightElements(selector, color),
  theme: () => cssDebugHelper.showThemeInfo(),
  responsive: () => cssDebugHelper.checkResponsive(),
  outlines: () => cssDebugHelper.toggleOutlines()
};

console.log('✅ CSS Debug Helper loaded successfully');
