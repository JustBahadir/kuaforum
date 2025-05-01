
import { useState } from "react";
import { Button } from "./button";
import { Upload, Camera, Loader2 } from "lucide-react";

export interface FileUploadProps {
  onUploadComplete: (uploadedUrl: string) => Promise<void>;
  acceptedFileTypes: string;
  label: string;
  currentImageUrl?: string;
  isUploading?: boolean;
}

export function FileUpload({
  onUploadComplete,
  acceptedFileTypes = "image/*",
  label = "Upload File",
  currentImageUrl,
  isUploading = false
}: FileUploadProps) {
  const handleFileSelect = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedFileTypes;
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        try {
          // For this demo, just pass the file directly
          // In real implementation, you would upload to a server
          await onUploadComplete(URL.createObjectURL(file));
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
    
    // Trigger file selection dialog
    input.click();
  };

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full bg-background p-2"
        disabled={isUploading}
        onClick={handleFileSelect}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
