import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { Streamdown } from "streamdown";
import { useAutoScroll } from "./hooks/useAutoScroll";

function App() {
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useChat();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  const [containerRef, endRef] = useAutoScroll<HTMLElement>([messages]);

  return (
    <>
      <article className="flex flex-col bg-gray-100 h-svh max-w-2xl mx-auto">
        <header className="p-8 shadow-xl">
          <img
            className="max-w-xs"
            src="https://www.fixtergeek.com/logo.png"
            alt="fixtergeek logo"
          />
          <p className="text-2xl font-extralight">
            Pregunta sobre nuestros cursos y talleres
          </p>
        </header>
        <section
          ref={containerRef}
          className="pt-10 px-8 overflow-auto bg-white h-full"
        >
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
              <div className="py-3" ref={endRef} />
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
