"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/chatmessage";
import "@fortawesome/fontawesome-free/css/all.css";
import "./page.css";

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

const startingMessage =
  "Imagine you're having a coffee shop discussion with a fellow student who firmly believes that all emotions, from fear and happiness to compassion and anger, can be entirely explained by neural activity in the brain. Your friend argues that the richness of our mental experiences can be reduced to the firing of neurons. Now, I'm curious to know your take on this matter. Do you think the mind's complexities can be fully understood through neuroscience and a reductionist lens?";

function handlePrint() {
  window.print();
}

export default function Page() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([]);

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
    inputRef.current?.focus();
  };

  const handleClearClick = () => {
    localStorage.clear();
    setMessages([{ message: startingMessage, sender: "Pat" }]);
  };

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

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
    let loadedMessages = [];
    const storedMessages = localStorage.getItem("messages");
    console.log(storedMessages);
    if (storedMessages) {
      loadedMessages = JSON.parse(storedMessages);
      if (loadedMessages.length == 0) {
        loadedMessages = [{ message: startingMessage, sender: "Pat" }];
      }
    } else {
      loadedMessages = [{ message: startingMessage, sender: "Pat" }];
    }
    setMessages(loadedMessages);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen mx-auto main">
      <div className="bg-transparent p-4">
        <div className="grid grid-cols-6 justify-between items-center mb-4">
          <div className="col-span-1"></div>
          <div className="col-span-4 text-center">
            <h1 className="text-4xl font-bold text-pat-highlight font-heading">
              Pat
            </h1>
          </div>
          <div className="col-span-1 flex justify-self-end">
            <button
              id="print-button"
              className="flex mr-4 items-center justify-center w-10 h-10 bg-gray-500 hover:bg-gray-700 text-white rounded-full"
              onClick={handlePrint}
            >
              <i className="fas fa-print"></i>
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleClearClick}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-md text-pat-light">
          Philosophical Artificial Thinker
        </h2>
      </div>
      <div className="w-screen overflow-y-auto py-4">
        <div className="max-w-3xl mx-auto px-4">
          {!isLoaded && <p>Loading...</p>}
          {isLoaded &&
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                sender={message.sender}
                message={message.message}
              />
            ))}
          {isSending && (
            <ChatMessage
              key={"sending"}
              sender={"Pat"}
              message={""}
              loading={true}
            />
          )}
        </div>
      </div>
      <div id="chat-input" className="flex custom-input">
        <div className="mx-auto">
        <textarea
          className="max-w-3xl my-4 flex-1 mr-2 px-2 py-1 rounded-md border border-gray-300 resize-y overflow-y-auto"
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
          {isSending ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}
