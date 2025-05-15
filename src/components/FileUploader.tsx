
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Camera } from "lucide-react";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FileUploaderProps {
  onFileAdded: (document: PolicyDocument) => void;
}

const FileUploader = ({ onFileAdded }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!isValidFileType(file)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, image, or text file",
        variant: "destructive",
      });
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
    
    if (capturedImage) {
      setCapturedImage(null);
      setShowCamera(false);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    } else {
      toast({
        title: "Camera Not Available",
        description: "Your device does not support camera access or permissions are denied.",
        variant: "destructive",
      });
    }
  };

  const handleCapturedImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);

    // Process the captured image
    const newFileName = `captured-image-${Date.now()}.jpg`;
    const imageFile = new File([file], newFileName, { type: file.type });

    onFileAdded({
      id: nanoid(),
      name: newFileName,
      type: "file",
      file: imageFile,
      previewUrl: previewUrl,
      status: "ready",
    });

    // Close the camera dialog after capturing
    setShowCamera(false);
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
        className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer transition-colors ${
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
          <Upload className="h-8 w-8 md:h-10 md:w-10 text-insurance-blue" />
          <p className="text-base md:text-lg font-medium">
            Drop your insurance policy document here or{" "}
            <span className="text-insurance-blue">browse</span>
          </p>
          <p className="text-xs md:text-sm text-gray-500">Support for PDF, images, and text files</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-sm" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
          Upload File
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-sm" 
          onClick={() => setShowCamera(true)}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
      </div>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Photo of Your Document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleCapturedImage}
              className="hidden"
            />
            <Button 
              onClick={handleCameraCapture}
              className="bg-insurance-blue hover:bg-insurance-blue-dark w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Document
            </Button>
            {capturedImage && (
              <div className="relative w-full max-w-md">
                <img 
                  src={capturedImage} 
                  alt="Captured document" 
                  className="w-full rounded-md"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploader;
