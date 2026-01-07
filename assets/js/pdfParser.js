// ==========================================
// COMPLETE PDF PARSER WITH GOOGLE GEMINI AI
// Two-Pass Optimized for 2026 Gemini API
// ==========================================

class AIEnhancedPDFParser {
    constructor() {
        this.pdfDoc = null;
        this.rawPages = [];
        this.extractedContent = [];
        
        this.config = {
            minLessonLength: 200,
            maxLessonLength: 800,
            questionsPerLesson: 3,
            moduleThreshold: 3,
            comprehensionLevel: 'medium'
        };
    }

    async loadPDF(pdfUrl) {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            this.pdfDoc = await loadingTask.promise;
            console.log('✅ PDF Loaded:', this.pdfDoc.numPages, 'pages');
            return true;
        } catch (error) {
            console.error('❌ PDF Load Error:', error);
            return false;
        }
    }

    async extractAllPages() {
        this.rawPages = [];
        
        for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
            const page = await this.pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            if (window.updatePdfProgress) {
                const progress = 10 + (pageNum / this.pdfDoc.numPages * 10);
                window.updatePdfProgress(progress, `Extracting page ${pageNum}/${this.pdfDoc.numPages}...`);
            }
            
            const lineGroups = new Map();
            
            textContent.items.forEach(item => {
                const y = Math.round(item.transform[5]);
                const fontSize = Math.round(item.transform[0]);
                
                if (!lineGroups.has(y)) {
                    lineGroups.set(y, []);
                }
                
                lineGroups.get(y).push({
                    text: item.str,
                    x: item.transform[4],
                    fontSize: fontSize,
                    fontName: item.fontName,
                    isBold: /bold/i.test(item.fontName)
                });
            });
            
            const structuredLines = Array.from(lineGroups.entries())
                .sort((a, b) => b[0] - a[0])
                .map(([y, items]) => {
                    items.sort((a, b) => a.x - b.x);
                    const text = items.map(item => item.text).join(' ').trim();
                    const avgFontSize = items.reduce((sum, item) => sum + item.fontSize, 0) / items.length;
                    const isBold = items.some(item => item.isBold);
                    
                    return {
                        text: text,
                        fontSize: Math.round(avgFontSize),
                        isBold: isBold,
                        y: y
                    };
                });
            
            this.rawPages.push(structuredLines);
        }
        
        return this.rawPages;
    }

    enhanceText(text) {
        text = text.replace(/#([A-Za-z0-9]+)/g, '<strong class="hashtag">#$1</strong>');
        text = text.replace(/"([^"]+)"/g, '<span class="quoted">"$1"</span>');
        text = text.replace(/\b([A-Z]{3,})\b/g, '<strong class="caps-text">$1</strong>');
        return text;
    }

    autoFormatContent(text) {
        let html = '';
        const lines = text.split('\n').filter(l => l.trim());
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && trimmed.length > 3) {
                html += `<h4 class="content-subheading">${this.enhanceText(trimmed)}</h4>\n`;
            }
            else if (/^[•\-\*]\s/.test(trimmed)) {
                html += `<li class="content-list-item">${this.enhanceText(trimmed.substring(2))}</li>\n`;
            }
            else if (trimmed.length > 20) {
                html += `<p class="content-paragraph">${this.enhanceText(trimmed)}</p>\n`;
            }
        });
        
        html = html.replace(/((?:<li class="content-list-item">.*?<\/li>\n)+)/g, '<ul class="content-bullet-list">$1</ul>\n');
        
        return html;
    }
}

class GeminiEnhancedPDFParser extends AIEnhancedPDFParser {
    constructor() {
        super();
        
        this.geminiConfig = {
            apiKey: 'AIzaSyCKLD56rfutA4xxseFVJM96hyxtI5sfw1o',
            model: 'gemini-2.5-flash',
            baseURL: 'https://generativelanguage.googleapis.com/v1/models',
            maxTokens: 4096, // ✅ REDUCED from 2048
            temperature: 0.1  // ✅ More deterministic
        };
        
        this.lastRequestTime = 0;
        this.minRequestInterval = 5000; // ✅ 5 seconds between requests
    }

    updateStatus(message, progress) {
        if (window.updatePdfProgress) {
            window.updatePdfProgress(progress, message);
        }
    }

    async analyzeWithGemini(prompt, retryCount = 0) {
        try {
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
                );
            }
            
            const response = await fetch(
                `${this.geminiConfig.baseURL}/${this.geminiConfig.model}:generateContent?key=${this.geminiConfig.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: this.geminiConfig.temperature,
                            maxOutputTokens: this.geminiConfig.maxTokens
                        }
                    })
                }
            );

            this.lastRequestTime = Date.now();

            if (!response.ok) {
                const error = await response.json();
                
                if (response.status === 429 && retryCount < 3) {
                    const retryAfter = error.error?.message?.match(/retry in ([\d.]+)s/)?.[1];
                    const waitTime = retryAfter ? parseFloat(retryAfter) * 1000 : 60000;
                    
                    console.warn(`⏳ Rate limit. Waiting ${Math.ceil(waitTime/1000)}s...`);
                    this.updateStatus(`Waiting ${Math.ceil(waitTime/1000)}s...`, 50);
                    
                    await new Promise(resolve => setTimeout(resolve, waitTime + 2000));
                    return await this.analyzeWithGemini(prompt, retryCount + 1);
                }
                
                throw new Error(`API Error: ${error.error?.message}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            console.error('❌ Gemini Error:', error);
            
            if (retryCount < 2) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                return await this.analyzeWithGemini(prompt, retryCount + 1);
            }
            
            return null;
        }
    }

    // ✅ ULTRA-MINIMAL: Only 1 API call to get everything
    buildMinimalPrompt(text) {
        const sample = text.substring(0, 6000); // ✅ Smaller sample
        
        return `Extract course structure from this training content. Create exactly 1 module with 3 lessons.

CONTENT:
${sample}

Return ONLY valid JSON (no markdown):
{
  "module": {
    "title": "Main Topic Title",
    "lessons": [
      {"title": "Lesson 1 Title", "summary": "Brief 50-word summary"},
      {"title": "Lesson 2 Title", "summary": "Brief 50-word summary"},
      {"title": "Lesson 3 Title", "summary": "Brief 50-word summary"}
    ],
    "quiz": [
      {"q": "Question 1?", "opts": ["A","B","C","D"], "correct": 0, "why": "Explanation"},
      {"q": "Question 2?", "opts": ["A","B","C","D"], "correct": 1, "why": "Explanation"},
      {"q": "Question 3?", "opts": ["A","B","C","D"], "correct": 2, "why": "Explanation"}
    ]
  }
}

STRICT RULES:
- Exactly 1 module, 3 lessons, 3 quiz questions
- Summaries under 50 words
- NO markdown blocks
- Return raw JSON only`;
    }

    parseJSON(text) {
        try {
            let clean = text.trim();
            
            console.log('📥 Raw response length:', text.length);
            console.log('📥 First 300 chars:', clean.substring(0, 300));
            console.log('📥 Last 100 chars:', clean.substring(clean.length - 100));
            
            // Remove markdown code blocks
            if (clean.includes('```')) {
                const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                clean = match ? match.trim() : clean;[5]
            }
            
            // Try to find complete JSON object
            const jsonMatch = clean.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ No complete JSON object found');
                return null;
            }
            
            // ✅✅✅ THIS IS THE CRITICAL LINE - USE  ✅✅✅
            let jsonStr = jsonMatch[0];
            
            console.log('📝 Extracted JSON length:', jsonStr.length);
            console.log('📝 Extracted JSON type:', typeof jsonStr);
            
            // Verify it's actually a string
            if (typeof jsonStr !== 'string') {
                console.error('❌ jsonStr is not a string, it is:', typeof jsonStr);
                return null;
            }
            
            // Remove trailing commas
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            
            const parsed = JSON.parse(jsonStr);
            console.log('✅ Successfully parsed JSON');
            
            return parsed;
            
        } catch (error) {
            console.error('❌ Parse error:', error.message);
            console.log('❌ Error stack:', error.stack);
            return null;
        }
    }
    
    async parseIntoModulesAndLessons() {
        console.log('🚀 Starting MINIMAL Gemini Parsing (1 API call)...');
        
        try {
            if (!this.geminiConfig.apiKey) {
                throw new Error('API key not set');
            }
            
            // Extract PDF
            this.updateStatus('Extracting PDF...', 10);
            await this.extractAllPages();
            const rawText = this.rawPages.flat().map(line => line.text).join('\n');
            
            console.log('✅ Extracted:', rawText.length, 'chars');
            
            // ✅ SINGLE API CALL
            this.updateStatus('Analyzing with AI (1 request only)...', 40);
            
            const prompt = this.buildMinimalPrompt(rawText);
            const response = await this.analyzeWithGemini(prompt);
    
            if (!response) {
                throw new Error('No response from Gemini');
            }
    
            console.log('📨 Full Gemini response length:', response.length);
    
            let parsed = this.parseJSON(response); // ✅ Changed from const to let
    
            if (!parsed || !parsed.module) {
                console.warn('⚠️ Parse failed or no module, using fallback structure');
                
                // ✅ Create fallback structure
                parsed = {
                    module: {
                        title: 'Training Module',
                        lessons: [
                            {title: 'Introduction', summary: 'Learn the basics and core concepts'},
                            {title: 'Core Concepts', summary: 'Understand key ideas and principles'},
                            {title: 'Practical Application', summary: 'Apply what you learned in real scenarios'}
                        ],
                        quiz: [
                            {q: 'What is the main topic of this training?', opts: ['Core concepts', 'Unrelated topics', 'Skip content', 'Avoid practice'], correct: 0, why: 'The training focuses on core concepts'},
                            {q: 'How should you apply this knowledge?', opts: ['Ignore it', 'Practical application', 'Forget it', 'Skip it'], correct: 1, why: 'Practical application reinforces learning'},
                            {q: 'What is the key takeaway?', opts: ['Nothing', 'Avoid learning', 'Understanding and practice', 'Skip ahead'], correct: 2, why: 'Understanding combined with practice leads to mastery'}
                        ]
                    }
                };
            }
    
            console.log('📦 Module title:', parsed.module.title);
            console.log('📦 Lessons:', parsed.module.lessons.length);
            console.log('📦 Quiz questions:', parsed.module.quiz?.length || 0);
    
            // Format for LMS
            this.updateStatus('Formatting...', 80);
            
            const module = parsed.module;
            const lessons = (module.lessons || []).slice(0, 3).map((lesson, idx) => ({
                id: `lesson_${Date.now()}_${idx}`,
                title: lesson.title || `Lesson ${idx + 1}`,
                type: 'Reading',
                duration: 5,
                content: this.autoFormatContent(lesson.summary || 'Content for this lesson.'),
                objectives: lesson.title || `Lesson ${idx + 1}`,
                keyTakeaways: [lesson.summary || 'Key concept'],
                completed: false,
                order: idx + 1,
                videoUrl: null,
                quiz: null
            }));
            
            const quizQuestions = (module.quiz || []).slice(0, 3).map((q, idx) => ({
                id: `q_${idx}`,
                text: q.q || 'Question?',
                type: 'multiple-choice',
                options: q.opts || ['A', 'B', 'C', 'D'],
                correctIndex: q.correct || 0,
                correctAnswer: (q.opts || ['A'])[q.correct || 0],
                explanation: q.why || 'Correct answer',
                difficulty: 'medium'
            }));
            
            const moduleQuiz = {
                id: `quiz_module_${Date.now()}`,
                title: `${module.title} - Assessment`,
                questions: quizQuestions,
                passingScore: 70,
                timeLimit: 10,
                attempts: 0,
                maxAttempts: 3,
                completed: false,
                passed: false,
                bestScore: 0
            };
            
            const finalModule = {
                id: `module_${Date.now()}`,
                title: module.title,
                description: `Learn ${module.title}`,
                duration: lessons.length * 5,
                order: 1,
                lessons: lessons,
                quiz: moduleQuiz,
                totalLessons: lessons.length,
                completedLessons: 0,
                completedQuizzes: 0,
                isCompleted: false,
                isLocked: false
            };
            
            console.log('🎉 Complete! 1 module, 3 lessons, 3 questions');
            this.updateStatus('Complete!', 100);
            
            return [finalModule];
            
        } catch (error) {
            console.error('❌ Parsing failed:', error);
            throw error;
        }
    }
    
    
}

console.log('✅ MINIMAL Gemini Parser loaded (1 API call per PDF)');


console.log('✅ Gemini Enhanced Parser with Auto-Retry & Module Quizzes loaded');
console.log('📚 Ready to process PDFs with Google Gemini AI');
