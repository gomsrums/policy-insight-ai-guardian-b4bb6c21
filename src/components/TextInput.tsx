
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

  const createPDFFromText = async (text: string, filename: string): Promise<File> => {
    // Create a simple PDF using canvas and jsPDF-like approach
    // For simplicity, we'll create a text file that mimics PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${text.length + 100}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${text.replace(/\n/g, ') Tj 0 -14 Td (')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return new File([blob], filename, { type: 'application/pdf' });
  };

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
      // Convert text to PDF
      const pdfFile = await createPDFFromText(text, "pasted-policy.pdf");
      const previewUrl = URL.createObjectURL(pdfFile);
      
      // Create a document with the PDF file
      const newDocument: PolicyDocument = {
        id: nanoid(),
        name: "Pasted Policy Text (PDF)",
        type: "file" as const,
        file: pdfFile,
        previewUrl: previewUrl,
        status: "ready" as const,
      };
      
      // Notify user
      toast({
        title: "Text Converted to PDF",
        description: "Your text has been converted to PDF and is ready for analysis...",
      });
      
      // Pass the document to the parent component
      onTextAdded(newDocument);
      
      // Clear the text input
      setText("");
      
    } catch (error) {
      console.error("Error converting text to PDF:", error);
      toast({
        title: "Conversion Error",
        description: "There was an error converting your text to PDF. Please try again.",
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
          {isProcessing ? "Converting to PDF..." : "Convert to PDF & Analyze"}
        </Button>
      </div>
    </div>
  );
};

export default TextInput;
