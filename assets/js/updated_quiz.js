// Updated Quiz System with Multiple Questions and Results Display

let currentQuizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizTimer = null;
let timeRemaining = 0;
let isQuizSubmitted = false;

// Parse quiz questions from CSV format
function parseQuizQuestions(quizQuestionsString) {
    if (!quizQuestionsString) return [];

    // Split by ~ to get individual questions
    const questions = quizQuestionsString.split('~').map(q => q.trim()).filter(q => q.length > 0);

    return questions.map(question => {
        // Split by | to separate question from answer
        const parts = question.split('|');
        if (parts.length < 2) return null;

        const questionText = parts[0].trim();
        const correctAnswer = parts[1].trim();

        // Generate wrong answers (simple approach)
        const wrongAnswers = generateWrongAnswers(correctAnswer);

        // Shuffle all options
        const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        return {
            text: questionText,
            correctAnswer: correctAnswer,
            options: allOptions,
            correctIndex: allOptions.indexOf(correctAnswer)
        };
    }).filter(q => q !== null);
}

// Generate plausible wrong answers
function generateWrongAnswers(correctAnswer) {
    const commonWrongAnswers = {
        '5 minutes': ['1 minute', '10 minutes', '15 minutes'],
        '12 characters': ['8 characters', '6 characters', '20 characters'],
        '72 hours': ['24 hours', '7 days', '30 days'],
        'Social engineering': ['Ransomware', 'SQL injection', 'Phishing email'],
        '4%': ['2%', '10%', '20%'],
        'Transformational leadership': ['Transactional leadership', 'Servant leadership', 'Autocratic leadership'],
        'Active listening': ['Passive listening', 'Selective listening', 'Fake listening']
    };

    if (commonWrongAnswers[correctAnswer]) {
        return commonWrongAnswers[correctAnswer];
    }

    // Default wrong answers
    return [
        'Alternative answer 1',
        'Alternative answer 2',
        'Alternative answer 3'
    ];
}

// Start quiz
function startQuiz() {
    if (!currentModule || !currentModule.quiz) return;

    if (currentModule.completedLessons < currentModule.totalLessons) {
        showNotification(`Please complete all ${currentModule.totalLessons} lessons before taking the quiz.`, 'warning');
        return;
    }

    currentQuizData = currentModule.quiz;

    // Parse multiple questions if they exist
    if (currentQuizData.questions && Array.isArray(currentQuizData.questions)) {
        // Already parsed
    } else if (currentQuizData.quiz_questions) {
        // Parse from string format
        currentQuizData.questions = parseQuizQuestions(currentQuizData.quiz_questions);
    }

    if (!currentQuizData.questions || currentQuizData.questions.length === 0) {
        showNotification('No quiz questions found for this module.', 'error');
        return;
    }

    currentQuestionIndex = 0;
    userAnswers = [];
    isQuizSubmitted = false;
    timeRemaining = (currentQuizData.timeLimit || 30) * 60; // Convert to seconds

    currentQuizData.attempts = (currentQuizData.attempts || 0) + 1;

    renderQuizInterface();
    showSection('quiz');
    startQuizTimer();
}

// Render quiz interface
function renderQuizInterface() {
    if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) {
        console.error('No quiz data available');
        return;
    }

    const question = currentQuizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuizData.questions.length) * 100;
    const timeMinutes = Math.floor(timeRemaining / 60);
    const timeSeconds = timeRemaining % 60;

    const html = `
        <div class="professional-quiz-container fade-in">
            <!-- Quiz Header -->
            <div class="quiz-header-professional">
                <div class="quiz-title-section">
                    <h2>${currentQuizData.title || 'Module Quiz'}</h2>
                    <p>Question ${currentQuestionIndex + 1} of ${currentQuizData.questions.length}</p>
                </div>
                <div class="quiz-timer">
                    <i class="fas fa-clock"></i>
                    <span class="timer-text">${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}</span>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="quiz-progress-professional">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%">
                        <span class="progress-text">${progress.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            <!-- Question Container -->
            <div class="quiz-question-container">
                <h4 class="question-number">Question ${currentQuestionIndex + 1}</h4>
                <h3 class="question-text">${question.text}</h3>

                <!-- Answer Options -->
                <div class="quiz-options-professional">
                    ${renderQuizOptions(question)}
                </div>
            </div>

            <!-- Quiz Navigation -->
            <div class="quiz-controls-professional">
                <button class="btn btn-outline-secondary" onclick="previousQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left me-2"></i>Previous
                </button>

                <div class="question-counter">
                    <span>${currentQuestionIndex + 1} / ${currentQuizData.questions.length}</span>
                </div>

                ${currentQuestionIndex < currentQuizData.questions.length - 1 ? 
                    `<button class="btn btn-primary" onclick="nextQuestion()">
                        <i class="fas fa-chevron-right me-2"></i>Next
                    </button>` : 
                    `<button class="btn btn-success" onclick="submitQuiz()">
                        <i class="fas fa-check me-2"></i>Submit Quiz
                    </button>`
                }
            </div>
        </div>
    `;

    const quizPlayer = document.getElementById('quizPlayer');
    if (quizPlayer) {
        quizPlayer.innerHTML = html;
    }

    // Restore previous answer if exists
    if (userAnswers[currentQuestionIndex] !== undefined) {
        setTimeout(() => {
            const selectedOption = document.querySelector(\`.quiz-option-professional[data-option-index="\${userAnswers[currentQuestionIndex]}"]\`);
            if (selectedOption) {
                selectedOption.click();
            }
        }, 100);
    }
}

// Render quiz options
function renderQuizOptions(question) {
    if (!question.options || question.options.length === 0) {
        return '<p class="alert alert-warning">No options available for this question.</p>';
    }

    return question.options.map((option, index) => `
        <div class="quiz-option-professional" onclick="selectOption(${index})" data-option-index="${index}">
            <div class="option-indicator">
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            </div>
            <div class="option-text">${option}</div>
            <div class="option-checkmark">
                <i class="fas fa-check"></i>
            </div>
        </div>
    `).join('');
}

// Select an option
function selectOption(optionIndex) {
    const options = document.querySelectorAll('.quiz-option-professional');
    options.forEach(opt => opt.classList.remove('selected'));

    const selectedOption = document.querySelector(\`.quiz-option-professional[data-option-index="\${optionIndex}"]\`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }

    userAnswers[currentQuestionIndex] = optionIndex;
}

// Next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuizData.questions.length - 1) {
        currentQuestionIndex++;
        renderQuizInterface();
    }
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuizInterface();
    }
}

// Submit quiz
function submitQuiz() {
    if (isQuizSubmitted) return;
    isQuizSubmitted = true;

    stopQuizTimer();

    // Calculate results
    const results = calculateQuizResults();

    // Update completion status
    currentQuizData.completed = true;
    currentQuizData.passed = results.passed;
    currentQuizData.bestScore = Math.max(currentQuizData.bestScore || 0, results.score);

    // Mark as complete in app.js if available
    if (typeof markQuizComplete === 'function' && results.passed) {
        markQuizComplete(currentQuizData.id, true);
    }

    // Show results
    displayQuizResults(results);

    // Show notification
    if (results.passed) {
        showNotification('Congratulations! You passed the quiz!', 'success');
    } else {
        showNotification('Quiz not passed. Please review and try again.', 'warning');
    }
}

// Calculate quiz results
function calculateQuizResults() {
    let correctAnswers = 0;
    const totalQuestions = currentQuizData.questions.length;
    const detailedResults = [];

    currentQuizData.questions.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const isCorrect = userAnswerIndex === question.correctIndex;

        if (isCorrect) correctAnswers++;

        detailedResults.push({
            questionNumber: index + 1,
            question: question.text,
            userAnswer: question.options[userAnswerIndex] || 'Not answered',
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            options: question.options
        });
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= (currentQuizData.passingScore || 70);

    return {
        score,
        correctAnswers,
        totalQuestions,
        passed,
        detailedResults
    };
}

// Display quiz results
function displayQuizResults(results) {
    const resultClass = results.passed ? 'success' : 'danger';
    const resultIcon = results.passed ? 'fa-check-circle' : 'fa-times-circle';
    const resultTitle = results.passed ? 'Quiz Passed!' : 'Quiz Not Passed';

    const detailedResultsHTML = results.detailedResults.map((result, idx) => `
        <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
            <div class="result-header">
                <span class="question-num">Question ${result.questionNumber}</span>
                <span class="result-badge ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <i class="fas fa-${result.isCorrect ? 'check-circle' : 'times-circle'} me-1"></i>
                    ${result.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
            </div>
            <div class="result-question">${result.question}</div>
            <div class="result-details">
                <div class="answer-row user-answer">
                    <span class="label">Your Answer:</span>
                    <span class="text ${result.isCorrect ? 'text-success' : 'text-danger'}">${result.userAnswer}</span>
                </div>
                ${!result.isCorrect ? \`
                    <div class="answer-row correct-answer">
                        <span class="label">Correct Answer:</span>
                        <span class="text text-success">\${result.correctAnswer}</span>
                    </div>
                \` : ''}
            </div>
        </div>
    \`).join('');

    const html = \`
        <div class="quiz-results-container fade-in">
            <!-- Results Header -->
            <div class="results-header \${resultClass}">
                <i class="fas \${resultIcon} fa-3x"></i>
                <h2>\${resultTitle}</h2>
            </div>

            <!-- Score Summary -->
            <div class="score-summary">
                <div class="score-display">
                    <span class="score-number">\${results.score}%</span>
                    <span class="score-label">Final Score</span>
                </div>
                <div class="score-details">
                    <div class="score-detail">
                        <span class="detail-label">Correct Answers</span>
                        <span class="detail-value">\${results.correctAnswers} / \${results.totalQuestions}</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Passing Score</span>
                        <span class="detail-value">\${currentQuizData.passingScore || 70}%</span>
                    </div>
                    <div class="score-detail">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">\${results.passed ? 'PASSED' : 'FAILED'}</span>
                    </div>
                </div>
            </div>

            <!-- Detailed Results -->
            <div class="detailed-results">
                <h3>Detailed Results</h3>
                <div class="results-list">
                    \${detailedResultsHTML}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="results-actions">
                <button class="btn btn-primary" onclick="showSection('module')">
                    <i class="fas fa-arrow-left me-2"></i>Back to Module
                </button>
                \${!results.passed ? \`
                    <button class="btn btn-warning" onclick="retakeQuiz()">
                        <i class="fas fa-redo me-2"></i>Retake Quiz
                    </button>
                \` : ''}
                <button class="btn btn-outline-primary" onclick="showSection('dashboard')">
                    <i class="fas fa-home me-2"></i>Go to Dashboard
                </button>
            </div>
        </div>
    \`;

    const quizPlayer = document.getElementById('quizPlayer');
    if (quizPlayer) {
        quizPlayer.innerHTML = html;
    }
}

// Retake quiz
function retakeQuiz() {
    startQuiz();
}

// Quiz timer
function startQuizTimer() {
    quizTimer = setInterval(() => {
        timeRemaining--;

        // Update timer display
        const timerElement = document.querySelector('.timer-text');
        if (timerElement) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerElement.textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;

            // Change color when time is running low
            if (timeRemaining <= 300) { // 5 minutes
                timerElement.parentElement.classList.add('timer-warning');
            }
        }

        // Auto-submit when time expires
        if (timeRemaining <= 0) {
            stopQuizTimer();
            submitQuiz();
        }
    }, 1000);
}

function stopQuizTimer() {
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
}

// Quiz CSS Styles
const quizStyles = \`
<style>
/* Quiz Container */
.professional-quiz-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Quiz Header */
.quiz-header-professional {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.quiz-title-section h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
}

.quiz-title-section p {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
}

.quiz-timer {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.3rem;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
}

.timer-text.timer-warning {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* Progress Bar */
.quiz-progress-professional {
    height: 6px;
    background-color: #e9ecef;
}

.quiz-progress-professional .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    position: relative;
}

.progress-text {
    position: absolute;
    right: 10px;
    top: -20px;
    color: #667eea;
    font-size: 0.85rem;
    font-weight: bold;
}

/* Question Container */
.quiz-question-container {
    padding: 3rem 2rem;
}

.question-number {
    color: #667eea;
    font-size: 0.9rem;
    margin: 0 0 1rem 0;
    text-transform: uppercase;
    font-weight: 600;
}

.question-text {
    font-size: 1.5rem;
    color: #1a1a1a;
    margin: 0 0 2rem 0;
    line-height: 1.6;
}

/* Quiz Options */
.quiz-options-professional {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.quiz-option-professional {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.quiz-option-professional:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
}

.quiz-option-professional.selected {
    border-color: #667eea;
    background-color: #f0f3ff;
}

.option-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #f8f9fa;
    font-weight: bold;
    color: #667eea;
    flex-shrink: 0;
}

.quiz-option-professional.selected .option-indicator {
    background: #667eea;
    color: white;
}

.option-text {
    flex-grow: 1;
    color: #1a1a1a;
    font-size: 1rem;
}

.option-checkmark {
    opacity: 0;
    color: #667eea;
}

.quiz-option-professional.selected .option-checkmark {
    opacity: 1;
}

/* Quiz Controls */
.quiz-controls-professional {
    padding: 2rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.question-counter {
    color: #667eea;
    font-weight: bold;
    font-size: 1rem;
}

/* Quiz Results */
.quiz-results-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.3s ease;
}

.results-header {
    padding: 3rem 2rem;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.results-header.danger {
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.results-header i {
    display: block;
    margin-bottom: 1rem;
}

.results-header h2 {
    margin: 0;
    font-size: 2rem;
}

/* Score Summary */
.score-summary {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 2rem;
    padding: 2rem;
    border-bottom: 1px solid #e9ecef;
    align-items: center;
}

.score-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
}

.score-number {
    font-size: 3rem;
    font-weight: bold;
}

.score-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-top: 0.5rem;
}

.score-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.score-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
}

.detail-label {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
}

.detail-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
}

/* Detailed Results */
.detailed-results {
    padding: 2rem;
}

.detailed-results h3 {
    margin-top: 0;
    color: #1a1a1a;
    border-bottom: 2px solid #667eea;
    padding-bottom: 1rem;
}

.results-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.result-item {
    border-left: 4px solid #e9ecef;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.result-item.correct {
    border-left-color: #43e97b;
    background: #f0fdf4;
}

.result-item.incorrect {
    border-left-color: #f5576c;
    background: #fdf4f4;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.question-num {
    font-weight: 600;
    color: #1a1a1a;
}

.result-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.result-badge.correct {
    background-color: #d4edda;
    color: #155724;
}

.result-badge.incorrect {
    background-color: #f8d7da;
    color: #721c24;
}

.result-question {
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.result-details {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.answer-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
}

.label {
    font-weight: 600;
    color: #6c757d;
}

.text {
    color: #1a1a1a;
}

.text-success {
    color: #155724;
}

.text-danger {
    color: #721c24;
}

/* Results Actions */
.results-actions {
    padding: 2rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
    .quiz-header-professional {
        flex-direction: column;
        gap: 1rem;
    }

    .score-summary {
        grid-template-columns: 1fr;
    }

    .score-details {
        grid-template-columns: 1fr;
    }

    .results-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
\`;

// Inject styles
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', quizStyles);
}

// Export functions
window.startQuiz = startQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.submitQuiz = submitQuiz;
window.retakeQuiz = retakeQuiz;

console.log('Enhanced quiz system loaded with multiple questions and detailed results');
