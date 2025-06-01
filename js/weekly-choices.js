// Weekly Choices addition for manage-selections.html
document.addEventListener('DOMContentLoaded', function() {
  // Load BINGWA Challenge options
  fetch('../../data/bingwa-challenges.json')
    .then(response => {
      return response.text().then(text => {
        const jsonString = text.replace(/^\s*\/\/.*$/gm, '');
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.error('Error parsing bingwa challenges JSON:', e);
          throw e;
        }
      });
    })
    .then(data => {
      const nextBingwaChallengeDropdown = document.getElementById('nextBingwaChallenge');
      nextBingwaChallengeDropdown.innerHTML = '<option value="">-- Select Challenge --</option>';
      
      data.forEach(challenge => {
        const option = document.createElement('option');
        option.value = challenge;
        option.textContent = challenge;
        nextBingwaChallengeDropdown.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error loading bingwa challenges:', error);
    });
  
  // Load ATLETICO Workout options
  fetch('../../data/atletico-workouts.json')
    .then(response => {
      return response.text().then(text => {
        const jsonString = text.replace(/^\s*\/\/.*$/gm, '');
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.error('Error parsing atletico workouts JSON:', e);
          throw e;
        }
      });
    })
    .then(data => {
      const atleticoWorkoutDropdown = document.getElementById('atleticoWorkout');
      atleticoWorkoutDropdown.innerHTML = '<option value="">-- Select Workout --</option>';
      
      data.forEach(workout => {
        const option = document.createElement('option');
        option.value = workout;
        option.textContent = workout;
        atleticoWorkoutDropdown.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error loading atletico workouts:', error);
    });
  
  // Load Weekly Errand options
  fetch('../../data/weekly-errands.json')
    .then(response => {
      return response.text().then(text => {
        const jsonString = text.replace(/^\s*\/\/.*$/gm, '');
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.error('Error parsing weekly errands JSON:', e);
          throw e;
        }
      });
    })
    .then(data => {
      const weeklyErrandDropdown = document.getElementById('weeklyErrand');
      weeklyErrandDropdown.innerHTML = '<option value="">-- Select Errand --</option>';
      
      data.forEach(errand => {
        const option = document.createElement('option');
        option.value = errand;
        option.textContent = errand;
        weeklyErrandDropdown.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error loading weekly errands:', error);
    });

  // Update preview when weekly choices selection changes
  document.getElementById('nextBingwaChallenge').addEventListener('change', updateWeeklyChoicesPreview);
  document.getElementById('atleticoWorkout').addEventListener('change', updateWeeklyChoicesPreview);
  document.getElementById('weeklyErrand').addEventListener('change', updateWeeklyChoicesPreview);

  // Add Weekly Choices to the preview
  function updateWeeklyChoicesPreview() {
    // Check if the preview container exists, if not, create it
    let weeklyChoicesPreview = document.getElementById('preview-weekly-choices');
    if (!weeklyChoicesPreview) {
      const previewContent = document.querySelector('.preview-content');
      if (!previewContent) return;
      
      // Add a horizontal rule before weekly choices
      const hr = document.createElement('hr');
      previewContent.appendChild(hr);
      
      // Create preview elements for Weekly Choices
      const bingwaChallengeP = document.createElement('p');
      bingwaChallengeP.innerHTML = '<strong>Next Bingwa Challenge:</strong> <span id="preview-next-bingwa"></span>';
      previewContent.appendChild(bingwaChallengeP);
      
      const atleticoWorkoutP = document.createElement('p');
      atleticoWorkoutP.innerHTML = '<strong>Atletico Workout:</strong> <span id="preview-atletico-workout"></span>';
      previewContent.appendChild(atleticoWorkoutP);
      
      const weeklyErrandP = document.createElement('p');
      weeklyErrandP.innerHTML = '<strong>Weekly Errand:</strong> <span id="preview-weekly-errand"></span>';
      previewContent.appendChild(weeklyErrandP);
      
      // Add a div to mark that weekly choices preview is added
      const marker = document.createElement('div');
      marker.id = 'preview-weekly-choices';
      marker.style.display = 'none';
      previewContent.appendChild(marker);
    }
    
    // Update the preview text
    const nextBingwaValue = document.getElementById('nextBingwaChallenge').value;
    const atleticoWorkoutValue = document.getElementById('atleticoWorkout').value;
    const weeklyErrandValue = document.getElementById('weeklyErrand').value;
    
    document.getElementById('preview-next-bingwa').textContent = nextBingwaValue || 'None selected';
    document.getElementById('preview-atletico-workout').textContent = atleticoWorkoutValue || 'None selected';
    document.getElementById('preview-weekly-errand').textContent = weeklyErrandValue || 'None selected';
  }
});
