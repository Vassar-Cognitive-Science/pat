"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/chatmessage";
import "@fortawesome/fontawesome-free/css/all.css";
import "./page.css";
import TextareaAutosize from 'react-textarea-autosize'

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
      <div className="flex items-center">
        <hr className="border-color-pat-light flex-1" />
        <h2 className="shadow-[0px_2px_8px_0px_rgba(225,225,237,0.40)] bg-pat-bg-plum px-3 py-2 font-tag justify-center items-center flex text-md text-pat-light border border-color-pat-light rounded-full">
          philosophical artificial thinker
        </h2>
        <hr className="border-color-pat-light flex-1" />
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
      <div id="chat-input" className="flex">
        <div className="flex mx-auto w-screen max-w-3xl bg-[rgba(225,225,237,0.2)] my-4 rounded-md">
        <TextareaAutosize
          className="bg-transparent flex-1 mr-2 px-2 py-1 resize-none overflow-y-auto text-pat-light font-body"
          placeholder="Type a message..."
          value={newMessage.message}
          onChange={handleInputChange}
          disabled={isSending}
          ref={inputRef}
          maxRows={10}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendClick();
            }
          }}
          style={{outline: "none"}}
        />
        <button
          className="text-white font-bold py-2 px-4 rounded"
          onClick={handleSendClick}
          disabled={isSending}
        >
          {isSending ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="13" viewBox="0 0 15 13" fill="none">
              <path d="M14.3948 5.59543L14.3898 5.59324L1.04228 0.0570952C0.930018 0.0101059 0.807855 -0.00832272 0.686722 0.00345783C0.56559 0.0152384 0.449267 0.0568607 0.348158 0.124602C0.241333 0.194598 0.153587 0.290055 0.0928133 0.402383C0.0320396 0.51471 0.000145356 0.640385 1.70645e-07 0.768099V4.30874C5.95301e-05 4.48334 0.0610242 4.65244 0.172387 4.78691C0.283749 4.92138 0.438532 5.01278 0.610057 5.04537L7.8898 6.39144C7.91841 6.39686 7.94422 6.4121 7.96279 6.43452C7.98136 6.45694 7.99153 6.48515 7.99153 6.51426C7.99153 6.54338 7.98136 6.57158 7.96279 6.594C7.94422 6.61643 7.91841 6.63166 7.8898 6.63709L0.61037 7.98315C0.438892 8.01566 0.284118 8.10694 0.172706 8.24129C0.0612939 8.37563 0.000218777 8.54462 1.70645e-07 8.71915V12.2604C-8.28297e-05 12.3824 0.0301135 12.5024 0.0878795 12.6098C0.145646 12.7173 0.229174 12.8086 0.330969 12.8758C0.453417 12.9572 0.59712 13.0006 0.744132 13.0008C0.846336 13.0007 0.947491 12.9802 1.04166 12.9405L14.3888 7.43591L14.3948 7.4331C14.5744 7.35589 14.7275 7.22769 14.8351 7.06439C14.9427 6.90108 15 6.70981 15 6.51426C15 6.31871 14.9427 6.12745 14.8351 5.96414C14.7275 5.80083 14.5744 5.67264 14.3948 5.59543Z" fill="#E1E1ED"/>
            </svg>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}
