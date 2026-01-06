const analyzeBtn = document.getElementById('analyzeBtn');
const userInput = document.getElementById('userInput');
const responseArea = document.getElementById('responseArea');
const loading = document.getElementById('loading');

const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';  // <-- PASTE YOUR GROQ API KEY HERE

analyzeBtn.addEventListener('click', async () => {
    const prompt = userInput.value.trim();
    if (!prompt) {
        alert('Please enter something!');
        return;
    }

    // Show loading
    responseArea.textContent = '';
    loading.style.display = 'block';

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',  // Fast and good for security advice
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI Security Co-Pilot. Help users stay safe online with clear, practical advice on passwords, phishing, scams, privacy, etc. Be friendly and concise.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        responseArea.textContent = aiResponse;
    } catch (error) {
        console.error(error);
        responseArea.textContent = 'Error: Could not get response. Check console for details (likely invalid/missing API key).';
    } finally {
        loading.style.display = 'none';
    }
});
