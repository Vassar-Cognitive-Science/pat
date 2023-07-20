interface ChatMessageProps {
  message: string;
  sender: "You" | "Pat";
}

export default function ChatMessage({ message, sender }: ChatMessageProps) {
  const bg = sender === "You" ? "bg-green-500" : "bg-blue-500";
  const textColor = "text-white" ;
  const paragraphs = message.split("\n");
  return (
    <div className={`${bg} ${textColor} p-3 rounded-md mb-2`}>
      <p className="text-sm font-roboto">{sender}</p>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-md mb-2">{paragraph}</p>
      ))}
    </div>
  );
}