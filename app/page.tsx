"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/chatmessage";
import ClearButton from "./components/clearbutton";
import "@fortawesome/fontawesome-free/css/all.css";
import "./page.css";
import TextareaAutosize from "react-textarea-autosize";
import PrintButton from "./components/printbutton";
import SendButton from "./components/sendbutton";

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
      <div id="chat-messages" className="w-screen overflow-y-auto py-4 flex-1">
        <div className="max-w-[960px] mx-auto px-4">
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
      <div id="chat-input" className="flex mx-2">
        <div className="flex mx-auto w-screen max-w-[960px] bg-[rgba(225,225,237,0.2)] my-4 rounded-md">
          <TextareaAutosize
            className="bg-transparent flex-1 mr-2 px-2 py-3 resize-none overflow-y-auto text-pat-light font-body"
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
            style={{ outline: "none" }}
          />
          <SendButton handleSendClick={handleSendClick} isSending={isSending} />
        </div>
      </div>
    </div>
  );
}
