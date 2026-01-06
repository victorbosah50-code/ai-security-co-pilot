const analyzeBtn = document.getElementById("analyze-btn");
const userInput = document.getElementById("user-input");
const output = document.getElementById("output");
const riskLevel = document.getElementById("risk-level");
const historyList = document.getElementById("history");

// Load history from localStorage
let history = JSON.parse(localStorage.getItem("aiSecurityHistory")) || [];
renderHistory();

// OpenAI API settings
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // replace or use GitHub Actions secrets
const MODEL = "gpt-4"; // or gpt-3.5-turbo

analyzeBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return alert("Please enter some text to analyze.");

  addHistory(text);

  output.textContent = "Analyzing...";
  riskLevel.style.width = "0";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a cybersecurity expert AI assistant." },
          { role: "user", content: text }
        ],
        max_tokens: 250
      })
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    output.textContent = aiMessage;

    // Simple risk meter logic based on keywords
    let risk = 0;
    const lower = text.toLowerCase();
    if (lower.includes("password") || lower.includes("login")) risk += 30;
    if (lower.includes("phishing") || lower.includes("link") || lower.includes("email")) risk += 50;
    if (lower.includes("url") || lower.includes("website")) risk += 20;
    if (risk > 100) risk = 100;

    riskLevel.style.width = `${risk}%`;
    riskLevel.style.background = risk < 40 ? "green" : risk < 70 ? "orange" : "red";

  } catch (err) {
    console.error(err);
    output.textContent = "❌ Error: Unable to reach AI. Check API key and internet connection.";
  }
});

// Add to history and save locally
function addHistory(text) {
  history.unshift({ text, date: new Date().toLocaleString() });
  if (history.length > 10) history.pop(); // keep last 10
  localStorage.setItem("aiSecurityHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `[${item.date}] ${item.text}`;
    historyList.appendChild(li);
  });
}
