'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useUploadFile, useDeleteImage } from '@/services/upload';
import { toast } from 'sonner';

interface ImageUploadZoneProps {
  multiple?: boolean;
  maxFiles?: number;
  onUploadSuccess: (urls: string[]) => void;
  onDeleteImage?: (url: string) => void;
  currentImages?: string[];
  maxSizeMB?: number;
}

export default function ImageUploadZone({
  multiple = false,
  maxFiles = 10,
  onUploadSuccess,
  onDeleteImage,
  currentImages = [],
  maxSizeMB = 10,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteImage();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const processFiles = async (files: FileList) => {
    const validFiles: File[] = [];

    // Filter files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File "${file.name}" is not an allowed image format.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Check count limits
    if (!multiple && validFiles.length > 1) {
      toast.error('Only single file upload is allowed here.');
      return;
    }

    if (multiple && currentImages.length + validFiles.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images in total.`);
      return;
    }

    // Set uploading state names
    setUploadingFiles(validFiles.map((f) => f.name));

    const uploadedUrls: string[] = [];
    for (const file of validFiles) {
      try {
        const result = await uploadMutation.mutateAsync(file);
        uploadedUrls.push(result.url);
      } catch (err: any) {
        toast.error(`Failed to upload file "${file.name}": ${err.message || 'Server error'}`);
      }
    }

    if (uploadedUrls.length > 0) {
      onUploadSuccess(uploadedUrls);
      toast.success(`Successfully uploaded ${uploadedUrls.length} file(s) 🎉`);
    }

    setUploadingFiles([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async (url: string) => {
    try {
      if (onDeleteImage) {
        onDeleteImage(url);
      }
      // Call deletion API on the backend to clean filesystem
      await deleteMutation.mutateAsync(url);
      toast.success('Image deleted successfully');
    } catch (err: any) {
      // If file is not found, it still removes it from frontend state
      console.warn('Physical file deletion warning:', err.message);
    }
  };

  const isUploading = uploadingFiles.length > 0;

  return (
    <div className="space-y-4">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/10'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple={multiple}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold text-slate-800">
              Uploading {uploadingFiles.length} file(s)...
            </p>
            <div className="text-xs text-slate-500 max-w-[200px] truncate">
              {uploadingFiles.join(', ')}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Upload className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & drop images here, or <span className="text-emerald-500">browse</span>
            </p>
            <p className="text-xs text-slate-500">
              Supports JPEG, PNG, WEBP, and GIF (Max {maxSizeMB}MB per image)
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails Display */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {currentImages.map((url, idx) => (
            <div key={idx} className="group relative aspect-video sm:aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={url}
                alt={`Uploaded image ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(url);
                }}
                disabled={deleteMutation.isPending}
                className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
