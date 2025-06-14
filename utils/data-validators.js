/**
 * ErgoSphere Data Validators
 * Utility functions for validating data fields across the application
 */

/**
 * Ensures that movie data has consistent WATCHED fields with proper eye emoji
 * @param {Object} movie - Movie object to validate
 * @returns {Object} - Validated movie object
 */
function validateMovieWatchedField(movie) {
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
}

/**
 * Validates an entire array of movie data for proper WATCHED field formatting
 * @param {Array} movies - Array of movie objects
 * @returns {Array} - Validated movie objects
 */
function validateMoviesData(movies) {
  if (!Array.isArray(movies)) return movies;
  
  return movies.map(validateMovieWatchedField);
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    validateMovieWatchedField,
    validateMoviesData
  };
} else {
  // For browser usage
  if (typeof window !== 'undefined') {
    window.DataValidators = {
      validateMovieWatchedField,
      validateMoviesData
    };
  }
}
