interface ChatMessageProps {
  sender: string;
  message: string;
  bg: string;
}

export default function ChatMessage({ sender, message, bg }: ChatMessageProps) {
  return (
    <Box bg={bg} color="white" p={2} borderRadius="md" mb={2}>
      <Text fontSize="sm">{sender}</Text>
      <Text fontSize="md">{message}</Text>
    </Box>
  );
}