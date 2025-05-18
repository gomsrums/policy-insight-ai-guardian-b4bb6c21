
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
  const { toast } = useToast();

  const handleSubmit = () => {
    if (text.trim()) {
      // Create a document with the text content
      const newDocument = {
        id: nanoid(),
        name: "Pasted Text",
        type: "text" as const,
        content: text,
        status: "ready" as const,
      };
      
      // Notify user
      toast({
        title: "Text added",
        description: "Your text has been added for analysis.",
      });
      
      // Pass the document to the parent component
      onTextAdded(newDocument);
      
      // Clear the text input
      setText("");
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Paste your policy text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[150px] md:min-h-[200px] text-sm"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="bg-insurance-blue hover:bg-insurance-blue-dark text-sm px-4 py-2"
        >
          Analyze Text
        </Button>
      </div>
    </div>
  );
};

export default TextInput;
