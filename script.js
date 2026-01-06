const modeSelect = document.getElementById('mode');
const generalInput = document.getElementById('general-input');
const linkInput = document.getElementById('link-input');
const emailInput = document.getElementById('email-input');
const fileInput = document.getElementById('file-input');
const analyzeBtn = document.getElementById('analyzeBtn');
const userInputGeneral = document.getElementById('userInputGeneral');
const userInputLink = document.getElementById('userInputLink');
const userInputEmail = document.getElementById('userInputEmail');
const userInputFile = document.getElementById('userInputFile');
const responseArea = document.getElementById('responseArea');
const loading = document.getElementById('loading');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// Fast public proxy for full AI magic (free for demo traffic)
const PROXY_URL = 'https://openai-proxy.vercel.app/api/chat';

const MODEL = 'gpt-4o-mini';

// Switch inputs based on mode
modeSelect.addEventListener('change', () => {
    const mode = modeSelect.value;
    generalInput.style.display = mode === 'general' ? 'block' : 'none';
    linkInput.style.display = mode === 'link' ? 'block' : 'none';
    emailInput.style.display = mode === 'email' ? 'block' : 'none';
    fileInput.style.display = mode === 'file' ? 'block' : 'none';
});

// Load history
loadHistory();

analyzeBtn.addEventListener('click', async () => {
    const mode = modeSelect.value;
    let prompt = '';
    let queryType = mode.charAt(0).toUpperCase() + mode.slice(1);

    if (mode === 'general') {
        prompt = userInputGeneral.value.trim();
    } else if (mode === 'link') {
        prompt = userInputLink.value.trim();
    } else if (mode === 'email') {
        prompt = userInputEmail.value.trim();
    } else if (mode === 'file') {
        const file = userInputFile.files[0];
        if (!file) return alert('Please select a file.');
        if (!file.type.startsWith('text/')) return alert('Text-based files only.');
        prompt = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    if (!prompt) return alert('Please enter data to analyze.');

    // Adjust prompt based on mode
    let adjustedPrompt = prompt;
    if (mode === 'link') {
        adjustedPrompt = `Scan this URL for phishing, malware, or risks: ${prompt}. Provide risk level (Low/Medium/High), reasons, and recommendations.`;
    } else if (mode === 'email') {
        adjustedPrompt = `Analyze this email content for phishing, scams, or threats: ${prompt}. Provide risk level (Low/Medium/High), suspicious elements, and advice.`;
    } else if (mode === 'file') {
        adjustedPrompt = `Scan this file content for malware indicators, scripts, or security risks: ${prompt}. Provide risk level (Low/Medium/High), findings, and mitigation steps.`;
    }

    responseArea.textContent = '';
    loading.style.display = 'block';

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are AI Security Co-Pilot for Humans — an elite, human-centric cybersecurity assistant for enterprise SOCs, CISOs, and security teams. Provide precise, professional, and actionable intelligence. Use structured formatting (headings, bullets, risk levels). Prioritize clarity, accuracy, and human oversight. Never automate decisions — always empower the defender.'
                    },
                    { role: 'user', content: adjustedPrompt }
                ],
                temperature: 0.5,
                max_tokens: 1000
            })
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        responseArea.textContent = aiResponse;
        saveToHistory(`${queryType}: ${prompt.substring(0, 50)}...`, aiResponse);
    } catch (error) {
        responseArea.textContent = `⚠️ Temporary overload or rate limit on free proxy.\n\nPlease try again in a few seconds.\n\nFor unlimited enterprise use, contact Victor Bosah for dedicated deployment.`;
    } finally {
        loading.style.display = 'none';
        // Clear inputs
        userInputGeneral.value = '';
        userInputLink.value = '';
        userInputEmail.value = '';
        userInputFile.value = '';
    }
});

// History functions (unchanged)
function saveToHistory(query, response) {
    let history = JSON.parse(localStorage.getItem('aiSecurityCopilotHistory') || '[]');
    history.unshift({
        query,
        response,
        timestamp: new Date().toLocaleString()
    });
    history = history.slice(0, 25);
    localStorage.setItem('aiSecurityCopilotHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('aiSecurityCopilotHistory') || '[]');
    historyList.innerHTML = history.length === 0 
        ? '<p style="text-align:center; color:#8b949e; padding:40px;">No session history yet. Begin your first threat analysis.</p>'
        : '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <strong>Query:</strong> ${item.query}
            <p><strong>Insight:</strong> ${item.response.substring(0, 280)}...</p>
            <small>${item.timestamp}</small>
        `;
        historyList.appendChild(div);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all session history?')) {
        localStorage.removeItem('aiSecurityCopilotHistory');
        loadHistory();
    }
});
