import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Loader2, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CameraCapture from './CameraCapture';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFile(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const clearPreview = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    handleFile(file);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        {!preview ? (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center p-12 border-2 border-dashed transition-colors",
              dragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
            
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
              <Upload size={32} />
            </div>
            
            <h3 className="text-xl font-semibold text-emerald-900 mb-2 text-center">
              Upload Leaf Image
            </h3>
            <p className="text-slate-500 text-center mb-2 max-w-sm">
              Drag and drop your leaf photo here, or click to browse files. Supports JPG, PNG.
            </p>
            <p className="text-xs text-amber-600 text-center mb-6 font-medium">
              ⚠️ Only Maize, Potato, and Tomato crops are supported
            </p>
            
            <Button 
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="px-8"
            >
              Select Image
            </Button>
            
            <Button 
              onClick={() => setShowCamera(true)}
              disabled={isLoading}
              variant="outline"
              className="px-8 mt-3"
            >
              <Camera className="mr-2" size={18} />
              Take Photo
            </Button>

            <div className="mt-8 flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 p-1">
                  <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d3d4fd6e-4ec2-495c-9352-1553c53ec539/maize-leaf-026753fa-1773666023051.webp" className="w-full h-full object-cover rounded" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Maize</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 p-1">
                  <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d3d4fd6e-4ec2-495c-9352-1553c53ec539/potato-leaf-61672ff0-1773666022947.webp" className="w-full h-full object-cover rounded" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Potato</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 p-1">
                  <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/d3d4fd6e-4ec2-495c-9352-1553c53ec539/tomato-leaf-d7579323-1773666022574.webp" className="w-full h-full object-cover rounded" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Tomato</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileImage className="text-emerald-600" />
                <span className="font-medium text-emerald-900">Leaf Preview</span>
              </div>
              <button 
                onClick={clearPreview}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-100 bg-slate-50">
              <img 
                src={preview} 
                alt="Upload Preview" 
                className="w-full h-full object-contain"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
                  <p className="font-medium text-emerald-900">Analyzing Crop Health...</p>
                  <p className="text-sm text-slate-500">Our AI is processing the image</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;