// ErgoArena Trivia System
class TriviaManager {
  constructor() {
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
    this.questionTime = 30; // Default question time limit
    
    // Load all trivia data
    this.loadTriviaData();
  }  async loadTriviaData() {
    try {
      for (const category of this.categories) {
        const response = await fetch(`../data/trivia/${category}.json`);
        if (response.ok) {
          this.triviaData[category] = await response.json();
        } else {
          console.warn(`Failed to load trivia data for category: ${category} (Status: ${response.status})`);
          this.triviaData[category] = [];
        }
      }
      console.log('Trivia data loaded successfully');
    } catch (error) {
      console.error('Error loading trivia data:', error);
    }
  }

  createTriviaContainer(monsterContainerIndex) {
    // Create the trivia container
    const triviaContainer = document.createElement("div");
    triviaContainer.id = "triviaContainer" + monsterContainerIndex;
    triviaContainer.className = "trivia-container";
    
    triviaContainer.innerHTML = `
      <div class="trivia-header">
        <h3>🧠 ULTIMATE TRIVIA</h3>
        <div class="multiplier-display">
          <span>Damage Multiplier: </span>
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
    `;    // Position the trivia container higher up for better PC monitor visibility
    triviaContainer.style.position = "absolute";
    triviaContainer.style.top = "470px"; // Raised position for better visibility - matches CSS
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
    this.loadNewQuestion();
  }

  stopTrivia() {
    this.isActive = false;
    if (this.triviaContainer) {
      this.triviaContainer.style.display = "none";
    }
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }
  loadNewQuestion() {
    if (!this.isActive) return;

    // Select random category
    const availableCategories = this.categories.filter(cat => 
      this.triviaData[cat] && this.triviaData[cat].length > 0
    );
    
    if (availableCategories.length === 0) {
      console.warn('No trivia data available');
      return;
    }

    this.currentCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const categoryData = this.triviaData[this.currentCategory];
    
    // Select random question
    const rawQuestion = categoryData[Math.floor(Math.random() * categoryData.length)];
    
    // Process question to create randomized options
    this.currentQuestion = this.processQuestionData(rawQuestion);
    
    // Update UI
    this.updateQuestionDisplay();
    this.startQuestionTimer();
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
    this.timeLeft = this.questionTime;
    this.updateTimerDisplay();
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        
        // Dispatch trivia timeout event for boss healing
        const triviaTimeoutEvent = new CustomEvent('triviaTimeout', {
          detail: {
            message: 'Trivia question timed out',
            healingAmount: 10
          }
        });
        document.dispatchEvent(triviaTimeoutEvent);
        
        this.showFeedback('Time\'s up! Boss healed 10 HP!', 'timeout');
        this.disableAnswers();
        
        // Start the next question after a short delay
        setTimeout(() => {
          this.resetMultiplier();
          this.loadNextQuestion();
        }, 3000);
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const progressBar = this.triviaContainer.querySelector('#questionProgress');
    const timeDisplay = this.triviaContainer.querySelector('#timeLeft');

    // Update time display
    timeDisplay.textContent = `${this.timeLeft}s`;
    
    // Update progress bar
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
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }

    // Disable all buttons and show correct answer
    answerButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === this.currentQuestion.correct) {
        button.classList.add('correct-answer');
      } else if (index === selectedAnswer && !isCorrect) {
        button.classList.add('wrong-answer');
      }
    });

    if (isCorrect) {
      this.damageMultiplier += 0.5;
      this.updateMultiplierDisplay();
      this.showFeedback('Correct! +0.5 damage multiplier!', 'success');
    } else {
      // Wrong answer - dispatch event for boss healing
      const correctIndex = this.currentQuestion.correct;
      answerButtons[correctIndex].classList.add('correct-answer');
      
      // Dispatch wrong answer event for boss healing
      const triviaWrongAnswerEvent = new CustomEvent('triviaWrongAnswer', {
        detail: {
          message: 'Wrong trivia answer',
          healingAmount: 50
        }
      });
      document.dispatchEvent(triviaWrongAnswerEvent);
      
      this.showFeedback('Wrong answer! Boss healed 50 HP!', 'error');
      this.resetMultiplier();
    }

    // Load new question after 3 seconds
    setTimeout(() => {
      if (this.isActive) {
        this.loadNewQuestion();
      }
    }, 3000);
  }

  handleTimeout() {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }

    const answerButtons = this.triviaContainer.querySelectorAll('.answer-btn');
    answerButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === this.currentQuestion.correct) {
        button.classList.add('correct-answer');
      }
    });

    this.showFeedback('Time\'s up!', 'timeout');

    // Load new question after 3 seconds
    setTimeout(() => {
      if (this.isActive) {
        this.loadNewQuestion();
      }
    }, 3000);
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

  // Remove the hideTrivia call from timeout handling
  // Keep the hideTrivia method for manual hiding only
  hideTrivia() {
    if (this.triviaContainer) {
      this.triviaContainer.style.display = 'none';
    }
    this.resetMultiplier();
  }

  // Add method to load next question after timeout
  loadNextQuestion() {
    if (this.triviaContainer && this.triviaContainer.style.display !== 'none') {
      // Re-enable the trivia system and load a new question
      this.showRandomQuestion();
    }
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
    this.currentMultiplier = 1.0;
    this.updateMultiplierDisplay();
    // Don't hide trivia here - only reset the multiplier
  }

  // Method to be called when damage is dealt
  applyMultiplierAndReset() {
    const multiplier = 1 + this.damageMultiplier;
    this.resetMultiplier();
    return multiplier;
  }
}

// Create global trivia manager instance
window.triviaManager = new TriviaManager();
