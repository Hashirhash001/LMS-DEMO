// Video Player functionality
function createVideoPlayer(videoUrl, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
        // YouTube video
        const videoId = extractYouTubeId(videoUrl);
        container.innerHTML = `
            <div class="video-player">
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (videoUrl && videoUrl.includes('vimeo.com')) {
        // Vimeo video
        const videoId = extractVimeoId(videoUrl);
        container.innerHTML = `
            <div class="video-player">
                <iframe 
                    width="100%" 
                    height="400" 
                    src="https://player.vimeo.com/video/${videoId}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (videoUrl && videoUrl.endsWith('.mp4')) {
        // Direct MP4 video
        container.innerHTML = `
            <div class="video-player">
                <video controls width="100%" height="400">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    } else {
        // Placeholder for demo
        container.innerHTML = `
            <div class="video-player">
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <p>Video Player</p>
                    <small class="text-muted">Professional video player with progress tracking</small>
                    <div class="mt-3">
                        <button class="btn btn-primary btn-sm" onclick="simulateVideoComplete()">
                            <i class="fas fa-play me-2"></i>Simulate Video Completion
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

function extractVimeoId(url) {
    const regExp = /(?:vimeo\.com\/)([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : false;
}

function simulateVideoComplete() {
    showNotification('Video completed! You can now mark the lesson as complete.', 'success');
    // Enable lesson completion button
    $('.lesson-actions .btn-success').prop('disabled', false);
}

// Video progress tracking (for future implementation)
function trackVideoProgress(videoId, progress) {
    // This would track video viewing progress for completion requirements
    console.log(`Video ${videoId} progress: ${progress}%`);
}

// Interactive content handlers
function handleInteractiveContent(contentData) {
    if (!contentData) return;

    switch(contentData.type) {
        case 'scenario':
            return createScenarioPlayer(contentData);
        case 'simulation':
            return createSimulationPlayer(contentData);
        case 'quiz':
            return createInteractiveQuiz(contentData);
        default:
            return createGenericInteractive(contentData);
    }
}

function createScenarioPlayer(scenarioData) {
    return `
        <div class="scenario-player">
            <h5><i class="fas fa-users me-2"></i>${scenarioData.title}</h5>
            <p>${scenarioData.description}</p>
            <div class="scenario-steps">
                ${scenarioData.steps.map((step, index) => `
                    <div class="step-item mb-3">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">${step}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" onclick="startScenario('${scenarioData.id}')">
                <i class="fas fa-play me-2"></i>Start Scenario
            </button>
        </div>
    `;
}

function startScenario(scenarioId) {
    showNotification('Interactive scenario started!', 'info');
    // Implement scenario logic here
    setTimeout(() => {
        showNotification('Scenario completed successfully!', 'success');
    }, 3000);
}

// Export functions
window.createVideoPlayer = createVideoPlayer;
window.simulateVideoComplete = simulateVideoComplete;
window.handleInteractiveContent = handleInteractiveContent;
window.startScenario = startScenario;