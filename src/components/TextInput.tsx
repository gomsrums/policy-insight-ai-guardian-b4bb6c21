
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

interface TextInputProps {
  onTextAdded: (document: PolicyDocument) => void;
}

const TextInput = ({ onTextAdded }: TextInputProps) => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create a document with the text content
      const newDocument: PolicyDocument = {
        id: nanoid(),
        name: "Policy Text Document",
        type: "text" as const,
        content: text.trim(),
        status: "ready" as const,
      };
      
      // Notify user
      toast({
        title: "Document Ready",
        description: "Your policy text is ready for analysis.",
      });
      
      // Pass the document to the parent component
      onTextAdded(newDocument);
      
      // Clear the text input
      setText("");
      
    } catch (error) {
      console.error("Error processing text:", error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Paste your policy text here to analyze it..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[150px] md:min-h-[200px] text-sm"
        disabled={isProcessing}
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing}
          className="bg-primary hover:bg-primary/90 text-sm px-4 py-2"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {isProcessing ? "Processing..." : "Analyze Policy"}
        </Button>
      </div>
    </div>
  );
};

export default TextInput;
