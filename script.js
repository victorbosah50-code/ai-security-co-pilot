const analyzeBtn = document.getElementById('analyzeBtn');
const userInput = document.getElementById('userInput');
const responseArea = document.getElementById('responseArea');
const loading = document.getElementById('loading');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// === CRITICAL: DO NOT PUT YOUR REAL KEY HERE FOR PUBLIC REPO ===
// Use this placeholder. Add your real key ONLY locally on your machine.
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE_LOCALLY_ONLY';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

// Load history
loadHistory();

analyzeBtn.addEventListener('click', async () => {
    const prompt = userInput.value.trim();
    if (!prompt) return alert('Please enter a security query.');

    if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE_LOCALLY_ONLY') {
        responseArea.textContent = '⚠️ API key not configured.\n\nFor demo: Add your OpenAI key locally in script.js (never commit it).\n\nFor enterprise deployment: Use a secure backend proxy.';
        return;
    }

    responseArea.textContent = '';
    loading.style.display = 'block';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are AI Security Co-Pilot for Humans — an elite, human-centric cybersecurity assistant for enterprise SOCs, CISOs, and security teams. Provide precise, professional, and actionable intelligence. Use structured formatting (headings, bullets, risk levels). Prioritize clarity, accuracy, and human oversight. Never automate decisions — always empower the defender.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 1000
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        responseArea.textContent = aiResponse;
        saveToHistory(prompt, aiResponse);
    } catch (error) {
        responseArea.textContent = `Error: Unable to reach AI service.\n\n• Check your API key and credits\n• Verify internet connection\n• Contact victor.bosah@outlook.com for enterprise support`;
    } finally {
        loading.style.display = 'none';
        userInput.value = '';
    }
});

// History Management
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
