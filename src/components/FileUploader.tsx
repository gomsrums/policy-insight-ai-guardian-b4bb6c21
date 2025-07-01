
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Tesseract from 'tesseract.js';
import { Upload, Camera, FileText, ArrowLeft, RotateCcw, ArrowRight, Check, Loader2, X } from "lucide-react";

interface PolicyDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  content?: string;
  file?: File;
}

interface FileUploaderProps {
  onDocumentUploaded?: (document: PolicyDocument) => void;
  onFileAdded?: (document: PolicyDocument) => void;
  showTakePhotoOnly?: boolean;
}

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  text?: string;
}

const FileUploader = ({ onDocumentUploaded, onFileAdded, showTakePhotoOnly = false }: FileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        const newPhoto: CapturedPhoto = {
          id: `photo-${Date.now()}`,
          dataUrl
        };
        
        setCapturedPhotos(prev => [...prev, newPhoto]);
        setCurrentPhotoIndex(capturedPhotos.length);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhotos(prev => prev.slice(0, -1));
    setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
  };

  const processPhotosToText = async () => {
    setIsProcessing(true);
    
    try {
      const processedPhotos = await Promise.all(
        capturedPhotos.map(async (photo) => {
          const { data: { text } } = await Tesseract.recognize(photo.dataUrl, 'eng');
          return { ...photo, text };
        })
      );
      
      setCapturedPhotos(processedPhotos);
      
      // Combine all text
      const combinedText = processedPhotos
        .map(photo => photo.text)
        .filter(text => text && text.trim().length > 0)
        .join('\n\n--- PAGE BREAK ---\n\n');
      
      if (combinedText.length > 0) {
        const document: PolicyDocument = {
          id: `doc-${Date.now()}`,
          name: `Scanned Policy - ${capturedPhotos.length} pages`,
          content: combinedText,
          type: 'scanned',
          status: 'processed'
        };
        
        if (onDocumentUploaded) {
          onDocumentUploaded(document);
        } else if (onFileAdded) {
          onFileAdded(document);
        }
        
        toast({
          title: "Document Processed",
          description: `Successfully processed ${capturedPhotos.length} pages.`,
        });
        
        // Reset state
        setCapturedPhotos([]);
        setCurrentPhotoIndex(0);
        stopCamera();
      } else {
        toast({
          title: "No Text Found",
          description: "Could not extract text from the images. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing photos:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const document: PolicyDocument = {
        id: `file-${Date.now()}`,
        name: file.name,
        file: file,
        type: 'uploaded',
        status: 'uploaded'
      };

      if (onDocumentUploaded) {
        onDocumentUploaded(document);
      } else if (onFileAdded) {
        onFileAdded(document);
      }

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Camera view
  if (showCamera) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header with controls */}
            <div className="flex justify-between items-center">
              <Button
                onClick={stopCamera}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {capturedPhotos.length} photos captured
                </Badge>
              </div>
            </div>

            {/* Camera view */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={capturePhoto}
                className="bg-insurance-blue hover:bg-insurance-blue-dark"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              
              {capturedPhotos.length > 0 && (
                <>
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Last
                  </Button>
                  
                  <Button
                    onClick={() => setShowCamera(false)}
                    variant="secondary"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Next
                  </Button>
                </>
              )}
            </div>

            {/* Preview captured photos */}
            {capturedPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Captured Photos:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {capturedPhotos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={photo.dataUrl}
                      alt={`Captured ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Photo processing view
  if (capturedPhotos.length > 0 && !showCamera) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Camera
              </Button>
              
              <Badge variant="secondary">
                {capturedPhotos.length} photos ready
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {capturedPhotos.map((photo, index) => (
                <div key={photo.id} className="space-y-2">
                  <img
                    src={photo.dataUrl}
                    alt={`Page ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                  <p className="text-sm text-center text-gray-600">
                    Page {index + 1}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add More Photos
              </Button>
              
              <Button
                onClick={processPhotosToText}
                disabled={isProcessing}
                className="bg-insurance-blue hover:bg-insurance-blue-dark"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Finish & Process
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main upload interface
  return (
    <div className="space-y-6">
      {/* Drag and Drop Zone */}
      <div 
        className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-primary');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-primary');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('border-primary');
          const files = e.dataTransfer.files;
          if (files[0]) {
            handleFileUpload({ target: { files } } as any);
          }
        }}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Drop your policy document here
            </h3>
            <p className="text-muted-foreground mb-4">
              or <span className="text-primary font-medium underline">browse files</span> to upload
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-1 rounded">PDF</span>
              <span className="bg-muted px-2 py-1 rounded">JPG</span>
              <span className="bg-muted px-2 py-1 rounded">PNG</span>
              <span className="bg-muted px-2 py-1 rounded">Max 10MB</span>
            </div>
          </div>
          {isUploading && (
            <div className="mt-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            </div>
          )}
        </div>
      </div>

      {/* Alternative Options */}
      <div className="grid grid-cols-1 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Don't have a digital copy? No problem!
          </p>
        </div>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary/30"
          onClick={startCamera}
        >
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Take Photos</h3>
                <p className="text-sm text-muted-foreground">
                  Capture multiple pages with your camera
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-green-600 text-sm">🔒</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Your data is secure</p>
            <p className="text-muted-foreground">
              Files are processed securely and automatically deleted after analysis. 
              We never store your personal information.
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
      />
    </div>
  );
};

export default FileUploader;
