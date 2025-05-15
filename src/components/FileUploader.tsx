
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, X } from "lucide-react";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";

interface FileUploaderProps {
  onFileAdded: (document: PolicyDocument) => void;
}

const FileUploader = ({ onFileAdded }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!isValidFileType(file)) {
      alert("Please upload a PDF, image, or text file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    
    onFileAdded({
      id: nanoid(),
      name: file.name,
      type: "file",
      file: file,
      previewUrl: previewUrl,
      status: "ready",
    });
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    return validTypes.includes(file.type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-insurance-blue bg-blue-50" : "border-gray-300 hover:border-insurance-blue"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-insurance-blue" />
          <p className="text-lg font-medium">
            Drop your insurance policy document here or{" "}
            <span className="text-insurance-blue">browse</span>
          </p>
          <p className="text-sm text-gray-500">Support for PDF, images, and text files</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
          Upload Document
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
