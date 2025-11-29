// Theme management functionality

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Update theme toggle state
    updateThemeToggle(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateThemeToggle(newTheme);

    // Show notification
    showNotification(`Switched to ${newTheme} mode`, 'info');

    // Animate theme transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme-dependent elements
    updateThemeElements(theme);
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.classList.toggle('light', theme === 'light');
    }
}

function updateThemeElements(theme) {
    // Update any theme-specific elements here
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }

    // Update theme-dependent charts or visualizations
    updateChartsTheme(theme);
}

function updateChartsTheme(theme) {
    // Update any charts or visualizations to match the theme
    // This would be implemented when adding chart functionality
    console.log(`Charts updated for ${theme} theme`);
}

// System theme detection
// function detectSystemTheme() {
//     if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//         return 'dark';
//     }
//     return 'light';
// }

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const autoTheme = localStorage.getItem('theme_auto');
        if (autoTheme === 'true') {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Auto theme functionality
function enableAutoTheme() {
    localStorage.setItem('theme_auto', 'true');
    const systemTheme = detectSystemTheme();
    setTheme(systemTheme);
    showNotification('Auto theme enabled - following system preference', 'info');
}

function disableAutoTheme() {
    localStorage.removeItem('theme_auto');
    showNotification('Auto theme disabled', 'info');
}

// Keyboard shortcuts for theme
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + T to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
    }
});

// Export functions
window.initializeTheme = initializeTheme;
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.enableAutoTheme = enableAutoTheme;
window.disableAutoTheme = disableAutoTheme;