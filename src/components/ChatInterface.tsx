
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ChatMessage } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { temporaryChatStorage } from "@/services/temporaryChatStorage";
import { useAuth } from "@/contexts/AuthContext";

interface ChatInterfaceProps {
  sourceId: string | null;
  onSendMessage: (message: string) => Promise<string>;
  isLoading: boolean;
}

const ChatInterface = ({ sourceId, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { user } = useAuth();

  // Load chat history from temporary storage when sourceId changes
  useEffect(() => {
    if (sourceId) {
      const tempHistory = temporaryChatStorage.getChatHistory(user?.id, sourceId);
      setChatHistory(tempHistory);
    } else {
      setChatHistory([]);
    }
  }, [sourceId, user?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !sourceId) return;

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    // Update local state
    setChatHistory((c) => [...c, userMessage]);
    setMessage("");
    
    // Save to temporary storage
    temporaryChatStorage.saveMessage(user?.id, sourceId, userMessage);

    try {
      const response = await onSendMessage(message);
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      // Update local state
      setChatHistory((prev) => [...prev, assistantMessage]);
      
      // Save to temporary storage
      temporaryChatStorage.saveMessage(user?.id, sourceId, assistantMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request.",
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
      temporaryChatStorage.saveMessage(user?.id, sourceId, errorMessage);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          💬 Chat with Your Policy
        </h3>
        <p className="text-sm text-muted-foreground">
          Ask questions about your policy coverage, terms, and conditions
          <span className="block text-xs text-gray-400 mt-1">
            Chat history is kept for 10 minutes during your session
          </span>
        </p>
      </div>
      
      <ScrollArea className="flex-grow mb-4 p-4 border rounded-md bg-gray-50">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <span className="text-4xl">🤖</span>
            </div>
            <p className="mb-4">Hi! I'm your AI insurance assistant.</p>
            <p className="text-sm">Try asking me:</p>
            <div className="mt-3 space-y-1 text-sm text-gray-400">
              <p>• "What is covered under this policy?"</p>
              <p>• "What are the exclusions?"</p>
              <p>• "What is my deductible?"</p>
              <p>• "How much coverage do I have?"</p>
            </div>
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
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === "user" ? "text-primary-foreground/70" : "text-gray-400"
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
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
