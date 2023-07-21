"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./components/chatmessage";
import "@fortawesome/fontawesome-free/css/all.css";
import "./page.css";
import TextareaAutosize from "react-textarea-autosize";

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
      <div id="header" className="bg-transparent p-4">
        <div className="grid grid-cols-6 justify-between items-center my-2">
          <div className="col-span-1">
            <button
              id="print-button"
              className="flex mr-4 items-center justify-center w-10 h-10 text-pat-light hover:text-white"
              onClick={handlePrint}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3.75 12C3.94891 12 4.13968 11.921 4.28033 11.7803C4.42098 11.6397 4.5 11.4489 4.5 11.25C4.5 11.0511 4.42098 10.8603 4.28033 10.7197C4.13968 10.579 3.94891 10.5 3.75 10.5C3.55109 10.5 3.36032 10.579 3.21967 10.7197C3.07902 10.8603 3 11.0511 3 11.25C3 11.4489 3.07902 11.6397 3.21967 11.7803C3.36032 11.921 3.55109 12 3.75 12Z"
                  fill="#FCE5B9"
                />
                <path
                  d="M7 1C6.20435 1 5.44129 1.31607 4.87868 1.87868C4.31607 2.44129 4 3.20435 4 4L4.5 7.5H3C2.20435 7.5 1.44129 7.81607 0.87868 8.37868C0.316071 8.94129 0 9.70435 0 10.5L0 15C0 15.7956 0.316071 17.0587 0.87868 17.6213C1.44129 18.1839 2.20435 18.5 3 18.5H4.5V19.5C4.5 20.2957 4.81607 21.0587 5.37868 21.6213C5.94129 22.1839 6.70435 22.5 7.5 22.5H16.5C17.2957 22.5 18.0587 22.1839 18.6213 21.6213C19.1839 21.0587 19.5 20.2957 19.5 19.5V18H21C21.7957 18 22.5587 17.6839 23.1213 17.1213C23.6839 16.5587 24 15.7956 24 15V9.62132C24 8.82567 23.6839 8.06261 23.1213 7.5C22.5587 6.93739 21.7957 6.62132 21 6.62132H19.5V4.5C19.5 3.70435 19.1839 2.94129 18.6213 2.37868C18.0587 1.81607 17.2957 1.5 16.5 1.5L7 1ZM5.5 4C5.5 3.60218 5.65804 3.22064 5.93934 2.93934C6.22064 2.65804 6.60218 2.5 7 2.5L16.5 3C16.8978 3 17.2794 3.15803 17.5607 3.43934C17.842 3.72064 18 4.10217 18 4.5V6.62132L6 7.5L5.5 4ZM7.5 12C6.70435 12 5.94129 12.3161 5.37868 12.8787C4.81607 13.4413 4.5 14.2043 4.5 15V17H3C2.60218 17 2.22064 16.842 1.93934 16.5607C1.65804 16.2794 1.5 15.3978 1.5 15V10.5C1.5 10.1022 1.65804 9.72064 1.93934 9.43934C2.22064 9.15804 2.60218 9 3 9L21 8.12132C21.3978 8.12132 21.7794 8.27936 22.0607 8.56066C22.342 8.84196 22.5 9.2235 22.5 9.62132V15C22.5 15.3978 22.342 15.7794 22.0607 16.0607C21.7794 16.342 21.3978 16.5 21 16.5H19.5V15C19.5 14.2043 19.1839 13.4413 18.6213 12.8787C18.0587 12.3161 17.2957 12 16.5 12H7.5ZM18 15V19.5C18 19.8978 17.842 20.2794 17.5607 20.5607C17.2794 20.842 16.8978 21 16.5 21H7.5C7.10218 21 6.72064 20.842 6.43934 20.5607C6.15804 20.2794 6 19.8978 6 19.5V15C6 14.6022 6.15804 14.2206 6.43934 13.9393C6.72064 13.658 7.10218 13.5 7.5 13.5H16.5C16.8978 13.5 17.2794 13.658 17.5607 13.9393C17.842 14.2206 18 14.6022 18 15Z"
                  fill="#FCE5B9"
                />
              </svg>
            </button>
          </div>
          <div className="col-span-4 text-center">
            <h1 className="text-4xl font-bold text-pat-highlight font-heading">
              Pat
            </h1>
          </div>
          <div className="col-span-1 flex justify-self-end">
            <button
              className="text-pat-light font-bold py-2 px-4"
              onClick={handleClearClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="26"
                viewBox="0 0 24 26"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16.2929 1.29287C16.981 0.679258 17.0237 0.695238 17.4142 1.08576L21.7071 5.29287C22.0976 5.68339 22.0976 6.31656 21.7071 6.70708L17.4142 10.9142C17.0237 11.3047 16.6834 11.0976 16.2929 10.7071C15.9024 10.3166 15.6095 9.8905 16 9.49998L19.5858 5.99997L16 2.49998C15.6095 2.10945 15.5 1.99998 16.2929 1.29287Z"
                  fill="#FCE5B9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7 8C6.20435 8 5.44129 8.31607 4.87868 8.87868C4.31607 9.44129 4 10.2044 4 11V13.5C4 14.0523 4 14 3 14C2 14 2 14.0523 2 13.5V11C2 9.67392 2.52678 8.40215 3.46447 7.46447C4.40215 6.52678 5.67392 6 7 6L21 5C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7L7 8Z"
                  fill="#FCE5B9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8.70711 15.2929C9.5 16 9.39052 16.1095 9 16.5L5.41421 20L9 23.5C9.39052 23.8905 9.45476 23.9594 8.70711 24.7071C8.08601 25.3282 7.97631 25.3047 7.58579 24.9142L3.29289 20.7071C2.90237 20.3166 2.90237 19.6834 3.29289 19.2929L7.58579 15.0858C7.97631 14.6952 8 14.6623 8.70711 15.2929Z"
                  fill="#FCE5B9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22 12C23 12 23 11.9477 23 12.5V17C23 18.3261 22.4732 19.5978 21.5355 20.5355C20.5979 21.4732 19.3261 22 18 22L4 21C3.44772 21 3 20.5523 3 20C3 19.4477 3.44772 19 4 19L18 20C18.7956 20 19.5587 19.6839 20.1213 19.1213C20.6839 18.5587 21 17.7956 21 17V12.5C21 11.9477 21 12 22 12Z"
                  fill="#FCE5B9"
                />
              </svg>
            </button>
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
      <div id="chat-input" className="flex">
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
          <button
            className="text-white font-bold py-2 px-4 rounded"
            onClick={handleSendClick}
            disabled={isSending}
          >
            {isSending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="13"
                viewBox="0 0 15 13"
                fill="none"
              >
                <path
                  d="M14.3948 5.59543L14.3898 5.59324L1.04228 0.0570952C0.930018 0.0101059 0.807855 -0.00832272 0.686722 0.00345783C0.56559 0.0152384 0.449267 0.0568607 0.348158 0.124602C0.241333 0.194598 0.153587 0.290055 0.0928133 0.402383C0.0320396 0.51471 0.000145356 0.640385 1.70645e-07 0.768099V4.30874C5.95301e-05 4.48334 0.0610242 4.65244 0.172387 4.78691C0.283749 4.92138 0.438532 5.01278 0.610057 5.04537L7.8898 6.39144C7.91841 6.39686 7.94422 6.4121 7.96279 6.43452C7.98136 6.45694 7.99153 6.48515 7.99153 6.51426C7.99153 6.54338 7.98136 6.57158 7.96279 6.594C7.94422 6.61643 7.91841 6.63166 7.8898 6.63709L0.61037 7.98315C0.438892 8.01566 0.284118 8.10694 0.172706 8.24129C0.0612939 8.37563 0.000218777 8.54462 1.70645e-07 8.71915V12.2604C-8.28297e-05 12.3824 0.0301135 12.5024 0.0878795 12.6098C0.145646 12.7173 0.229174 12.8086 0.330969 12.8758C0.453417 12.9572 0.59712 13.0006 0.744132 13.0008C0.846336 13.0007 0.947491 12.9802 1.04166 12.9405L14.3888 7.43591L14.3948 7.4331C14.5744 7.35589 14.7275 7.22769 14.8351 7.06439C14.9427 6.90108 15 6.70981 15 6.51426C15 6.31871 14.9427 6.12745 14.8351 5.96414C14.7275 5.80083 14.5744 5.67264 14.3948 5.59543Z"
                  fill="#E1E1ED"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
