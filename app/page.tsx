"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/chatmessage";
import ClearButton from "./components/clearbutton";
import "@fortawesome/fontawesome-free/css/all.css";
import "./page.css";
import TextareaAutosize from "react-textarea-autosize";
import PrintButton from "./components/printbutton";
import SendButton from "./components/sendbutton";
import { useChat } from "ai/react";
import { Message } from "ai";

const startingMessage: Message = {
  id: "initial",
  content:
    "Imagine you're having a coffee shop discussion with a fellow student who firmly believes that all emotions, from fear and happiness to compassion and anger, can be entirely explained by neural activity in the brain. Your friend argues that the richness of our mental experiences can be reduced to the firing of neurons. Now, I'm curious to know your take on this matter. Do you think the mind's complexities can be fully understood through neuroscience and a reductionist lens?",
  role: "assistant",
};

// interface Message {
//   message: string;
//   sender: "You" | "Pat";
// }

// async function getPatResponse(
//   messageHistory: Message[],
//   messageText: string
// ): Promise<Message> {
//   const result = await fetch("/api/message", {
//     method: "POST",
//     body: JSON.stringify({ history: messageHistory, message: messageText }),
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   const json = await result.json();
//   console.log(json);
//   return {
//     message: json,
//     sender: "Pat",
//   };
// }

export default function Page() {
  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "api/message" });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleClearClick = () => {
    localStorage.clear();
    setMessages([startingMessage]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // save messages to local storage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

  // scroll to bottom whenever new message is added
  useEffect(() => {
    const chatMessages = chatMessagesRef.current;
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages]);

  // load messages from local storage
  useEffect(() => {
    let storedMessages = localStorage.getItem("messages");
    // this is a fix if localStorage is not using the updated messages format
    if(storedMessages && JSON.parse(storedMessages).length >= 1 && JSON.parse(storedMessages)[0].id !== "initial"){
      localStorage.clear();
      storedMessages = null;
    }
    const loadedMessages: Message[] = storedMessages
      ? JSON.parse(storedMessages)
      : [startingMessage];
    setMessages(loadedMessages);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen mx-auto main">
      <div id="header" className="bg-transparent p-4">
        <div className="grid grid-cols-6 justify-between items-center my-2">
          <div className="col-span-1">
            <PrintButton />
          </div>
          <div className="col-span-4 text-center">
            <h1 className="text-4xl font-bold text-pat-highlight font-heading">
              Pat
            </h1>
          </div>
          <div className="col-span-1 flex justify-self-end">
            <ClearButton handleClearClick={handleClearClick} />
          </div>
        </div>
      </div>
      <div id="tagline" className="flex items-center">
        <hr className="border-color-pat-light flex-1" />
        <h2 className="shadow-[0px_2px_8px_0px_rgba(225,225,237,0.40)] bg-pat-bg-plum px-3 py-2 font-tag justify-center items-center flex text-md text-pat-light border border-color-pat-light rounded-full">
          philosophical artificial thinker
        </h2>
        <hr className="border-color-pat-light flex-1" />
      </div>
      <div
        id="chat-messages"
        ref={chatMessagesRef}
        className="w-screen overflow-y-auto print:overflow-visible py-4 flex-1"
      >
        <div className="max-w-[960px] mx-auto px-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              sender={message.role === "assistant" ? "Pat" : "You"}
              message={message.content}
            />
          ))}
        </div>
      </div>
      <div id="chat-input" className="flex mx-2">
        <form  ref={formRef} className="flex mx-auto w-screen max-w-[960px] bg-[rgba(225,225,237,0.2)] my-4 rounded-md" onSubmit={handleSubmit}>
            <TextareaAutosize
              className="bg-transparent flex-1 mr-2 px-2 py-3 resize-none overflow-y-auto text-pat-light font-body"
              placeholder="Type a message... (Ctrl+Enter to send)"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              ref={inputRef}
              maxRows={10}
              style={{ outline: "none" }}
            />
            <SendButton isSending={isLoading} />
          </form>
        
      </div>
    </div>
  );
}
