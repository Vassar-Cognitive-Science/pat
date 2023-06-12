import ChatMessage from "./chatmessage";
import PatMessage from "./patmessage";

interface DialogProps {
    message: string;
}

export default async function Dialog({message}: DialogProps){
    return(<>
        <ChatMessage message={message}></ChatMessage>
        {/* @ts-expect-error Async Server Component */}
        <PatMessage userMessage={message}></PatMessage>
    </>)
}