
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import { RealtimeChat } from "@/utils/RealtimeAudio";

const VoiceChatInterface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<RealtimeChat | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  const handleEvent = (event: any) => {
    if (event.type === "response.audio_transcript.delta") {
      setTranscript((prev) => [...prev, event.delta]);
    }
    if (event.type === "response.audio.delta") {
      setIsSpeaking(true);
    }
    if (event.type === "response.audio.done") {
      setIsSpeaking(false);
    }
    if (event.type === "error") {
      setError(event.message || "Realtime chat error");
      setIsConnected(false);
    }
  };

  const startChat = async () => {
    setError(null);
    try {
      chatRef.current = new RealtimeChat(handleEvent, audioRef);
      await chatRef.current.init();
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Realtime chat with OpenAI is ready.",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to start chat");
      toast({
        title: "Realtime Chat Error",
        description: err?.message || "Could not start.",
        variant: "destructive",
      });
    }
  };

  const stopChat = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopChat();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <audio ref={audioRef} autoPlay hidden />
      <div>
        <Button onClick={isConnected ? stopChat : startChat} className="mb-4">
          <MessageCircle className="w-4 h-4 mr-2" />
          {isConnected ? "Stop" : "Start"} Realtime Chat
          {isSpeaking && (
            <span className="ml-2 animate-pulse text-green-600">(Listening...)</span>
          )}
        </Button>
      </div>
      <div className="w-full max-w-2xl">
        <div className="p-4 rounded bg-gray-50 border min-h-[180px] text-sm overflow-y-auto">
          {transcript.length === 0 && !isConnected && "Start a voice conversation about your policy with AI."}
          {transcript.length > 0 && (
            <div>
              {transcript.map((t, i) => (
                <div key={i} className="mb-1">
                  {t}
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="text-red-500 mt-2">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatInterface;

