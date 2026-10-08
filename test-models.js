const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/GEMINI_API_KEY="?(.*?)"?(\n|$)/)[1];

async function check() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
  } else {
    console.log("Error fetching models:", data);
  }
}
check();
