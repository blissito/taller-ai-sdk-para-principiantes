const output = document.getElementById("output");
const button = document.getElementById("start");

async function startStream() {
  output.textContent = "";
  const response = await fetch("/chat");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output.textContent += decoder.decode(value);
  }
}

button.addEventListener("click", startStream);
