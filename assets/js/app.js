// Zenerom LMS - Advanced Learning Management System
// FINAL VERSION: NO AUTO-GENERATION OF QUIZ OPTIONS
// All quiz options MUST come from CSV only

// Global variables
let courses = [];
let employees = [];   // [{id, name, email, department, role, status}]
let enrollments = []; // [{employeeId, courseId, status, progress, dueDate, completedAt, score}]
let currentCourse = null;
let currentModule = null;
let currentLesson = null;
let currentQuiz = null;
let quizAttempts = {};
let userData = {
    completedLessons: [],
    completedQuizzes: [],
    unlockedModules: []
};

let appSettings = {
    general: {
        portalName: 'Smart LMS',
        timezone: 'Asia/Dubai',
        language: 'en',
        defaultDashboard: 'dashboard' // dashboard | courses | upload
    },
    branding: {
        primaryColor: '#6366f1',
        logoUrl: '',
        darkModeDefault: true
    },
    notifications: {
        emailFromName: 'Smart LMS',
        emailFromAddress: 'no-reply@smartlms.local',
        courseReminderDays: 3,
        sendCompletionEmails: true
    },
    security: {
        requireStrongPasswords: true,
        sessionTimeoutMinutes: 60,
        allowSelfRegistration: false
    }
};


// Draft courses (from CSV) BEFORE final creation
let draftCourses = [];


// Initialize the application
$(document).ready(function() {
    initializeApp();
    setupEventListeners();
    loadStoredData();
    showSection('upload');
});

// Initialize application
function initializeApp() {
    console.log('Zenerom LMS Advanced Platform initialized');
    updateStats();
    initializeSidebar();
    initializeTheme();
}

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

    // Employee filters – ADD THIS LINE
    $('#employeeSearch, #employeeDeptFilter, #employeeStatusFilter')
        .on('input change', renderEmployeesList);

    // Settings tab switching
    $('#settingsTabs').on('click', 'button', function () {
        const tab = $(this).data('settings-tab');
        renderSettings(tab);
    });


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

    const isCollapsed = sidebar.hasClass('collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);
    // showNotification(isCollapsed ? 'Sidebar collapsed' : 'Sidebar expanded', 'info');
}

function toggleMobileSidebar() {
    $('#sidebar').toggleClass('mobile-open');
}

function handleResize() {
    if ($(window).width() > 1024) {
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

// Navigation
function showSection(sectionName) {
    console.log('Navigating to section:', sectionName);

    $('.section').removeClass('active');
    $('#' + sectionName + '-section').addClass('active');

    switch(sectionName) {
        case 'courses':
            renderCourseDashboard();
            break;
        case 'dashboard':
            renderDashboard();
            break;
        case 'employees':          // NEW
            renderEmployeesList();
            break;
        case 'analytics':          // NEW (if using analytics)
            renderAnalytics();
            break;
        case 'settings':
            renderSettings('general');
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
            break;
    }
}

function updateActiveNav(activeLink) {
    $('.nav-link').removeClass('active');
    activeLink.addClass('active');
}

// Dashboard rendering
function renderDashboard() {
    const totalCourses   = courses.length;
    const totalEmployees = employees.length;
    const totalEnrollments = enrollments.length;

    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const notStarted = enrollments.filter(e => e.status === 'not_started').length;

    const completionRate = totalEnrollments
        ? Math.round((completed / totalEnrollments) * 100)
        : 0;

    const overdue = enrollments.filter(e => {
        if (!e.dueDate || e.status === 'completed') return false;
        return new Date(e.dueDate) < new Date();
    }).length;

    const html = `
      <div class="dashboard-grid">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-content">
              <h3>${totalEmployees}</h3>
              <p>Employees</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-book"></i></div>
            <div class="stat-content">
              <h3>${totalCourses}</h3>
              <p>Courses</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
            <div class="stat-content">
              <h3>${completionRate}%</h3>
              <p>Overall Completion</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-content">
              <h3>${overdue}</h3>
              <p>Overdue Trainings</p>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Course Progress Overview</h5>
              </div>
              <div class="card-body">
                <p class="text-muted mb-2">Completions by status</p>
                <div class="progress mb-2">
                  <div class="progress-bar bg-success" style="width: ${completionRate}%"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                  <span>Completed: ${completed}</span>
                  <span>In progress: ${inProgress}</span>
                  <span>Not started: ${notStarted}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-fire me-2"></i>Top Courses</h5>
              </div>
              <div class="card-body" id="topCoursesList">
                ${renderTopCoursesWidget()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    $('#dashboardContent').html(html);
}

function renderTopCoursesWidget() {
    if (!courses.length || !enrollments.length) {
        return '<p class="text-muted mb-0">No course engagement data yet.</p>';
    }

    const counts = {};
    enrollments.forEach(e => {
        counts[e.courseId] = (counts[e.courseId] || 0) + 1;
    });

    const ranked = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return ranked.map(([courseId, count]) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return '';
        return `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <strong>${course.title}</strong>
              <div class="small text-muted">${course.category}</div>
            </div>
            <span class="badge bg-primary">${count} enrolled</span>
          </div>
        `;
    }).join('');
}

function renderEmployeesList() {
    const search = ($('#employeeSearch').val() || '').toLowerCase();
    const dept   = $('#employeeDeptFilter').val() || '';
    const status = $('#employeeStatusFilter').val() || '';

    // populate dept filter from current employees
    const deptSet = new Set(employees.map(e => e.department).filter(Boolean));
    const deptSelect = $('#employeeDeptFilter');
    if (deptSelect.children().length <= 1) {
        deptSet.forEach(d => deptSelect.append(`<option value="${d}">${d}</option>`));
    }

    const rows = employees
        .filter(e => {
            const matchSearch =
                !search ||
                e.name.toLowerCase().includes(search) ||
                e.email.toLowerCase().includes(search);
            const matchDept = !dept || e.department === dept;
            const matchStatus = !status || e.status === status;
            return matchSearch && matchDept && matchStatus;
        })
        .map(e => {
            const empEnrolls = enrollments.filter(en => en.employeeId === e.id);
            const assignedCourses = empEnrolls.length;
            const completed = empEnrolls.filter(en => en.status === 'completed').length;
            const avgCompletion = assignedCourses
                ? Math.round((completed / assignedCourses) * 100)
                : 0;

            return `
              <tr>
                <td>${e.name}</td>
                <td>${e.email}</td>
                <td>${e.department || '-'}</td>
                <td>${e.role || '-'}</td>
                <td>${assignedCourses}</td>
                <td>${avgCompletion}%</td>
                <td>
                  <span class="badge ${e.status === 'Active' ? 'bg-success' : 'bg-secondary'}">
                    ${e.status}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee('${e.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="toggleEmployeeStatus('${e.id}')">
                    <i class="fas fa-power-off"></i>
                  </button>
                </td>
              </tr>
            `;
        }).join('');

    $('#employeesTableBody').html(rows || `<tr><td colspan="8" class="text-center text-muted">No employees found</td></tr>`);
}

function resetEmployeeFilters() {
    $('#employeeSearch').val('');
    $('#employeeDeptFilter').val('');
    $('#employeeStatusFilter').val('');
    renderEmployeesList();
}

function openEmployeeModal() {
    $('#employeeModalTitle').text('Add Employee');
    $('#employeeId').val('');
    $('#employeeName').val('');
    $('#employeeEmail').val('');
    $('#employeeDept').val('');
    $('#employeeRole').val('');
    $('#employeeStatus').val('Active');
    new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    $('#employeeModalTitle').text('Edit Employee');
    $('#employeeId').val(emp.id);
    $('#employeeName').val(emp.name);
    $('#employeeEmail').val(emp.email);
    $('#employeeDept').val(emp.department);
    $('#employeeRole').val(emp.role);
    $('#employeeStatus').val(emp.status);
    new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

function saveEmployee(event) {
    event.preventDefault();
    const id    = $('#employeeId').val() || `EMP${Date.now()}`;
    const existsIndex = employees.findIndex(e => e.id === id);

    const data = {
        id,
        name: $('#employeeName').val().trim(),
        email: $('#employeeEmail').val().trim(),
        department: $('#employeeDept').val().trim(),
        role: $('#employeeRole').val().trim(),
        status: $('#employeeStatus').val()
    };

    if (existsIndex >= 0) {
        employees[existsIndex] = data;
    } else {
        employees.push(data);
    }

    saveData();
    renderEmployeesList();
    showNotification('Employee saved', 'success');
    bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
}

function toggleEmployeeStatus(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    emp.status = emp.status === 'Active' ? 'Inactive' : 'Active';
    saveData();
    renderEmployeesList();
    showNotification('Employee status updated', 'info');
}

function renderAnalytics() {
    // populate filters
    const courseSel = $('#analyticsCourseFilter');
    if (courseSel.children().length <= 1) {
        courses.forEach(c => courseSel.append(`<option value="${c.id}">${c.title}</option>`));
    }
    const deptSel = $('#analyticsDeptFilter');
    if (deptSel.children().length <= 1) {
        const depts = new Set(employees.map(e => e.department).filter(Boolean));
        depts.forEach(d => deptSel.append(`<option value="${d}">${d}</option>`));
    }

    const courseId = $('#analyticsCourseFilter').val() || '';
    const dept     = $('#analyticsDeptFilter').val() || '';

    let filtered = enrollments;

    if (courseId) {
        filtered = filtered.filter(e => e.courseId === courseId);
    }
    if (dept) {
        const ids = employees.filter(e => e.department === dept).map(e => e.id);
        filtered = filtered.filter(e => ids.includes(e.employeeId));
    }

    const total = filtered.length;
    const completed = filtered.filter(e => e.status === 'completed').length;
    const inProgress = filtered.filter(e => e.status === 'in_progress').length;
    const notStarted = filtered.filter(e => e.status === 'not_started').length;
    const completionRate = total ? Math.round(completed / total * 100) : 0;

    $('#analyticsKPIs').html(`
      <div class="row g-3">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-tasks"></i></div>
            <div class="stat-content">
              <h3>${total}</h3>
              <p>Total Enrollments</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
            <div class="stat-content">
              <h3>${completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-play-circle"></i></div>
            <div class="stat-content">
              <h3>${inProgress}</h3>
              <p>In Progress</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
            <div class="stat-content">
              <h3>${notStarted}</h3>
              <p>Not Started</p>
            </div>
          </div>
        </div>
      </div>
    `);

    $('#analyticsTables').html(`
      <div class="card mb-3">
        <div class="card-header">
          <h5 class="mb-0"><i class="fas fa-book-open me-2"></i>Course Performance</h5>
        </div>
        <div class="card-body table-responsive">
          ${renderAnalyticsCourseTable(filtered)}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h5 class="mb-0"><i class="fas fa-users me-2"></i>Employees at Risk</h5>
        </div>
        <div class="card-body table-responsive">
          ${renderAnalyticsRiskTable(filtered)}
        </div>
      </div>
    `);
}

function renderAnalyticsCourseTable(filtered) {
    if (!filtered.length) {
        return '<p class="text-muted mb-0">No data for selected filters.</p>';
    }
    const grouped = {};
    filtered.forEach(e => {
        if (!grouped[e.courseId]) grouped[e.courseId] = [];
        grouped[e.courseId].push(e);
    });

    let rows = '';
    Object.entries(grouped).forEach(([courseId, list]) => {
        const course = courses.find(c => c.id === courseId);
        const total = list.length;
        const completed = list.filter(en => en.status === 'completed').length;
        const avgScore = Math.round(
            list.filter(en => typeof en.score === 'number')
                .reduce((s, en) => s + en.score, 0) /
            (list.filter(en => typeof en.score === 'number').length || 1)
        );
        rows += `
          <tr>
            <td>${course ? course.title : courseId}</td>
            <td>${total}</td>
            <td>${completed}</td>
            <td>${isNaN(avgScore) ? '-' : avgScore + '%'}</td>
            <td>${total ? Math.round(completed / total * 100) + '%' : '-'}</td>
          </tr>
        `;
    });

    return `
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Course</th>
            <th>Enrollments</th>
            <th>Completed</th>
            <th>Avg. Score</th>
            <th>Completion %</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
}

function renderAnalyticsRiskTable(filtered) {
    const mandatory = courses.filter(c => c.category === 'Security' || c.category === 'Compliance').map(c => c.id);
    if (!mandatory.length || !employees.length) {
        return '<p class="text-muted mb-0">No mandatory/compliance rules configured.</p>';
    }

    const byEmployee = {};
    filtered.forEach(e => {
        if (!mandatory.includes(e.courseId)) return;
        if (!byEmployee[e.employeeId]) byEmployee[e.employeeId] = [];
        byEmployee[e.employeeId].push(e);
    });

    const risky = Object.entries(byEmployee).map(([empId, list]) => {
        const emp = employees.find(e => e.id === empId);
        const overdue = list.filter(en => {
            if (!en.dueDate || en.status === 'completed') return false;
            return new Date(en.dueDate) < new Date();
        }).length;
        const completed = list.filter(en => en.status === 'completed').length;
        return { emp, overdue, completed, total: list.length };
    }).filter(r => r.overdue > 0).sort((a, b) => b.overdue - a.overdue);

    if (!risky.length) {
        return '<p class="text-muted mb-0">No employees at risk based on current rules.</p>';
    }

    const rows = risky.slice(0, 20).map(r => `
      <tr>
        <td>${r.emp?.name || r.emp?.email || r.emp?.id}</td>
        <td>${r.emp?.department || '-'}</td>
        <td>${r.total}</td>
        <td>${r.completed}</td>
        <td>${r.overdue}</td>
      </tr>
    `).join('');

    return `
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Mandatory Enrollments</th>
            <th>Completed</th>
            <th>Overdue</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
}

function resetAnalyticsFilters() {
    $('#analyticsCourseFilter').val('');
    $('#analyticsDeptFilter').val('');
    renderAnalytics();
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

    $('.upload-content').hide();
    $('#csvFileInfo').show();
    $('#csvFileName').text(file.name);

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

    $('#csvProgressContainer').show();
    $('#csvUploadBtn').prop('disabled', true).text('Processing...');

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

            const headers = parseCSVLine(lines[0]);
            const headerIndex = {};
            headers.forEach((header, index) => {
                headerIndex[header] = index;
            });

            console.log('CSV Headers:', headers);

            const courseMap = {};
            let totalLessons = 0;
            let totalQuizzes = 0;

            // Progress simulation
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 8;
                $('#csvProgressBar').css('width', progress + '%');

                if (progress < 30) {
                    $('#csvProgressText').text('Parsing course structure...');
                } else if (progress < 60) {
                    $('#csvProgressText').text('Creating lessons and quizzes...');
                } else if (progress < 90) {
                    $('#csvProgressText').text('Preparing preview...');
                }

                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 150);

            // Process CSV data (same as before)
            for (let i = 1; i < lines.length; i++) {
                const cells = parseCSVLine(lines[i]);

                if (cells.length < headers.length) {
                    continue;
                }

                const courseId = cells[headerIndex['course_id']];
                const moduleId = cells[headerIndex['module_id']];
                const lessonId = cells[headerIndex['lesson_id']];

                if (!courseId) continue;

                // Initialize course
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
                        isLocked: false
                    };
                }

                // Initialize module
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
                        isLocked: false
                    };
                }

                // Add lesson
                if (moduleId && lessonId) {
                    const lessonType = cells[headerIndex['lesson_type']] || 'Reading';
                    const rawVideoUrl = cells[headerIndex['video_url']] || '';

                    const lesson = {
                        id: lessonId,
                        title: cells[headerIndex['lesson_title']] || 'Untitled Lesson',
                        content: cells[headerIndex['lesson_content']] || '',
                        type: lessonType,
                        duration: parseInt(cells[headerIndex['lesson_duration']]) || 10,
                        order: parseInt(cells[headerIndex['lesson_order']]) || 1,
                        objectives: cells[headerIndex['learning_objectives']] || '',
                        completed: false,
                        videoUrl: lessonType === 'Video' ? parseVideoUrl(rawVideoUrl) : null,
                        interactiveContent: (lessonType === 'Interactive' || lessonType === 'Scenario' || lessonType === 'Assessment') ? 
                            generateInteractiveContent(lessonType, cells[headerIndex['lesson_content']]) : null
                    };

                    courseMap[courseId].modules[moduleId].lessons.push(lesson);
                    courseMap[courseId].modules[moduleId].totalLessons++;
                    courseMap[courseId].totalLessons++;
                    totalLessons++;
                }

                // Create quiz
                const quizQuestions = cells[headerIndex['quiz_questions']];
                if (quizQuestions && moduleId && !courseMap[courseId].modules[moduleId].quiz) {
                    courseMap[courseId].modules[moduleId].quiz = {
                        id: moduleId + '_quiz',
                        title: courseMap[courseId].modules[moduleId].title + ' Quiz',
                        questions: parseMultipleQuizQuestions(quizQuestions),
                        passingScore: 70,
                        timeLimit: 10,
                        attempts: 0,
                        maxAttempts: 3,
                        completed: false,
                        passed: false,
                        bestScore: 0
                    };
                    courseMap[courseId].totalQuizzes++;
                    totalQuizzes++;
                }
            }

            // Convert to array and sort
            const newCourses = Object.values(courseMap).map((course, courseIndex) => {
                const modulesArray = Object.values(course.modules)
                    .sort((a, b) => a.order - b.order);

                modulesArray.forEach((module, moduleIndex) => {
                    module.lessons.sort((a, b) => a.order - b.order);
                    module.isLocked = moduleIndex > 0;
                });

                course.modules = modulesArray;
                course.isLocked = courseIndex > 0;

                return course;
            });

            // CHANGED: Store in draftCourses instead of courses
            draftCourses = newCourses;

            $('#csvModal').modal('hide');

            setTimeout(() => {
                // Show draft page instead of success modal
                showDraftPage();
            }, 500);

        } catch (error) {
            console.error('Error parsing CSV:', error);
            showNotification('Error processing CSV file: ' + error.message, 'error');
            resetCsvUpload();
        }
    };

    reader.readAsText(file);
}

// ============================================================================
// DRAFT PAGE RENDERING
// ============================================================================

function showDraftPage() {
    console.log('📋 Showing draft page with', draftCourses.length, 'courses');

    // Calculate statistics
    let totalModules = 0;
    let totalLessons = 0;
    let totalQuestions = 0;

    draftCourses.forEach(course => {
        totalModules += course.modules.length;
        totalLessons += course.totalLessons;
        course.modules.forEach(module => {
            if (module.quiz) {
                totalQuestions += module.quiz.questions.length;
            }
        });
    });

    // Update summary
    $('#draftCourseCount').text(draftCourses.length);
    $('#draftModuleCount').text(totalModules);
    $('#draftLessonCount').text(totalLessons);
    $('#draftQuestionCount').text(totalQuestions);

    // Render courses
    renderDraftCourses();

    // Show draft section
    showSection('draft');
}

function renderDraftCourses() {
    const container = $('#draftCoursesContainer');
    let html = '';

    draftCourses.forEach((course, courseIndex) => {
        html += renderDraftCourse(course, courseIndex);
    });

    container.html(html);

    // Setup edit functionality
    setupEditableFields();
}

function renderDraftCourse(course, courseIndex) {
    const videoLessons = course.modules.reduce((sum, module) => {
        return sum + module.lessons.filter(l => l.type === 'Video').length;
    }, 0);

    return `
        <div class="draft-course-card" data-course-index="${courseIndex}">
            <div class="draft-course-header">
                <div class="draft-course-title-section">
                    <h2 class="mb-3">
                        <i class="fas fa-book me-2"></i>
                        Course ${courseIndex + 1}
                    </h2>

                    <div class="mb-3">
                        <span class="field-label">Course Title</span>
                        <div class="editable-field" data-field="title" data-course="${courseIndex}">
                            <input type="text" value="${course.title}" />
                            <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                        </div>
                    </div>

                    <div class="mb-3">
                        <span class="field-label">Description</span>
                        <div class="editable-field" data-field="description" data-course="${courseIndex}">
                            <textarea rows="2">${course.description}</textarea>
                            <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-2">
                            <span class="field-label">Category</span>
                            <div class="editable-field" data-field="category" data-course="${courseIndex}">
                                <input type="text" value="${course.category}" />
                                <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                            </div>
                        </div>
                        <div class="col-md-4 mb-2">
                            <span class="field-label">Difficulty</span>
                            <div class="editable-field" data-field="difficulty" data-course="${courseIndex}">
                                <select>
                                    <option ${course.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                    <option ${course.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                    <option ${course.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
                                    <option ${course.difficulty === 'Expert' ? 'selected' : ''}>Expert</option>
                                </select>
                                <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                            </div>
                        </div>
                        <div class="col-md-4 mb-2">
                            <span class="field-label">Duration (minutes)</span>
                            <div class="editable-field" data-field="duration" data-course="${courseIndex}">
                                <input type="number" value="${course.duration}" min="1" />
                                <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                            </div>
                        </div>
                    </div>

                    <div class="badge-group">
                        <span class="info-badge">
                            <i class="fas fa-layer-group"></i>
                            ${course.modules.length} Modules
                        </span>
                        <span class="info-badge">
                            <i class="fas fa-play-circle"></i>
                            ${course.totalLessons} Lessons
                        </span>
                        ${videoLessons > 0 ? `
                        <span class="info-badge">
                            <i class="fas fa-video"></i>
                            ${videoLessons} Videos
                        </span>
                        ` : ''}
                        <span class="info-badge">
                            <i class="fas fa-question-circle"></i>
                            ${course.totalQuizzes} Quizzes
                        </span>
                    </div>
                </div>
            </div>

            ${renderDraftModules(course.modules, courseIndex)}
        </div>
    `;
}

function renderDraftModules(modules, courseIndex) {
    let html = '<div class="draft-module-section">';
    html += '<h4 class="mb-3"><i class="fas fa-layer-group me-2"></i>Modules</h4>';

    modules.forEach((module, moduleIndex) => {
        html += `
            <div class="draft-module-card" data-course="${courseIndex}" data-module="${moduleIndex}">
                <div class="draft-module-header">
                    <h5>
                        <i class="fas fa-folder me-2"></i>
                        Module ${moduleIndex + 1}: ${module.title}
                    </h5>
                    <span class="badge bg-primary">${module.lessons.length} Lessons</span>
                </div>

                <div class="mb-3">
                    <span class="field-label">Module Title</span>
                    <div class="editable-field" data-field="title" data-course="${courseIndex}" data-module="${moduleIndex}">
                        <input type="text" value="${module.title}" />
                        <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                    </div>
                </div>

                <div class="mb-3">
                    <span class="field-label">Module Description</span>
                    <div class="editable-field" data-field="description" data-course="${courseIndex}" data-module="${moduleIndex}">
                        <textarea rows="2">${module.description}</textarea>
                        <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                    </div>
                </div>

                ${renderDraftLessons(module.lessons, courseIndex, moduleIndex)}
                ${module.quiz ? renderDraftQuiz(module.quiz, courseIndex, moduleIndex) : ''}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function renderDraftLessons(lessons, courseIndex, moduleIndex) {
    let html = '<div class="draft-lesson-list">';
    html += '<h6 class="mb-2"><i class="fas fa-play-circle me-2"></i>Lessons</h6>';

    lessons.forEach((lesson, lessonIndex) => {
        html += `
            <div class="draft-lesson-item">
                <div class="draft-lesson-header">
                    <div>
                        <strong>${lessonIndex + 1}. ${lesson.title}</strong>
                        <span class="lesson-type-badge ${lesson.type.toLowerCase()} ms-2">${lesson.type}</span>
                    </div>
                    <span class="text-muted"><i class="fas fa-clock me-1"></i>${lesson.duration} min</span>
                </div>

                <div class="editable-field" data-field="title" data-course="${courseIndex}" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
                    <input type="text" value="${lesson.title}" />
                    <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                </div>

                ${lesson.videoUrl ? `
                <div class="mt-2">
                    <span class="field-label">Video URL</span>
                    <div class="editable-field" data-field="videoUrl" data-course="${courseIndex}" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
                        <input type="text" value="${lesson.videoUrl}" />
                        <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function renderDraftQuiz(quiz, courseIndex, moduleIndex) {
    return `
        <div class="draft-quiz-card">
            <div class="draft-quiz-header">
                <h6><i class="fas fa-question-circle me-2"></i>Module Quiz</h6>
                <span class="badge bg-warning">${quiz.questions.length} Questions</span>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <span class="field-label">Passing Score (%)</span>
                    <div class="editable-field" data-field="passingScore" data-course="${courseIndex}" data-module="${moduleIndex}" data-quiz="true">
                        <input type="number" value="${quiz.passingScore}" min="0" max="100" />
                        <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                    </div>
                </div>
                <div class="col-md-6">
                    <span class="field-label">Time Limit (minutes)</span>
                    <div class="editable-field" data-field="timeLimit" data-course="${courseIndex}" data-module="${moduleIndex}" data-quiz="true">
                        <input type="number" value="${quiz.timeLimit}" min="1" />
                        <span class="edit-indicator"><i class="fas fa-edit"></i></span>
                    </div>
                </div>
            </div>

            ${renderDraftQuestions(quiz.questions, courseIndex, moduleIndex)}
        </div>
    `;
}

function renderDraftQuestions(questions, courseIndex, moduleIndex) {
    let html = '<div class="mt-3">';
    html += '<h6 class="mb-2">Questions</h6>';

    questions.forEach((question, qIndex) => {
        html += `
            <div class="draft-question-item">
                <strong>Q${qIndex + 1}.</strong> ${question.text}
                <div class="draft-option-list">
                    ${question.options.map((option, oIndex) => `
                        <div class="draft-option-item ${oIndex === question.correctIndex ? 'correct' : ''}">
                            <span class="option-indicator ${oIndex === question.correctIndex ? 'correct' : 'wrong'}">
                                ${oIndex === question.correctIndex ? '<i class="fas fa-check"></i>' : String.fromCharCode(65 + oIndex)}
                            </span>
                            <span>${option}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// ============================================================================
// EDITABLE FIELDS FUNCTIONALITY
// ============================================================================

function setupEditableFields() {
    $('.editable-field input, .editable-field textarea, .editable-field select').on('change blur', function() {
        const field = $(this).closest('.editable-field');
        const courseIndex = parseInt(field.data('course'));
        const fieldName = field.data('field');
        const value = $(this).val();

        if (field.data('module') !== undefined) {
            const moduleIndex = parseInt(field.data('module'));

            if (field.data('lesson') !== undefined) {
                // Lesson field
                const lessonIndex = parseInt(field.data('lesson'));
                draftCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex][fieldName] = value;
            } else if (field.data('quiz')) {
                // Quiz field
                draftCourses[courseIndex].modules[moduleIndex].quiz[fieldName] = fieldName === 'passingScore' || fieldName === 'timeLimit' ? parseInt(value) : value;
            } else {
                // Module field
                draftCourses[courseIndex].modules[moduleIndex][fieldName] = value;
            }
        } else {
            // Course field
            if (fieldName === 'duration') {
                draftCourses[courseIndex][fieldName] = parseInt(value);
            } else {
                draftCourses[courseIndex][fieldName] = value;
            }
        }

        console.log('✏️ Updated', fieldName, 'to:', value);
    });
}

// ============================================================================
// CONFIRM & CANCEL ACTIONS
// ============================================================================

function confirmCourseCreation() {
    if (draftCourses.length === 0) {
        showNotification('No courses to create', 'warning');
        return;
    }

    console.log('✅ Confirming course creation:', draftCourses.length, 'courses');

    // Add to main courses array
    courses.push(...draftCourses);

    // Initialize quiz attempts
    draftCourses.forEach(course => {
        course.modules.forEach(module => {
            if (module.quiz) {
                quizAttempts[module.quiz.id] = 0;
            }
        });
    });

    // Apply user progress
    applyUserProgress();
    checkAndUnlockContent();
    saveData();

    // Clear draft
    draftCourses = [];

    // Show success
    const totalQuestions = courses.reduce((sum, course) => {
        return sum + course.modules.reduce((moduleSum, module) => {
            return moduleSum + (module.quiz ? module.quiz.questions.length : 0);
        }, 0);
    }, 0);

    showSuccessModal(courses.length, courses.reduce((sum, c) => sum + c.totalLessons, 0), totalQuestions);
}

function cancelCourseDraft() {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        draftCourses = [];
        showSection('upload');
        showNotification('Course draft cancelled', 'info');
    }
}

// Export functions
window.showDraftPage = showDraftPage;
window.confirmCourseCreation = confirmCourseCreation;
window.cancelCourseDraft = cancelCourseDraft;

console.log('✅ Draft page functionality loaded');


// Export functions
window.parseVideoUrl = parseVideoUrl;

function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    cells.push(current.trim());
    return cells;
}

// ============================================================================
// CRITICAL SECTION: QUIZ QUESTION PARSING
// ============================================================================
// FIXED: Parse questions from CSV ONLY - NO auto-generation allowed
// Format: Question|CorrectAnswer|WrongOption1|WrongOption2|WrongOption3
// ============================================================================

function parseMultipleQuizQuestions(quizString) {
    const questions = [];
    const questionPairs = quizString.split('~');

    questionPairs.forEach((pair, index) => {
        const parts = pair.split('|').map(p => p.trim());

        if (parts.length < 2) {
            console.warn('⚠ Skipping question - insufficient data:', pair);
            return;
        }

        const questionText = parts[0];
        const correctAnswer = parts[1];

        // Get options from CSV ONLY
        let options = [];

        if (parts.length >= 5) {
            // All 4 options provided: Q|Correct|Wrong1|Wrong2|Wrong3
            options = [
                correctAnswer,
                parts[2],
                parts[3],
                parts[4]
            ];
            console.log('✓ Question', index + 1, '- Using 4 options from CSV');
        } else if (parts.length === 4) {
            // 3 options provided
            options = [
                correctAnswer,
                parts[2],
                parts[3]
            ];
            console.log('⚠ Question', index + 1, '- Only 3 options in CSV');
        } else if (parts.length === 3) {
            // 2 options provided
            options = [
                correctAnswer,
                parts[2]
            ];
            console.log('⚠ Question', index + 1, '- Only 2 options in CSV');
        } else {
            // Only correct answer - skip this question
            console.error('✗ Question', index + 1, '- Insufficient options, SKIPPING');
            return;
        }

        // Shuffle options
        const shuffledOptions = shuffleArray([...options]);
        const correctIndex = shuffledOptions.indexOf(correctAnswer);

        questions.push({
            id: 'q' + (index + 1),
            text: questionText,
            type: 'multiplechoice',
            options: shuffledOptions,
            correctIndex: correctIndex,
            correctAnswer: correctAnswer,
            explanation: 'The correct answer is: ' + correctAnswer
        });
    });

    console.log('📊 Parsed', questions.length, 'questions from CSV (NO auto-generation)');
    return questions;
}

// ============================================================================
// REMOVED FUNCTIONS - NO LONGER USED
// ============================================================================
// These functions have been COMPLETELY REMOVED to prevent any auto-generation:
// - generateQuizOptions() - REMOVED
// - generateIncorrectOptions() - REMOVED
// All quiz options MUST come from CSV file only
// ============================================================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function parseVideoUrl(videoUrl) {
    if (!videoUrl || videoUrl.trim() === '') {
        return null;
    }

    videoUrl = videoUrl.trim();

    console.log('📹 Parsing video URL:', videoUrl);

    // Format 1: Already in embed format (youtube.com/embed/)
    if (videoUrl.includes('youtube.com/embed/')) {
        console.log('✓ Already in YouTube embed format');
        return videoUrl;
    }

    // Format 2: Already in Vimeo player format
    if (videoUrl.includes('player.vimeo.com/video/')) {
        console.log('✓ Already in Vimeo embed format');
        return videoUrl;
    }

    // Format 3: Short YouTube URL (youtu.be/)
    if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0].split('&')[0];
        console.log('✓ Converted youtu.be format, ID:', videoId);
        return 'https://www.youtube.com/embed/' + videoId;
    }

    // Format 4: Standard YouTube URL (youtube.com/watch?v=)
    if (videoUrl.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
        const videoId = urlParams.get('v');
        if (videoId) {
            console.log('✓ Converted youtube.com/watch format, ID:', videoId);
            return 'https://www.youtube.com/embed/' + videoId;
        }
    }

    // Format 5: Vimeo standard URL
    if (videoUrl.includes('vimeo.com/') && !videoUrl.includes('player.vimeo.com')) {
        const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0].split('/')[0];
        console.log('✓ Converted Vimeo format, ID:', videoId);
        return 'https://player.vimeo.com/video/' + videoId;
    }

    // Format 6: Direct video ID (11 characters for YouTube)
    if (videoUrl.length === 11 && !videoUrl.includes('/') && !videoUrl.includes('.')) {
        console.log('✓ Detected direct video ID:', videoUrl);
        return 'https://www.youtube.com/embed/' + videoUrl;
    }

    console.warn('⚠️ Unknown video URL format, returning as-is:', videoUrl);
    return videoUrl;
}

function generateDemoVideoUrl() {
    const demoVideos = [
        'https://www.youtube.com/embed/8aulMPhE12g',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/9bZkp7q19f0'
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
        grid.html(`
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-book-open"></i></div>
                <h3>No courses yet</h3>
                <p>Upload your first course to get started</p>
                <button class="btn btn-primary" onclick="showSection('upload')">Create Course</button>
            </div>
        `);
        return;
    }

    let html = '';

    courses.forEach((course, index) => {
        const totalItems = course.totalLessons + course.totalQuizzes;
        const completedItems = course.completedLessons + course.completedQuizzes;
        const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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
                <small class="text-muted">${completedItems} of ${totalItems} items completed</small>
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

function openModule(moduleIndex) {
    if (!currentCourse || !currentCourse.modules[moduleIndex]) {
        console.error('Invalid module index');
        return;
    }

    const module = currentCourse.modules[moduleIndex];

    if (module.isLocked) {
        showNotification('Complete the previous module to unlock this one', 'warning');
        return;
    }

    currentModule = module;

    if (typeof renderModulePlayer === 'function') {
        renderModulePlayer();
        showSection('module');
    } else {
        showNotification('Error opening module', 'error');
    }
}

$(document).on('click', '.module-card', function() {
    if ($(this).hasClass('locked')) {
        showNotification('Complete the previous module to unlock this one', 'warning');
        return;
    }

    const moduleIndex = $(this).data('module-index');
    openModule(moduleIndex);
});

// Completion tracking
function markLessonComplete(lessonId) {
    if (!userData.completedLessons.includes(lessonId)) {
        userData.completedLessons.push(lessonId);
        updateCompletionCounts();
        checkAndUnlockContent();
        saveData();
        showNotification('Lesson completed! Great job!', 'success');
    }
}

function markQuizComplete(quizId, passed = true) {
    if (passed && !userData.completedQuizzes.includes(quizId)) {
        userData.completedQuizzes.push(quizId);
    }

    updateCompletionCounts();
    checkAndUnlockContent();
    saveData();

    // Re-render UI so unlock state is visible immediately
    if (currentCourse) {
        renderCoursePlayer();
    }
    if (currentModule && typeof renderModulePlayer === 'function') {
        renderModulePlayer();
    }

    showNotification(
        passed ? 'Quiz passed! Well done!' : 'Quiz completed',
        passed ? 'success' : 'info'
    );
}

function updateCompletionCounts() {
    courses.forEach(course => {
        course.completedLessons = 0;
        course.completedQuizzes = 0;

        course.modules.forEach(module => {
            module.completedLessons = 0;
            module.completedQuizzes = 0;

            module.lessons.forEach(lesson => {
                if (userData.completedLessons.includes(lesson.id)) {
                    lesson.completed = true;
                    module.completedLessons++;
                }
            });

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
    updateCompletionCounts();

    courses.forEach(course => {
        course.modules.forEach(module => {
            if (userData.unlockedModules.includes(module.id)) {
                module.isLocked = false;
            }
        });
    });
}

function checkAndUnlockContent() {
    courses.forEach((course, courseIndex) => {
        for (let i = 0; i < course.modules.length; i++) {
            const module = course.modules[i];

            if (i === 0) {
                if (module.isLocked) {
                    module.isLocked = false;
                    if (!userData.unlockedModules.includes(module.id)) {
                        userData.unlockedModules.push(module.id);
                    }
                }
                continue;
            }

            const prevModule = course.modules[i - 1];
            const prevComplete = isModuleComplete(prevModule);

            if (prevComplete && module.isLocked) {
                module.isLocked = false;
                if (!userData.unlockedModules.includes(module.id)) {
                    userData.unlockedModules.push(module.id);
                    showNotification('New module unlocked: ' + module.title, 'success');
                }
            }
        }

        if (courseIndex === 0) {
            course.isLocked = false;
        } else {
            const prevCourse = courses[courseIndex - 1];
            if (isCourseComplete(prevCourse) && course.isLocked) {
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
    if (!course || !course.modules || course.modules.length === 0) return false;
    return course.modules.every(module => isModuleComplete(module));
}

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

    $('#' + id).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

function saveData() {
    try {
        localStorage.setItem('zenerom-courses', JSON.stringify(courses));
        localStorage.setItem('zenerom-quizattempts', JSON.stringify(quizAttempts));
        localStorage.setItem('zenerom-userdata', JSON.stringify(userData));
        localStorage.setItem('smartlms-settings', JSON.stringify(appSettings));
        console.log('✓ Data saved. Courses:', courses.length);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function loadStoredData() {
    try {
        const storedCourses = localStorage.getItem('zenerom-courses');
        if (storedCourses) {
            courses = JSON.parse(storedCourses);
        }

        const storedQuizAttempts = localStorage.getItem('zenerom-quizattempts');
        if (storedQuizAttempts) {
            quizAttempts = JSON.parse(storedQuizAttempts);
        }

        const storedUserData = localStorage.getItem('zenerom-userdata');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
        }

        const storedSettings = localStorage.getItem('smartlms-settings');
        if (storedSettings) {
            appSettings = { ...appSettings, ...JSON.parse(storedSettings) };
        }

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

function renderSettings(activeTab = 'general') {
    // highlight tab
    $('#settingsTabs button').removeClass('active');
    $(`#settingsTabs button[data-settings-tab="${activeTab}"]`).addClass('active');

    let html = '';
    switch (activeTab) {
        case 'general':
            html = renderGeneralSettings();
            break;
        case 'branding':
            html = renderBrandingSettings();
            break;
        case 'notifications':
            html = renderNotificationSettings();
            break;
        case 'security':
            html = renderSecuritySettings();
            break;
    }
    $('#settingsContent').html(html);
}

function renderGeneralSettings() {
    const s = appSettings.general;
    return `
      <h4 class="mb-3"><i class="fas fa-sliders-h me-2"></i>General Settings</h4>
      <div class="mb-3">
        <label class="form-label">Portal Name</label>
        <input type="text" class="form-control" id="setPortalName" value="${s.portalName}">
      </div>
      <div class="mb-3">
        <label class="form-label">Default Dashboard</label>
        <select class="form-select" id="setDefaultDashboard">
          <option value="dashboard" ${s.defaultDashboard === 'dashboard' ? 'selected' : ''}>Dashboard</option>
          <option value="courses" ${s.defaultDashboard === 'courses' ? 'selected' : ''}>Courses</option>
          <option value="upload" ${s.defaultDashboard === 'upload' ? 'selected' : ''}>Upload Course</option>
        </select>
      </div>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Timezone</label>
          <input type="text" class="form-control" id="setTimezone" value="${s.timezone}">
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Language</label>
          <select class="form-select" id="setLanguage">
            <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
            <option value="ar" ${s.language === 'ar' ? 'selected' : ''}>Arabic</option>
          </select>
        </div>
      </div>
    `;
}

function renderBrandingSettings() {
    const s = appSettings.branding;
    return `
      <h4 class="mb-3"><i class="fas fa-palette me-2"></i>Branding</h4>
      <div class="mb-3">
        <label class="form-label">Primary Color</label>
        <input type="color" class="form-control form-control-color" id="setPrimaryColor" value="${s.primaryColor}">
      </div>
      <div class="mb-3">
        <label class="form-label">Logo URL</label>
        <input type="text" class="form-control" id="setLogoUrl" value="${s.logoUrl}">
        <small class="text-muted">Public image URL for the header logo.</small>
      </div>
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="setDarkModeDefault" ${s.darkModeDefault ? 'checked' : ''}>
        <label class="form-check-label" for="setDarkModeDefault">Use dark theme by default</label>
      </div>
    `;
}

function renderNotificationSettings() {
    const s = appSettings.notifications;
    return `
      <h4 class="mb-3"><i class="fas fa-bell me-2"></i>Notifications</h4>
      <div class="mb-3">
        <label class="form-label">From Name</label>
        <input type="text" class="form-control" id="setEmailFromName" value="${s.emailFromName}">
      </div>
      <div class="mb-3">
        <label class="form-label">From Address</label>
        <input type="email" class="form-control" id="setEmailFromAddress" value="${s.emailFromAddress}">
      </div>
      <div class="mb-3">
        <label class="form-label">Reminder Before Due (days)</label>
        <input type="number" class="form-control" id="setReminderDays" value="${s.courseReminderDays}" min="0">
      </div>
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="setSendCompletionEmails" ${s.sendCompletionEmails ? 'checked' : ''}>
        <label class="form-check-label" for="setSendCompletionEmails">Send email when learner completes a course</label>
      </div>
    `;
}

function renderSecuritySettings() {
    const s = appSettings.security;
    return `
      <h4 class="mb-3"><i class="fas fa-shield-alt me-2"></i>Security</h4>
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="setStrongPasswords" ${s.requireStrongPasswords ? 'checked' : ''}>
        <label class="form-check-label" for="setStrongPasswords">Require strong passwords for admin accounts</label>
      </div>
      <div class="mb-3">
        <label class="form-label">Session Timeout (minutes)</label>
        <input type="number" class="form-control" id="setSessionTimeout" value="${s.sessionTimeoutMinutes}" min="5">
      </div>
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="setAllowSelfRegistration" ${s.allowSelfRegistration ? 'checked' : ''}>
        <label class="form-check-label" for="setAllowSelfRegistration">Allow employees to self-register</label>
      </div>
    `;
}

function saveSettings() {
    appSettings.general.portalName = $('#setPortalName').val().trim();
    appSettings.general.timezone = $('#setTimezone').val().trim();
    appSettings.general.language = $('#setLanguage').val();
    appSettings.general.defaultDashboard = $('#setDefaultDashboard').val();

    appSettings.branding.primaryColor = $('#setPrimaryColor').val();
    appSettings.branding.logoUrl = $('#setLogoUrl').val().trim();
    appSettings.branding.darkModeDefault = $('#setDarkModeDefault').is(':checked');

    appSettings.notifications.emailFromName = $('#setEmailFromName').val().trim();
    appSettings.notifications.emailFromAddress = $('#setEmailFromAddress').val().trim();
    appSettings.notifications.courseReminderDays = parseInt($('#setReminderDays').val(), 10) || 0;
    appSettings.notifications.sendCompletionEmails = $('#setSendCompletionEmails').is(':checked');

    appSettings.security.requireStrongPasswords = $('#setStrongPasswords').is(':checked');
    appSettings.security.sessionTimeoutMinutes = parseInt($('#setSessionTimeout').val(), 10) || 60;
    appSettings.security.allowSelfRegistration = $('#setAllowSelfRegistration').is(':checked');

    saveData();

    // apply branding immediately
    document.documentElement.style.setProperty('--primary-color', appSettings.branding.primaryColor);
    if (appSettings.branding.darkModeDefault) {
        setTheme('dark');
    }

    showNotification('Settings saved successfully', 'success');
}

function resetSettingsToStored() {
    const stored = localStorage.getItem('smartlms-settings');
    if (stored) {
        appSettings = { ...appSettings, ...JSON.parse(stored) };
        renderSettings(getCurrentSettingsTab());
        showNotification('Settings reset to last saved values', 'info');
    } else {
        renderSettings(getCurrentSettingsTab());
    }
}

function getCurrentSettingsTab() {
    const active = $('#settingsTabs button.active').data('settings-tab');
    return active || 'general';
}



// Export functions
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

console.log('✅ Zenerom LMS loaded - NO auto-generation, CSV options only!');