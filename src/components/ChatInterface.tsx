
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ChatMessage } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ChatInterfaceProps {
  sourceId: string | null;
  onSendMessage: (message: string) => Promise<string>;
  isLoading: boolean;
}

const ChatInterface = ({ sourceId, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!message.trim() || !sourceId) return;

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setChatHistory([...chatHistory, userMessage]);
    setMessage("");

    try {
      const response = await onSendMessage(message);
      
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
        timestamp: new Date(),
      };

      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-gray-500 text-center">
          Please sign in to chat with your document
        </p>
        <Button
          onClick={() => navigate("/auth")}
          className="bg-insurance-blue hover:bg-insurance-blue-dark"
        >
          Sign In to Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow mb-4 p-4 border rounded-md bg-gray-50">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Start asking questions about your policy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-insurance-blue text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          placeholder="Ask a question about your policy..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!sourceId || isLoading}
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || !sourceId || isLoading}
          className="bg-insurance-blue hover:bg-insurance-blue-dark self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
