import { useState, useRef } from "react";
import ChatMessage from "../components/chatmessage";
import getPatMessage from "../lib/getPatMessage";

interface Message {
  sender: string;
  message: string;
  bg: string;
}

async function getPatResponse(messageText: string):Promise<Message> {
  const message = await getPatMessage(messageText);
  return {
    sender: "Pat",
    message,
    bg: "blue.500",
  };
}

export default function Chat() {

  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { sender: "Pat", message: "Hi there!", bg: "blue.500" }
  ]);

  const [newMessage, setNewMessage] = useState<Message>({
    sender: "You",
    message: "",
    bg: "gray.400",
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
    <Flex
      direction="column"
      height="100vh"
      width="100vw"
      maxW="960px"
      bg="gray.100"
      p={4}
      margin="auto"
    >
      <Box flex={1} overflowY="scroll">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            sender={message.sender}
            message={message.message}
            bg={message.bg}
          />
        ))}
        {isSending && (
          <Spinner></Spinner>
        )}
      </Box>
      <Flex>
        <Input
          placeholder="Type a message..."
          flex={1}
          mr={2}
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
        <Button
          colorScheme="blue"
          onClick={handleSendClick}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </Flex>
    </Flex>
  );
}
