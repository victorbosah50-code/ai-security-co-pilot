const analyzeBtn=document.getElementById("analyze-btn");
const userInput=document.getElementById("user-input");
const output=document.getElementById("output");
const riskLevel=document.getElementById("risk-level");
const historyList=document.getElementById("history");

let history=JSON.parse(localStorage.getItem("aiSecurityHistory"))||[];
renderHistory();

analyzeBtn.addEventListener("click",async()=>{
  const text=userInput.value.trim();
  if(!text) return alert("Please enter text to analyze.");

  addHistory(text);

  output.textContent="Analyzing...";
  riskLevel.style.width="0";

  try{
    await fetch("/.netlify/functions/trigger-ai",{  // Replace with GitHub Actions proxy URL
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({user_input:text})
    });

    output.textContent="✅ Request sent. AI is analyzing...";

    let risk=0;
    const lower=text.toLowerCase();
    if(lower.includes("password")||lower.includes("login")) risk+=30;
    if(lower.includes("phishing")||lower.includes("link")||lower.includes("email")) risk+=50;
    if(lower.includes("url")||lower.includes("website")) risk+=20;
    if(risk>100) risk=100;

    riskLevel.style.width=`${risk}%`;
    riskLevel.style.background=risk<40?"green":risk<70?"orange":"red";
  }catch(err){
    console.error(err);
    output.textContent="❌ Network error";
  }
});

function addHistory(text){
  history.unshift({text,date:new Date().toLocaleString()});
  if(history.length>10) history.pop();
  localStorage.setItem("aiSecurityHistory",JSON.stringify(history));
  renderHistory();
}

function renderHistory(){
  historyList.innerHTML="";
  history.forEach(item=>{
    const li=document.createElement("li");
    li.textContent=`[${item.date}] ${item.text}`;
    historyList.appendChild(li);
  });
}
