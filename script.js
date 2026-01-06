const analyzeBtn = document.getElementById('analyzeBtn');
const userInput = document.getElementById('userInput');
const responseArea = document.getElementById('responseArea');
const loading = document.getElementById('loading');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// Fast public proxy (free, reliable for demos/portfolio use)
const PROXY_URL = 'https://openai-proxy.vercel.app/api/chat';  // This one is stable and widely used

const MODEL = 'gpt-4o-mini';

loadHistory();

analyzeBtn.addEventListener('click', async () => {
    const prompt = userInput.value.trim();
    if (!prompt) return alert('Please enter a security query.');

    responseArea.textContent = '';
    loading.style.display = 'block';

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
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

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        responseArea.textContent = aiResponse;
        saveToHistory(prompt, aiResponse);

    } catch (error) {
        responseArea.textContent = `⚠️ Temporary overload or rate limit on free proxy.\n\nPlease try again in a few seconds.\n\nFor unlimited enterprise use, contact Victor Bosah for dedicated deployment.`;
    } finally {
        loading.style.display = 'none';
        userInput.value = '';
    }
});

// History functions (same as before)
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
