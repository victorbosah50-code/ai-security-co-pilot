const modeBtns = document.querySelectorAll('.mode-btn');
const inputs = {
    general: document.getElementById('general-input'),
    link: document.getElementById('link-input'),
    email: document.getElementById('email-input'),
    file: document.getElementById('file-input')
};
const userInputGeneral = document.getElementById('userInputGeneral');
const userInputLink = document.getElementById('userInputLink');
const userInputEmail = document.getElementById('userInputEmail');
const userInputFile = document.getElementById('userInputFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const responseArea = document.getElementById('responseArea');
const loading = document.getElementById('loading');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// Public proxy for full AI (free demo traffic)
const PROXY_URL = 'https://api.pawan.krd/v1/chat/completions';  // Updated stable free proxy 2026

const MODEL = 'gpt-4o-mini';

let currentMode = 'general';

// Mode switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        Object.values(inputs).forEach(i => i.style.display = 'none');
        inputs[currentMode].style.display = 'block';
    });
});

// Load history
loadHistory();

analyzeBtn.addEventListener('click', async () => {
    let prompt = '';
    let displayQuery = '';

    if (currentMode === 'general') {
        prompt = userInputGeneral.value.trim();
        displayQuery = prompt;
    } else if (currentMode === 'link') {
        prompt = userInputLink.value.trim();
        displayQuery = `Link: ${prompt}`;
    } else if (currentMode === 'email') {
        prompt = userInputEmail.value.trim();
        displayQuery = `Email scan`;
    } else if (currentMode === 'file') {
        const file = userInputFile.files[0];
        if (!file) return alert('Select a file');
        prompt = await file.text();
        displayQuery = `File: ${file.name}`;
    }

    if (!prompt) return alert('Enter data to scan');

    // Specialized prompts
    const basePrompt = currentMode === 'link' ? `Analyze this URL for phishing/malware risks: ${prompt}` :
                       currentMode === 'email' ? `Scan this email for threats/phishing: ${prompt}` :
                       currentMode === 'file' ? `Scan file content for security risks: ${prompt}` : prompt;

    responseArea.textContent = '';
    loading.style.display = 'flex';

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: 'You are AI Security Co-Pilot – elite cybersecurity assistant. Use structured output with risk levels.' },
                    { role: 'user', content: basePrompt }
                ]
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        responseArea.textContent = aiResponse;
        saveToHistory(displayQuery, aiResponse);
    } catch (error) {
        responseArea.textContent = 'Temporary issue – try again. For enterprise unlimited, contact Victor.';
    } finally {
        loading.style.display = 'none';
        // Clear inputs
        userInputGeneral.value = userInputLink.value = userInputEmail.value = '';
        userInputFile.value = '';
    }
});

// History functions (same as before)
function saveToHistory(query, response) { /* ... same as previous */ }
function loadHistory() { /* ... same as previous */ }
clearHistoryBtn.addEventListener('click', () => { /* ... same */ });
