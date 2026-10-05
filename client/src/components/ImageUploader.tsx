import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressedBase64);
        } else {
          onChange(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900 group">
          <img src={value} alt="Uploaded Leaf Diagnostic" className="w-full h-48 object-cover rounded-xl" />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
            >
              Replace Photo
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 text-[10px] text-emerald-400 font-mono">
            Compressed Base64 Image Ready
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-400 bg-emerald-950/30'
              : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/40'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Click or drag & drop leaf/crop photo
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports JPEG, PNG, WebP for Gemini visual pathology diagnosis
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-red-400 mt-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
