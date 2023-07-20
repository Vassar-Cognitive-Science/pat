import "./style.css"

interface ChatMessageProps {
  message: string;
  sender: "You" | "Pat";
  loading?: boolean;
}

export default function ChatMessage({ message, sender, loading=false }: ChatMessageProps) {
  const bg = sender === "You" ? "bg-pat-purple" : "bg-transparent";
  const border = sender === "You" ? "border-0" : "border-2 border-pat-highlight";
  const textColor = sender === "You" ? "text-white" : "text-pat-highlight";
  const font = sender === "You" ? "font-you" : "font-pat";
  const paragraphs = message.split("\n");
  return (
    <div className={`${bg} ${textColor} ${border} p-3 rounded-md mb-2`}>
      {loading && <div className="dot-elastic mt-3 mb-3" style={{marginLeft: "15px"}}></div>}
      {!loading && paragraphs.map((paragraph, index) => (
        <p key={index} className={`text-md mb-2 ${font}`}>{paragraph}</p>
      ))}
    </div>
  );
}