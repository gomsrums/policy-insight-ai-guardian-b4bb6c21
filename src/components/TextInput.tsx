
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";

interface TextInputProps {
  onTextAdded: (document: PolicyDocument) => void;
}

const TextInput = ({ onTextAdded }: TextInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onTextAdded({
        id: nanoid(),
        name: "Pasted Text",
        type: "text",
        content: text,
        status: "ready",
      });
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
