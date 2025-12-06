import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { Streamdown } from "streamdown";

function App() {
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useChat();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <>
      <article className="flex flex-col bg-gray-100 h-svh">
        <header className="p-8 shadow-xl">
          <h1 className="text-6xl font-bold">Fixter Assistant</h1>
          <p>Pregunta sobre nuestros cursos y talleres</p>
        </header>
        <section className="pt-10 px-8 overflow-auto bg-white h-full">
          {messages.map((message) => (
            <div key={message.id}>
              <p>
                <strong>{message.role}:</strong>
              </p>
              {message.parts.map((part, indx) =>
                part.type === "text" ? (
                  <Streamdown key={indx}>{part.text}</Streamdown>
                ) : null
              )}
            </div>
          ))}
        </section>
        <footer className="mt-auto">
          <form className="flex gap-1 p-4" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              type="text"
              placeholder="Escribe tus preguntas..."
              className="w-full border border-gray-200 rounded-2xl py-2 px-3"
            />
            <input
              type="submit"
              className="border border-gray-300 rounded-2xl py-2 px-6"
            />
          </form>
        </footer>
      </article>
    </>
  );
}

export default App;
