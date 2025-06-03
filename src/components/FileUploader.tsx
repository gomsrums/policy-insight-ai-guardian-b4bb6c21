import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  Type,
  Check,
  Plus,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { PolicyDocument } from "@/lib/chatpdf-types";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface FileUploaderProps {
  onDocumentUploaded: (document: PolicyDocument) => void;
  showTakePhotoOnly?: boolean;
}

const FileUploader = ({ onDocumentUploaded, showTakePhotoOnly = true }: FileUploaderProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCapture = useCallback(() => {
    setIsCapturing(true);
    setLastCapturedImage(null);
    setCapturedPages([]);
    
    // Access the camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera Error",
          description: "Failed to access the camera. Please check your permissions.",
          variant: "destructive",
        });
        setIsCapturing(false);
      });
  }, [toast]);

  const stopCapture = () => {
    setIsCapturing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setLastCapturedImage(dataUrl);
    }
  };

  const retakePhoto = () => {
    setLastCapturedImage(null);
  };

  const finishCapture = async () => {
    setIsProcessing(true);
    stopCapture();
  
    if (lastCapturedImage) {
      setCapturedPages([...capturedPages, lastCapturedImage]);
    }
  
    if (capturedPages.length === 0 && !lastCapturedImage) {
      toast({
        title: "No Images Captured",
        description: "Please capture at least one image before finishing.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
  
    try {
      const combinedImages = lastCapturedImage ? [...capturedPages, lastCapturedImage] : capturedPages;
      const combinedText = combinedImages.join('\n');
  
      const document: PolicyDocument = {
        name: "Policy Images",
        content: combinedText,
      };
  
      onDocumentUploaded(document);
      toast({
        title: "Document Captured",
        description: "Policy document has been captured successfully.",
      });
    } catch (error) {
      console.error("Error finishing capture:", error);
      toast({
        title: "Capture Error",
        description: "Failed to finalize the capture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCapturedPages([]);
      setLastCapturedImage(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true);
    const file = event.target.files?.[0];
  
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
  
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
  
    try {
      const document: PolicyDocument = {
        name: file.name,
        file: file,
      };
  
      onDocumentUploaded(document);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    setIsProcessing(true);
    setShowTextInput(false);
  
    if (!textInputValue.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text before submitting.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
  
    try {
      const document: PolicyDocument = {
        name: "Entered Text",
        content: textInputValue,
      };
  
      onDocumentUploaded(document);
      toast({
        title: "Text Submitted",
        description: "Text has been submitted successfully.",
      });
    } catch (error) {
      console.error("Text submission error:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTextInputValue("");
    }
  };

  if (showTakePhotoOnly) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            {!isCapturing ? (
              <div className="flex flex-col gap-4">
                <Button
                  onClick={startCapture}
                  disabled={isProcessing}
                  className="w-full bg-insurance-blue hover:bg-insurance-blue-dark"
                  size="lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">Upload PDF</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                    />
                  </label>
                  <Button
                    onClick={() => setShowTextInput(true)}
                    variant="outline"
                    className="h-32 border-dashed"
                    disabled={isProcessing}
                  >
                    <Type className="mr-2 h-5 w-5" />
                    Enter Text
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-lg bg-black"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <Button
                    onClick={stopCapture}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {capturedPages.length + 1}
                  </span>
                  
                  <div className="flex gap-2">
                    {lastCapturedImage && (
                      <Button
                        onClick={retakePhoto}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retake
                      </Button>
                    )}
                    <Button
                      onClick={capturePhoto}
                      className="flex items-center gap-2"
                      disabled={isProcessing}
                    >
                      <Camera className="h-4 w-4" />
                      Capture
                    </Button>
                  </div>
                </div>

                {capturedPages.length > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      {capturedPages.length} page(s) captured
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={capturePhoto}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isProcessing}
                      >
                        <Plus className="h-4 w-4" />
                        Next Page
                      </Button>
                      <Button
                        onClick={finishCapture}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        disabled={isProcessing || capturedPages.length === 0}
                      >
                        <Check className="h-4 w-4" />
                        Finish
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Dialog open={showTextInput} onOpenChange={setShowTextInput}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Enter Policy Text</DialogTitle>
                  <DialogDescription>
                    Enter or paste the policy text here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    placeholder="Enter policy text"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" onClick={handleTextSubmit} disabled={isProcessing}>
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {isProcessing && (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                </svg>
                Processing...
              </div>
            )}

            {capturedPages.length > 0 && !isCapturing && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium">Captured Pages:</h4>
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {capturedPages.map((page, index) => (
                    <img
                      key={index}
                      src={page}
                      alt={`Captured Page ${index + 1}`}
                      className="w-24 h-32 object-cover rounded-md"
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

  // Return the full uploader with all options when showTakePhotoOnly is false
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={startCapture}
              disabled={isProcessing}
              className="h-32 bg-insurance-blue hover:bg-insurance-blue-dark"
            >
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8" />
                <span>Take Photo</span>
              </div>
            </Button>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Upload PDF</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
            
            <Button
              onClick={() => setShowTextInput(true)}
              variant="outline"
              className="h-32 border-dashed"
              disabled={isProcessing}
            >
              <div className="flex flex-col items-center gap-2">
                <Type className="h-8 w-8" />
                <span>Enter Text</span>
              </div>
            </Button>
          </div>

          <Dialog open={showTextInput} onOpenChange={setShowTextInput}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Enter Policy Text</DialogTitle>
                <DialogDescription>
                  Enter or paste the policy text here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  placeholder="Enter policy text"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={handleTextSubmit} disabled={isProcessing}>
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isProcessing && (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
              </svg>
              Processing...
            </div>
          )}

          {capturedPages.length > 0 && !isCapturing && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium">Captured Pages:</h4>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {capturedPages.map((page, index) => (
                  <img
                    key={index}
                    src={page}
                    alt={`Captured Page ${index + 1}`}
                    className="w-24 h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
