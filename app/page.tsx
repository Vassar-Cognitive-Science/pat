'use client';

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/chatmessage";
import '@fortawesome/fontawesome-free/css/all.css';

interface Message {
  message: string;
  sender: "You" | "Pat";
}

async function getPatResponse(messageText: string): Promise<Message> {
  const result = await fetch("/api/message", {
    method: "POST",
    body: JSON.stringify({ message: messageText }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await result.json();
  console.log(json);
  return {
    message: json,
    sender: "Pat",
  };
}

const startingMessage = "Hi there!";

function handlePrint() {
  window.print();
}

export default function Page() {

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([
    { message: "Hi there!", sender: "Pat" }
  ]);

  const [newMessage, setNewMessage] = useState<Message>({
    message: "",
    sender: "You",
  });

  const [isSending, setIsSending] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage({
      ...newMessage,
      message: event.target.value,
    });
  };

  const handleSendClick = async () => {
    setIsSending(true);
    setMessages([...messages, newMessage]);
    setNewMessage({
      ...newMessage,
      message: "",
    });
    const response = await getPatResponse(newMessage.message);
    setMessages([...messages, newMessage, response]);
    setIsSending(false);
    console.log(inputRef.current);
    inputRef.current?.focus()
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await result.json();
      console.log(json);
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen max-w-4xl bg-gray-100 p-4 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pat</h1>
          <h2 className="text-md font-light">Philosophical Artificial Thinker</h2>
        </div>
        <button id="print-button" className="flex items-center justify-center w-10 h-10 bg-gray-500 text-white rounded-full" onClick={handlePrint}>
          <i className="fas fa-print"></i>
        </button>
      </div>
      <div className="flex-1 overflow-y-scroll">
        {!isLoaded && <p>Loading...</p>}
        {isLoaded && messages.map((message, index) => (
          <ChatMessage
            key={index}
            sender={message.sender}
            message={message.message}
          />
        ))}
      </div>
      <div id="chat-input" className="flex">
      <textarea
        className="flex-1 mr-2 px-2 py-1 rounded-md border border-gray-300 resize-y overflow-y-auto"
        placeholder="Type a message..."
        value={newMessage.message}
        onChange={handleInputChange}
        disabled={isSending}
        ref={inputRef}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSendClick();
          }
        }}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSendClick}
        disabled={isSending}
      >
        {isSending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
      </button>
</div>
    </div>
  );
}
