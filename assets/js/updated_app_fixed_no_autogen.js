// Zenerom LMS - Advanced Learning Management System
// Enhanced with proper course progression and completion tracking
// FIXED: Removed auto-generation of placeholder options from app.js

// Global variables
let courses = [];
let currentCourse = null;
let currentModule = null;
let currentLesson = null;
let currentQuiz = null;
let quizAttempts = {};
// FIXED: Add completion tracking
let userData = {
    completedLessons: [],
    completedQuizzes: [],
    unlockedModules: []
};

// Initialize the application
document.ready(function initializeApp() {
    console.log('Zenerom LMS Advanced Platform initialized');
    updateStats();
    initializeSidebar();
    initializeTheme();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    $('.nav-link').on('click', function(e) {
        e.preventDefault();
        const section = $(this).data('section');
        if (section) {
            showSection(section);
            updateActiveNav($(this));
        }
    });

    // Course creation options
    $('.option-card').on('click', function() {
        const option = $(this).data('option');
        handleOptionSelection(option);
    });

    // CSV file upload
    setupCsvUpload();

    // Modal events
    $('#csvModal').on('hidden.bs.modal', function() {
        resetCsvUpload();
    });

    // Sidebar toggle
    $('#sidebarToggle').on('click', toggleSidebar);
    $('#mobileMenuToggle').on('click', toggleMobileSidebar);

    // Theme toggle
    $('#themeToggle').on('click', toggleTheme);

    // Window resize handler
    $(window).on('resize', handleResize);
}

// Sidebar functionality
function initializeSidebar() {
    const sidebarState = localStorage.getItem('sidebar-collapsed');
    if (sidebarState === 'true') {
        $('body').addClass('collapsed');
        $('#sidebar').addClass('collapsed');
        $('#mainContent').addClass('sidebar-collapsed');
        $('.top-header').addClass('sidebar-collapsed');
    }
}

function toggleSidebar() {
    const sidebar = $('#sidebar');
    const mainContent = $('#mainContent');
    const topHeader = $('.top-header');

    sidebar.toggleClass('collapsed');
    mainContent.toggleClass('sidebar-collapsed');
    topHeader.toggleClass('sidebar-collapsed');

    // Save state
    const isCollapsed = sidebar.hasClass('collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);
    showNotification(isCollapsed ? 'Sidebar collapsed' : 'Sidebar expanded', 'info');
}

function toggleMobileSidebar() {
    $('#sidebar').toggleClass('mobile-open');
}

function handleResize() {
    if (window.innerWidth > 1024) {
        $('#sidebar').removeClass('mobile-open');
    }
}

// Theme functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = $('html').attr('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showNotification('Switched to ' + newTheme + ' mode', 'info');
}

function setTheme(theme) {
    $('html').attr('data-theme', theme);
    $('#themeToggle').toggleClass('light', theme === 'light');
    localStorage.setItem('theme', theme);
}

// FIXED: Enhanced navigation with forced data refresh
function showSection(sectionName) {
    console.log('Navigating to section:', sectionName);
    // FIXED: Force data refresh on every navigation
    loadStoredData();

    $('.section').removeClass('active');
    $('#' + sectionName + '-section').addClass('active');

    // FIXED: Update page content with latest data
    switch(sectionName) {
        case 'courses':
            renderCourseDashboard();
            break;
        case 'dashboard':
            renderDashboard();
            break;
        case 'player':
            if (currentCourse) {
                renderCoursePlayer();
            }
            break;
        case 'module':
            if (currentModule && typeof renderModulePlayer === 'function') {
                renderModulePlayer();
            }
            break;
        case 'upload':
            // Upload section is static
            break;
        default:
            console.log('Unknown section:', sectionName);
    }
    console.log('Navigated to ' + sectionName + ' with fresh data');
}

function updateActiveNav(activeLink) {
    $('.nav-link').removeClass('active');
    activeLink.addClass('active');
}

// Dashboard rendering
function renderDashboard() {
    // Dashboard functionality can be added here
    console.log('Dashboard rendered');
}

// Course creation option handling
function handleOptionSelection(option) {
    $('.option-card').removeClass('selected');
    $('.option-card[data-option="' + option + '"]').addClass('selected');

    switch(option) {
        case 'powerpoint':
            showNotification('PowerPoint upload coming soon!', 'info');
            break;
        case 'csv':
            $('#csvModal').modal('show');
            break;
        case 'manual':
            showNotification('Manual course builder coming soon!', 'info');
            break;
    }
}

// CSV Upload functionality
function setupCsvUpload() {
    const fileInput = $('#csvFileInput');
    const uploadArea = $('#csvUploadArea');

    // Drag and drop
    uploadArea.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });

    uploadArea.on('dragleave', function() {
        $(this).removeClass('dragover');
    });

    uploadArea.on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
        const files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            handleCsvFile(files[0]);
        }
    });

    // File input change
    fileInput.on('change', function() {
        if (this.files.length > 0) {
            handleCsvFile(this.files[0]);
        }
    });
}

function handleCsvFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showNotification('Please select a valid CSV file', 'error');
        return;
    }

    // Show file info
    $('.upload-content').hide();
    $('#csvFileInfo').show();
    $('#csvFileName').text(file.name);

    // Store file for processing
    window.selectedCsvFile = file;
}

function removeCsvFile() {
    $('#csvFileInput').val('');
    $('.upload-content').show();
    $('#csvFileInfo').hide();
    window.selectedCsvFile = null;
}

function processCsvFile() {
    if (!window.selectedCsvFile) {
        showNotification('Please select a CSV file first', 'error');
        return;
    }

    // Show progress
    $('#csvProgressContainer').show();
    $('#csvUploadBtn').prop('disabled', true).text('Processing...');

    // Parse CSV file
    parseCsvFile(window.selectedCsvFile);
}

function parseCsvFile(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                throw new Error('CSV file appears to be empty or invalid');
            }

            console.log('Raw CSV lines:', lines.length);
            console.log('First few lines:', lines.slice(0, 3));

            // Parse CSV headers - handle quoted fields properly
            const headers = parseCSVLine(lines[0]);

            // Create header index mapping
            const headerIndex = {};
            headers.forEach((header, index) => {
                headerIndex[header] = index;
            });

            console.log('CSV Headers found:', headers);
            console.log('Header mapping:', headerIndex);
            console.log('Processing', lines.length - 1, 'data rows');

            // Parse course data
            const courseMap = {};
            let totalLessons = 0;
            let totalQuizzes = 0;

            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 8;
                $('#csvProgressBar').css('width', progress + '%');

                if (progress < 30) {
                    $('#csvProgressText').text('Parsing course structure...');
                }
                if (progress >= 30 && progress < 60) {
                    $('#csvProgressText').text('Creating quizzes and lessons...');
                }
                if (progress >= 60 && progress < 90) {
                    $('#csvProgressText').text('Finalizing course setup...');
                }
                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 100);

            // Process the actual data
            for (let i = 1; i < lines.length; i++) {
                const cells = parseCSVLine(lines[i]);

                if (cells.length < headers.length) {
                    console.log('Skipping line', i, '- insufficient cells:', cells.length, 'vs', headers.length);
                    continue;
                }

                const courseId = cells[headerIndex['course_id']];
                const moduleId = cells[headerIndex['module_id']];
                const lessonId = cells[headerIndex['lesson_id']];

                console.log('Processing row', i, 'Course:' + courseId, ', Module:' + moduleId, ', Lesson:' + lessonId);

                if (!courseId) {
                    console.log('Skipping row - no course ID');
                    continue;
                }

                // Initialize course if not exists
                if (!courseMap[courseId]) {
                    courseMap[courseId] = {
                        id: courseId,
                        title: cells[headerIndex['course_title']] || 'Untitled Course',
                        description: cells[headerIndex['course_description']] || '',
                        category: cells[headerIndex['course_category']] || 'General',
                        duration: parseInt(cells[headerIndex['estimated_duration']]) || 60,
                        difficulty: cells[headerIndex['difficulty_level']] || 'Beginner',
                        prerequisites: cells[headerIndex['prerequisites']] || 'None',
                        modules: {},
                        totalLessons: 0,
                        totalQuizzes: 0,
                        completedLessons: 0,
                        completedQuizzes: 0,
                        isLocked: false // FIXED: Will be set properly later
                    };
                    console.log('Created course', courseId, courseMap[courseId].title);
                }

                // Initialize module if not exists
                if (moduleId && !courseMap[courseId].modules[moduleId]) {
                    courseMap[courseId].modules[moduleId] = {
                        id: moduleId,
                        title: cells[headerIndex['module_title']] || 'Untitled Module',
                        description: cells[headerIndex['module_description']] || '',
                        duration: parseInt(cells[headerIndex['module_duration']]) || 30,
                        order: parseInt(cells[headerIndex['module_order']]) || 1,
                        lessons: [],
                        quiz: null,
                        totalLessons: 0,
                        completedLessons: 0,
                        completedQuizzes: 0,
                        isCompleted: false,
                        isLocked: false // Will be set properly later
                    };
                    console.log('Created module', moduleId, courseMap[courseId].modules[moduleId].title);
                }

                // Add lesson if lesson_id is provided and module exists
                if (moduleId && lessonId) {
                    const lessonType = cells[headerIndex['lesson_type']] || 'Reading';
                    const lessonContent = cells[headerIndex['lesson_content']];
                    let videoUrl = cells[headerIndex['video_url']];

                    // Convert youtu.be URLs to embed format
                    if (videoUrl) {
                        if (videoUrl.includes('youtu.be')) {
                            const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
                            videoUrl = 'https://www.youtube.com/embed/' + videoId;
                            console.log('Converted youtu.be URL to embed format:', videoUrl);
                        }
                    }

                    const lesson = {
                        id: lessonId,
                        title: cells[headerIndex['lesson_title']] || 'Untitled Lesson',
                        content: lessonContent,
                        type: lessonType,
                        duration: parseInt(cells[headerIndex['lesson_duration']]) || 10,
                        order: parseInt(cells[headerIndex['lesson_order']]) || 1,
                        objectives: cells[headerIndex['learning_objectives']] || '',
                        completed: false,
                        videoUrl: lessonType === 'Video' ? videoUrl : null,
                        interactiveContent: (lessonType === 'Interactive' || lessonType === 'Scenario' || lessonType === 'Assessment') ? generateInteractiveContent(lessonType, lessonContent) : null
                    };

                    courseMap[courseId].modules[moduleId].lessons.push(lesson);
                    courseMap[courseId].modules[moduleId].totalLessons++;
                    courseMap[courseId].totalLessons++;
                    totalLessons++;

                    console.log('Added lesson', lessonId, 'to module', moduleId, lessonType);
                }

                // Create quiz for module if quiz questions exist - ENHANCED FOR MULTIPLE QUESTIONS
                const quizQuestions = cells[headerIndex['quiz_questions']];
                if (quizQuestions && moduleId && !courseMap[courseId].modules[moduleId].quiz) {
                    courseMap[courseId].modules[moduleId].quiz = {
                        id: moduleId + '_quiz',
                        title: courseMap[courseId].modules[moduleId].title + ' Quiz',
                        // FIXED: Parse multiple questions directly - NO auto-generation
                        questions: parseMultipleQuizQuestions(quizQuestions),
                        passingScore: 70,
                        timeLimit: 10, // minutes
                        attempts: 0,
                        maxAttempts: 3,
                        completed: false,
                        passed: false,
                        bestScore: 0
                    };
                    courseMap[courseId].totalQuizzes++;
                    totalQuizzes++;
                    console.log('Added quiz to module', moduleId, 'with', courseMap[courseId].modules[moduleId].quiz.questions.length, 'questions');
                }
            }

            // Convert to array and sort
            const newCourses = Object.values(courseMap).map((course, courseIndex) => {
                // Convert modules object to array and sort by order
                const modulesArray = Object.values(course.modules)
                    .sort((a, b) => a.order - b.order);

                // For each module, sort lessons by order
                modulesArray.forEach((module, moduleIndex) => {
                    module.lessons.sort((a, b) => a.order - b.order);

                    // FIXED: Lock modules properly - first module of each course unlocked
                    module.isLocked = moduleIndex > 0;
                    console.log('Module', module.id, 'has', module.lessons.length, 'lessons,', (module.quiz ? module.quiz.questions.length + ' questions' : 'no quiz'));
                });

                course.modules = modulesArray;

                // FIXED: Lock courses properly - first course unlocked
                course.isLocked = courseIndex > 0;

                return course;
            });

            // Add to courses array
            courses.push(...newCourses);

            // Initialize quiz attempts
            newCourses.forEach(course => {
                course.modules.forEach(module => {
                    if (module.quiz) {
                        quizAttempts[module.quiz.id] = 0;
                    }
                });
            });

            // FIXED: Apply existing progress and check unlocks
            applyUserProgress();
            checkAndUnlockContent();

            // Save to localStorage
            saveData();

            // Show success
            $('#csvModal').modal('hide');

            setTimeout(() => {
                // Count total questions
                const totalQuestions = newCourses.reduce((sum, course) => {
                    return sum + course.modules.reduce((moduleSum, module) => {
                        return moduleSum + (module.quiz ? module.quiz.questions.length : 0);
                    }, 0);
                }, 0);

                showSuccessModal(newCourses.length, totalLessons, totalQuestions);
            }, 150);

        } catch (error) {
            console.error('Error parsing CSV:', error);
            showNotification('Error processing CSV file: ' + error.message, 'error');
            resetCsvUpload();
        }
    };

    reader.readAsText(file);
}

// Enhanced CSV line parsing to handle quoted fields properly
function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // End of cell
            cells.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }

    // Add the last cell
    cells.push(current.trim());

    return cells;
}

// ENHANCED: Parse multiple questions separated by ~ - FIXED: NO auto-generation
function parseMultipleQuizQuestions(quizString) {
    const questions = [];
    const questionPairs = quizString.split('~');

    questionPairs.forEach((pair, index) => {
        const parts = pair.split('|');

        if (parts.length >= 2) {
            const questionText = parts[0].trim();
            const correctAnswer = parts[1].trim();

            // Get answer options from CSV (all provided options)
            let options = [correctAnswer]; // Start with correct answer

            // Add wrong options if provided in CSV (parts 2, 3, 4)
            if (parts.length >= 5) {
                // All 4 options provided: Q|Correct|Wrong1|Wrong2|Wrong3
                options = [
                    correctAnswer,
                    parts[2].trim(),
                    parts[3].trim(),
                    parts[4].trim()
                ];
            } else if (parts.length === 4) {
                // 3 options provided
                options = [
                    correctAnswer,
                    parts[2].trim(),
                    parts[3].trim()
                ];
            } else if (parts.length === 3) {
                // 2 options provided
                options = [
                    correctAnswer,
                    parts[2].trim()
                ];
            }
            // If only question and correct answer, let quiz.js handle it

            // Shuffle options but track correct answer position
            const shuffledOptions = shuffleArray([...options]);
            const correctIndex = shuffledOptions.indexOf(correctAnswer);

            questions.push({
                id: 'q' + (index + 1),
                text: questionText,
                type: 'multiplechoice',
                options: shuffledOptions,
                correctIndex: correctIndex,
                correctAnswer: correctAnswer,
                explanation: 'The correct answer is ' + correctAnswer
            });
        }
    });

    console.log('Parsed', questions.length, 'questions from quiz string (CSV options only - NO auto-generation)');
    return questions;
}

// FIXED: generateQuizOptions - REMOVED GENERIC OPTION GENERATION
function generateQuizOptions(correctAnswer, questionIndex = 0) {
    // FIXED: Return empty array - do NOT auto-generate placeholder options
    // Options should ONLY come from CSV via parseMultipleQuizQuestions
    // This prevents "Alternative 1, 2, 3" from appearing
    return [];
}

// FIXED: generateIncorrectOptions - COMPLETELY DISABLED
function generateIncorrectOptions(correctAnswer, questionIndex = 0) {
    // FIXED: Do NOT generate any incorrect options
    // All options must come from CSV file
    // This ensures no generic placeholder text appears
    return [];
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateDemoVideoUrl() {
    // Return working video URLs
    const demoVideos = [
        'https://www.youtube.com/embed/8aulMPhE12g',  // Using your provided URL
        'https://www.youtube.com/embed/dQw4w9WgXcQ',  // Rick Roll as backup
        'https://www.youtube.com/embed/9bZkp7q19f0'   // Gangnam Style as backup
    ];

    return demoVideos[Math.floor(Math.random() * demoVideos.length)];
}

function generateInteractiveContent(type, content) {
    if (type === 'Scenario') {
        return {
            type: 'scenario',
            title: 'Interactive Scenario Training',
            description: content,
            steps: [
                'Analyze the situation presented',
                'Consider your available options',
                'Apply the concepts you have learned',
                'Make your decision',
                'Review the outcome and feedback'
            ]
        };
    } else if (type === 'Assessment') {
        return {
            type: 'assessment',
            title: 'Self-Assessment Activity',
            description: content,
            steps: [
                'Complete the self-assessment questionnaire',
                'Review your responses honestly',
                'Identify areas for improvement',
                'Create an action plan for development'
            ]
        };
    } else {
        return {
            type: 'interactive',
            title: 'Interactive Learning Activity',
            description: content,
            steps: [
                'Review the interactive content',
                'Participate in the learning activity',
                'Complete the hands-on exercises',
                'Apply your knowledge'
            ]
        };
    }
}

function resetCsvUpload() {
    $('#csvProgressContainer').hide();
    $('#csvProgressBar').css('width', '0%');
    $('#csvProgressText').text('Extracting course content...');
    $('#csvUploadBtn').prop('disabled', false).html('<i class="fas fa-cogs me-2"></i>Process CSV');
    removeCsvFile();
}

// Course dashboard functions
function renderCourseDashboard() {
    updateStats();
    const grid = $('#coursesGrid');

    if (courses.length === 0) {
        grid.html(`<div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-book-open"></i>
            </div>
            <h3>No courses yet</h3>
            <p>Upload your first course to get started</p>
            <button class="btn btn-primary" onclick="showSection('upload')">Create Course</button>
        </div>`);
        return;
    }

    let html = '';

    courses.forEach((course, index) => {
        const totalItems = course.totalLessons + course.totalQuizzes;
        const completedItems = course.completedLessons + course.completedQuizzes;
        const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // FIXED: Check if course is locked
        const isLocked = course.isLocked;
        const lockClass = isLocked ? 'locked' : '';
        const lockIcon = isLocked ? '<i class="fas fa-lock"></i>' : '';

        html += `
            <div class="course-card fade-in ${lockClass}" data-course-index="${index}">
                <div class="course-card-header">
                    <h3 class="course-card-title">${course.title} ${lockIcon}</h3>
                    <p class="course-card-description">${course.description}</p>
                </div>

                <div class="course-badges">
                    <span class="course-badge badge-category">${course.category}</span>
                    <span class="course-badge badge-difficulty">${course.difficulty}</span>
                    <span class="course-badge badge-modules">${course.modules.length} Modules</span>
                </div>

                <div class="course-progress">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="course-meta">
                    <span><i class="fas fa-clock me-1"></i>${course.duration} minutes</span>
                    <span><i class="fas fa-tasks me-1"></i>${completedItems}/${totalItems} completed</span>
                </div>

                ${isLocked ? '<div class="lock-message">Complete previous course to unlock</div>' : ''}
            </div>
        `;
    });

    grid.html(html);

    // Add click handlers
    $('.course-card').on('click', function() {
        if ($(this).hasClass('locked')) {
            showNotification('Complete the previous course to unlock this one', 'warning');
            return;
        }

        const courseIndex = $(this).data('course-index');
        openCourse(courseIndex);
    });
}

function updateStats() {
    const totalCourses = courses.length;
    const totalModules = courses.reduce((sum, course) => sum + course.modules.length, 0);
    const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
    const totalQuizzes = courses.reduce((sum, course) => sum + course.totalQuizzes, 0);

    $('#totalCourses').text(totalCourses);
    $('#totalModules').text(totalModules);
    $('#totalLessons').text(totalLessons);
    $('#totalQuizzes').text(totalQuizzes);
}

// Course player functions
function openCourse(courseIndex) {
    const course = courses[courseIndex];

    if (course.isLocked) {
        showNotification('Complete the previous course to unlock this one', 'warning');
        return;
    }

    currentCourse = course;
    renderCoursePlayer();
    showSection('player');
}

function renderCoursePlayer() {
    if (!currentCourse) return;

    const totalItems = currentCourse.totalLessons + currentCourse.totalQuizzes;
    const completedItems = currentCourse.completedLessons + currentCourse.completedQuizzes;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const html = `
        <div class="course-player fade-in">
            <button class="btn btn-outline-primary mb-3" onclick="showSection('courses')">
                <i class="fas fa-arrow-left me-2"></i>Back to Courses
            </button>

            <div class="course-player-header">
                <h1 class="course-player-title">${currentCourse.title}</h1>
                <p class="course-player-description">${currentCourse.description}</p>

                <div class="course-badges">
                    <span class="course-badge badge-category">${currentCourse.category}</span>
                    <span class="course-badge badge-difficulty">${currentCourse.difficulty}</span>
                    <span class="course-badge badge-modules">${currentCourse.modules.length} Modules</span>
                </div>
            </div>

            <div class="course-progress">
                <div class="progress-label">
                    <span><strong>Course Progress</strong></span>
                    <span><strong>${progressPercent}% Complete</strong></span>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <small class="text-muted">${completedItems} of ${totalItems} items completed (lessons + quizzes)</small>
            </div>

            <h3 class="mb-3">Course Modules</h3>
            <div class="modules-list">
                ${renderModulesList()}
            </div>
        </div>
    `;

    $('#coursePlayer').html(html);
}

function renderModulesList() {
    return currentCourse.modules.map((module, index) => {
        const totalItems = module.totalLessons + (module.quiz ? 1 : 0);
        const completedItems = module.completedLessons + (module.quiz && module.quiz.completed && module.quiz.passed ? 1 : 0);
        const isCompleted = completedItems >= totalItems && totalItems > 0;
        const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        let statusClass = 'status-not-started';
        let statusText = 'Not Started';
        let statusIcon = '';

        if (isCompleted) {
            statusClass = 'status-completed';
            statusText = 'Completed';
            statusIcon = '<i class="fas fa-check-circle text-success"></i>';
        } else if (completedItems > 0) {
            statusClass = 'status-in-progress';
            statusText = 'In Progress';
            statusIcon = '<i class="fas fa-play-circle text-primary"></i>';
        }

        const isLocked = module.isLocked;
        const lockClass = isLocked ? 'locked' : '';

        return `
            <div class="module-card ${isCompleted ? 'completed' : ''} ${lockClass}" data-module-index="${index}">
                <div class="module-header">
                    <div>
                        <h4 class="module-title">${module.title} ${isLocked ? '<i class="fas fa-lock"></i>' : ''}</h4>
                        <p class="module-description">${module.description}</p>
                    </div>
                    <div class="module-status ${statusClass}">
                        ${statusIcon}
                        ${statusText}
                    </div>
                </div>

                <div class="course-progress mb-2">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="module-meta">
                    <span><i class="fas fa-play-circle me-1"></i>${module.totalLessons} lessons</span>
                    <span><i class="fas fa-clock me-1"></i>${module.duration} minutes</span>
                    ${module.quiz ? `<span><i class="fas fa-question-circle me-1"></i>${module.quiz.questions.length} quiz questions</span>` : ''}
                    <span><i class="fas fa-chart-line me-1"></i>${completedItems}/${totalItems} completed</span>
                </div>

                ${isLocked ? '<div class="lock-message">Complete previous module to unlock</div>' : ''}
            </div>
        `;
    }).join('');
}

// Module player functions - MOVED TO APP.JS
function openModule(moduleIndex) {
    if (!currentCourse || !currentCourse.modules[moduleIndex]) {
        console.error('Invalid module index or course not selected');
        return;
    }

    const module = currentCourse.modules[moduleIndex];

    // Check if module is locked
    if (module.isLocked) {
        showNotification('Complete the previous module to unlock this one', 'warning');
        return;
    }

    currentModule = module;
    console.log('Opening module:', currentModule.title, 'with', currentModule.lessons.length, 'lessons');

    // Call renderModulePlayer from quiz.js
    if (typeof renderModulePlayer === 'function') {
        renderModulePlayer();
        showSection('module');
    } else {
        console.error('renderModulePlayer function not found');
        showNotification('Error opening module. Please refresh the page.', 'error');
    }
}

// Event handlers for module clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.module-card')) {
        if (e.target.closest('.module-card').classList.contains('locked')) {
            showNotification('Complete the previous module to unlock this one', 'warning');
            return;
        }

        const moduleIndex = e.target.closest('.module-card').getAttribute('data-module-index');
        openModule(parseInt(moduleIndex));
    }
});

// FIXED: Enhanced completion tracking functions
function markLessonComplete(lessonId) {
    if (!userData.completedLessons.includes(lessonId)) {
        userData.completedLessons.push(lessonId);
        console.log('Lesson ' + lessonId + ' marked as complete');

        // Update lesson and module completion counts
        updateCompletionCounts();

        // Check for unlocks
        checkAndUnlockContent();

        // Save data
        saveData();
        showNotification('Lesson completed! Great job!', 'success');
    }
}

function markQuizComplete(quizId, passed = true) {
    if (!userData.completedQuizzes.includes(quizId)) {
        if (passed) {
            userData.completedQuizzes.push(quizId);
        }
    }

    console.log('Quiz ' + quizId + ' marked as complete', passed ? 'passed' : '');

    // Update quiz completion counts
    updateCompletionCounts();

    // Check for unlocks
    checkAndUnlockContent();

    // Save data
    saveData();
    showNotification(passed ? 'Quiz passed! Well done!' : 'Quiz completed', passed ? 'success' : 'info');
}

function updateCompletionCounts() {
    courses.forEach(course => {
        course.completedLessons = 0;
        course.completedQuizzes = 0;

        course.modules.forEach(module => {
            module.completedLessons = 0;
            module.completedQuizzes = 0;

            // Count completed lessons
            module.lessons.forEach(lesson => {
                if (userData.completedLessons.includes(lesson.id)) {
                    lesson.completed = true;
                    module.completedLessons++;
                }
            });

            // Count completed quizzes
            if (module.quiz && userData.completedQuizzes.includes(module.quiz.id)) {
                module.quiz.completed = true;
                module.quiz.passed = true;
                module.completedQuizzes++;
            }

            course.completedLessons += module.completedLessons;
            course.completedQuizzes += module.completedQuizzes;
        });
    });
}

function applyUserProgress() {
    console.log('Applying user progress...');
    updateCompletionCounts();

    // Apply unlocked modules
    courses.forEach(course => {
        course.modules.forEach(module => {
            if (userData.unlockedModules.includes(module.id)) {
                module.isLocked = false;
            }
        });
    });
}

// FIXED: Enhanced unlock checking
function checkAndUnlockContent() {
    console.log('Checking for content to unlock...');

    courses.forEach((course, courseIndex) => {
        // Check module unlocks within course
        for (let i = 0; i < course.modules.length; i++) {
            const module = course.modules[i];

            // First module is always unlocked
            if (i === 0) {
                if (module.isLocked) {
                    module.isLocked = false;
                    if (!userData.unlockedModules.includes(module.id)) {
                        userData.unlockedModules.push(module.id);
                    }
                }
                continue;
            }

            // Check if previous module is complete
            const prevModule = course.modules[i - 1];
            const prevComplete = isModuleComplete(prevModule);

            if (prevComplete && module.isLocked) {
                console.log('Unlocking module:', module.title);
                module.isLocked = false;
                if (!userData.unlockedModules.includes(module.id)) {
                    userData.unlockedModules.push(module.id);
                    showNotification('New module unlocked: ' + module.title, 'success');
                }
            }
        }

        // Check course unlocks
        if (courseIndex === 0) {
            course.isLocked = false; // First course always unlocked
        } else {
            const prevCourse = courses[courseIndex - 1];
            const prevCourseComplete = isCourseComplete(prevCourse);

            if (prevCourseComplete && course.isLocked) {
                console.log('Unlocking course:', course.title);
                course.isLocked = false;
                showNotification('New course unlocked: ' + course.title, 'success');
            }
        }
    });
}

function isModuleComplete(module) {
    if (!module) return false;

    const lessonsComplete = module.completedLessons >= module.totalLessons;
    const quizComplete = !module.quiz || (module.quiz.completed && module.quiz.passed);

    return lessonsComplete && quizComplete;
}

function isCourseComplete(course) {
    if (!course || !course.modules || course.modules.length === 0) {
        return false;
    }

    return course.modules.every(module => isModuleComplete(module));
}

// Success and completion modals
function showSuccessModal(courseCount, lessonCount, questionCount) {
    $('#successMessage').html(`
        <strong>${courseCount}</strong> course${courseCount !== 1 ? 's' : ''} created successfully!<br>
        <div class="mt-2">
            <i class="fas fa-play-circle me-2"></i><strong>${lessonCount}</strong> lessons<br>
            <i class="fas fa-question-circle me-2"></i><strong>${questionCount}</strong> quiz questions
        </div>
        <p class="mt-2">Your interactive courses are now ready for learners!</p>
    `);
    $('#successModal').modal('show');
}

function viewCreatedCourses() {
    $('#successModal').modal('hide');
    showSection('courses');
}

function showCourseCompletionModal() {
    $('#completedCourseTitle').text(currentCourse.title);
    $('#completionDate').text(new Date().toLocaleDateString());
    $('#completionModal').modal('show');
}

// Notification system
function showNotification(message, type = 'info') {
    const types = {
        success: { class: 'bg-success', icon: 'fas fa-check-circle' },
        error: { class: 'bg-danger', icon: 'fas fa-exclamation-circle' },
        warning: { class: 'bg-warning', icon: 'fas fa-exclamation-triangle' },
        info: { class: 'bg-primary', icon: 'fas fa-info-circle' }
    };

    const notification = types[type] || types.info;
    const id = 'notification-' + Date.now();

    const html = `
        <div id="${id}" class="toast position-fixed" style="top: 100px; right: 20px; z-index: 9999; min-width: 300px;">
            <div class="toast-body ${notification.class} text-white rounded d-flex align-items-center">
                <i class="${notification.icon} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    $('body').append(html);

    const toastElement = new bootstrap.Toast(document.getElementById(id), {
        autohide: true,
        delay: 4000
    });

    toastElement.show();

    // Remove after hiding
    document.getElementById(id).addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// FIXED: Enhanced data persistence
function saveData() {
    try {
        const dataToSave = {
            courses: courses,
            quizAttempts: quizAttempts,
            userData: userData,
            timestamp: Date.now()
        };

        localStorage.setItem('zenerom-courses', JSON.stringify(dataToSave.courses));
        localStorage.setItem('zenerom-quizattempts', JSON.stringify(dataToSave.quizAttempts));
        localStorage.setItem('zenerom-userdata', JSON.stringify(dataToSave.userData));

        console.log('Data saved successfully. Courses:', courses.length);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function loadStoredData() {
    try {
        // Load courses
        const storedCourses = localStorage.getItem('zenerom-courses');
        if (storedCourses) {
            courses = JSON.parse(storedCourses);
            console.log('Loaded', courses.length, 'courses from storage');
        }

        // Load quiz attempts
        const storedQuizAttempts = localStorage.getItem('zenerom-quizattempts');
        if (storedQuizAttempts) {
            quizAttempts = JSON.parse(storedQuizAttempts);
        }

        // Load user data
        const storedUserData = localStorage.getItem('zenerom-userdata');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
        }

        // Apply progress and check unlocks
        if (courses.length > 0) {
            applyUserProgress();
            checkAndUnlockContent();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        courses = [];
        quizAttempts = {};
        userData = {
            completedLessons: [],
            completedQuizzes: [],
            unlockedModules: []
        };
    }
}

// Export functions to global scope
window.showSection = showSection;
window.openCourse = openCourse;
window.openModule = openModule;
window.markLessonComplete = markLessonComplete;
window.markQuizComplete = markQuizComplete;
window.viewCreatedCourses = viewCreatedCourses;
window.showCourseCompletionModal = showCourseCompletionModal;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.saveData = saveData;
window.loadStoredData = loadStoredData;
window.isModuleComplete = isModuleComplete;
window.isCourseComplete = isCourseComplete;

console.log('✅ Enhanced app.js loaded successfully with REMOVED generic option generation');
