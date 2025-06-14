// Entertainment Page Validation Script
console.log('🎬 Starting Entertainment Page Validation...');

// Data validators for ensuring proper WATCHED field formatting
window.DataValidators = {
    /**
     * Ensures that movie data has consistent WATCHED fields with proper eye emoji
     * @param {Object} movie - Movie object to validate
     * @returns {Object} - Validated movie object
     */
    validateMovieWatchedField(movie) {
        if (!movie) return movie;
        
        // Ensure both uppercase and lowercase keys exist for compatibility
        if (movie.WATCHED !== undefined) {
            movie.watched = movie.WATCHED;
        } else if (movie.watched !== undefined) {
            movie.WATCHED = movie.watched;
        }
        
        // If the field exists but isn't properly formatted
        const watchedStr = movie.WATCHED || '';
        
        // Convert to proper eye emoji format if it's a number or different format
        if (typeof watchedStr === 'number') {
            // Convert number to eye emojis
            let eyeStr = '';
            for (let i = 0; i < watchedStr; i++) {
                eyeStr += '👀';
            }
            movie.WATCHED = eyeStr;
            movie.watched = eyeStr;
        }
        
        return movie;
    },

    /**
     * Validates an entire array of movie data for proper WATCHED field formatting
     * @param {Array} movies - Array of movie objects
     * @returns {Array} - Validated movie objects
     */
    validateMoviesData(movies) {
        if (!Array.isArray(movies)) return movies;
        
        return movies.map(this.validateMovieWatchedField);
    }
};

// Extend the EntertainmentHub class to use validators when available
document.addEventListener('DOMContentLoaded', () => {
    if (typeof EntertainmentHub === 'function' && EntertainmentHub.prototype.loadAllData) {
        const originalLoadAllData = EntertainmentHub.prototype.loadAllData;
        
        // Override the loadAllData method to add validation
        EntertainmentHub.prototype.loadAllData = async function() {
            // Call the original method
            const result = await originalLoadAllData.call(this);
            
            // If movies data was loaded, validate it
            if (this.data && this.data.movies) {
                console.log('Validating movie WATCHED fields for Entertainment Hub...');
                this.data.movies = window.DataValidators.validateMoviesData(this.data.movies);
            }
            
            return result;
        };
        
        console.log('✅ Entertainment Hub data validation initialized');
    }
});

// Test 1: Check if all required HTML elements exist
function validateHTMLElements() {
    console.log('📋 Validating HTML elements...');
    
    const requiredElements = [
        'hero-title',
        'hero-description',
        'categories-carousel',
        'featured-carousel',
        'recent-carousel',
        'continue-carousel',
        'content-modal'
    ];
    
    const missing = [];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missing.push(id);
        }
    });
    
    if (missing.length === 0) {
        console.log('✅ All required HTML elements found');
        return true;
    } else {
        console.error('❌ Missing HTML elements:', missing);
        return false;
    }
}

// Test 2: Check CSS loading
function validateCSS() {
    console.log('🎨 Validating CSS...');
    
    const testElement = document.createElement('div');
    testElement.className = 'entertainment-main';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const hasMaxWidth = styles.maxWidth !== 'none';
    
    document.body.removeChild(testElement);
    
    if (hasMaxWidth) {
        console.log('✅ Entertainment CSS loaded successfully');
        return true;
    } else {
        console.error('❌ Entertainment CSS not loaded properly');
        return false;
    }
}

// Test 3: Check JavaScript class
function validateJavaScript() {
    console.log('⚙️ Validating JavaScript...');
    
    if (typeof EntertainmentHub === 'function') {
        console.log('✅ EntertainmentHub class available');
        return true;
    } else {
        console.error('❌ EntertainmentHub class not found');
        return false;
    }
}

// Test 4: API availability
async function validateAPIs() {
    console.log('🌐 Validating API endpoints...');
    
    const testEndpoints = [
        '/api/data/movies',
        '/api/data/anime',
        '/api/loot'
    ];
    
    const results = {};
    
    for (const endpoint of testEndpoints) {
        try {
            const response = await fetch(endpoint);
            results[endpoint] = response.ok ? 'Available' : `HTTP ${response.status}`;
        } catch (error) {
            results[endpoint] = `Error: ${error.message}`;
        }
    }
    
    console.log('🔍 API Test Results:', results);
    return results;
}

// Run all validation tests
async function runAllTests() {
    console.log('🧪 Running all validation tests...');
    
    const results = {
        html: validateHTMLElements(),
        css: validateCSS(),
        javascript: validateJavaScript(),
        apis: await validateAPIs()
    };
    
    console.log('📊 Validation Results:', results);
    
    const allPassed = results.html && results.css && results.javascript;
    
    if (allPassed) {
        console.log('🎉 All validation tests passed! Entertainment page is ready.');
        
        // Try to initialize Entertainment Hub
        try {
            console.log('🚀 Attempting to initialize Entertainment Hub...');
            window.entertainmentHub = new EntertainmentHub();
            console.log('✅ Entertainment Hub initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize Entertainment Hub:', error);
        }
    } else {
        console.error('❌ Some validation tests failed. Check the results above.');
    }
    
    return results;
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.entertainmentValidation = {
    runAllTests,
    validateHTMLElements,
    validateCSS,
    validateJavaScript,
    validateAPIs
};
