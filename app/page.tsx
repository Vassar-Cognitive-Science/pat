'use client';

import { useState, useRef } from "react";
import Dialog from "./components/dialog";
import ChatMessage from "./components/chatmessage";
//import getPatMessage from "../lib/getPatMessage";

interface Message {
  message: string;
}

async function getPatResponse(messageText: string): Promise<Message> {
  //const message = await getPatMessage(messageText);
  return {
    message: "testing",
  };
}

const startingMessage = "Hi there!";

export default function Chat() {

  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { message: "Hi there!" }
  ]);

  const [newMessage, setNewMessage] = useState<Message>({
    message: "",
  });

  const [isSending, setIsSending] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="flex flex-col h-screen w-screen max-w-4xl bg-gray-100 p-4 mx-auto">
      <div className="flex-1 overflow-y-scroll">
        <div className={`bg-blue-500 text-white p-2 rounded-md mb-2`}>
          <p className="text-sm">Pat</p>
          <p className="text-md">{startingMessage}</p>
        </div>
        {messages.map((message, index) => (
          /* @ts-expect-error Async Server Component */
          <Dialog
            key={index}
            message={message.message}
          />
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 mr-2 px-2 py-1 rounded-md border border-gray-300"
          type="text"
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
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
