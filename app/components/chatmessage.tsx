interface ChatMessageProps {
  message: string;
  sender: "You" | "Pat";
}

export default function ChatMessage({ message, sender }: ChatMessageProps) {
  const bg = sender === "You" ? "bg-green-500" : "bg-blue-500";
  const textColor = "text-white" ;
  return (
    <div className={`${bg} ${textColor} p-2 rounded-md mb-2`}>
      <p className="text-sm">{sender}</p>
      <p className="text-md">{message}</p>
    </div>
  );
}