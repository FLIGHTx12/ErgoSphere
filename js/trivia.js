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
    `;    // Position the trivia container higher up for better PC monitor visibility
    triviaContainer.style.position = "absolute";
    triviaContainer.style.top = "450px"; // Raised position for better visibility
    triviaContainer.style.left = "10px";
    triviaContainer.style.width = "350px";
    triviaContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
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
    this.currentQuestion = categoryData[Math.floor(Math.random() * categoryData.length)];
    
    // Update UI
    this.updateQuestionDisplay();
    this.startQuestionTimer();
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
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
    }

    let timeLeft = 30; // 30 seconds per question
    const progressBar = this.triviaContainer.querySelector('#questionProgress');
    const timeDisplay = this.triviaContainer.querySelector('#timeLeft');

    const updateTimer = () => {
      timeLeft--;
      timeDisplay.textContent = `${timeLeft}s`;
      
      // Update progress bar
      const progress = (timeLeft / 30) * 100;
      progressBar.style.width = `${progress}%`;
      
      // Change color as time runs out
      if (timeLeft <= 10) {
        progressBar.style.backgroundColor = '#e74c3c';
      } else if (timeLeft <= 20) {
        progressBar.style.backgroundColor = '#f39c12';
      } else {
        progressBar.style.backgroundColor = '#27ae60';
      }

      if (timeLeft <= 0) {
        this.handleTimeout();
      }
    };

    // Initial update
    timeDisplay.textContent = `${timeLeft}s`;
    progressBar.style.width = '100%';
    progressBar.style.backgroundColor = '#27ae60';

    this.questionTimer = setInterval(updateTimer, 1000);
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
      this.showFeedback('Wrong answer!', 'error');
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
    const questionText = this.triviaContainer.querySelector('#questionText');
    const originalContent = questionText.innerHTML;
    
    questionText.innerHTML = `<div class="feedback ${type}">${message}</div>`;
    
    // Restore original content after 2 seconds
    setTimeout(() => {
      questionText.innerHTML = originalContent;
    }, 2000);
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
}

// Create global trivia manager instance
window.triviaManager = new TriviaManager();
