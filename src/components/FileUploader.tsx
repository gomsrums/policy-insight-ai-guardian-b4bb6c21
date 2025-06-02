
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Camera, Loader2, ArrowLeft, RotateCcw, ArrowRight, Check } from "lucide-react";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Tesseract from 'tesseract.js';

interface FileUploaderProps {
  onFileAdded: (document: PolicyDocument) => void;
}

interface CapturedPhoto {
  id: string;
  url: string;
  file: File;
}

const FileUploader = ({ onFileAdded }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { toast } = useToast();

  const createPDFFromText = async (text: string, filename: string): Promise<File> => {
    const lines = text.split('\n');
    const maxLineLength = 80;
    const formattedLines: string[] = [];
    
    lines.forEach(line => {
      if (line.length <= maxLineLength) {
        formattedLines.push(line);
      } else {
        const words = line.split(' ');
        let currentLine = '';
        words.forEach(word => {
          if ((currentLine + word).length <= maxLineLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) formattedLines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) formattedLines.push(currentLine);
      }
    });

    const textContent = formattedLines.map(line => 
      `(${line.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj 0 -14 Td`
    ).join(' ');

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
/Length ${textContent.length + 100}
>>
stream
BT
/F1 10 Tf
50 750 Td
${textContent}
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
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture documents.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraReady(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(file);
        const newPhoto: CapturedPhoto = {
          id: nanoid(),
          url,
          file
        };
        setCapturedPhotos(prev => [...prev, newPhoto]);
        setCurrentPhotoIndex(capturedPhotos.length);
        
        toast({
          title: "Photo Captured",
          description: `Photo ${capturedPhotos.length + 1} captured successfully`,
        });
      }
    }, 'image/jpeg', 0.8);
  };

  const retakeCurrentPhoto = () => {
    if (capturedPhotos.length === 0) return;
    
    const photoToRemove = capturedPhotos[currentPhotoIndex];
    URL.revokeObjectURL(photoToRemove.url);
    
    const newPhotos = capturedPhotos.filter((_, index) => index !== currentPhotoIndex);
    setCapturedPhotos(newPhotos);
    
    if (newPhotos.length === 0) {
      setCurrentPhotoIndex(0);
    } else if (currentPhotoIndex >= newPhotos.length) {
      setCurrentPhotoIndex(newPhotos.length - 1);
    }
  };

  const performOCR = async (imageFile: File): Promise<string> => {
    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  };

  const processAllPhotos = async () => {
    if (capturedPhotos.length === 0) {
      toast({
        title: "No Photos",
        description: "Please capture at least one photo before processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingOCR(true);
    
    try {
      toast({
        title: "Processing Photos",
        description: `Extracting text from ${capturedPhotos.length} photo(s)...`,
      });

      let combinedText = '';
      
      for (let i = 0; i < capturedPhotos.length; i++) {
        const photo = capturedPhotos[i];
        try {
          const extractedText = await performOCR(photo.file);
          combinedText += `--- Page ${i + 1} ---\n${extractedText}\n\n`;
          
          toast({
            title: "Processing Progress",
            description: `Processed ${i + 1} of ${capturedPhotos.length} photos`,
          });
        } catch (error) {
          console.error(`Error processing photo ${i + 1}:`, error);
          combinedText += `--- Page ${i + 1} (Error) ---\nFailed to extract text from this page.\n\n`;
        }
      }

      if (!combinedText.trim()) {
        toast({
          title: "No Text Found",
          description: "Could not extract readable text from the images. Please try with clearer photos.",
          variant: "destructive",
        });
        return;
      }

      // Convert combined text to PDF
      const pdfFile = await createPDFFromText(combinedText, `captured-policy-${Date.now()}.pdf`);
      const pdfPreviewUrl = URL.createObjectURL(pdfFile);

      // Create document with the PDF
      onFileAdded({
        id: nanoid(),
        name: `Captured Policy Document (${capturedPhotos.length} pages)`,
        type: "file",
        file: pdfFile,
        previewUrl: pdfPreviewUrl,
        status: "ready",
      });

      toast({
        title: "Photos Processed Successfully",
        description: `${capturedPhotos.length} photos converted to PDF for analysis.`,
      });

      // Clean up
      capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url));
      setCapturedPhotos([]);
      setCurrentPhotoIndex(0);
      stopCamera();
      setShowCamera(false);
      
    } catch (error) {
      console.error("Error processing photos:", error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the captured photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleCameraOpen = () => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setShowCamera(true);
    startCamera();
  };

  const handleCameraClose = () => {
    stopCamera();
    capturedPhotos.forEach(photo => URL.revokeObjectURL(photo.url));
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
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
          onClick={handleCameraOpen}
          disabled={isProcessingOCR}
        >
          {isProcessingOCR ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {isProcessingOCR ? "Processing..." : "Take Photos"}
        </Button>
      </div>

      <Dialog open={showCamera} onOpenChange={handleCameraClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Capture Policy Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Camera View */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ display: isCameraReady ? 'block' : 'none' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!isCameraReady && !isProcessingOCR && (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Starting camera...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Preview */}
            {capturedPhotos.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Captured Photos ({capturedPhotos.length})</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{currentPhotoIndex + 1} of {capturedPhotos.length}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPhotoIndex(Math.min(capturedPhotos.length - 1, currentPhotoIndex + 1))}
                      disabled={currentPhotoIndex === capturedPhotos.length - 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {capturedPhotos[currentPhotoIndex] && (
                  <div className="relative">
                    <img 
                      src={capturedPhotos[currentPhotoIndex].url} 
                      alt={`Captured photo ${currentPhotoIndex + 1}`}
                      className="w-full max-h-64 object-contain rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              {isCameraReady && !isProcessingOCR && (
                <Button 
                  onClick={capturePhoto}
                  className="bg-insurance-blue hover:bg-insurance-blue-dark"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
              )}
              
              {capturedPhotos.length > 0 && !isProcessingOCR && (
                <>
                  <Button 
                    variant="outline"
                    onClick={retakeCurrentPhoto}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake Current
                  </Button>
                  
                  <Button 
                    onClick={processAllPhotos}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Finish & Process ({capturedPhotos.length} photos)
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleCameraClose}
                disabled={isProcessingOCR}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            {isProcessingOCR && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Processing photos and extracting text...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploader;
