// Complete Interactive Security Training with Full Implementation
let currentQuizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizTimer = null;
let timeRemaining = 0;
let isQuizSubmitted = false;

// Interactive Learning Variables
let currentInteractiveModule = null;
let interactiveScore = 0;
let interactiveProgress = 0;
let scenarioStep = 0;
let userChoices = {};
let phishingEmails = [];
let currentEmailIndex = 0;
let securityScenarios = {};
let currentScenarioIndex = 0;

// Password strength variables
let passwordTests = [];
let currentPasswordTestIndex = 0;
let passwordScore = 0;

// Policy decision variables  
let policyDecisions = [];
let currentPolicyIndex = 0;
let policyScore = 0;

// Module player functions
function renderModulePlayer() {
    if (!currentModule) return;

    const completedLessons = currentModule.lessons.filter(l => l.completed).length;
    const progressPercent = Math.round((completedLessons / currentModule.totalLessons) * 100);

    const html = `
        <div class="module-player fade-in">
            <button class="btn btn-outline-primary mb-3" onclick="backToCourse()">
                <i class="fas fa-arrow-left me-2"></i>Back to Course
            </button>

            <div class="module-player-header">
                <h1 class="module-player-title">${currentModule.title}</h1>
                <p class="module-player-description">${currentModule.description}</p>
                
                <div class="module-stats">
                    <span class="module-stat">
                        <i class="fas fa-play-circle me-1"></i>
                        ${currentModule.totalLessons} Lessons
                    </span>
                    <span class="module-stat">
                        <i class="fas fa-clock me-1"></i>
                        ${currentModule.duration} minutes
                    </span>
                    <span class="module-stat">
                        <i class="fas fa-check-circle me-1"></i>
                        ${completedLessons}/${currentModule.totalLessons} Completed
                    </span>
                </div>

                <div class="module-progress">
                    <div class="progress-label">
                        <span>Module Progress</span>
                        <span><strong>${progressPercent}%</strong></span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <h3 class="mb-3">Lessons</h3>
                    <div class="lessons-list">
                        ${renderLessonsList()}
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="module-sidebar">
                        <div class="sidebar-section" style="margin-top: 3.2rem !important;">
                            <h4><i class="fas fa-info-circle me-2"></i>Module Overview</h4>
                            <p>${currentModule.description}</p>
                        </div>

                        ${currentModule.quiz ? `
                        <div class="sidebar-section quiz-section">
                            <h4><i class="fas fa-question-circle me-2"></i>Module Quiz</h4>
                            <p>${currentModule.quiz.questions.length} Questions</p>
                            <p class="text-muted">Complete all lessons to unlock</p>
                            <button class="btn btn-warning w-100" 
                                    onclick="startModuleQuiz('${currentCourse.id}', '${currentModule.id}')"
                                    ${completedLessons < currentModule.totalLessons ? 'disabled' : ''}>
                                <i class="fas fa-play me-2"></i>
                                ${currentModule.quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#modulePlayer').html(html);
}

// ✅ FIXED: Lesson List Rendering with Proper HTML Escaping
function renderLessonsList() {
    if (!currentModule || !currentModule.lessons) return '';

    return currentModule.lessons.map((lesson, index) => {
        const isCompleted = lesson.completed;
        const statusClass = isCompleted ? 'completed' : '';
        const statusText = isCompleted ? 'Completed' : 'Not completed';
        const statusIcon = isCompleted ? 'fa-check-circle' : 'fa-circle';
        const buttonText = isCompleted ? 'Review Lesson' : 'Start Lesson';
        const buttonClass = isCompleted ? 'btn-outline-primary' : 'btn-primary';
        const buttonIcon = isCompleted ? 'fa-eye' : 'fa-play';

        // Extract plain text preview from content (remove HTML tags)
        const contentPreview = extractTextPreview(lesson.content, 150);
        const objectivesText = lesson.objectives || 'Master the key concepts and apply them effectively';

        return `
            <div class="lesson-card ${statusClass}" data-lesson-index="${index}">
                <div class="lesson-number">
                    <span class="lesson-badge ${statusClass}">${index + 1}</span>
                </div>
                <div class="lesson-details">
                    <div class="lesson-header">
                        <div class="lesson-title-section">
                            <h5 class="lesson-title">
                                <i class="fas fa-book-open me-2"></i>
                                ${escapeHtml(lesson.title)}
                            </h5>
                            <span class="lesson-type-badge ${lesson.type.toLowerCase()}">${lesson.type}</span>
                        </div>
                        <div class="lesson-meta">
                            <span class="lesson-duration">
                                <i class="fas fa-clock me-1"></i>${lesson.duration} min
                            </span>
                            <span class="lesson-status ${statusClass}">
                                <i class="fas ${statusIcon} me-1"></i>
                                ${statusText}
                            </span>
                        </div>
                    </div>

                    <div class="lesson-content-preview">
                        <p>${contentPreview}</p>
                        <div class="lesson-objectives">
                            <strong>Learning Objectives:</strong> ${escapeHtml(objectivesText)}
                        </div>
                    </div>

                    <div class="lesson-actions">
                        <button class="btn ${buttonClass} btn-lesson-start" onclick="openLesson(${index})">
                            <i class="fas ${buttonIcon} me-2"></i>
                            ${buttonText}
                        </button>
                        ${isCompleted ? '<span class="completion-badge"><i class="fas fa-check-circle text-success me-1"></i>Complete</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ✅ HELPER: Extract Plain Text Preview from HTML Content
function extractTextPreview(htmlContent, maxLength = 150) {
    if (!htmlContent) return 'No content available.';

    // Create a temporary div to parse HTML
    const temp = $('<div>').html(htmlContent);
    
    // Get plain text
    let text = temp.text().trim();
    
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ');
    
    // Truncate
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
    }
    
    return text || 'Content preview not available.';
}

// ✅ HELPER: Escape HTML to Prevent Rendering Issues
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}


function confirmTrainingAnswer(scenarioId) {
    if (currentSelectedOption === null) {
        showNotification('Please select an answer first', 'warning');
        return;
    }

    if (trainingAnswerConfirmed) {
        return;
    }

    trainingAnswerConfirmed = true;

    // Get current scenario and option
    const selectedOption = getCurrentScenarioOption();

    if (!selectedOption) {
        console.error('Could not get selected option');
        return;
    }

    // Disable options
    $('.training-option').css('pointer-events', 'none');
    $('#confirmTrainingBtn').prop('disabled', true).html('<i class="fas fa-check-circle me-2"></i>Answer Submitted');

    // Show feedback
    const feedbackClass = selectedOption.correct ? 'alert-success' : 'alert-danger';
    const feedbackIcon = selectedOption.correct ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
    const feedbackTitle = selectedOption.correct ? '✓ Correct!' : '✗ Incorrect';

    const feedbackHtml = `
        <div class="alert ${feedbackClass}">
            <h5><i class="fas ${feedbackIcon} me-2"></i>${feedbackTitle}</h5>
            <p><strong>Explanation:</strong> ${selectedOption.explanation}</p>
            ${selectedOption.correct ? '<p class="mb-0"><i class="fas fa-trophy text-warning me-2"></i>Great job! You demonstrated excellent judgment.</p>' : ''}
        </div>
    `;

    $('#trainingFeedback').html(feedbackHtml).show();
    $('#continueTrainingBtn').removeClass('d-none');

    // Award points if correct
    if (selectedOption.correct) {
        const pointsEarned = 2; // 2 points per correct answer
        completeTrainingModule(pointsEarned);
    }
}

function renderModuleQuiz() {
    if (!currentModule.quiz) {
        return `
            <div class="quiz-section">
                <h4 class="quiz-section-title">Module Assessment</h4>
                <div class="quiz-card">
                    <div class="quiz-card-body text-center">
                        <i class="fas fa-info-circle quiz-icon-muted"></i>
                        <p class="quiz-message">No quiz available for this module</p>
                    </div>
                </div>
            </div>
        `;
    }

    const quiz = currentModule.quiz;
    const requiredLessons = currentModule.totalLessons;
    const completedLessons = currentModule.completedLessons;
    const canTakeQuiz = completedLessons >= requiredLessons;

    let statusColor = 'status-pending';
    let statusIcon = 'fa-clock';
    let statusText = 'Pending';
    let actionButton = '';

    // FIXED: Show actual score instead of 0%
    const actualScore = quiz.bestScore || 0;
    const lastScore = quiz.lastScore || 0;

    console.log('Quiz status:', {
        completed: quiz.completed,
        passed: quiz.passed,
        bestScore: quiz.bestScore,
        lastScore: quiz.lastScore,
        actualScore: actualScore
    });

    if (!canTakeQuiz) {
        statusText = `Complete all ${requiredLessons} lessons first`;
        statusIcon = 'fa-lock';
        statusColor = 'status-locked';
        actionButton = `
            <button class="btn btn-secondary btn-quiz-action" disabled>
                <i class="fas fa-lock me-2"></i>Quiz Locked
            </button>
        `;
    } else if (quiz.completed && quiz.passed) {
        statusColor = 'status-passed';
        statusIcon = 'fa-check-circle';
        // FIXED: Display actual score, not 0%
        statusText = `Passed (${actualScore}%)`;
        actionButton = `
            <button class="btn btn-outline-primary btn-quiz-action" onclick="retakeQuiz()">
                <i class="fas fa-redo me-2"></i>Retake Quiz
            </button>
        `;
    } else if (quiz.completed && !quiz.passed) {
        statusColor = 'status-failed';
        statusIcon = 'fa-times-circle';
        statusText = `Failed (${lastScore}%) - Try Again`;
        actionButton = `
            <button class="btn btn-warning btn-quiz-action" onclick="retakeQuiz()">
                <i class="fas fa-redo me-2"></i>Retake Quiz
            </button>
        `;
    } else {
        statusText = 'Ready to start';
        statusColor = 'status-ready';
        statusIcon = 'fa-play';
        actionButton = `
            <button class="btn btn-success btn-quiz-action" onclick="startQuiz()">
                <i class="fas fa-play me-2"></i>Start Quiz
            </button>
        `;
    }

    return `
        <div class="quiz-section">
            <h4 class="quiz-section-title">Module Quiz</h4>
            <div class="quiz-card">
                <div class="quiz-card-header">
                    <h6 class="quiz-title">${quiz.title}</h6>
                    <span class="quiz-status ${statusColor}">
                        <i class="fas ${statusIcon} me-1"></i>${statusText}
                    </span>
                </div>
                <div class="quiz-card-body">
                    <div class="quiz-meta-grid">
                        <div class="quiz-meta-item">
                            <i class="fas fa-question-circle"></i>
                            <span class="quiz-meta-value">${quiz.questions.length}</span>
                            <span class="quiz-meta-label">questions</span>
                        </div>
                        <div class="quiz-meta-item">
                            <i class="fas fa-clock"></i>
                            <span class="quiz-meta-value">${quiz.timeLimit}</span>
                            <span class="quiz-meta-label">minutes</span>
                        </div>
                        <div class="quiz-meta-item">
                            <i class="fas fa-target"></i>
                            <span class="quiz-meta-value">${quiz.passingScore}%</span>
                            <span class="quiz-meta-label">to pass</span>
                        </div>
                        ${actualScore > 0 ? `
                        <div class="quiz-meta-item">
                            <i class="fas fa-trophy"></i>
                            <span class="quiz-meta-value">${actualScore}%</span>
                            <span class="quiz-meta-label">best score</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="quiz-action-area">
                        ${actionButton}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getLessonIcon(type) {
    const icons = {
        'Video': 'play-circle',
        'Interactive': 'gamepad',
        'Reading': 'book',
        'Scenario': 'users',
        'Assessment': 'clipboard-check',
        'Review': 'eye'
    };
    return icons[type] || 'file-text';
}

// Lesson player
function openLesson(lessonIndex) {
    if (!currentModule || !currentModule.lessons || !currentModule.lessons[lessonIndex]) {
        console.error('Invalid lesson index or module not selected');
        showNotification('Lesson not found', 'error');
        return;
    }
    
    currentLesson = currentModule.lessons[lessonIndex];
    console.log('Opening lesson:', currentLesson.title, 'Type:', currentLesson.type);
    
    // Pass the lesson object to renderLessonPlayer
    renderLessonPlayer(currentLesson);
    showSection('lesson');
}


function renderLessonPlayer(lesson) {
    // Add validation at the start
    if (!lesson) {
        console.error('No lesson provided to renderLessonPlayer');
        showNotification('Lesson data not available', 'error');
        showSection('module');
        return;
    }

    // Set as current lesson
    currentLesson = lesson;

    const lessonIndex = currentModule.lessons.findIndex(l => l.id === lesson.id);
    const isFirstLesson = lessonIndex === 0;
    const isLastLesson = lessonIndex === currentModule.lessons.length - 1;
    const nextLesson = !isLastLesson ? currentModule.lessons[lessonIndex + 1] : null;
    const prevLesson = !isFirstLesson ? currentModule.lessons[lessonIndex - 1] : null;

    const isCompleted = lesson.completed || userData.completedLessons.includes(lesson.id);
    
    // Calculate module progress
    const totalLessons = currentModule.lessons.length;
    const completedCount = currentModule.lessons.filter(l => 
        l.completed || userData.completedLessons.includes(l.id)
    ).length;
    const progressPercent = Math.round((completedCount / totalLessons) * 100);

    const html = `
        <div class="professional-lesson-layout fade-in">
            <!-- Top Navigation Bar -->
            <div class="lesson-top-nav">
                <button class="btn btn-outline-secondary" onclick="showSection('module')">
                    <i class="fas fa-arrow-left me-2"></i>Back to Module
                </button>
                <div class="breadcrumb-trail">
                    <span class="breadcrumb-item">${currentCourse.title}</span>
                    <i class="fas fa-chevron-right mx-2"></i>
                    <span class="breadcrumb-item">${currentModule.title}</span>
                    <i class="fas fa-chevron-right mx-2"></i>
                    <span class="breadcrumb-item active">${lesson.title}</span>
                </div>
            </div>

            <div class="lesson-container-grid">
                <!-- Main Content Area -->
                <div class="lesson-main-content">
                    <!-- Lesson Header Card -->
                    <div class="lesson-header-card">
                        <div class="lesson-type-badge ${lesson.type.toLowerCase()}">
                            <i class="fas fa-${getLessonIcon(lesson.type)}"></i>
                            ${lesson.type}
                        </div>
                        <h1 class="lesson-main-title">${lesson.title}</h1>
                        <div class="lesson-meta-row">
                            <span class="meta-item">
                                <i class="fas fa-clock"></i>
                                ${lesson.duration} minutes
                            </span>
                            <span class="meta-item">
                                <i class="fas fa-layer-group"></i>
                                Lesson ${lessonIndex + 1} of ${totalLessons}
                            </span>
                            ${isCompleted ? `
                                <span class="meta-item completed-badge">
                                    <i class="fas fa-check-circle"></i>
                                    Completed
                                </span>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Learning Objectives Panel -->
                    ${lesson.objectives ? `
                        <div class="objectives-panel">
                            <div class="panel-icon">
                                <i class="fas fa-bullseye"></i>
                            </div>
                            <div class="panel-content">
                                <h3 class="panel-title">Learning Objectives</h3>
                                <p class="panel-text">${lesson.objectives}</p>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Video Player (if video lesson) -->
                    ${lesson.type === 'Video' && lesson.videoUrl ? `
                        <div class="video-player-wrapper">
                            <div class="video-container">
                                <iframe 
                                    src="${lesson.videoUrl}" 
                                    class="lesson-video-iframe"
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Lesson Content Card -->
                    <div class="content-card">
                        <div class="content-header">
                            <h2 class="content-title">
                                <i class="fas fa-book-reader me-2"></i>
                                Lesson Content
                            </h2>
                        </div>
                        <div class="content-body">
                            ${formatLessonContent(lesson.content)}
                        </div>
                    </div>

                    <!-- Interactive Content (if applicable) -->
                    ${lesson.interactiveContent ? renderInteractiveContentPreview(lesson.interactiveContent) : ''}

                    <!-- Key Takeaways Section -->
                    <div class="takeaways-panel">
                        <div class="panel-icon-large">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div>
                            <h3 class="panel-title">Key Takeaways</h3>
                            <ul class="takeaways-list">
                                ${generateKeyTakeaways(lesson.content)}
                            </ul>
                        </div>
                    </div>

                    <!-- Lesson Navigation Footer -->
                    <div class="lesson-nav-footer">
                        <div class="nav-footer-left">
                            ${prevLesson ? `
                                <button class="btn btn-outline-primary" onclick="openLesson(${lessonIndex - 1})">
                                    <i class="fas fa-arrow-left me-2"></i>
                                    Previous Lesson
                                </button>
                            ` : '<div></div>'}
                        </div>
                        <div class="nav-footer-center">
                            ${!isCompleted ? `
                                <button class="btn btn-success btn-lg" onclick="markLessonComplete('${lesson.id}'); ${nextLesson ? `openLesson(${lessonIndex + 1})` : `showSection('module')`}">
                                    <i class="fas fa-check-circle me-2"></i>
                                    Mark Complete & Continue
                                </button>
                            ` : nextLesson ? `
                                <button class="btn btn-primary btn-lg" onclick="openLesson(${lessonIndex + 1})">
                                    Continue to Next Lesson
                                    <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                            ` : `
                                <button class="btn btn-primary btn-lg" onclick="showSection('module')">
                                    <i class="fas fa-trophy me-2"></i>
                                    Complete Module
                                </button>
                            `}
                        </div>
                        <div class="nav-footer-right">
                            ${nextLesson ? `
                                <button class="btn btn-outline-primary" onclick="openLesson(${lessonIndex + 1})">
                                    Next Lesson
                                    <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                            ` : '<div></div>'}
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lesson-sidebar">
                    <!-- Module Progress Card -->
                    <div class="sidebar-card progress-card">
                        <h4 class="sidebar-card-title">
                            <i class="fas fa-chart-line me-2"></i>
                            Your Progress
                        </h4>
                        <div class="progress-stats">
                            <div class="progress-circle">
                                <svg viewBox="0 0 36 36" class="circular-chart">
                                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                    <path class="circle" stroke-dasharray="${progressPercent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                    <text x="18" y="20.35" class="percentage">${progressPercent}%</text>
                                </svg>
                            </div>
                            <div class="progress-text">
                                <strong>${completedCount}</strong> of <strong>${totalLessons}</strong> lessons completed
                            </div>
                        </div>
                    </div>

                    <!-- Module Content List -->
                    <div class="sidebar-card module-content-card">
                        <h4 class="sidebar-card-title">
                            <i class="fas fa-list me-2"></i>
                            Module Content
                        </h4>
                        <div class="module-lessons-list">
                            ${renderSidebarLessonsList(lessonIndex)}
                        </div>
                    </div>

                    <!-- Quick Actions Card -->
                    <div class="sidebar-card quick-actions-card">
                        <h4 class="sidebar-card-title">
                            <i class="fas fa-bolt me-2"></i>
                            Quick Actions
                        </h4>
                        <div class="quick-actions-list">
                            <button class="quick-action-btn" onclick="showSection('module')">
                                <i class="fas fa-th-large"></i>
                                Module Overview
                            </button>
                            <button class="quick-action-btn" onclick="showSection('courses')">
                                <i class="fas fa-book"></i>
                                All Courses
                            </button>
                            ${currentModule.quiz ? `
                                <button class="quick-action-btn" onclick="startQuiz(currentModule.quiz)">
                                    <i class="fas fa-question-circle"></i>
                                    Take Module Quiz
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Resources Card -->
                    <div class="sidebar-card resources-card">
                        <h4 class="sidebar-card-title">
                            <i class="fas fa-download me-2"></i>
                            Resources
                        </h4>
                        <div class="resources-list">
                            <a href="#" class="resource-item">
                                <i class="fas fa-file-pdf"></i>
                                Lesson Notes (PDF)
                            </a>
                            <a href="#" class="resource-item">
                                <i class="fas fa-file-powerpoint"></i>
                                Presentation Slides
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#lessonPlayer').html(html);
}

// Helper functions
function getLessonIcon(type) {
    const icons = {
        'Video': 'play-circle',
        'Reading': 'book-open',
        'Interactive': 'hands',
        'Scenario': 'theater-masks',
        'Assessment': 'clipboard-check'
    };
    return icons[type] || 'book';
}

function formatLessonContent(content) {
    if (!content) return '<p class="content-paragraph">No content available.</p>';
    
    // Content is already formatted as HTML from the PDF parser
    // Just ensure it's wrapped properly
    if (content.includes('<p class="content-paragraph">') || 
        content.includes('<ul class="content-list">')) {
        return content;
    }
    
    // Fallback: basic formatting for non-HTML content
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs
        .filter(p => p.trim())
        .map(p => {
            p = p.trim();
            // Check if it's a bullet point
            if (p.startsWith('•') || p.startsWith('-') || /^\d+\./.test(p)) {
                const items = p.split('\n')
                    .filter(item => item.trim())
                    .map(item => {
                        const text = item.replace(/^[•\-\d\.]+\s*/, '').trim();
                        return `<li class="content-list-item">${text}</li>`;
                    })
                    .join('');
                return `<ul class="content-list">${items}</ul>`;
            }
            return `<p class="content-paragraph">${p}</p>`;
        })
        .join('');
}

function generateKeyTakeaways(content) {
    // Remove ALL HTML tags first for clean processing
    let cleanContent = content.replace(/<[^>]*>/g, ' ');
    
    // Clean up multiple spaces and newlines
    cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
    
    // Split into sentences
    const sentences = cleanContent
        .split(/\.\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30); // Only meaningful sentences
    
    // Take first 3
    const takeaways = sentences.slice(0, 3).map(sentence => {
        let text = sentence.trim();
        
        // Ensure it ends with period
        if (!text.endsWith('.')) {
            text += '.';
        }
        
        // ✅ Return clean, consistent format
        return `<li class="takeaway-item"><i class="fas fa-check-circle me-2"></i>${text}</li>`;
    });
    
    // Fallback
    if (takeaways.length < 3) {
        const defaults = [
            'Understand the core concepts and principles covered in this lesson.',
            'Apply the knowledge in real-world scenarios and practical situations.',
            'Master the key techniques and best practices for success.'
        ];
        
        while (takeaways.length < 3) {
            const index = takeaways.length;
            if (index < defaults.length) {
                takeaways.push(
                    `<li class="takeaway-item"><i class="fas fa-check-circle me-2"></i>${defaults[index]}</li>`
                );
            }
        }
    }
    
    return takeaways.join('\n');
}

function renderSidebarLessonsList(currentIndex) {
    return currentModule.lessons.map((l, index) => {
        const isCompleted = l.completed || userData.completedLessons.includes(l.id);
        const isCurrent = index === currentIndex;
        
        return `
            <div class="sidebar-lesson-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                 onclick="openLesson(${index})"
                 title="${l.title}">
                <div class="lesson-number2">
                    ${isCompleted ? '<i class="fas fa-check-circle"></i>' : index + 1}
                </div>
                <div class="lesson-info">
                    <div class="lesson-title-small">${l.title}</div>
                    <div class="lesson-duration-small">
                        <i class="fas fa-clock"></i>
                        <span>${l.duration} min</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderInteractiveContentPreview(interactive) {
    return `
        <div class="interactive-preview-card">
            <div class="interactive-icon">
                <i class="fas fa-hand-pointer"></i>
            </div>
            <div class="interactive-content">
                <h3>${interactive.title}</h3>
                <p>${interactive.description}</p>
                <button class="btn btn-primary" onclick="startInteractiveActivity()">
                    <i class="fas fa-play me-2"></i>
                    Start Interactive Activity
                </button>
            </div>
        </div>
    `;
}

function renderLessonContent() {
    switch(currentLesson.type) {
        case 'Video':
            return renderVideoContent();
        case 'Interactive':
            return renderInteractiveSecurityHub();
        case 'Scenario':
            return renderSecurityScenarios();
        default:
            return renderTextContent();
    }
}

// ========== COMPLETE INTERACTIVE SECURITY TRAINING HUB ==========
function renderInteractiveSecurityHub() {
    console.log('Rendering COMPLETE Interactive Security Training Hub');

    // Initialize all training modules
    initializePhishingEmails();
    initializePasswordTests();
    initializePolicyDecisions();

    return `
        <div class="interactive-security-hub">
            <div class="hub-header" style="background: linear-gradient(135deg, #17a2b8, #0ca8d6); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem;">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h3 style="margin: 0; font-weight: 700;">
                            <i class="fas fa-shield-alt me-3"></i>
                            Interactive Security Training Hub
                        </h3>
                        <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 1.1rem;">
                            Choose from multiple hands-on security training modules
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="training-stats">
                            <div class="stat-item">
                                <span class="stat-label">Training Progress</span>
                                <div class="progress mt-1" style="height: 8px;">
                                    <div id="hubProgressBar" class="progress-bar bg-light" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress Tracker -->
            <div class="progress-section mb-4">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="mb-0">
                                <i class="fas fa-chart-line me-2 text-primary"></i>
                                Overall Training Progress
                            </h5>
                            <span class="badge bg-primary fs-6" id="interactiveScoreBadge">Score: 0/30 points</span>
                        </div>
                        <div class="progress mb-2" style="height: 10px;">
                            <div id="interactiveProgressBar" class="progress-bar bg-success" style="width: 0%"></div>
                        </div>
                        <small class="text-muted" id="interactiveProgressText">Ready to start interactive security training</small>
                    </div>
                </div>
            </div>

            <!-- Interactive Training Modules -->
            <div id="interactiveModuleSelect" class="row mb-4">
                <div class="col-md-4 mb-4">
                    <div class="card training-module-card h-100" onclick="startPhishingEmailTraining()" style="cursor: pointer; transition: all 0.3s; border: 2px solid #e9ecef;">
                        <div class="card-body text-center d-flex flex-column">
                            <div class="module-icon mb-3">
                                <i class="fas fa-envelope-open-text fa-4x text-danger mb-3"></i>
                            </div>
                            <h5 class="card-title">Email Threat Detection</h5>
                            <p class="card-text flex-grow-1">Master the art of identifying phishing emails and social engineering attempts through realistic scenarios</p>
                            <div class="module-stats mb-3">
                                <span class="badge bg-danger me-2">10 Email Scenarios</span>
                                <span class="badge bg-outline-danger">10 Points Max</span>
                            </div>
                            <div class="module-features">
                                <small class="text-muted">
                                    ✓ Real phishing examples<br>
                                    ✓ Social engineering detection<br>
                                    ✓ Email header analysis<br>
                                    ✓ Immediate feedback
                                </small>
                            </div>
                            <button class="btn btn-danger mt-3" onclick="startPhishingEmailTraining()">
                                <i class="fas fa-play me-2"></i>Start Email Training
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-md-4 mb-4">
                    <div class="card training-module-card h-100" onclick="startPasswordStrengthTraining()" style="cursor: pointer; transition: all 0.3s; border: 2px solid #e9ecef;">
                        <div class="card-body text-center d-flex flex-column">
                            <div class="module-icon mb-3">
                                <i class="fas fa-key fa-4x text-warning mb-3"></i>
                            </div>
                            <h5 class="card-title">Password Security Lab</h5>
                            <p class="card-text flex-grow-1">Create, test, and understand secure password strategies with real-time strength analysis</p>
                            <div class="module-stats mb-3">
                                <span class="badge bg-warning me-2">Live Testing</span>
                                <span class="badge bg-outline-warning">10 Points Max</span>
                            </div>
                            <div class="module-features">
                                <small class="text-muted">
                                    ✓ Password strength meter<br>
                                    ✓ Common weakness detection<br>
                                    ✓ Best practices guide<br>
                                    ✓ Security recommendations
                                </small>
                            </div>
                            <button class="btn btn-warning mt-3" onclick="startPasswordStrengthTraining()">
                                <i class="fas fa-flask me-2"></i>Launch Password Lab
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-md-4 mb-4">
                    <div class="card training-module-card h-100" onclick="startSecurityPolicyTraining()" style="cursor: pointer; transition: all 0.3s; border: 2px solid #e9ecef;">
                        <div class="card-body text-center d-flex flex-column">
                            <div class="module-icon mb-3">
                                <i class="fas fa-clipboard-check fa-4x text-success mb-3"></i>
                            </div>
                            <h5 class="card-title">Policy Decision Maker</h5>
                            <p class="card-text flex-grow-1">Make critical security policy decisions in realistic business scenarios and understand their impact</p>
                            <div class="module-stats mb-3">
                                <span class="badge bg-success me-2">6 Business Scenarios</span>
                                <span class="badge bg-outline-success">10 Points Max</span>
                            </div>
                            <div class="module-features">
                                <small class="text-muted">
                                    ✓ Real business scenarios<br>
                                    ✓ Policy impact analysis<br>
                                    ✓ Compliance considerations<br>
                                    ✓ Decision consequences
                                </small>
                            </div>
                            <button class="btn btn-success mt-3" onclick="startSecurityPolicyTraining()">
                                <i class="fas fa-gavel me-2"></i>Start Policy Training
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dynamic Content Area -->
            <div id="interactiveActivityArea" class="d-none">
                <!-- Training content will be dynamically loaded here -->
            </div>

            <!-- Training Results Summary -->
            <div id="trainingResultsArea" class="d-none">
                <!-- Results will be shown here -->
            </div>

            <!-- Action Buttons -->
            <div class="text-center mt-4">
                <button id="resetInteractiveBtn" class="btn btn-outline-secondary me-2 d-none" onclick="resetAllTraining()">
                    <i class="fas fa-redo me-2"></i>Reset All Training
                </button>
                <button id="continueTrainingBtn" class="btn btn-primary d-none" onclick="continueTraining()">
                    <i class="fas fa-arrow-right me-2"></i>Continue Training
                </button>
            </div>
        </div>
    `;
}

// ========== PHISHING EMAIL TRAINING ==========
function initializePhishingEmails() {
    phishingEmails = [
        {
            id: 1,
            from: "security@yourbank.com",
            subject: "URGENT: Your account will be closed in 24 hours",
            body: "Dear Valued Customer,\n\nWe have detected suspicious activity on your account. To prevent closure, please verify your identity immediately by clicking the link below.\n\nVerify Now: www.yourbank-security.net/urgent-verify\n\nFailure to act within 24 hours will result in permanent account closure.\n\nSecurity Department\nYourBank",
            isPhishing: true,
            difficulty: "Easy",
            indicators: [
                "Urgent/threatening language creating false urgency",
                "Suspicious domain (yourbank-security.net vs yourbank.com)", 
                "Generic greeting instead of your name",
                "Threatening consequences for inaction",
                "Requests immediate action without proper verification"
            ],
            explanation: "This is a classic phishing attempt using urgency and fear tactics. Real banks never ask for verification through email links.",
            points: 1
        },
        {
            id: 2,
            from: "noreply@company.com",
            subject: "Monthly Security Policy Update",
            body: "Hello Team,\n\nAs part of our ongoing security improvements, please review the updated security policy document attached.\n\nKey changes include:\n- Updated password requirements\n- New remote work guidelines\n- Revised incident reporting procedures\n\nPlease acknowledge receipt by replying to this email.\n\nBest regards,\nIT Security Team\nExtension: 5555",
            isPhishing: false,
            difficulty: "Easy",
            indicators: [
                "Internal company domain (@company.com)",
                "Professional, informative tone",
                "Specific, relevant business content",
                "Internal contact information provided",
                "No suspicious links or urgent calls to action",
                "Legitimate business purpose"
            ],
            explanation: "This appears to be a legitimate internal security communication with proper business context and contact information.",
            points: 1
        },
        {
            id: 3,
            from: "support@microsoft.com",
            subject: "Your Microsoft 365 subscription expires today",
            body: "Dear Microsoft Customer,\n\nYour Microsoft 365 subscription is set to expire today. To avoid service interruption, please update your payment information immediately.\n\nUpdate Payment: microsoft-renewal.secure-portal.com\n\nYour subscription will be automatically renewed once payment is processed.\n\nMicrosoft Support",
            isPhishing: true,
            difficulty: "Medium",
            indicators: [
                "Spoofed sender address (appears to be from Microsoft)",
                "Suspicious redirect domain (not microsoft.com)",
                "False urgency about subscription expiration",
                "No personalization or account details",
                "Requests payment information through email link"
            ],
            explanation: "This is a sophisticated phishing attempt impersonating Microsoft. The domain 'microsoft-renewal.secure-portal.com' is not legitimate.",
            points: 2
        },
        {
            id: 4,
            from: "it-helpdesk@company.com", 
            subject: "System Maintenance - Action Required",
            body: "Hi there,\n\nWe're performing scheduled system maintenance this weekend. To ensure your data is properly backed up, please log into the system backup portal and verify your files.\n\nBackup Portal: https://backup.company.com/verify\n\nThis maintenance is required for compliance and security updates.\n\nThanks,\nIT Helpdesk",
            isPhishing: false,
            difficulty: "Medium", 
            indicators: [
                "Internal IT communication from legitimate domain",
                "Reasonable business purpose (system maintenance)",
                "URL uses company's actual domain",
                "Professional communication style",
                "Advance notice of maintenance activities"
            ],
            explanation: "This is a legitimate IT communication about scheduled maintenance. The URL uses the company's actual domain.",
            points: 2
        },
        {
            id: 5,
            from: "ceo@company.com",
            subject: "Confidential: Urgent wire transfer needed",
            body: "Hello,\n\nI'm currently in meetings with potential investors and need you to process an urgent wire transfer. Due to the confidential nature of this deal, please handle this discretely.\n\nAmount: $45,000\nRecipient: Global Ventures LLC\nAccount details will be provided once you confirm availability.\n\nThis must be completed today for the deal to proceed.\n\nRegards,\nJohn Smith, CEO",
            isPhishing: true,
            difficulty: "Hard",
            indicators: [
                "CEO impersonation (Business Email Compromise)",
                "Requests urgent financial transaction",
                "Emphasizes secrecy and urgency",
                "No proper authorization process followed", 
                "Vague details about business purpose",
                "Attempts to bypass normal procedures"
            ],
            explanation: "This is a Business Email Compromise (BEC) attack impersonating the CEO to authorize fraudulent wire transfers.",
            points: 3
        }
    ];
}

function startPhishingEmailTraining() {
    console.log('Starting comprehensive phishing email training');

    $('#interactiveModuleSelect').addClass('d-none');
    $('#interactiveActivityArea').removeClass('d-none');
    $('#resetInteractiveBtn').removeClass('d-none');

    currentInteractiveModule = 'phishing';
    interactiveScore = 0;
    currentEmailIndex = 0;

    updateInteractiveProgress('Starting Email Threat Detection Training...', 0);
    showCurrentEmail();
}

function showCurrentEmail() {
    if (currentEmailIndex >= phishingEmails.length) {
        showPhishingResults();
        return;
    }

    const email = phishingEmails[currentEmailIndex];
    const progress = ((currentEmailIndex) / phishingEmails.length) * 100;

    updateInteractiveProgress(`Email ${currentEmailIndex + 1} of ${phishingEmails.length}`, progress);

    const html = `
        <div class="email-training-container">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-envelope me-2"></i>
                            Email Analysis Training
                        </h5>
                        <div class="training-badges">
                            <span class="badge bg-light text-dark me-2">Difficulty: ${email.difficulty}</span>
                            <span class="badge bg-warning">${email.points} Point${email.points > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="email-preview mb-4">
                        <div class="email-header">
                            <div class="row">
                                <div class="col-md-2"><strong>From:</strong></div>
                                <div class="col-md-10">${email.from}</div>
                            </div>
                            <div class="row">
                                <div class="col-md-2"><strong>Subject:</strong></div>
                                <div class="col-md-10">${email.subject}</div>
                            </div>
                            <hr>
                        </div>
                        <div class="email-body">
                            <pre style="white-space: pre-wrap; font-family: 'Arial', sans-serif; line-height: 1.6;">${email.body}</pre>
                        </div>
                    </div>

                    <div class="analysis-question">
                        <h6><i class="fas fa-question-circle me-2 text-primary"></i>Is this email legitimate or a phishing attempt?</h6>
                        <p class="text-muted">Analyze the email content, sender information, and any suspicious elements before making your decision.</p>

                        <div class="decision-buttons mt-3">
                            <button class="btn btn-success btn-lg me-3" onclick="analyzeEmail(false)">
                                <i class="fas fa-check-circle me-2"></i>
                                Legitimate Email
                            </button>
                            <button class="btn btn-danger btn-lg" onclick="analyzeEmail(true)">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Phishing Attempt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').html(html);
}

function analyzeEmail(userThinksMalicious) {
    const email = phishingEmails[currentEmailIndex];
    const isCorrect = userThinksMalicious === email.isPhishing;

    if (isCorrect) {
        interactiveScore += email.points;
    }

    // Show detailed feedback
    const feedbackClass = isCorrect ? 'alert-success' : 'alert-danger';
    const feedbackIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
    const feedbackTitle = isCorrect ? 'Correct Analysis!' : 'Incorrect Analysis';

    const feedbackHtml = `
        <div class="email-feedback mt-4">
            <div class="alert ${feedbackClass}">
                <h6><i class="fas ${feedbackIcon} me-2"></i>${feedbackTitle}</h6>
                <p><strong>This email is ${email.isPhishing ? 'a PHISHING ATTEMPT' : 'LEGITIMATE'}.</strong></p>
                <p><strong>Explanation:</strong> ${email.explanation}</p>

                <div class="mt-3">
                    <h6>Key Indicators:</h6>
                    <ul class="mb-0">
                        ${email.indicators.map(indicator => `<li>${indicator}</li>`).join('')}
                    </ul>
                </div>

                <div class="mt-3">
                    <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'} fs-6">
                        ${isCorrect ? `+${email.points} points earned` : '0 points earned'}
                    </span>
                </div>
            </div>

            <div class="text-center">
                <button class="btn btn-primary btn-lg" onclick="nextEmail()">
                    <i class="fas fa-arrow-right me-2"></i>
                    ${currentEmailIndex < phishingEmails.length - 1 ? 'Next Email' : 'View Results'}
                </button>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').append(feedbackHtml);

    // Update score display
    updateInteractiveScore();
}

function nextEmail() {
    currentEmailIndex++;
    showCurrentEmail();
}

function showPhishingResults() {
    const maxPoints = phishingEmails.reduce((sum, email) => sum + email.points, 0);
    const percentage = Math.round((interactiveScore / maxPoints) * 100);

    let performanceLevel = 'Needs Improvement';
    let performanceClass = 'danger';
    let recommendations = [
        'Review common phishing indicators',
        'Practice identifying suspicious URLs',
        'Learn to verify sender authenticity'
    ];

    if (percentage >= 90) {
        performanceLevel = 'Excellent';
        performanceClass = 'success';
        recommendations = [
            'You demonstrate excellent phishing detection skills',
            'Continue staying updated on new phishing techniques',
            'Share your knowledge with colleagues'
        ];
    } else if (percentage >= 70) {
        performanceLevel = 'Good';
        performanceClass = 'info';
        recommendations = [
            'Good foundation in phishing detection',
            'Focus on more sophisticated attack patterns',
            'Practice with business email compromise scenarios'
        ];
    } else if (percentage >= 50) {
        performanceLevel = 'Average';
        performanceClass = 'warning';
        recommendations = [
            'Develop stronger awareness of phishing tactics',
            'Learn to identify social engineering techniques',
            'Practice URL and domain analysis'
        ];
    }

    const html = `
        <div class="training-results">
            <div class="card border-${performanceClass}">
                <div class="card-header bg-${performanceClass} text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-chart-bar me-2"></i>
                        Email Threat Detection Results
                    </h5>
                </div>
                <div class="card-body text-center">
                    <div class="results-score mb-4">
                        <h2 class="text-${performanceClass}">${interactiveScore}/${maxPoints} Points</h2>
                        <h3>${percentage}%</h3>
                        <h4 class="text-${performanceClass}">${performanceLevel}</h4>
                    </div>

                    <div class="performance-breakdown">
                        <div class="row">
                            <div class="col-md-4">
                                <h6>Correct Identifications</h6>
                                <p class="h5">${Math.round(percentage/100 * phishingEmails.length)}/${phishingEmails.length}</p>
                            </div>
                            <div class="col-md-4">
                                <h6>Training Completion</h6>
                                <p class="h5">100%</p>
                            </div>
                            <div class="col-md-4">
                                <h6>Skill Level</h6>
                                <p class="h5">${performanceLevel}</p>
                            </div>
                        </div>
                    </div>

                    <div class="recommendations mt-4">
                        <h6>Recommendations:</h6>
                        <ul class="list-unstyled">
                            ${recommendations.map(rec => `<li><i class="fas fa-lightbulb me-2 text-warning"></i>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').html(html);
    updateInteractiveProgress('Email Threat Detection Completed', 100);

    // Show continue training button
    $('#continueTrainingBtn').removeClass('d-none');
}

// ========== PASSWORD SECURITY LAB ==========
function initializePasswordTests() {
    passwordTests = [
        {
            id: 1,
            challenge: "Create a password that is at least 12 characters long",
            requirements: ["minimum 12 characters"],
            testFunction: (pwd) => pwd.length >= 12,
            points: 1,
            hint: "Longer passwords are exponentially harder to crack"
        },
        {
            id: 2, 
            challenge: "Create a password with uppercase, lowercase, numbers, and symbols",
            requirements: ["uppercase letters", "lowercase letters", "numbers", "special symbols"],
            testFunction: (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd),
            points: 2,
            hint: "Mix different character types for complexity"
        },
        {
            id: 3,
            challenge: "Create a password that avoids common patterns (no dictionary words, sequences, or personal info)",
            requirements: ["no common dictionary words", "no sequential patterns", "no obvious substitutions"],
            testFunction: (pwd) => {
                const common = ['password', 'admin', 'user', '123', 'abc', 'qwerty'];
                const lower = pwd.toLowerCase();
                return !common.some(word => lower.includes(word)) && 
                       !(/123|abc|qwe/i.test(pwd)) &&
                       !(/password|admin|login/i.test(pwd));
            },
            points: 2,
            hint: "Avoid predictable patterns and common words"
        }
    ];
}

function startPasswordStrengthTraining() {
    console.log('Starting password security lab');

    $('#interactiveModuleSelect').addClass('d-none');
    $('#interactiveActivityArea').removeClass('d-none');
    $('#resetInteractiveBtn').removeClass('d-none');

    currentInteractiveModule = 'password';
    passwordScore = 0;
    currentPasswordTestIndex = 0;

    updateInteractiveProgress('Starting Password Security Lab...', 0);
    showPasswordLab();
}

function showPasswordLab() {
    const html = `
        <div class="password-lab-container">
            <div class="card">
                <div class="card-header bg-warning text-dark">
                    <h5 class="mb-0">
                        <i class="fas fa-key me-2"></i>
                        Password Security Laboratory
                    </h5>
                </div>
                <div class="card-body">
                    <div class="lab-intro mb-4">
                        <p><strong>Welcome to the Password Security Lab!</strong> Test your password creation skills through hands-on challenges.</p>
                    </div>

                    <!-- Password Testing Interface -->
                    <div id="passwordTestArea">
                        ${renderPasswordTest()}
                    </div>

                    <!-- Password Strength Meter -->
                    <div class="password-analysis mt-4">
                        <h6>Real-time Password Analysis</h6>
                        <div class="form-group">
                            <input type="text" id="passwordInput" class="form-control" placeholder="Type your password here..." onkeyup="analyzePasswordStrength()">
                        </div>
                        <div class="strength-meter mt-2">
                            <div class="progress">
                                <div id="strengthBar" class="progress-bar" style="width: 0%"></div>
                            </div>
                            <div id="strengthFeedback" class="mt-2">
                                <small class="text-muted">Enter a password to see strength analysis</small>
                            </div>
                        </div>
                    </div>

                    <!-- Test Results -->
                    <div id="testResults" class="mt-4 d-none">
                        <!-- Results will appear here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').html(html);
}

function renderPasswordTest() {
    const test = passwordTests[currentPasswordTestIndex];
    if (!test) {
        showPasswordResults();
        return '';
    }

    const progress = (currentPasswordTestIndex / passwordTests.length) * 100;
    updateInteractiveProgress(`Password Challenge ${currentPasswordTestIndex + 1} of ${passwordTests.length}`, progress);

    return `
        <div class="password-test">
            <div class="test-challenge mb-3">
                <h6 class="text-warning">
                    <i class="fas fa-trophy me-2"></i>
                    Challenge ${currentPasswordTestIndex + 1}: ${test.challenge}
                </h6>
                <div class="requirements">
                    <small><strong>Requirements:</strong></small>
                    <ul class="small">
                        ${test.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="hint">
                    <small class="text-info"><i class="fas fa-lightbulb me-1"></i><strong>Hint:</strong> ${test.hint}</small>
                </div>
            </div>

            <div class="test-actions">
                <button class="btn btn-warning" onclick="testCurrentPassword()">
                    <i class="fas fa-check me-2"></i>Test This Password
                </button>
                <span class="ms-3 text-muted">Worth ${test.points} point${test.points > 1 ? 's' : ''}</span>
            </div>
        </div>
    `;
}

function analyzePasswordStrength() {
    const password = document.getElementById('passwordInput').value;
    const strengthBar = document.getElementById('strengthBar');
    const feedback = document.getElementById('strengthFeedback');

    let strength = 0;
    let messages = [];
    let color = 'bg-danger';

    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;

    // Character variety
    if (/[a-z]/.test(password)) { strength += 10; messages.push('Contains lowercase letters'); }
    if (/[A-Z]/.test(password)) { strength += 10; messages.push('Contains uppercase letters'); }
    if (/[0-9]/.test(password)) { strength += 10; messages.push('Contains numbers'); }
    if (/[^A-Za-z0-9]/.test(password)) { strength += 15; messages.push('Contains special characters'); }

    // Pattern checks
    if (!/123|abc|qwe/i.test(password)) { strength += 10; messages.push('No common sequences'); }
    if (!/password|admin|login/i.test(password)) { strength += 5; messages.push('No common words'); }

    // Determine color and label
    let label = 'Very Weak';
    if (strength >= 80) { color = 'bg-success'; label = 'Very Strong'; }
    else if (strength >= 60) { color = 'bg-info'; label = 'Strong'; }
    else if (strength >= 40) { color = 'bg-warning'; label = 'Moderate'; }
    else if (strength >= 20) { color = 'bg-danger'; label = 'Weak'; }

    strengthBar.className = `progress-bar ${color}`;
    strengthBar.style.width = `${strength}%`;

    feedback.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span><strong>Strength: ${label}</strong></span>
            <span>${strength}/100</span>
        </div>
        ${messages.length > 0 ? `<div class="mt-1"><small class="text-success">✓ ${messages.join(', ')}</small></div>` : ''}
    `;
}

function testCurrentPassword() {
    const password = document.getElementById('passwordInput').value;
    const test = passwordTests[currentPasswordTestIndex];

    if (!password) {
        alert('Please enter a password first');
        return;
    }

    const passed = test.testFunction(password);
    if (passed) {
        passwordScore += test.points;
        updateInteractiveScore();
    }

    // Show results
    const resultClass = passed ? 'alert-success' : 'alert-danger';
    const resultIcon = passed ? 'fa-check-circle' : 'fa-times-circle';
    const resultTitle = passed ? 'Challenge Passed!' : 'Challenge Failed';

    const resultHtml = `
        <div class="alert ${resultClass}">
            <h6><i class="fas ${resultIcon} me-2"></i>${resultTitle}</h6>
            <p>${passed ? `Your password meets all requirements! +${test.points} points` : 'Your password doesn\'t meet all requirements. Try again!'}</p>
            ${passed ? 
                `<button class="btn btn-primary" onclick="nextPasswordTest()">
                    <i class="fas fa-arrow-right me-2"></i>Next Challenge
                </button>` :
                `<button class="btn btn-warning" onclick="document.getElementById('passwordInput').focus()">
                    <i class="fas fa-redo me-2"></i>Try Again
                </button>`
            }
        </div>
    `;

    document.getElementById('testResults').innerHTML = resultHtml;
    document.getElementById('testResults').classList.remove('d-none');
}

function nextPasswordTest() {
    currentPasswordTestIndex++;
    document.getElementById('passwordInput').value = '';
    document.getElementById('testResults').classList.add('d-none');
    document.getElementById('passwordTestArea').innerHTML = renderPasswordTest();

    // Reset strength meter
    document.getElementById('strengthBar').style.width = '0%';
    document.getElementById('strengthFeedback').innerHTML = '<small class="text-muted">Enter a password to see strength analysis</small>';
}

function showPasswordResults() {
    const maxPoints = passwordTests.reduce((sum, test) => sum + test.points, 0);
    const percentage = Math.round((passwordScore / maxPoints) * 100);

    let performanceLevel = 'Novice';
    let performanceClass = 'danger';

    if (percentage >= 90) { performanceLevel = 'Expert'; performanceClass = 'success'; }
    else if (percentage >= 70) { performanceLevel = 'Advanced'; performanceClass = 'info'; }
    else if (percentage >= 50) { performanceLevel = 'Intermediate'; performanceClass = 'warning'; }

    const html = `
        <div class="password-results text-center">
            <h4><i class="fas fa-certificate me-2 text-${performanceClass}"></i>Password Security Lab Complete!</h4>
            <h2 class="text-${performanceClass}">${passwordScore}/${maxPoints} Points (${percentage}%)</h2>
            <h3>Skill Level: ${performanceLevel}</h3>

            <div class="recommendations mt-4">
                <h6>Key Takeaways:</h6>
                <ul class="text-start">
                    <li>Use passphrases with 4+ unrelated words</li>
                    <li>Enable two-factor authentication when available</li>
                    <li>Use a password manager for unique passwords</li>
                    <li>Regularly update passwords for sensitive accounts</li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('passwordTestArea').innerHTML = html;
    updateInteractiveProgress('Password Security Lab Completed', 100);

    $('#continueTrainingBtn').removeClass('d-none');
}

// ========== POLICY DECISION TRAINING ==========
function initializePolicyDecisions() {
    policyDecisions = [
        {
            id: 1,
            scenario: "Remote Work Security",
            context: "Due to increased remote work, your company needs to update its security policies. You must balance security with employee productivity and satisfaction.",
            question: "What should be the primary focus of the new remote work security policy?",
            choices: [
                {
                    text: "Require VPN for all remote connections and company-issued devices only",
                    impact: "High security, moderate productivity impact, higher costs",
                    score: 8,
                    reasoning: "Strong security approach that maintains control over endpoints and network access."
                },
                {
                    text: "Allow personal devices with mandatory endpoint protection software",
                    impact: "Moderate security, high productivity, lower costs", 
                    score: 6,
                    reasoning: "Balanced approach but introduces BYOD security risks that need careful management."
                },
                {
                    text: "Trust employees to follow basic guidelines without technical enforcement",
                    impact: "Low security, maximum productivity, minimal costs",
                    score: 2,
                    reasoning: "High risk approach that relies entirely on user behavior without technical controls."
                }
            ],
            points: 2
        },
        {
            id: 2,
            scenario: "Data Classification Policy", 
            context: "Your organization handles customer data, financial records, and proprietary information. A clear data classification system is needed to guide security measures.",
            question: "How should you structure the data classification levels?",
            choices: [
                {
                    text: "Four levels: Public, Internal, Confidential, Restricted with specific handling requirements for each",
                    impact: "Clear governance, manageable complexity, good compliance alignment",
                    score: 9,
                    reasoning: "Industry standard approach that provides clear guidance without excessive complexity."
                },
                {
                    text: "Two levels: Internal and External to keep it simple",
                    impact: "Very simple, but lacks granular protection for sensitive data",
                    score: 4,
                    reasoning: "Too simplistic for most organizations and doesn't address varying sensitivity levels."
                },
                {
                    text: "Six levels: Public, Internal, Sensitive, Confidential, Secret, Top Secret",
                    impact: "Very granular control, but complex to manage and may reduce compliance",
                    score: 5,
                    reasoning: "Overly complex for most business environments and may lead to misclassification."
                }
            ],
            points: 2
        }
    ];
}

function startSecurityPolicyTraining() {
    console.log('Starting security policy decision training');

    $('#interactiveModuleSelect').addClass('d-none');
    $('#interactiveActivityArea').removeClass('d-none');
    $('#resetInteractiveBtn').removeClass('d-none');

    currentInteractiveModule = 'policy';
    policyScore = 0;
    currentPolicyIndex = 0;

    updateInteractiveProgress('Starting Policy Decision Training...', 0);
    showCurrentPolicyScenario();
}

function showCurrentPolicyScenario() {
    if (currentPolicyIndex >= policyDecisions.length) {
        showPolicyResults();
        return;
    }

    const scenario = policyDecisions[currentPolicyIndex];
    const progress = (currentPolicyIndex / policyDecisions.length) * 100;

    updateInteractiveProgress(`Policy Scenario ${currentPolicyIndex + 1} of ${policyDecisions.length}`, progress);

    const html = `
        <div class="policy-scenario">
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">
                        <i class="fas fa-gavel me-2"></i>
                        Policy Decision Scenario ${currentPolicyIndex + 1}
                    </h5>
                </div>
                <div class="card-body">
                    <div class="scenario-context mb-4">
                        <h6 class="text-success">${scenario.scenario}</h6>
                        <p>${scenario.context}</p>
                        <div class="question-box p-3 bg-light rounded">
                            <strong><i class="fas fa-question-circle me-2 text-primary"></i>${scenario.question}</strong>
                        </div>
                    </div>

                    <div class="policy-choices">
                        ${scenario.choices.map((choice, index) => `
                            <div class="choice-card policy-choice mb-3" onclick="makePolicyDecision(${index})" data-choice="${index}">
                                <div class="choice-content p-3 border rounded" style="cursor: pointer; transition: all 0.3s;">
                                    <h6><i class="fas fa-arrow-right text-success me-2"></i>${choice.text}</h6>
                                    <p class="mb-1"><strong>Expected Impact:</strong> ${choice.impact}</p>
                                    <small class="text-muted">Click to select this policy approach</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').html(html);
}

function makePolicyDecision(choiceIndex) {
    const scenario = policyDecisions[currentPolicyIndex];
    const selectedChoice = scenario.choices[choiceIndex];

    $('.policy-choice').removeClass('selected');
    $(`.policy-choice[data-choice="${choiceIndex}"]`).addClass('selected');

    policyScore += selectedChoice.score;
    updateInteractiveScore();

    const resultClass = selectedChoice.score >= 8 ? 'success' : selectedChoice.score >= 6 ? 'info' : 'warning';
    const resultIcon = selectedChoice.score >= 8 ? 'check-circle' : selectedChoice.score >= 6 ? 'info-circle' : 'exclamation-triangle';

    const feedbackHtml = `
        <div class="policy-feedback mt-4">
            <div class="alert alert-${resultClass}">
                <h6><i class="fas fa-${resultIcon} me-2"></i>Decision Analysis</h6>
                <p><strong>Your Choice:</strong> ${selectedChoice.text}</p>
                <p><strong>Impact Assessment:</strong> ${selectedChoice.impact}</p>
                <p><strong>Reasoning:</strong> ${selectedChoice.reasoning}</p>
                <div class="mt-2">
                    <span class="badge bg-${resultClass} fs-6">+${selectedChoice.score} points earned</span>
                </div>
            </div>

            <div class="text-center">
                <button class="btn btn-success btn-lg" onclick="nextPolicyScenario()">
                    <i class="fas fa-arrow-right me-2"></i>
                    ${currentPolicyIndex < policyDecisions.length - 1 ? 'Next Scenario' : 'View Results'}
                </button>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').append(feedbackHtml);
}

function nextPolicyScenario() {
    currentPolicyIndex++;
    showCurrentPolicyScenario();
}

function showPolicyResults() {
    const maxPoints = policyDecisions.reduce((sum, scenario) => sum + scenario.points * Math.max(...scenario.choices.map(c => c.score)), 0);
    const percentage = Math.round((policyScore / maxPoints) * 100);

    let skillLevel = 'Junior Policy Maker';
    let levelClass = 'warning';

    if (percentage >= 85) { skillLevel = 'Expert Policy Strategist'; levelClass = 'success'; }
    else if (percentage >= 70) { skillLevel = 'Senior Policy Analyst'; levelClass = 'info'; }
    else if (percentage >= 55) { skillLevel = 'Intermediate Policy Developer'; levelClass = 'primary'; }

    const html = `
        <div class="policy-results text-center">
            <div class="card border-${levelClass}">
                <div class="card-header bg-${levelClass} text-white">
                    <h5 class="mb-0">Policy Decision Training Complete</h5>
                </div>
                <div class="card-body">
                    <h3 class="text-${levelClass}">${policyScore} points earned</h3>
                    <h4>Performance: ${percentage}%</h4>
                    <h5>Skill Level: ${skillLevel}</h5>

                    <div class="key-insights mt-4">
                        <h6>Key Policy Development Principles:</h6>
                        <ul class="text-start">
                            <li>Balance security requirements with business needs</li>
                            <li>Consider implementation complexity and user adoption</li>
                            <li>Align policies with industry standards and regulations</li>
                            <li>Plan for regular policy review and updates</li>
                            <li>Ensure clear communication and training for all policies</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#interactiveActivityArea').html(html);
    updateInteractiveProgress('Policy Decision Training Completed', 100);

    $('#continueTrainingBtn').removeClass('d-none');
}

// ========== SECURITY INCIDENT RESPONSE SCENARIOS ==========
function renderSecurityScenarios() {
    console.log('Rendering COMPLETE Security Incident Response Scenarios');

    initializeComprehensiveSecurityScenarios();

    return `
        <div class="security-scenarios-hub">
            <div class="scenarios-header" style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem;">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h3 style="margin: 0; font-weight: 700;">
                            <i class="fas fa-shield-alt me-3"></i>
                            Security Incident Response Training
                        </h3>
                        <p style="margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 1.1rem;">
                            Master real-world security incidents with comprehensive step-by-step scenarios
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="incident-stats">
                            <span class="badge bg-light text-dark fs-6">4 Complete Scenarios</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scenario Progress -->
            <div class="scenario-progress mb-4">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="mb-0">
                                <i class="fas fa-chart-line me-2 text-danger"></i>
                                Incident Response Progress
                            </h5>
                            <span class="badge bg-danger fs-6" id="scenarioScoreBadge">Ready to Start</span>
                        </div>
                        <div class="progress mb-2" style="height: 10px;">
                            <div id="scenarioProgressBar" class="progress-bar bg-danger" style="width: 0%"></div>
                        </div>
                        <small class="text-muted" id="scenarioProgressText">Choose your security incident scenario to begin training</small>
                    </div>
                </div>
            </div>

            <!-- Enhanced Scenario Selection -->
            <div id="scenarioSelection" class="row mb-4">
                <div class="col-md-6 mb-4">
                    <div class="card scenario-select-card h-100" onclick="startSecurityScenario('ransomware')" style="cursor: pointer; transition: transform 0.3s; border: 2px solid #dee2e6;">
                        <div class="card-body d-flex flex-column">
                            <div class="text-center mb-3">
                                <i class="fas fa-virus fa-4x text-danger mb-3"></i>
                                <h5 class="card-title">Ransomware Attack Response</h5>
                                <span class="badge bg-danger mb-2">CRITICAL SEVERITY - 8 STEPS</span>
                            </div>
                            <p class="card-text flex-grow-1">Navigate a major ransomware attack affecting your entire organization. Make critical decisions about containment, communication, law enforcement, and recovery strategies.</p>
                            <div class="scenario-details">
                                <h6>Scenario includes:</h6>
                                <ul class="small">
                                    <li>Initial detection and containment decisions</li>
                                    <li>Incident command structure setup</li>  
                                    <li>Public and stakeholder communications</li>
                                    <li>Law enforcement cooperation choices</li>
                                    <li>Ransom payment ethical considerations</li>
                                    <li>Recovery prioritization strategies</li>
                                    <li>Regulatory compliance requirements</li>
                                    <li>Long-term security improvements</li>
                                </ul>
                            </div>
                            <button class="btn btn-danger mt-3" onclick="startSecurityScenario('ransomware')">
                                <i class="fas fa-play me-2"></i>Start Ransomware Scenario
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 mb-4">
                    <div class="card scenario-select-card h-100" onclick="startSecurityScenario('databreach')" style="cursor: pointer; transition: transform 0.3s; border: 2px solid #dee2e6;">
                        <div class="card-body d-flex flex-column">
                            <div class="text-center mb-3">
                                <i class="fas fa-database fa-4x text-warning mb-3"></i>
                                <h5 class="card-title">Data Breach Investigation</h5>
                                <span class="badge bg-warning text-dark mb-2">HIGH SEVERITY - 6 STEPS</span>
                            </div>
                            <p class="card-text flex-grow-1">Handle a customer data breach from discovery to recovery. Navigate regulatory requirements, customer communications, and business impact management.</p>
                            <div class="scenario-details">
                                <h6>Scenario includes:</h6>
                                <ul class="small">
                                    <li>Breach discovery and initial assessment</li>
                                    <li>Forensic investigation procedures</li>
                                    <li>Impact scope determination</li>
                                    <li>Customer and regulatory notifications</li>
                                    <li>Business continuity decisions</li>
                                    <li>Trust rebuilding strategies</li>
                                </ul>
                            </div>
                            <button class="btn btn-warning mt-3" onclick="startSecurityScenario('databreach')">
                                <i class="fas fa-play me-2"></i>Start Data Breach Scenario
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 mb-4">
                    <div class="card scenario-select-card h-100" onclick="startSecurityScenario('insider')" style="cursor: pointer; transition: transform 0.3s; border: 2px solid #dee2e6;">
                        <div class="card-body d-flex flex-column">
                            <div class="text-center mb-3">
                                <i class="fas fa-user-secret fa-4x text-info mb-3"></i>
                                <h5 class="card-title">Insider Threat Investigation</h5>
                                <span class="badge bg-info mb-2">MODERATE SEVERITY - 5 STEPS</span>
                            </div>
                            <p class="card-text flex-grow-1">Conduct a sensitive insider threat investigation. Balance employee rights, evidence collection, and organizational security while managing legal implications.</p>
                            <div class="scenario-details">
                                <h6>Scenario includes:</h6>
                                <ul class="small">
                                    <li>Suspicious activity detection</li>
                                    <li>Discreet evidence gathering</li>
                                    <li>Employee rights and legal considerations</li>
                                    <li>Interview and confrontation decisions</li>
                                    <li>Preventive security measures</li>
                                </ul>
                            </div>
                            <button class="btn btn-info mt-3" onclick="startSecurityScenario('insider')">
                                <i class="fas fa-play me-2"></i>Start Insider Threat Scenario
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 mb-4">
                    <div class="card scenario-select-card h-100" onclick="startSecurityScenario('ddos')" style="cursor: pointer; transition: transform 0.3s; border: 2px solid #dee2e6;">
                        <div class="card-body d-flex flex-column">
                            <div class="text-center mb-3">
                                <i class="fas fa-network-wired fa-4x text-success mb-3"></i>
                                <h5 class="card-title">DDoS Attack Mitigation</h5>
                                <span class="badge bg-success mb-2">MODERATE SEVERITY - 4 STEPS</span>
                            </div>
                            <p class="card-text flex-grow-1">Respond to a distributed denial of service attack affecting your website and services. Implement mitigation strategies while maintaining business operations.</p>
                            <div class="scenario-details">
                                <h6>Scenario includes:</h6>
                                <ul class="small">
                                    <li>Attack pattern recognition</li>
                                    <li>Traffic filtering and mitigation</li>
                                    <li>Customer communication strategies</li>
                                    <li>Long-term protection planning</li>
                                </ul>
                            </div>
                            <button class="btn btn-success mt-3" onclick="startSecurityScenario('ddos')">
                                <i class="fas fa-play me-2"></i>Start DDoS Scenario
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dynamic Scenario Content Area -->
            <div id="scenarioActivityArea" class="d-none">
                <!-- Scenario content will be dynamically loaded here -->
            </div>

            <!-- Action Buttons -->
            <div class="text-center mt-4">
                <button id="resetScenarioBtn" class="btn btn-outline-secondary me-2 d-none" onclick="resetScenarioTraining()">
                    <i class="fas fa-redo me-2"></i>Reset Scenario Training
                </button>
                <button id="nextScenarioBtn" class="btn btn-danger d-none" onclick="nextScenarioStep()">
                    <i class="fas fa-arrow-right me-2"></i>Continue Incident Response
                </button>
            </div>
        </div>
    `;
}

// Initialize comprehensive security scenarios
function initializeComprehensiveSecurityScenarios() {
    securityScenarios = {
        ransomware: {
            title: "Ransomware Attack Response",
            description: "Navigate a critical ransomware attack affecting your entire organization",
            severity: "CRITICAL",
            totalSteps: 8,
            steps: [
                {
                    title: "Initial Detection & Immediate Response",
                    description: "🚨 CRITICAL ALERT: Multiple file servers showing encrypted files with .locked extension. Users reporting inability to access critical documents and systems.",
                    situation: "Monday 8:30 AM - Employees arriving to find computers showing ransom notes demanding Bitcoin payment. IT helpdesk flooded with 200+ calls. Email system partially compromised. Customer database appears affected.",
                    timeframe: "IMMEDIATE ACTION REQUIRED (0-30 minutes)",
                    choices: [
                        { 
                            text: "Immediately isolate all affected systems from network", 
                            impact: "Prevents spread but may lose forensic evidence and disrupt operations", 
                            score: 9, 
                            consequence: "✅ Network isolated successfully. No further encryption detected but business operations halted. Forensic evidence preserved on isolated systems." 
                        },
                        { 
                            text: "Keep systems running while investigating scope", 
                            impact: "Risk of further encryption but preserves evidence and operations", 
                            score: 4, 
                            consequence: "❌ Additional 20 systems compromised while investigating. Evidence preserved but damage increased significantly. Attack continues spreading." 
                        },
                        { 
                            text: "Shutdown and reboot all affected systems immediately", 
                            impact: "May destroy forensic evidence and won't remove persistent ransomware", 
                            score: 2, 
                            consequence: "❌ Systems reboot but ransomware persists. Critical forensic evidence lost permanently. Attack continues after restart." 
                        }
                    ]
                },
                {
                    title: "Incident Command & Escalation",
                    description: "With initial containment measures in place, establish proper incident response procedures. CEO demanding answers, customers reporting service outages, media starting to notice unusual activity.",
                    situation: "Initial assessment complete: 60% of file servers encrypted, email system compromised, customer database partially affected. Ransom note demands $500,000 Bitcoin within 48 hours or data will be leaked publicly on dark web.",
                    timeframe: "URGENT (30 minutes - 1 hour)",
                    choices: [
                        { 
                            text: "Activate full incident response team with CEO as commander", 
                            impact: "Ensures proper resources and decision authority but creates internal alarm", 
                            score: 10, 
                            consequence: "✅ IR team assembled rapidly. CEO, legal, IT, communications, and HR aligned. Clear command structure established. All stakeholders informed and coordinated." 
                        },
                        { 
                            text: "Handle internally with IT team first, escalate later if needed", 
                            impact: "Avoids panic but may delay proper response and lack necessary resources", 
                            score: 3, 
                            consequence: "❌ IT team overwhelmed by complexity. Critical decisions delayed 4 hours. No legal or executive guidance available when needed most." 
                        },
                        { 
                            text: "Contact cyber insurance company first before internal escalation", 
                            impact: "Important step but should not delay immediate response actions", 
                            score: 6, 
                            consequence: "⚠️ Insurance contacted but no immediate response capability. Response delayed 2 hours waiting for external guidance. Some coordination achieved." 
                        }
                    ]
                },
                {
                    title: "External Communications & Stakeholder Management",
                    description: "News of the attack is starting to leak. Social media mentions increasing. Key customers calling for status updates. Regulatory clock is ticking for breach notifications.",
                    situation: "6 hours post-incident: Local news station received anonymous tip about the attack. Three major customers threatening to terminate contracts. Regulatory notification deadline approaching. Stock price beginning to react to rumors.",
                    timeframe: "CRITICAL (6-12 hours post-incident)",
                    choices: [
                        { 
                            text: "Proactive transparent communication with prepared statements to all stakeholders", 
                            impact: "Builds trust but may cause short-term market reaction and customer concern", 
                            score: 9, 
                            consequence: "✅ Controlled narrative maintained. Customers appreciate transparency. Media reports accurate information. Stock dips 8% but recovers within week." 
                        },
                        { 
                            text: "Minimal communication, 'no comment' until full investigation complete", 
                            impact: "Avoids premature statements but allows speculation and rumor to spread", 
                            score: 4, 
                            consequence: "❌ Speculation runs wild. Customers lose confidence. Media creates sensational stories. Stock drops 25%. Trust severely damaged." 
                        },
                        { 
                            text: "Deny any significant impact, downplay the incident publicly", 
                            impact: "May prevent immediate panic but creates trust issues if truth emerges", 
                            score: 1, 
                            consequence: "❌ Truth emerges quickly. Massive credibility loss. Regulatory scrutiny intensifies. Customers flee. Long-term reputation damage severe." 
                        }
                    ]
                },
                {
                    title: "Law Enforcement & Regulatory Coordination",
                    description: "FBI cybercrime unit has reached out offering assistance. Regulatory bodies requesting formal breach notifications. International law enforcement indicates they're tracking this ransomware group.",
                    situation: "18 hours post-incident: FBI offers full forensic support and threat intelligence. CISA requests detailed incident report. European authorities indicate GDPR implications. Ransomware group known to law enforcement with previous attacks on critical infrastructure.",
                    timeframe: "IMPORTANT (12-24 hours)",
                    choices: [
                        { 
                            text: "Full cooperation with all law enforcement and regulatory bodies", 
                            impact: "Maximum support and compliance but may extend investigation timeline", 
                            score: 10, 
                            consequence: "✅ FBI provides threat intelligence and forensic expertise. Regulatory cooperation noted positively. International coordination aids investigation. Strong legal protection established." 
                        },
                        { 
                            text: "Selective cooperation, share only required information to maintain privacy", 
                            impact: "Protects some confidentiality but may limit available assistance and support", 
                            score: 6, 
                            consequence: "⚠️ Limited law enforcement support. Some regulatory compliance achieved. Investigation progress slower. Missed opportunities for intelligence sharing." 
                        },
                        { 
                            text: "Minimal engagement, handle internally to maintain confidentiality", 
                            impact: "Maintains complete control but foregoes significant resources and expertise", 
                            score: 2, 
                            consequence: "❌ Investigation lacks external expertise. Regulatory violations for non-cooperation. Missed critical threat intelligence. Recovery significantly delayed." 
                        }
                    ]
                }
                // Additional steps would be added here for complete 8-step scenario
            ]
        },

        databreach: {
            title: "Data Breach Investigation",
            description: "Handle a customer data breach from discovery to recovery",
            severity: "HIGH",
            totalSteps: 6,
            steps: [
                {
                    title: "Breach Discovery & Initial Assessment",
                    description: "🔍 Security monitoring alerts indicate unusual database access patterns. Large volumes of customer records accessed outside normal business hours from unfamiliar IP addresses.",
                    situation: "Tuesday 3:45 AM - Automated security system triggers alerts for suspicious database queries. 150,000+ customer records potentially accessed including names, addresses, phone numbers, and encrypted payment data. Access appears to have occurred over past 72 hours.",
                    timeframe: "IMMEDIATE ASSESSMENT (0-2 hours)",
                    choices: [
                        { 
                            text: "Immediately secure the database and begin forensic investigation", 
                            impact: "Protects remaining data but may alert attacker and disrupt evidence collection", 
                            score: 8, 
                            consequence: "✅ Database secured. Attacker access terminated. Forensic timeline preserved. Some evidence collected before access removed." 
                        },
                        { 
                            text: "Monitor the access quietly while gathering evidence", 
                            impact: "Preserves evidence but risks additional data exposure", 
                            score: 5, 
                            consequence: "⚠️ Additional 50,000 records accessed during monitoring. Comprehensive evidence gathered but larger breach scope." 
                        },
                        { 
                            text: "Assume false alarm and monitor for 24 hours before action", 
                            impact: "Avoids disruption if innocent but catastrophic if genuine attack", 
                            score: 1, 
                            consequence: "❌ Massive data exfiltration continues. 500,000+ total records compromised. Evidence suggests data sold on dark web." 
                        }
                    ]
                }
                // Additional data breach steps would be added here
            ]
        }
    };
}

// Helper functions for updating progress and scores
function updateInteractiveProgress(text, percentage) {
    $('#interactiveProgressText').text(text);
    $('#interactiveProgressBar').css('width', percentage + '%');
    if (percentage === 100) {
        $('#interactiveProgressBar').removeClass('bg-success').addClass('bg-success');
    }
}

function updateInteractiveScore() {
    const totalScore = interactiveScore + passwordScore + policyScore;
    $('#interactiveScoreBadge').text(`Score: ${totalScore}/30 points`);
}

// Scenario management functions
function startSecurityScenario(scenarioType) {
    console.log('Starting enhanced security scenario:', scenarioType);
    $('#scenarioSelection').addClass('d-none');
    $('#scenarioActivityArea').removeClass('d-none');
    $('#resetScenarioBtn').removeClass('d-none');
    $('#nextScenarioBtn').removeClass('d-none');

    currentInteractiveModule = 'scenario';
    interactiveScore = 0;
    scenarioStep = 0;
    currentScenarioIndex = scenarioType;
    userChoices = {};

    showCurrentScenarioStep();
}

function showCurrentScenarioStep() {
    const scenario = securityScenarios[currentScenarioIndex];
    if (!scenario) return;

    const currentStepData = scenario.steps[scenarioStep];
    if (!currentStepData) {
        showScenarioResults();
        return;
    }

    const totalSteps = scenario.totalSteps || scenario.steps.length;
    const progressPercent = ((scenarioStep + 1) / totalSteps) * 100;

    // Update progress indicators
    $('#scenarioScoreBadge').text(`Step ${scenarioStep + 1} of ${totalSteps}`);
    $('#scenarioProgressBar').css('width', progressPercent + '%');
    $('#scenarioProgressText').text(`${scenario.title} - ${currentStepData.title}`);

    const html = `
        <div class="scenario-step-container">
            <div class="alert alert-danger">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5><i class="fas fa-exclamation-triangle me-2"></i>${currentStepData.title}</h5>
                        <p class="mb-1"><strong>Situation:</strong> ${currentStepData.description}</p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-warning">${currentStepData.timeframe || 'Time Sensitive'}</span>
                    </div>
                </div>
            </div>

            <div class="card border-warning mb-4">
                <div class="card-header bg-warning text-dark">
                    <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Detailed Incident Information</h6>
                </div>
                <div class="card-body">
                    <p class="mb-0">${currentStepData.situation}</p>
                </div>
            </div>

            <h6><i class="fas fa-user-tie me-2 text-primary"></i>What is your response as the incident commander?</h6>
            <p class="text-muted">Consider the business impact, technical requirements, and stakeholder concerns before making your decision.</p>

            <div class="scenario-choices">
                ${currentStepData.choices.map((choice, index) => `
                    <div class="choice-card enhanced-choice" onclick="makeScenarioChoice(${index})" data-choice="${index}">
                        <div class="choice-content p-4 border rounded mb-3" style="cursor: pointer; transition: all 0.3s; border: 2px solid #e9ecef;">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="choice-title mb-2"><i class="fas fa-arrow-right text-primary me-2"></i>${choice.text}</h6>
                                <span class="badge bg-secondary">Score Potential: ${choice.score}/10</span>
                            </div>
                            <p class="choice-impact mb-2"><strong>Expected Impact:</strong> ${choice.impact}</p>
                            <small class="text-muted"><em>Click to select this response option and see the consequences</em></small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    $('#scenarioActivityArea').html(html);
}

function makeScenarioChoice(choiceIndex) {
    const scenario = securityScenarios[currentScenarioIndex];
    const currentStepData = scenario.steps[scenarioStep];
    const selectedChoice = currentStepData.choices[choiceIndex];

    // Clear previous selections and mark current
    $('.choice-card').removeClass('selected');
    $(`.choice-card[data-choice="${choiceIndex}"]`).addClass('selected');

    // Store choice and score
    userChoices[scenarioStep] = {
        choice: choiceIndex,
        score: selectedChoice.score,
        text: selectedChoice.text,
        consequence: selectedChoice.consequence
    };
    interactiveScore += selectedChoice.score;

    // Determine result styling
    const resultClass = selectedChoice.score >= 8 ? 'success' : selectedChoice.score >= 6 ? 'info' : selectedChoice.score >= 4 ? 'warning' : 'danger';
    const resultIcon = selectedChoice.score >= 8 ? 'check-circle' : selectedChoice.score >= 6 ? 'info-circle' : selectedChoice.score >= 4 ? 'exclamation-triangle' : 'times-circle';
    const resultText = selectedChoice.score >= 8 ? 'Excellent Decision!' : selectedChoice.score >= 6 ? 'Good Choice' : selectedChoice.score >= 4 ? 'Acceptable Decision' : 'Poor Choice - Consider Implications';

    // Show detailed result with consequence
    const explanationHtml = `
        <div class="result-explanation mt-4">
            <div class="alert alert-${resultClass}">
                <h6><i class="fas fa-${resultIcon} me-2"></i>${resultText} (${selectedChoice.score}/10 points)</h6>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Your Decision:</strong><br>${selectedChoice.text}</p>
                        <p><strong>Expected Impact:</strong><br>${selectedChoice.impact}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Actual Consequence:</strong><br>${selectedChoice.consequence}</p>
                        <div class="score-indicator">
                            <span class="badge bg-${resultClass} fs-6">Score: ${selectedChoice.score}/10</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <button class="btn btn-danger btn-lg" onclick="nextScenarioStep()">
                    <i class="fas fa-arrow-right me-2"></i>
                    ${scenarioStep < scenario.steps.length - 1 ? 'Continue to Next Step' : 'View Final Results'}
                </button>
            </div>
        </div>
    `;

    $('#scenarioActivityArea').append(explanationHtml);

    // Update overall progress
    const completionProgress = ((scenarioStep + 1) / scenario.steps.length) * 100;
    updateInteractiveProgress(`Step ${scenarioStep + 1} completed`, completionProgress);
}

function nextScenarioStep() {
    scenarioStep++;
    showCurrentScenarioStep();
}

function showScenarioResults() {
    const scenario = securityScenarios[currentScenarioIndex];
    const maxPossibleScore = scenario.steps.reduce((sum, step) => sum + Math.max(...step.choices.map(c => c.score)), 0);
    const percentage = Math.round((interactiveScore / maxPossibleScore) * 100);

    let performanceLevel = 'Needs Training';
    let performanceClass = 'danger';
    let certification = 'Incident Response Trainee';

    if (percentage >= 90) {
        performanceLevel = 'Expert Level';
        performanceClass = 'success';
        certification = 'Master Incident Response Commander';
    } else if (percentage >= 75) {
        performanceLevel = 'Advanced';
        performanceClass = 'info';
        certification = 'Senior Incident Response Analyst';
    } else if (percentage >= 60) {
        performanceLevel = 'Competent';
        performanceClass = 'primary';
        certification = 'Incident Response Specialist';
    } else if (percentage >= 45) {
        performanceLevel = 'Developing';
        performanceClass = 'warning';
        certification = 'Junior Incident Response Coordinator';
    }

    // Create detailed step-by-step results
    const stepResults = scenario.steps.map((step, index) => {
        const userChoice = userChoices[index];
        if (!userChoice) return '';

        const choiceClass = userChoice.score >= 8 ? 'success' : userChoice.score >= 6 ? 'info' : userChoice.score >= 4 ? 'warning' : 'danger';

        return `
            <div class="step-result mb-3">
                <div class="card border-${choiceClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6>${step.title}</h6>
                            <span class="badge bg-${choiceClass}">${userChoice.score}/10</span>
                        </div>
                        <p class="mb-1"><strong>Your Decision:</strong> ${userChoice.text}</p>
                        <small class="text-muted">${userChoice.consequence}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const html = `
        <div class="scenario-results">
            <div class="card border-${performanceClass}">
                <div class="card-header bg-${performanceClass} text-white text-center">
                    <h4 class="mb-1">
                        <i class="fas fa-certificate me-2"></i>
                        ${scenario.title} - Complete
                    </h4>
                    <p class="mb-0">Incident Response Training Scenario</p>
                </div>

                <div class="card-body">
                    <div class="text-center mb-4">
                        <div class="results-score mb-3">
                            <h2 class="text-${performanceClass}">${interactiveScore}/${maxPossibleScore} Points</h2>
                            <h3>${percentage}% Performance Score</h3>
                            <h4 class="text-${performanceClass}">${performanceLevel}</h4>
                        </div>

                        <div class="certification-badge p-3 bg-light rounded">
                            <h5 class="text-${performanceClass}">
                                <i class="fas fa-award me-2"></i>
                                Certification Level: ${certification}
                            </h5>
                        </div>
                    </div>

                    <div class="performance-breakdown mb-4">
                        <h6>Detailed Step-by-Step Performance:</h6>
                        ${stepResults}
                    </div>

                    <div class="key-learnings">
                        <h6>Key Incident Response Principles:</h6>
                        <ul>
                            <li><strong>Speed vs. Accuracy:</strong> Balance quick response with thorough analysis</li>
                            <li><strong>Communication:</strong> Transparent, timely stakeholder updates are critical</li>
                            <li><strong>Documentation:</strong> Maintain detailed logs for legal and learning purposes</li>
                            <li><strong>Coordination:</strong> Leverage external resources and expertise when available</li>
                            <li><strong>Recovery Focus:</strong> Plan for both immediate response and long-term resilience</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#scenarioActivityArea').html(html);
    updateInteractiveProgress(`${scenario.title} Completed`, 100);

    // Show continue button for other scenarios
    $('#continueTrainingBtn').removeClass('d-none');
}

// Training management functions
function continueTraining() {
    console.log('✓ Continue Training clicked');

    // Save all training scores
    const progress = saveTrainingProgress();

    if (progress && progress.totalScore > 0) {
        const totalScore = progress.totalScore;
        showNotification(`Training progress saved! Total score: ${totalScore} points`, 'success');
    }

    // Reset interactive training state
    currentInteractiveModule = null;

    // Hide all training areas
    $('#interactiveActivityArea').addClass('d-none');
    $('#scenarioActivityArea').addClass('d-none');
    $('#trainingResultsArea').addClass('d-none');

    // Hide training selection screens
    $('#interactiveModuleSelect').addClass('d-none');
    $('#scenarioSelection').addClass('d-none');

    // Hide all training control buttons
    $('#resetInteractiveBtn, #continueTrainingBtn, #resetScenarioBtn, #nextScenarioBtn').addClass('d-none');

    // Navigate back to module view
    if (typeof showSection === 'function') {
        showSection('module');
    }

    // Refresh module display to show updated progress
    if (typeof renderModulePlayer === 'function') {
        setTimeout(() => {
            renderModulePlayer();
        }, 100);
    }
}

function resetAllTraining() {
    // Reset all training states
    currentInteractiveModule = null;
    interactiveScore = 0;
    passwordScore = 0;
    policyScore = 0;
    interactiveProgress = 0;
    currentEmailIndex = 0;
    currentPasswordTestIndex = 0;
    currentPolicyIndex = 0;

    // Show module selection
    $('#interactiveActivityArea').addClass('d-none');
    $('#interactiveModuleSelect').removeClass('d-none');
    $('#resetInteractiveBtn').addClass('d-none');
    $('#continueTrainingBtn').addClass('d-none');

    // Reset progress displays
    updateInteractiveProgress('Ready to start interactive security training', 0);
    updateInteractiveScore();
}

function resetScenarioTraining() {
    // Reset scenario states
    currentInteractiveModule = null;
    interactiveScore = 0;
    scenarioStep = 0;
    currentScenarioIndex = 0;
    userChoices = {};

    // Show scenario selection
    $('#scenarioActivityArea').addClass('d-none');
    $('#scenarioSelection').removeClass('d-none');
    $('#resetScenarioBtn').addClass('d-none');
    $('#nextScenarioBtn').addClass('d-none');

    // Reset progress displays
    $('#scenarioScoreBadge').text('Ready to Start');
    $('#scenarioProgressBar').css('width', '0%');
    $('#scenarioProgressText').text('Choose your security incident scenario to begin training');
}

// Standard lesson content functions
function renderVideoContent() {
    let cleanVideoUrl = currentLesson.videoUrl;
    if (cleanVideoUrl && cleanVideoUrl.includes('youtu.be/')) {
        const videoId = cleanVideoUrl.split('youtu.be/')[1].split('?')[0];
        cleanVideoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const isValidYouTubeUrl = cleanVideoUrl && cleanVideoUrl.includes('youtube.com/embed/');

    return `
        <div class="professional-video-lesson">
            <div class="video-player-container">
                ${isValidYouTubeUrl ? 
                    `<div class="video-wrapper" style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
                        <iframe src="${cleanVideoUrl}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
                    </div>` :
                    `<div class="video-placeholder" style="height: 400px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                        <div class="text-center">
                            <i class="fas fa-play-circle" style="font-size: 4rem; color: #6c757d;"></i>
                            <h4>Video Player</h4>
                            <p>Video content would appear here</p>
                        </div>
                    </div>`
                }
            </div>
            <div class="lesson-content-section" style="padding: 2rem;">
                <h4>About This Video</h4>
                ${formatLessonText(currentLesson.content)}
            </div>
        </div>
    `;
}

function renderTextContent() {
    return `
        <div class="professional-text-lesson">
            <div class="text-content-container" style="padding: 2rem;">
                <h4>Lesson Content</h4>
                ${formatLessonText(currentLesson.content)}
            </div>
        </div>
    `;
}

function formatLessonText(text) {
    return text.split('.').filter(p => p.trim()).map(paragraph => 
        paragraph.trim() ? `<p>${paragraph.trim()}.</p>` : ''
    ).join('');
}

// Completion tracking with app.js integration
function completeLesson() {
    if (currentLesson.completed) {
        showNotification('This lesson is already completed!', 'info');
        return;
    }

    // Use the global marking function from app.js
    if (typeof markLessonComplete === 'function') {
        markLessonComplete(currentLesson.id);
    }

    // Mark lesson as completed locally
    currentLesson.completed = true;
    currentModule.completedLessons++;
    currentCourse.completedLessons++;

    showNotification('Lesson completed! Great job!', 'success');

    if (isModuleReadyForQuiz(currentModule)) {
        showNotification(`All ${currentModule.totalLessons} lessons completed! You can now take the module quiz.`, 'success');
    }

    // Trigger UI refresh
    setTimeout(() => {
        renderLessonPlayer();
    }, 100);
}

function isModuleReadyForQuiz(module) {
    return module.completedLessons >= module.totalLessons && module.quiz && !module.quiz.completed;
}

function startQuiz() {
    console.log('🎯 startQuiz() called');

    // Validate module exists
    if (!currentModule) {
        console.error('❌ No current module selected');
        showNotification('Please select a module first', 'error');
        return;
    }

    // Validate quiz exists
    if (!currentModule.quiz) {
        console.error('❌ No quiz available for module:', currentModule.id);
        showNotification('No quiz available for this module', 'error');
        return;
    }

    // Check lesson completion requirement
    if (currentModule.completedLessons < currentModule.totalLessons) {
        const remaining = currentModule.totalLessons - currentModule.completedLessons;
        showNotification(`Please complete all ${currentModule.totalLessons} lessons before taking the quiz. (${remaining} remaining)`, 'warning');
        return;
    }

    currentQuizData = currentModule.quiz;

    // CRITICAL: Validate quiz structure
    if (!currentQuizData.questions) {
        console.error('❌ Quiz has no questions property:', currentQuizData);
        showNotification('Quiz data is malformed (missing questions)', 'error');
        return;
    }

    if (!Array.isArray(currentQuizData.questions)) {
        console.error('❌ Quiz questions is not an array:', typeof currentQuizData.questions);
        showNotification('Quiz data is malformed (questions not array)', 'error');
        return;
    }

    if (currentQuizData.questions.length === 0) {
        console.error('❌ Quiz has zero questions');
        showNotification('This quiz has no questions', 'error');
        return;
    }

    console.log('✓ Quiz validated:', currentQuizData.questions.length, 'questions');
    console.log('✓ Quiz structure:', currentQuizData);

    // Initialize quiz state
    currentQuestionIndex = 0;
    userAnswers = [];
    isQuizSubmitted = false;
    timeRemaining = (currentQuizData.timeLimit || 30) * 60;

    // Increment attempt counter
    currentQuizData.attempts = (currentQuizData.attempts || 0) + 1;

    // Save updated attempts
    if (typeof saveData === 'function') {
        saveData();
    }

    // Render quiz interface and switch view
    renderQuizInterface();
    showSection('quiz');
    startQuizTimer();
}

// Global variable to track if answer is confirmed
let answerConfirmed = false;
let selectedOptionIndex = null;

// FIX 1: Render Quiz Interface with Confirm Button
// ============================================================================
function renderQuizInterface() {
    console.log('🎨 renderQuizInterface() called, questionIndex:', currentQuestionIndex);

    // Validate quiz data
    if (!currentQuizData || !currentQuizData.questions || !Array.isArray(currentQuizData.questions)) {
        console.error('❌ Quiz data invalid');
        showNotification('Quiz data not available', 'error');
        showSection('module');
        return;
    }

    if (currentQuizData.questions.length === 0) {
        console.error('❌ Quiz has no questions');
        showNotification('This quiz is empty', 'error');
        showSection('module');
        return;
    }

    const question = currentQuizData.questions[currentQuestionIndex];
    if (!question) {
        console.error('❌ Question is null/undefined');
        showSection('module');
        return;
    }

    console.log('✓ Rendering question', currentQuestionIndex + 1, 'of', currentQuizData.questions.length);

    // Reset confirmation state
    answerConfirmed = false;
    selectedOptionIndex = null;

    const progress = ((currentQuestionIndex + 1) / currentQuizData.questions.length) * 100;
    const timeMinutes = Math.floor(timeRemaining / 60);
    const timeSeconds = timeRemaining % 60;

    const html = `
        <div class="professional-quiz-container fade-in">
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

            <div class="quiz-progress-professional">
                <div class="progress">
                    <div class="progress-bar bg-primary" style="width: ${progress}%">
                        <span class="progress-text">${progress.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            <div class="quiz-question-container">
                <h4 class="question-number">Question ${currentQuestionIndex + 1}</h4>
                <h3 class="question-text">${question.text || 'Question text missing'}</h3>

                <div class="quiz-options-professional" id="quizOptions">
                    ${renderQuizOptions(question)}
                </div>

                <!-- Feedback area (hidden until confirmed) -->
                <div id="answerFeedback" class="answer-feedback mt-4" style="display: none;"></div>

                <!-- Confirm Answer Button -->
                <div class="text-center mt-4">
                    <button 
                        id="confirmAnswerBtn" 
                        class="btn btn-primary btn-lg confirm-answer-btn" 
                        onclick="confirmAnswer()" 
                        disabled>
                        <i class="fas fa-check-circle me-2"></i>Confirm Answer
                    </button>
                </div>
            </div>

            <div class="quiz-controls-professional mt-4">
                <button class="btn btn-outline-secondary" onclick="previousQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left me-2"></i>Previous
                </button>

                <div class="question-counter">
                    <span>${currentQuestionIndex + 1} / ${currentQuizData.questions.length}</span>
                </div>

                <button 
                    id="nextQuestionBtn" 
                    class="btn btn-primary" 
                    onclick="nextQuestion()" 
                    style="display: none;">
                    Next<i class="fas fa-chevron-right ms-2"></i>
                </button>

                <button 
                    id="submitQuizBtn" 
                    class="btn btn-success" 
                    onclick="submitQuiz()" 
                    style="display: none;">
                    Submit Quiz<i class="fas fa-check ms-2"></i>
                </button>
            </div>
        </div>
    `;

    $('#quizPlayer').html(html);

    // Restore previous answer if exists (only if not confirmed yet)
    if (userAnswers[currentQuestionIndex] !== undefined && !answerConfirmed) {
        setTimeout(() => {
            selectQuizOption(userAnswers[currentQuestionIndex]);
        }, 100);
    }
}

function selectQuizOption(index) {
    console.log('Option selected:', index);

    // Don't allow selection after answer is confirmed
    if (answerConfirmed) {
        return;
    }

    // Remove previous selections
    $('.quiz-option-professional').removeClass('selected');

    // Add selection to clicked option
    $(`.quiz-option-professional[data-option-index="${index}"]`).addClass('selected');

    // Store selected index
    selectedOptionIndex = index;

    // Enable confirm button
    $('#confirmAnswerBtn').prop('disabled', false);

    // Hide next/submit buttons until confirmed
    $('#nextQuestionBtn, #submitQuizBtn').hide();
}

// FIX 4: Confirm Answer - Show Feedback After Confirmation
// ============================================================================
function confirmAnswer() {
    if (selectedOptionIndex === null) {
        showNotification('Please select an answer first', 'warning');
        return;
    }

    if (answerConfirmed) {
        return;
    }

    answerConfirmed = true;

    // Store answer
    userAnswers[currentQuestionIndex] = selectedOptionIndex;

    const question = currentQuizData.questions[currentQuestionIndex];
    const isCorrect = selectedOptionIndex === question.correctIndex;

    console.log('Answer confirmed:', {
        selected: selectedOptionIndex,
        correct: question.correctIndex,
        isCorrect: isCorrect
    });

    // Disable confirm button
    $('#confirmAnswerBtn').prop('disabled', true).html('<i class="fas fa-check-circle me-2"></i>Answer Submitted');

    // Disable all options (prevent changing answer)
    $('.quiz-option-professional').css('pointer-events', 'none');

    // Show feedback
    showAnswerFeedback(isCorrect, question);

    // Show next/submit button
    if (currentQuestionIndex < currentQuizData.questions.length - 1) {
        $('#nextQuestionBtn').show();
    } else {
        $('#submitQuizBtn').show();
    }
}

// FIX 5: Show Answer Feedback
// ============================================================================
function showAnswerFeedback(isCorrect, question) {
    const feedbackClass = isCorrect ? 'alert-success' : 'alert-danger';
    const feedbackIcon = isCorrect ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
    const feedbackTitle = isCorrect ? 'Correct!' : 'Incorrect';

    const html = `
        <div class="alert ${feedbackClass} answer-feedback">
            <h5><i class="fas ${feedbackIcon} me-2"></i>${feedbackTitle}</h5>
            <p><strong>Correct Answer:</strong> ${question.correctAnswer || question.options[question.correctIndex]}</p>
            ${question.explanation ? `<p><strong>Explanation:</strong> ${question.explanation}</p>` : ''}
        </div>
    `;

    $('#answerFeedback').html(html).show();
}

function renderQuizOptions(question) {
    if (!question) {
        console.error('❌ Question is null');
        return '<p class="alert alert-danger">Question data missing</p>';
    }

    let options = [];
    if (question.options && Array.isArray(question.options)) {
        options = question.options;
    }

    if (options.length === 0) {
        console.error('❌ No options for question');
        return '<p class="alert alert-warning">No answer options available</p>';
    }

    console.log('✓ Rendering', options.length, 'options');

    return options.map((option, index) => `
        <div class="quiz-option-professional" onclick="selectQuizOption(${index})" data-option-index="${index}">
            <div class="option-indicator">
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            </div>
            <div class="option-text">${option || 'Option ' + (index + 1)}</div>
            <div class="option-checkmark">
                <i class="fas fa-check-circle"></i>
            </div>
        </div>
    `).join('');
}

function selectOption(optionIndex) {
    $('.quiz-option-professional').removeClass('selected');
    $(`.quiz-option-professional[data-option-index="${optionIndex}"]`).addClass('selected');
    userAnswers[currentQuestionIndex] = optionIndex;
}

function nextQuestion() {
    if (selectedOptionIndex === null) {
        showNotification('Please select an answer', 'warning');
        return;
    }

    if (!answerConfirmed) {
        showNotification('Please confirm your answer first', 'warning');
        return;
    }

    currentQuestionIndex++;
    renderQuizInterface();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuizInterface();
    }
}

function submitQuiz() {
    if (selectedOptionIndex === null || !answerConfirmed) {
        showNotification('Please confirm your answer before submitting', 'warning');
        return;
    }

    console.log('🎯 Submitting quiz...');
    console.log('User answers:', userAnswers);

    // Stop timer
    if (quizTimer) {
        clearInterval(quizTimer);
    }

    // Calculate score ACCURATELY
    let correctCount = 0;
    const questions = currentQuizData.questions;

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctIndex;

        console.log(`Q${index + 1}: User=${userAnswer}, Correct=${correctAnswer}, Match=${userAnswer === correctAnswer}`);

        if (userAnswer === correctAnswer) {
            correctCount++;
        }
    });

    const totalQuestions = questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= currentQuizData.passingScore;

    console.log('Final Score:', {
        correct: correctCount,
        total: totalQuestions,
        percent: scorePercent,
        passing: currentQuizData.passingScore,
        passed: passed
    });

    // Update quiz data
    currentQuizData.completed = true;
    currentQuizData.passed = passed;
    currentQuizData.bestScore = Math.max(currentQuizData.bestScore || 0, scorePercent);
    currentQuizData.lastScore = scorePercent;

    // Mark as complete if passed
    if (passed) {
        markQuizComplete(currentQuizData.id, true);
    }

    // Save data
    if (typeof saveData === 'function') {
        saveData();
    }

    // Show results
    showQuizResults(correctCount, totalQuestions, scorePercent, passed);
}

function showQuizResults(correctCount, totalQuestions, scorePercent, passed) {
    const resultClass = passed ? 'text-success' : 'text-danger';
    const resultIcon = passed ? 'fa-check-circle' : 'fa-times-circle';
    const resultText = passed ? 'Congratulations! You Passed!' : 'You Did Not Pass';

    let skillLevel = 'Needs Improvement';
    if (scorePercent >= 90) skillLevel = 'Excellent';
    else if (scorePercent >= 80) skillLevel = 'Very Good';
    else if (scorePercent >= 70) skillLevel = 'Good';
    else if (scorePercent >= 60) skillLevel = 'Average';

    const html = `
        <div class="quiz-results-container fade-in">
            <div class="text-center mb-4">
                <i class="fas ${resultIcon} ${resultClass}" style="font-size: 72px;"></i>
                <h2 class="${resultClass} mt-3">${resultText}</h2>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="results-summary">
                        <div class="row text-center">
                            <div class="col-md-3">
                                <h3 class="${resultClass}">${scorePercent}%</h3>
                                <p class="text-muted">Score</p>
                            </div>
                            <div class="col-md-3">
                                <h3>${correctCount}/${totalQuestions}</h3>
                                <p class="text-muted">Correct Answers</p>
                            </div>
                            <div class="col-md-3">
                                <h3>${currentQuizData.passingScore}%</h3>
                                <p class="text-muted">Passing Score</p>
                            </div>
                            <div class="col-md-3">
                                <h3>${skillLevel}</h3>
                                <p class="text-muted">Performance</p>
                            </div>
                        </div>
                    </div>

                    <hr>

                    <h5>Question Review</h5>
                    <div class="question-review">
                        ${renderQuestionReview()}
                    </div>

                    <div class="mt-4 text-center">
                        ${!passed ? `
                            <button class="btn btn-warning me-2" onclick="retakeQuiz()">
                                <i class="fas fa-redo me-2"></i>Retake Quiz
                            </button>
                        ` : ''}
                        <button class="btn btn-primary" onclick="showSection('module')">
                            <i class="fas fa-arrow-left me-2"></i>Back to Module
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('#quizPlayer').html(html);
}

function renderQuestionReview() {
    return currentQuizData.questions.map((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctIndex;
        const statusClass = isCorrect ? 'text-success' : 'text-danger';
        const statusIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';

        return `
            <div class="card mb-3">
                <div class="card-header ${isCorrect ? 'bg-success' : 'bg-danger'} text-white">
                    <strong>Q${index + 1}</strong>
                    <span class="float-end">
                        <i class="fas ${statusIcon}"></i> ${isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                </div>
                <div class="card-body">
                    <p><strong>${question.text}</strong></p>
                    ${userAnswer !== undefined ? `
                        <p class="${statusClass}">
                            <strong>Your answer:</strong> ${question.options[userAnswer]}
                        </p>
                    ` : ''}
                    ${!isCorrect ? `
                        <p class="text-success">
                            <strong>Correct answer:</strong> ${question.options[question.correctIndex]}
                        </p>
                        ${question.explanation ? `<p class="text-muted"><em>${question.explanation}</em></p>` : ''}
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Export functions
window.renderQuizInterface = renderQuizInterface;
window.selectQuizOption = selectQuizOption;
window.confirmAnswer = confirmAnswer;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.submitQuiz = submitQuiz;

console.log('✅ Quiz fixes loaded - Accurate scoring and confirm button implemented');

function renderQuizResults(results) {
    if (!currentQuizData || !currentQuizData.questions) return;

    const passedClass = results.passed ? "passed" : "failed";
    const quizTitle = currentQuizData.title || "Quiz Results";

    // Build question review list
    const questionsHtml = currentQuizData.questions
        .map((question, index) => {
            const userAnswerIndex = userAnswers[index];
            const hasOptions = question.options && question.options.options;
            const correctIndex = hasOptions
                ? question.options.correctIndex
                : question.correctAnswer;
            const isCorrect = userAnswerIndex === correctIndex;

            const questionClass = isCorrect ? "correct" : "incorrect";
            const userAnswerText = hasOptions && userAnswerIndex !== undefined
                ? question.options.options[userAnswerIndex]
                : "No answer selected";
            const correctAnswerText = hasOptions
                ? question.options.options[correctIndex]
                : question.correctAnswer;

            const explanation = question.explanation || "";

            return `
                <div class="question-review-item ${questionClass}">
                    <div class="question-review-header">
                        <span class="question-number">Q${index + 1}</span>
                        <div class="question-status ${questionClass}">
                            <i class="fas fa-${isCorrect ? "check-circle" : "times-circle"} me-1"></i>
                            ${isCorrect ? "Correct" : "Incorrect"}
                        </div>
                    </div>
                    <div class="question-review-content">
                        <div class="question-text">${question.text}</div>
                        <p><strong>Your answer:</strong> ${userAnswerText}</p>
                        <p><strong>Correct answer:</strong> ${correctAnswerText}</p>
                        ${
                            explanation
                                ? `<div class="explanation"><strong>Why:</strong> ${explanation}</div>`
                                : ""
                        }
                    </div>
                </div>
            `;
        })
        .join("");

    const html = `
        <div class="professional-quiz-results fade-in">
            <div class="results-hero ${passedClass}">
                <div class="score-display">
                    <div class="score-circle">
                        <div class="score-number">
                            <span class="score-value">${results.score}</span>
                            <span class="score-percent">%</span>
                        </div>
                    </div>
                </div>
                <div class="results-message">
                    <h2 class="result-title">${quizTitle}</h2>
                    <p class="result-description">
                        You answered ${results.correctAnswers} of ${results.totalQuestions} questions correctly.
                    </p>
                    <p class="result-description">
                        Status: ${results.passed ? "Passed" : "Not Passed"} (Passing score: ${currentQuizData.passingScore}%)
                    </p>
                </div>
            </div>

            <div class="results-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${results.correctAnswers}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${results.totalQuestions - results.correctAnswers}</div>
                        <div class="stat-label">Incorrect</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-bullseye"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${currentQuizData.passingScore}%</div>
                        <div class="stat-label">Required</div>
                    </div>
                </div>
            </div>

            <div class="question-review-section">
                <h5>Question Review</h5>
                <div class="questions-review-list">
                    ${questionsHtml}
                </div>
            </div>

            <div class="results-actions mt-4">
                <button class="btn btn-outline-secondary me-2" onclick="showSection('module')">
                    <i class="fas fa-arrow-left me-2"></i>Back to Module
                </button>
                <button class="btn btn-primary" onclick="retakeQuiz()">
                    <i class="fas fa-redo me-2"></i>Retake Quiz
                </button>
            </div>
        </div>
    `;

    $("#quizResults").html(html);
}

function calculateQuizResults() {
    let correctAnswers = 0;
    const totalQuestions = currentQuizData.questions.length;

    currentQuizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.options ? question.options.correctIndex : question.correctAnswer;
        if (userAnswer === correctAnswer) correctAnswers++;
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= currentQuizData.passingScore;

    return { score, correctAnswers, totalQuestions, passed };
}

// Global timer variable
// let quizTimer = null;
// let timeRemaining = 0;

// Global training score (add at top of file if not exists)
let trainingTotalScore = 0;

// ============================================================================
// FIX 1: Quiz Timer - Real-time Countdown
// ============================================================================

function startQuizTimer() {
    // Clear any existing timer
    if (quizTimer) {
        clearInterval(quizTimer);
    }

    // Set initial time (already set in startQuiz)
    console.log('⏰ Starting quiz timer with', timeRemaining, 'seconds');

    // Update timer display immediately
    updateTimerDisplay();

    // Start interval that runs every second
    quizTimer = setInterval(() => {
        timeRemaining--;

        console.log('⏱️ Time remaining:', timeRemaining, 'seconds');

        // Update display
        updateTimerDisplay();

        // Check if time is up
        if (timeRemaining <= 0) {
            clearInterval(quizTimer);
            console.log('⏰ Time is up!');
            showNotification('Time is up! Submitting quiz...', 'warning');

            // Auto-submit quiz
            setTimeout(() => {
                submitQuiz();
            }, 1000);
        }

        // Warning at 1 minute remaining
        if (timeRemaining === 60) {
            showNotification('Only 1 minute remaining!', 'warning');
        }

        // Warning at 30 seconds
        if (timeRemaining === 30) {
            showNotification('30 seconds left!', 'warning');
        }
    }, 1000); // Run every 1 second (1000ms)
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update timer text
    $('.timer-text').text(timerText);

    // Change color if time is running out
    if (timeRemaining <= 60) {
        $('.timer-text').css('color', '#dc3545'); // Red
    } else if (timeRemaining <= 120) {
        $('.timer-text').css('color', '#ffc107'); // Yellow
    } else {
        $('.timer-text').css('color', '#ffffff'); // White
    }
}

function stopQuizTimer() {
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
        console.log('⏰ Quiz timer stopped');
    }
}

function stopQuizTimer() {
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }
}

function retakeQuiz() {
    console.log('🔄 Retaking quiz');

    if (!currentModule || !currentModule.quiz) {
        console.error('❌ Cannot retake quiz: No module or quiz data');
        showNotification('Cannot retake quiz. Please try again.', 'error');
        return;
    }

    // Validate quiz has questions
    if (!currentModule.quiz.questions || currentModule.quiz.questions.length === 0) {
        console.error('❌ Quiz has no questions');
        showNotification('This quiz has no questions', 'error');
        return;
    }

    // Reset quiz state
    currentQuizData = currentModule.quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    isQuizSubmitted = false;
    timeRemaining = (currentQuizData.timeLimit || 30) * 60;

    // Increment attempt counter
    currentQuizData.attempts = (currentQuizData.attempts || 0) + 1;

    console.log('✓ Quiz reset for retake, attempt:', currentQuizData.attempts);

    // Save data and start quiz
    if (typeof saveData === 'function') {
        saveData();
    }

    renderQuizInterface();
    showSection('quiz');
    startQuizTimer();
}

function saveTrainingProgress() {
    try {
        const progress = {
            totalScore: trainingTotalScore || 0,
            interactiveScore: window.interactiveScore || 0,
            passwordScore: window.passwordScore || 0,
            policyScore: window.policyScore || 0,
            timestamp: Date.now(),
            moduleId: currentModule ? currentModule.id : null,
            moduleName: currentModule ? currentModule.title : null
        };

        // Save for current module
        if (progress.moduleId) {
            localStorage.setItem(`training-progress-${progress.moduleId}`, JSON.stringify(progress));
        }

        // Save global training progress
        localStorage.setItem('training-progress-global', JSON.stringify(progress));

        console.log('✓ Training progress saved:', progress);
        return progress;
    } catch (error) {
        console.error('❌ Error saving training progress:', error);
        return null;
    }
}

// Load training progress from localStorage
function loadTrainingProgress(moduleId) {
    try {
        let progress = null;

        if (moduleId) {
            // Try to load module-specific progress
            const saved = localStorage.getItem(`training-progress-${moduleId}`);
            if (saved) {
                progress = JSON.parse(saved);
            }
        }

        // If no module-specific progress, load global
        if (!progress) {
            const globalSaved = localStorage.getItem('training-progress-global');
            if (globalSaved) {
                progress = JSON.parse(globalSaved);
            }
        }

        if (progress) {
            // Restore scores
            trainingTotalScore = progress.totalScore || 0;
            if (window.interactiveScore !== undefined) {
                window.interactiveScore = progress.interactiveScore || 0;
            }
            if (window.passwordScore !== undefined) {
                window.passwordScore = progress.passwordScore || 0;
            }
            if (window.policyScore !== undefined) {
                window.policyScore = progress.policyScore || 0;
            }

            console.log('✓ Training progress loaded:', progress);

            // Update display
            updateTrainingProgressDisplay();
        }

        return progress;
    } catch (error) {
        console.error('❌ Error loading training progress:', error);
        return null;
    }
}

// Update training progress display
function updateTrainingProgressDisplay() {
    const totalScore = trainingTotalScore || 0;
    const maxScore = 30; // Adjust based on your training modules

    // Update score badge
    $('#interactiveScoreBadge').text(`Score: ${totalScore}/${maxScore} points`);

    // Update progress bar
    const progressPercent = Math.round((totalScore / maxScore) * 100);
    $('#interactiveProgressBar').css('width', `${progressPercent}%`);

    // Update progress text
    if (totalScore === 0) {
        $('#interactiveProgressText').text('Ready to start interactive security training');
    } else if (totalScore >= maxScore) {
        $('#interactiveProgressText').text('All training modules completed! Excellent work!');
    } else {
        $('#interactiveProgressText').text(`Training in progress - ${totalScore}/${maxScore} points earned`);
    }

    console.log('✓ Training display updated:', { totalScore, maxScore, progressPercent });
}

// Updated: Add score when training completed
function completeTrainingModule(pointsEarned) {
    trainingTotalScore += pointsEarned;

    console.log('✓ Training module completed:', {
        pointsEarned: pointsEarned,
        totalScore: trainingTotalScore
    });

    // Save progress
    saveTrainingProgress();

    // Update display
    updateTrainingProgressDisplay();

    // Show notification
    showNotification(`Great job! You earned ${pointsEarned} points!`, 'success');
}

// Initialize training progress on page load
function initializeTrainingProgress() {
    if (currentModule) {
        loadTrainingProgress(currentModule.id);
    } else {
        loadTrainingProgress(null);
    }
}

// Export functions
window.startQuizTimer = startQuizTimer;
window.updateTimerDisplay = updateTimerDisplay;
window.stopQuizTimer = stopQuizTimer;
window.saveTrainingProgress = saveTrainingProgress;
window.loadTrainingProgress = loadTrainingProgress;
window.updateTrainingProgressDisplay = updateTrainingProgressDisplay;
window.completeTrainingModule = completeTrainingModule;
window.initializeTrainingProgress = initializeTrainingProgress;

// Export all functions to global scope
window.renderModulePlayer = renderModulePlayer;
window.openLesson = openLesson;
window.completeLesson = completeLesson;
window.startQuiz = startQuiz;
window.retakeQuiz = retakeQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.submitQuiz = submitQuiz;

// Interactive training functions
window.startPhishingEmailTraining = startPhishingEmailTraining;
window.analyzeEmail = analyzeEmail;
window.nextEmail = nextEmail;
window.startPasswordStrengthTraining = startPasswordStrengthTraining;
window.analyzePasswordStrength = analyzePasswordStrength;
window.testCurrentPassword = testCurrentPassword;
window.nextPasswordTest = nextPasswordTest;
window.startSecurityPolicyTraining = startSecurityPolicyTraining;
window.makePolicyDecision = makePolicyDecision;
window.nextPolicyScenario = nextPolicyScenario;

// Scenario training functions
window.startSecurityScenario = startSecurityScenario;
window.makeScenarioChoice = makeScenarioChoice;
window.nextScenarioStep = nextScenarioStep;
window.resetScenarioTraining = resetScenarioTraining;
window.resetAllTraining = resetAllTraining;
window.continueTraining = continueTraining;

console.log('Complete Interactive Security Training Hub loaded with all modules fully implemented');