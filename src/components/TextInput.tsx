
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

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
        name: "Pasted Text",
        type: "text" as const,
        content: text,
        status: "processing" as const,
      };
      
      // Notify user
      toast({
        title: "Text Processing",
        description: "Your text is being prepared for analysis...",
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
        placeholder="Paste your policy text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[150px] md:min-h-[200px] text-sm"
        disabled={isProcessing}
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing}
          className="bg-insurance-blue hover:bg-insurance-blue-dark text-sm px-4 py-2"
        >
          {isProcessing ? "Processing..." : "Add Text for Analysis"}
        </Button>
      </div>
    </div>
  );
};

export default TextInput;
