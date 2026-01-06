const analyzeBtn = document.getElementById("analyze-btn");
const userInput = document.getElementById("user-input");
const output = document.getElementById("output");

// Basic threat simulation logic
const simulatedAIResponse = (text) => {
  text = text.toLowerCase();
  let response = "";

  if (!text) return "Please enter some text to analyze.";

  if (text.includes("password")) {
    response += "⚠️ Tip: Use a strong password with letters, numbers, and symbols.\n";
  }

  if (text.includes("phishing") || text.includes("link") || text.includes("email")) {
    response += "🛡️ Warning: This may be a phishing attempt. Check sender, URLs, and attachments carefully.\n";
  }

  if (text.includes("url") || text.includes("website")) {
    response += "🔍 Suggestion: Scan URLs using online security tools before visiting.\n";
  }

  if (!response) {
    response = "✅ No immediate threats detected. Remember to follow best security practices.";
  }

  return response;
};

analyzeBtn.addEventListener("click", () => {
  const text = userInput.value;
  output.textContent = simulatedAIResponse(text);
});
