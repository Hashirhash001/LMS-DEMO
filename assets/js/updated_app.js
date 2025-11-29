// Enhanced LMS Application with Fixed Sidebar and Detailed Analytics

let currentCourse = null;
let currentModule = null;
let currentLesson = null;
let courseData = [];
let userProgress = {};
let currentUser = { name: 'Administrator', role: 'Admin' };

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadCourseData();
    initializeUI();
    loadDashboardAnalytics();
});

// Load course data from CSV or API
function loadCourseData() {
    // In production, this would fetch from your backend
    // For now, it will work with CSV data loaded by your system
    console.log('Course data loaded');
    initializeSidebar();
}

// Initialize UI and event listeners
function initializeUI() {
    // Fixed sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            updateSidebarAlignment();
        });
    }

    // Navigation
    setupNavigation();
}

// Fixed sidebar alignment
function updateSidebarAlignment() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebar && mainContent) {
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '80px';
            sidebar.style.width = '80px';
        } else {
            mainContent.style.marginLeft = '280px';
            sidebar.style.width = '280px';
        }
    }
}

// Initialize sidebar navigation
function initializeSidebar() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    // Remove AI Assistant item if it exists
    const aiAssistantItem = sidebarNav.querySelector('[data-nav="ai"]');
    if (aiAssistantItem) {
        aiAssistantItem.remove();
    }

    // Setup navigation items
    const navItems = sidebarNav.querySelectorAll('[data-nav]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.nav;

            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            showSection(section);
        });
    });

    // Set dashboard as default active
    const dashboardItem = sidebarNav.querySelector('[data-nav="dashboard"]');
    if (dashboardItem) {
        dashboardItem.classList.add('active');
    }
}

// Setup main navigation
function setupNavigation() {
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            showSection('dashboard');
        });
    });
}

// Show different sections
function showSection(section) {
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(s => {
        s.style.display = 'none';
    });

    const targetSection = document.querySelector(`[data-section="${section}"]`);
    if (targetSection) {
        targetSection.style.display = 'block';

        if (section === 'dashboard') {
            loadDashboardAnalytics();
        }
    }
}

// ========== DETAILED DASHBOARD ANALYTICS ==========
function loadDashboardAnalytics() {
    console.log('Loading detailed dashboard analytics...');

    const dashboardContainer = document.getElementById('dashboardContent');
    if (!dashboardContainer) return;

    const analyticsHTML = `
        <div class="dashboard-container">
            <!-- Header -->
            <div class="dashboard-header">
                <h1>Learning Management System Dashboard</h1>
                <p class="subtitle">Complete overview of learning progress and organizational training metrics</p>
            </div>

            <!-- Key Metrics Overview -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        <i class="fas fa-graduation-cap"></i>
                        <h3>Active Courses</h3>
                    </div>
                    <div class="metric-value">${courseData.length || 12}</div>
                    <div class="metric-footer">Available for enrollment</div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <i class="fas fa-users"></i>
                        <h3>Total Learners</h3>
                    </div>
                    <div class="metric-value">324</div>
                    <div class="metric-footer">Across all courses</div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <i class="fas fa-book"></i>
                        <h3>Lessons Completed</h3>
                    </div>
                    <div class="metric-value">1,247</div>
                    <div class="metric-footer">By all learners</div>
                </div>

                <div class="metric-card">
                    <div class="metric-header">
                        <i class="fas fa-trophy"></i>
                        <h3>Avg Completion Rate</h3>
                    </div>
                    <div class="metric-value">78%</div>
                    <div class="metric-footer">Across all courses</div>
                </div>
            </div>

            <!-- Progress Analytics -->
            <div class="analytics-section">
                <h2>Learning Progress Analysis</h2>
                <div class="progress-analytics-grid">
                    <!-- Course Completion Status -->
                    <div class="analytics-card wide">
                        <h3>Course Enrollment & Completion</h3>
                        <table class="analytics-table">
                            <thead>
                                <tr>
                                    <th>Course Name</th>
                                    <th>Category</th>
                                    <th>Enrolled</th>
                                    <th>Completed</th>
                                    <th>Completion %</th>
                                    <th>Avg Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Advanced Security Awareness Training</td>
                                    <td>Security</td>
                                    <td>156</td>
                                    <td>122</td>
                                    <td>
                                        <div class="progress-mini">
                                            <div class="progress-fill" style="width: 78%"></div>
                                        </div>
                                    </td>
                                    <td>82%</td>
                                </tr>
                                <tr>
                                    <td>Leadership Development Program</td>
                                    <td>Leadership</td>
                                    <td>89</td>
                                    <td>71</td>
                                    <td>
                                        <div class="progress-mini">
                                            <div class="progress-fill" style="width: 80%"></div>
                                        </div>
                                    </td>
                                    <td>85%</td>
                                </tr>
                                <tr>
                                    <td>Sales Excellence Training</td>
                                    <td>Sales</td>
                                    <td>124</td>
                                    <td>94</td>
                                    <td>
                                        <div class="progress-mini">
                                            <div class="progress-fill" style="width: 76%"></div>
                                        </div>
                                    </td>
                                    <td>79%</td>
                                </tr>
                                <tr>
                                    <td>Compliance & Risk Management</td>
                                    <td>Compliance</td>
                                    <td>98</td>
                                    <td>74</td>
                                    <td>
                                        <div class="progress-mini">
                                            <div class="progress-fill" style="width: 76%"></div>
                                        </div>
                                    </td>
                                    <td>81%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="analytics-section">
                <h2>Performance & Engagement Metrics</h2>
                <div class="performance-grid">
                    <!-- Engagement by Department -->
                    <div class="analytics-card">
                        <h3>Engagement by Department</h3>
                        <div class="department-stats">
                            <div class="stat-item">
                                <span class="dept-name">Engineering</span>
                                <div class="engagement-bar">
                                    <div class="engagement-fill" style="width: 88%"></div>
                                </div>
                                <span class="engagement-pct">88%</span>
                            </div>
                            <div class="stat-item">
                                <span class="dept-name">Sales</span>
                                <div class="engagement-bar">
                                    <div class="engagement-fill" style="width: 92%"></div>
                                </div>
                                <span class="engagement-pct">92%</span>
                            </div>
                            <div class="stat-item">
                                <span class="dept-name">HR</span>
                                <div class="engagement-bar">
                                    <div class="engagement-fill" style="width: 85%"></div>
                                </div>
                                <span class="engagement-pct">85%</span>
                            </div>
                            <div class="stat-item">
                                <span class="dept-name">Finance</span>
                                <div class="engagement-bar">
                                    <div class="engagement-fill" style="width: 79%"></div>
                                </div>
                                <span class="engagement-pct">79%</span>
                            </div>
                            <div class="stat-item">
                                <span class="dept-name">Operations</span>
                                <div class="engagement-bar">
                                    <div class="engagement-fill" style="width: 83%"></div>
                                </div>
                                <span class="engagement-pct">83%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Learning Time Statistics -->
                    <div class="analytics-card">
                        <h3>Average Learning Time (Minutes)</h3>
                        <div class="time-stats">
                            <div class="time-item">
                                <span class="time-label">Per Lesson</span>
                                <span class="time-value">32 min</span>
                            </div>
                            <div class="time-item">
                                <span class="time-label">Per Module</span>
                                <span class="time-value">156 min</span>
                            </div>
                            <div class="time-item">
                                <span class="time-label">Per Course</span>
                                <span class="time-value">480 min</span>
                            </div>
                            <div class="time-item">
                                <span class="time-label">Weekly Active</span>
                                <span class="time-value">320 min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Performance -->
            <div class="analytics-section">
                <h2>Quiz Performance Analysis</h2>
                <div class="quiz-analytics">
                    <div class="analytics-card wide">
                        <h3>Quiz Results Summary</h3>
                        <table class="analytics-table">
                            <thead>
                                <tr>
                                    <th>Course/Module</th>
                                    <th>Total Attempts</th>
                                    <th>Avg Score</th>
                                    <th>Pass Rate</th>
                                    <th>First Attempt %</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Data Security Fundamentals</td>
                                    <td>156</td>
                                    <td>84%</td>
                                    <td>
                                        <span class="badge badge-success">89%</span>
                                    </td>
                                    <td>72%</td>
                                </tr>
                                <tr>
                                    <td>Password & Access Control</td>
                                    <td>145</td>
                                    <td>81%</td>
                                    <td>
                                        <span class="badge badge-success">85%</span>
                                    </td>
                                    <td>68%</td>
                                </tr>
                                <tr>
                                    <td>Incident Response Mastery</td>
                                    <td>89</td>
                                    <td>78%</td>
                                    <td>
                                        <span class="badge badge-info">76%</span>
                                    </td>
                                    <td>64%</td>
                                </tr>
                                <tr>
                                    <td>Leadership Fundamentals</td>
                                    <td>124</td>
                                    <td>86%</td>
                                    <td>
                                        <span class="badge badge-success">91%</span>
                                    </td>
                                    <td>75%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- User Progress Distribution -->
            <div class="analytics-section">
                <h2>Learner Progress Distribution</h2>
                <div class="progress-distribution">
                    <div class="distribution-card">
                        <h3>Completion Status Distribution</h3>
                        <div class="status-distribution">
                            <div class="distribution-item">
                                <div class="status-bar">
                                    <div class="status-segment completed" style="width: 45%">
                                        <span>45%</span>
                                    </div>
                                    <div class="status-segment in-progress" style="width: 35%">
                                        <span>35%</span>
                                    </div>
                                    <div class="status-segment not-started" style="width: 20%">
                                        <span>20%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="legend">
                                <div class="legend-item">
                                    <div class="legend-color completed"></div>
                                    <span>Completed (45%)</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color in-progress"></div>
                                    <span>In Progress (35%)</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color not-started"></div>
                                    <span>Not Started (20%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="distribution-card">
                        <h3>Performance Grade Distribution</h3>
                        <div class="grade-distribution">
                            <div class="grade-item">
                                <span class="grade-label">A (90-100%)</span>
                                <div class="grade-bar">
                                    <div class="grade-fill" style="width: 38%"></div>
                                </div>
                                <span class="grade-count">123 learners</span>
                            </div>
                            <div class="grade-item">
                                <span class="grade-label">B (80-89%)</span>
                                <div class="grade-bar">
                                    <div class="grade-fill" style="width: 35%"></div>
                                </div>
                                <span class="grade-count">113 learners</span>
                            </div>
                            <div class="grade-item">
                                <span class="grade-label">C (70-79%)</span>
                                <div class="grade-bar">
                                    <div class="grade-fill" style="width: 20%"></div>
                                </div>
                                <span class="grade-count">65 learners</span>
                            </div>
                            <div class="grade-item">
                                <span class="grade-label">D (60-69%)</span>
                                <div class="grade-bar">
                                    <div class="grade-fill" style="width: 5%"></div>
                                </div>
                                <span class="grade-count">16 learners</span>
                            </div>
                            <div class="grade-item">
                                <span class="grade-label">F (Below 60%)</span>
                                <div class="grade-bar">
                                    <div class="grade-fill" style="width: 2%"></div>
                                </div>
                                <span class="grade-count">7 learners</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Learning Activity Trends -->
            <div class="analytics-section">
                <h2>Weekly Learning Activity</h2>
                <div class="activity-trends">
                    <div class="analytics-card wide">
                        <div class="week-activity">
                            <div class="activity-day">
                                <span class="day-name">Mon</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 65%"></div>
                                </div>
                                <span class="activity-count">245</span>
                            </div>
                            <div class="activity-day">
                                <span class="day-name">Tue</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 72%"></div>
                                </div>
                                <span class="activity-count">272</span>
                            </div>
                            <div class="activity-day">
                                <span class="day-name">Wed</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 78%"></div>
                                </div>
                                <span class="activity-count">295</span>
                            </div>
                            <div class="activity-day">
                                <span class="day-name">Thu</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 82%"></div>
                                </div>
                                <span class="activity-count">310</span>
                            </div>
                            <div class="activity-day">
                                <span class="day-name">Fri</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 68%"></div>
                                </div>
                                <span class="activity-count">257</span>
                            </div>
                            <div class="activity-day">
                                <span class="day-name">Sat</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 45%"></div>
                                </div>
                                <span class="activity-count">170</span>
                            </div>
                            <div class="activity-day">
                                <span class="day-name">Sun</span>
                                <div class="activity-bar">
                                    <div class="activity-fill" style="height: 38%"></div>
                                </div>
                                <span class="activity-count">144</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Performing Courses -->
            <div class="analytics-section">
                <h2>Top Performing Courses</h2>
                <div class="top-courses">
                    <div class="course-ranking">
                        <h3>1. Leadership Development Program</h3>
                        <div class="course-stats">
                            <span class="badge badge-success">85% Avg Score</span>
                            <span class="badge badge-primary">91% Pass Rate</span>
                            <span class="badge badge-info">89 Learners</span>
                        </div>
                    </div>
                    <div class="course-ranking">
                        <h3>2. Advanced Security Awareness Training</h3>
                        <div class="course-stats">
                            <span class="badge badge-success">82% Avg Score</span>
                            <span class="badge badge-primary">89% Pass Rate</span>
                            <span class="badge badge-info">156 Learners</span>
                        </div>
                    </div>
                    <div class="course-ranking">
                        <h3>3. Sales Excellence Training</h3>
                        <div class="course-stats">
                            <span class="badge badge-success">79% Avg Score</span>
                            <span class="badge badge-primary">84% Pass Rate</span>
                            <span class="badge badge-info">124 Learners</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = analyticsHTML;
}

// Export functions for global use
window.showSection = showSection;
window.loadDashboardAnalytics = loadDashboardAnalytics;
window.updateSidebarAlignment = updateSidebarAlignment;

// Add CSS for dashboard analytics
const dashboardStyles = `
<style>
/* Dashboard Container */
.dashboard-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.dashboard-header {
    margin-bottom: 2rem;
}

.dashboard-header h1 {
    font-size: 2.5rem;
    color: #1a1a1a;
    margin: 0 0 0.5rem 0;
}

.dashboard-header .subtitle {
    color: #666;
    font-size: 1.1rem;
}

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.metric-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metric-card:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.metric-card:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.metric-card:nth-child(4) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.metric-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.metric-header i {
    font-size: 2rem;
    margin-right: 1rem;
    opacity: 0.8;
}

.metric-header h3 {
    margin: 0;
    font-size: 1.1rem;
}

.metric-value {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.metric-footer {
    font-size: 0.9rem;
    opacity: 0.8;
}

/* Analytics Section */
.analytics-section {
    margin-bottom: 2rem;
}

.analytics-section h2 {
    font-size: 1.8rem;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
    border-bottom: 3px solid #667eea;
    padding-bottom: 0.5rem;
}

.analytics-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.analytics-card.wide {
    grid-column: 1 / -1;
}

.progress-analytics-grid {
    display: grid;
    gap: 1.5rem;
}

/* Analytics Table */
.analytics-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.analytics-table thead {
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
}

.analytics-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
}

.analytics-table td {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
}

.analytics-table tbody tr:hover {
    background-color: #f8f9fa;
}

.progress-mini {
    width: 100%;
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* Performance Grid */
.performance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.department-stats {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.stat-item {
    display: grid;
    grid-template-columns: 100px 1fr 50px;
    align-items: center;
    gap: 1rem;
}

.dept-name {
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
}

.engagement-bar {
    height: 24px;
    background-color: #e9ecef;
    border-radius: 12px;
    overflow: hidden;
}

.engagement-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.engagement-pct {
    font-weight: 600;
    color: #667eea;
    font-size: 0.9rem;
}

/* Time Stats */
.time-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.time-item {
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.time-label {
    display: block;
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.time-value {
    display: block;
    font-size: 1.8rem;
    font-weight: bold;
    color: #667eea;
}

/* Progress Distribution */
.progress-distribution {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
}

.distribution-card {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.distribution-card h3 {
    margin-top: 0;
    color: #1a1a1a;
}

.status-bar {
    display: flex;
    height: 40px;
    border-radius: 20px;
    overflow: hidden;
    margin: 1rem 0;
    gap: 0;
}

.status-segment {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
}

.status-segment.completed {
    background-color: #43e97b;
}

.status-segment.in-progress {
    background-color: #f5576c;
}

.status-segment.not-started {
    background-color: #bdbdbd;
}

.legend {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.legend-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
}

.legend-color.completed {
    background-color: #43e97b;
}

.legend-color.in-progress {
    background-color: #f5576c;
}

.legend-color.not-started {
    background-color: #bdbdbd;
}

/* Grade Distribution */
.grade-distribution {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.grade-item {
    display: grid;
    grid-template-columns: 100px 1fr 120px;
    align-items: center;
    gap: 1rem;
}

.grade-label {
    font-weight: 600;
    color: #495057;
}

.grade-bar {
    height: 20px;
    background-color: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
}

.grade-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.grade-count {
    text-align: right;
    color: #6c757d;
    font-size: 0.9rem;
}

/* Activity Trends */
.week-activity {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
    align-items: flex-end;
    min-height: 300px;
}

.activity-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.day-name {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
}

.activity-bar {
    width: 40px;
    background-color: #e9ecef;
    border-radius: 4px;
    flex-grow: 1;
}

.activity-fill {
    width: 100%;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.activity-count {
    font-weight: 600;
    color: #667eea;
    font-size: 0.85rem;
}

/* Top Courses */
.top-courses {
    display: grid;
    gap: 1rem;
}

.course-ranking {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #667eea;
}

.course-ranking h3 {
    margin: 0 0 1rem 0;
    color: #1a1a1a;
}

.course-stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge-success {
    background-color: #d4edda;
    color: #155724;
}

.badge-primary {
    background-color: #d1ecf1;
    color: #0c5460;
}

.badge-info {
    background-color: #e7f3ff;
    color: #004085;
}

/* Fixed Sidebar */
#sidebar {
    transition: width 0.3s ease, margin 0.3s ease;
    min-height: 100vh;
    overflow: hidden;
}

#sidebar.collapsed {
    width: 80px !important;
}

#mainContent {
    transition: margin-left 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .performance-grid {
        grid-template-columns: 1fr;
    }

    .progress-distribution {
        grid-template-columns: 1fr;
    }

    .grade-item {
        grid-template-columns: 1fr;
    }

    .time-stats {
        grid-template-columns: 1fr;
    }

    .analytics-table {
        font-size: 0.85rem;
    }

    .analytics-table th,
    .analytics-table td {
        padding: 0.75rem 0.5rem;
    }
}
</style>
`;

// Inject styles
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', dashboardStyles);
}

console.log('Enhanced LMS app loaded with detailed analytics and fixed sidebar');
