// ErgoArena Trivia System
class TriviaManager {  constructor() {
    this.categories = [
      'history',
      'music', 
      'games',
      'sports',
      'spanish-english',
      'movies-shows',
      'minneapolis-chicago',
      'construction',
      'coding'
    ];
    
    this.triviaData = {};
    this.currentQuestion = null;
    this.currentCategory = null;
    this.timer = null;
    this.questionTimer = null;
    this.damageMultiplier = 0;
    this.triviaContainer = null;
    this.isActive = false;
    this.questionTime = 30;
    this.handlingTimeout = false;
    this.questionInTransition = false;
    this.dataLoaded = false;
    
    // Load all trivia data
    this.loadTriviaData();
    
    // Add keyboard handler binding
    this.boundKeyHandler = this.handleTriviaKeys.bind(this);
  }  async loadTriviaData() {
    try {
      console.log('Starting to load trivia data...');
      for (const category of this.categories) {
        const url = `../data/trivia/${category}.json`;
        console.log(`Fetching trivia data from: ${url}`);
        
        try {
          const response = await fetch(url);
          console.log(`Response for ${category}: status ${response.status}, ok: ${response.ok}`);
          
          if (response.ok) {
            const data = await response.json();
            this.triviaData[category] = data;
            console.log(`Loaded trivia data for ${category}: ${data.length} questions`);
          } else {
            console.warn(`Failed to load trivia data for category: ${category} (Status: ${response.status})`);
            this.triviaData[category] = [];
          }
        } catch (categoryError) {
          console.error(`Error loading ${category}:`, categoryError);
          this.triviaData[category] = [];
        }
      }
      this.dataLoaded = true;
      console.log('Trivia data loading complete. Data loaded:', this.dataLoaded);
      console.log('Available categories:', Object.keys(this.triviaData));
      console.log('Questions per category:', Object.entries(this.triviaData).map(([cat, data]) => `${cat}: ${data.length}`));
    } catch (error) {
      console.error('Error in loadTriviaData:', error);
      this.dataLoaded = false;
    }
  }

  createTriviaContainer(monsterContainerIndex) {
    // Create the trivia container
    const triviaContainer = document.createElement("div");
    triviaContainer.id = "triviaContainer" + monsterContainerIndex;
    triviaContainer.className = "trivia-container";
    
    triviaContainer.innerHTML = `      <div class="trivia-header">
        <h3>🌐 DIMENSION SYNC</h3>
        <div class="multiplier-display">
          <span>Memory Sync: </span>
          <span id="multiplierValue">×${(1 + this.damageMultiplier).toFixed(1)}</span>
        </div>
      </div>
      <div class="question-container">
        <div id="questionText" class="question-text">Loading trivia...</div>
        <div class="answers-container">
          <button class="answer-btn" data-answer="0">A</button>
          <button class="answer-btn" data-answer="1">B</button>
          <button class="answer-btn" data-answer="2">C</button>
        </div>
        <div class="question-timer">
          <div id="questionProgress" class="progress-bar"></div>
          <span id="timeLeft">30s</span>
        </div>
      </div>
      <div id="triviaFeedback" class="feedback" style="display:none;"></div>
    `;

    triviaContainer.style.position = "absolute";
    triviaContainer.style.top = "470px";
    triviaContainer.style.left = "10px";
    triviaContainer.style.width = "350px";
    triviaContainer.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    triviaContainer.style.border = "2px solid #e74c3c";
    triviaContainer.style.borderRadius = "10px";
    triviaContainer.style.padding = "15px";
    triviaContainer.style.display = "none";
    triviaContainer.style.zIndex = "15";

    // Add event listeners for answer buttons
    const answerButtons = triviaContainer.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleAnswer(parseInt(e.target.dataset.answer));
      });
    });

    this.triviaContainer = triviaContainer;
    return triviaContainer;
  }
  startTrivia() {
    if (!this.triviaContainer) return;
    
    this.isActive = true;
    this.triviaContainer.style.display = "block";
    
    // Bind keyboard events when trivia starts
    document.addEventListener('keydown', this.boundKeyHandler);
    
    // Check if data is loaded before starting
    if (!this.dataLoaded) {
      console.log('Trivia data not loaded yet, waiting...');
      // Update display to show loading
      const questionText = this.triviaContainer.querySelector('#questionText');
      if (questionText) {
        questionText.innerHTML = `<strong>[LOADING...]</strong><br>Loading trivia data...`;
      }
      // Wait for data to load
      setTimeout(() => {
        if (this.dataLoaded && this.isActive) {
          this.loadNewQuestion();
        } else if (this.isActive) {
          this.startTrivia(); // Try again
        }
      }, 1000);
    } else {
      this.loadNewQuestion();
    }
  }

  stopTrivia() {
    console.log('Stopping trivia system');
    
    // First mark as inactive to prevent new questions
    this.isActive = false;
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.boundKeyHandler);
    
    // Clear all timers
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
    
    // Hide UI if it exists
    if (this.triviaContainer) {
      this.triviaContainer.style.display = "none";
    }
    
    // Reset multiplier
    this.resetMultiplier();
  }
  loadNewQuestion() {
    if (!this.isActive) {
      console.log('loadNewQuestion: Trivia not active, skipping');
      return;
    }

    if (!this.dataLoaded) {
      console.log('loadNewQuestion: Trivia data not loaded yet, retrying in 1 second...');
      setTimeout(() => this.loadNewQuestion(), 1000);
      return;
    }

    console.log('Loading new trivia question...');

    try {
      // Select random category
      const availableCategories = this.categories.filter(cat => 
        this.triviaData[cat] && this.triviaData[cat].length > 0
      );
      
      if (availableCategories.length === 0) {
        console.warn('No trivia data available - data loaded:', this.dataLoaded);
        console.warn('Trivia data keys:', Object.keys(this.triviaData));
        console.warn('Categories with data:', this.categories.map(cat => `${cat}: ${this.triviaData[cat]?.length || 0}`));
        return;
      }

      // Select category and question
      this.currentCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      const categoryData = this.triviaData[this.currentCategory];
      
      if (!categoryData || categoryData.length === 0) {
        console.error('Invalid category data for', this.currentCategory);
        // Try a different category after a short delay
        setTimeout(() => this.loadNewQuestion(), 500);
        return;
      }
      
      // Select random question
      const questionIndex = Math.floor(Math.random() * categoryData.length);
      const rawQuestion = categoryData[questionIndex];
      
      if (!rawQuestion) {
        console.error('Invalid question at index', questionIndex);
        // Try again after a short delay
        setTimeout(() => this.loadNewQuestion(), 500);
        return;
      }
      
      // Process question to create randomized options
      this.currentQuestion = this.processQuestionData(rawQuestion);
      
      if (!this.currentQuestion) {
        console.error('Failed to process question data');
        // Try again with a different question after a short delay
        setTimeout(() => this.loadNewQuestion(), 500);
        return;
      }
      
      // Update UI
      this.updateQuestionDisplay();
      
      // Start timer LAST, after everything else is set up
      this.startQuestionTimer();
      
      console.log('Question loaded successfully');
    } catch (err) {
      console.error('Error in loadNewQuestion:', err);
      // Try again after a delay
      setTimeout(() => {
        if (this.isActive) {
          this.loadNewQuestion();
        }
      }, 1000);
    }
  }

  processQuestionData(rawQuestion) {
    // Handle both old format (options array) and new format (correctAnswer + wrongAnswers)
    if (rawQuestion.options) {
      // Old format - already has 3 options, just return as-is
      return rawQuestion;
    } else if (rawQuestion.correctAnswer && rawQuestion.wrongAnswers) {
      // New enhanced format - randomly select 2 wrong answers + correct answer
      const correctAnswer = rawQuestion.correctAnswer;
      const wrongAnswers = [...rawQuestion.wrongAnswers]; // Copy array
      
      // Randomly select 2 wrong answers
      const selectedWrongAnswers = [];
      for (let i = 0; i < 2 && wrongAnswers.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * wrongAnswers.length);
        selectedWrongAnswers.push(wrongAnswers.splice(randomIndex, 1)[0]);
      }
      
      // Combine correct and wrong answers
      const allOptions = [correctAnswer, ...selectedWrongAnswers];
      
      // Shuffle the options to randomize correct answer position
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
      }
      
      // Find the new position of the correct answer
      const correctIndex = allOptions.indexOf(correctAnswer);
      
      return {
        question: rawQuestion.question,
        options: allOptions,
        correct: correctIndex
      };
    } else {
      console.warn('Invalid question format:', rawQuestion);
      return null;
    }
  }

  updateQuestionDisplay() {
    if (!this.triviaContainer || !this.currentQuestion) return;

    const questionText = this.triviaContainer.querySelector('#questionText');
    const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');

    // Display category and question
    const categoryDisplay = this.currentCategory.replace('-', ' & ').toUpperCase();
    questionText.innerHTML = `<strong>[${categoryDisplay}]</strong><br>${this.currentQuestion.question}`;

    // Update answer buttons
    answerButtons.forEach((button, index) => {
      if (index < this.currentQuestion.options.length) {
        button.textContent = `${String.fromCharCode(65 + index)}: ${this.currentQuestion.options[index]}`;
        button.style.display = 'block';
        button.disabled = false;
        button.className = 'answer-btn'; // Reset styling
      } else {
        button.style.display = 'none';
      }
    });
  }

  startQuestionTimer() {
    // Reset timeout handling flag
    this.handlingTimeout = false;
    
    // reset time and UI
    this.timeLeft = this.questionTime;
    this.updateTimerDisplay();

    // clear prior timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // start new interval
    this.timer = setInterval(() => {
      // Don't process if we're already handling a timeout
      if (this.handlingTimeout) {
        clearInterval(this.timer);
        this.timer = null;
        return;
      }

      this.timeLeft--;
      if (this.timeLeft <= 0) {
        // Set flag FIRST to prevent multiple timeouts
        this.handlingTimeout = true;
        
        // clamp, stop, fire timeout once
        clearInterval(this.timer);
        this.timer = null;
        this.timeLeft = 0;
        this.updateTimerDisplay();

        // Handle timeout with flag protection
        this.handleTimeout();
      } else {
        this.updateTimerDisplay();
      }
    }, 1000);
    
    console.log('Started question timer for ' + this.questionTime + ' seconds');
  }

  updateTimerDisplay() {
    // clamp display
    if (this.timeLeft < 0) this.timeLeft = 0;
    const progressBar = this.triviaContainer.querySelector('#questionProgress');
    const timeDisplay = this.triviaContainer.querySelector('#timeLeft');
    timeDisplay.textContent = `${this.timeLeft}s`;
    const progress = (this.timeLeft / this.questionTime) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Change color as time runs out
    if (this.timeLeft <= 10) {
      progressBar.style.backgroundColor = '#e74c3c';
    } else if (this.timeLeft <= 20) {
      progressBar.style.backgroundColor = '#f39c12';
    } else {
      progressBar.style.backgroundColor = '#27ae60';
    }
  }

  handleAnswer(selectedAnswer) {
    if (!this.currentQuestion || !this.isActive) return;

    const isCorrect = selectedAnswer === this.currentQuestion.correct;
    const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');

    // Clear timer
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Disable all buttons and show correct answer
    answerButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === this.currentQuestion.correct) {
        button.classList.add('correct-answer');
      } else if (index === selectedAnswer && !isCorrect) {
        button.classList.add('wrong-answer');
      }
    });    if (isCorrect) {
      this.damageMultiplier += 0.5;
      this.updateMultiplierDisplay();
      
      // Dispatch event for correct answer tracking
      const triviaCorrectAnswerEvent = new CustomEvent('triviaCorrectAnswer', {
        detail: {
          message: 'Correct trivia answer',
          multiplierBonus: 0.5,
          timestamp: Date.now()
        }
      });
      document.dispatchEvent(triviaCorrectAnswerEvent);
      
      this.showFeedback('Correct! +0.5 memory sync multiplier!', 'success');
    } else {
      // Wrong answer - reduce multiplier by 5.0 (but don't go below 0)
      this.damageMultiplier = Math.max(0, this.damageMultiplier - 5.0);
      this.updateMultiplierDisplay();
        // Dispatch event for boss healing ONLY ONCE
      const triviaWrongAnswerEvent = new CustomEvent('triviaWrongAnswer', {
        detail: {
          message: 'Wrong trivia answer',
          healingAmount: 50,
          timestamp: Date.now() // Add timestamp for deduplication consistency
        }
      });
      document.dispatchEvent(triviaWrongAnswerEvent);
      
      this.showFeedback('Wrong answer! Boss healed 50 HP! -5.0 memory sync multiplier!', 'error');
    }

    // Load new question after 3 seconds
    setTimeout(() => {
      if (this.isActive) {
        this.prepareNextQuestion();
      }
    }, 3000);
  }

  // Add dedicated timeout handler
  handleTimeout() {
    if (!this.currentQuestion || !this.isActive) {
      console.log('handleTimeout: Skipping timeout handler - inactive or no question');
      return;
    }
    
    console.log('Handling trivia timeout');

    // Set flag to prevent multiple dispatches
    this.handlingTimeout = true;

    // Clear any lingering timers first
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');
    
    // Disable all buttons and show correct answer
    answerButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === this.currentQuestion.correct) {
        button.classList.add('correct-answer');
      }
    });

    // Dispatch timeout event for boss healing EXACTLY ONCE
    console.log('Dispatching triviaTimeout event');
    const triviaTimeoutEvent = new CustomEvent('triviaTimeout', {
      detail: {
        message: 'Trivia question timed out',
        healingAmount: 20, // Changed from 10 to 20
        timestamp: Date.now() // Add timestamp for deduplication
      }
    });
    document.dispatchEvent(triviaTimeoutEvent);
    
    // Display feedback
    this.showFeedback('Time\'s up! Boss healed 20 HP!', 'timeout');

    // Load new question after 3 seconds - use standard prepare method instead of recreating
    console.log('Scheduling next question in 3 seconds after timeout');
    setTimeout(() => {
      // Reset timeout flag
      this.handlingTimeout = false;
      this.questionInTransition = false;
      
      if (this.isActive) {
        console.log('Preparing next question after timeout');
        this.prepareNextQuestion();
      }
    }, 3000);
  }
  
  // Update prepareNextQuestion to be more robust
  prepareNextQuestion() {
    if (!this.isActive) {
      console.log('prepareNextQuestion: Trivia not active, skipping');
      return;
    }
    
    console.log('Preparing next trivia question');
    
    // Reset all state flags
    this.handlingTimeout = false;
    this.questionInTransition = false;
    
    // Reset UI state before loading new question
    try {
      const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');
      answerButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.className = 'answer-btn'; // Reset all styling
      });

      // Hide feedback
      const feedback = this.triviaContainer.querySelector('#triviaFeedback');
      if (feedback) {
        feedback.style.display = 'none';
      }
      
      // Reset timer display
      const timeDisplay = this.triviaContainer.querySelector('#timeLeft');
      if (timeDisplay) {
        timeDisplay.textContent = `${this.questionTime}s`;
      }
      
      // Reset progress bar
      const progressBar = this.triviaContainer.querySelector('#questionProgress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#27ae60';
      }

      // Load a new question
      console.log('Loading new question after UI reset');
      this.loadNewQuestion();
      
    } catch (err) {
      console.error('Error in prepareNextQuestion:', err);
      
      // Emergency recovery if UI reset fails
      setTimeout(() => {
        if (this.isActive) {
          this.loadNewQuestion();
        }
      }, 500);
    }
  }

  showFeedback(message, type) {
    const feedback = this.triviaContainer.querySelector('#triviaFeedback');
    if (feedback) {
      feedback.textContent = message;
      feedback.className = `feedback ${type}`;
      feedback.style.display = 'block';
      
      // Auto-hide feedback after a few seconds (but keep trivia visible)
      setTimeout(() => {
        feedback.style.display = 'none';
      }, 2500);
    }
  }

  disableAnswers() {
    const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.6';
    });
  }

  hideTrivia() {
    this.isActive = false;
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.boundKeyHandler);
    
    if (this.triviaContainer) {
      this.triviaContainer.style.display = 'none';
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.resetMultiplier();
  }

  updateMultiplierDisplay() {
    const multiplierValue = this.triviaContainer.querySelector('#multiplierValue');
    if (multiplierValue) {
      multiplierValue.textContent = `×${(1 + this.damageMultiplier).toFixed(1)}`;
      
      // Add animation effect
      multiplierValue.style.animation = 'none';
      setTimeout(() => {
        multiplierValue.style.animation = 'multiplierPulse 0.5s ease-in-out';
      }, 10);
    }
  }

  getDamageMultiplier() {
    return this.damageMultiplier;
  }

  resetMultiplier() {
    this.damageMultiplier = 0;
    this.updateMultiplierDisplay();
  }

  // Method to be called when damage is dealt
  applyMultiplierAndReset() {
    const multiplier = 1 + this.damageMultiplier;
    this.resetMultiplier();
    return multiplier;
  }

  // Add new method to handle trivia keyboard input
  handleTriviaKeys(event) {
    // Only handle keys if trivia is active and we have a current question
    if (!this.isActive || !this.currentQuestion) return;
    
    // Only handle if answer buttons are enabled (not disabled after answering)
    const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');
    if (!answerButtons[0] || answerButtons[0].disabled) return;
    
    let answerIndex = -1;
    
    // Map keys to answer indices
    switch(event.key.toLowerCase()) {
      case 'a':
        answerIndex = 0;
        break;
      case 's':
        answerIndex = 1;
        break;
      case 'd':
        answerIndex = 2;
        break;
      default:
        return; // Don't handle other keys
    }
    
    // Prevent default behavior and handle the answer
    if (answerIndex >= 0 && answerIndex < this.currentQuestion.options.length) {
      event.preventDefault();
      
      // Visual feedback - briefly highlight the selected button
      const selectedButton = answerButtons[answerIndex];
      selectedButton.style.backgroundColor = 'rgba(52, 152, 219, 0.6)';
      selectedButton.style.transform = 'scale(1.05)';
      
      // Reset visual feedback after a short delay, then handle the answer
      setTimeout(() => {
        selectedButton.style.backgroundColor = '';
        selectedButton.style.transform = '';
        this.handleAnswer(answerIndex);
      }, 150);
    }
  }
}

// Create global trivia manager instance
window.triviaManager = new TriviaManager();
