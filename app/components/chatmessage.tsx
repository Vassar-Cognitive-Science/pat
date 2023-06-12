interface ChatMessageProps {
  message: string;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const bg = "bg-green-500";
  return (
    <div className={`${bg} text-white p-2 rounded-md mb-2`}>
      <p className="text-sm">You</p>
      <p className="text-md">{message}</p>
    </div>
  );
}