
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Camera, Loader2 } from "lucide-react";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Tesseract from 'tesseract.js';

interface FileUploaderProps {
  onFileAdded: (document: PolicyDocument) => void;
}

const FileUploader = ({ onFileAdded }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const { toast } = useToast();

  const createPDFFromText = async (text: string, filename: string): Promise<File> => {
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
(${text.replace(/\n/g, ') Tj 0 -14 Td (').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj
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

  const performOCR = async (imageFile: File): Promise<string> => {
    try {
      setIsProcessingOCR(true);
      
      toast({
        title: "Processing Image",
        description: "Extracting text from your image using OCR...",
      });

      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      console.log('OCR Result:', result.data.text);
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleCapturedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);

    try {
      // Perform OCR on the captured image
      const extractedText = await performOCR(file);
      
      if (!extractedText.trim()) {
        toast({
          title: "No Text Found",
          description: "Could not extract readable text from the image. Please try with a clearer image.",
          variant: "destructive",
        });
        return;
      }

      // Convert extracted text to PDF
      const pdfFile = await createPDFFromText(extractedText, `captured-policy-${Date.now()}.pdf`);
      const pdfPreviewUrl = URL.createObjectURL(pdfFile);

      // Create document with the PDF
      onFileAdded({
        id: nanoid(),
        name: `Captured Policy Image (OCR to PDF)`,
        type: "file",
        file: pdfFile,
        previewUrl: pdfPreviewUrl,
        status: "ready",
      });

      toast({
        title: "Image Processed Successfully",
        description: "Text extracted from image and converted to PDF for analysis.",
      });

      // Close the camera dialog
      setShowCamera(false);
      setCapturedImage(null);
      
    } catch (error) {
      console.error("Error processing captured image:", error);
      toast({
        title: "Processing Failed",
        description: "Failed to extract text from the image. Please try again with a clearer photo.",
        variant: "destructive",
      });
    }
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
          disabled={isProcessingOCR}
        >
          {isProcessingOCR ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {isProcessingOCR ? "Processing..." : "Take Photo"}
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
            
            {!isProcessingOCR ? (
              <Button 
                onClick={handleCameraCapture}
                className="bg-insurance-blue hover:bg-insurance-blue-dark w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Document
              </Button>
            ) : (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Extracting text from image...</p>
              </div>
            )}
            
            {capturedImage && !isProcessingOCR && (
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
