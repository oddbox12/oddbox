"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface UploadCompleteEvent {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  filename?: string;
}

interface MediaUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onUploadComplete?: (data: UploadCompleteEvent) => void;
  folder?: string;
  accept?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
}

export default function MediaUploadField({
  label = "Image or Video",
  value,
  onChange,
  onUploadComplete,
  folder = "oddbox/uploads",
  accept = "image/*,video/*",
  helperText,
  placeholder = "https://res.cloudinary.com/... or upload a file",
  required = false,
}: MediaUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo =
    value?.toLowerCase().endsWith(".mp4") ||
    value?.toLowerCase().endsWith(".webm") ||
    value?.toLowerCase().endsWith(".mov") ||
    value?.includes("/video/upload/");

  const handleFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);
    setError(null);

    try {
      // 1. Request signature from /api/cloudinary/sign
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to request upload signature (${signRes.status})`);
      }

      const signData = await signRes.json();
      const detectedIsVideo =
        file.type.startsWith("video") || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);
      const resourceType: "image" | "video" = detectedIsVideo ? "video" : "image";

      let finalUrl = "";
      let publicId = "";
      let width: number | undefined;
      let height: number | undefined;
      let bytes: number = file.size;
      let format: string = file.name.split(".").pop() || "";

      if (signData.signature && signData.apiKey && signData.cloudName) {
        // 2. Direct signed upload to normal Cloudinary
        setProgress(25);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.apiKey);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        formData.append("folder", signData.folder || folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`;

        // Use XMLHttpRequest for live progress bar
        const uploadPromise = new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round(25 + (event.loaded / event.total) * 65);
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                resolve(res);
              } catch (err) {
                reject(new Error("Invalid JSON response from Cloudinary"));
              }
            } else {
              try {
                const errRes = JSON.parse(xhr.responseText);
                reject(
                  new Error(errRes.error?.message || `Upload failed with status ${xhr.status}`)
                );
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          };

          xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
          xhr.send(formData);
        });

        const cloudRes = await uploadPromise;
        finalUrl = cloudRes.secure_url || cloudRes.url;
        publicId = cloudRes.public_id;
        width = cloudRes.width;
        height = cloudRes.height;
        format = cloudRes.format || format;
        bytes = cloudRes.bytes || bytes;
      } else {
        // Local preview fallback if credentials are absent
        setProgress(50);
        finalUrl = URL.createObjectURL(file);
        publicId = `local-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      }

      setProgress(95);

      // 3. Register asset with central Media Library
      try {
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cloudinaryPublicId: publicId,
            secureUrl: finalUrl,
            filename: file.name,
            format,
            bytes,
            width,
            height,
            folder: signData.folder || folder,
            mediaType: resourceType,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          }),
        });
      } catch (mediaErr) {
        console.warn("Failed to log asset to media library:", mediaErr);
      }

      setProgress(100);

      // 4. Fill the link automatically
      onChange(finalUrl);

      if (onUploadComplete) {
        onUploadComplete({
          url: finalUrl,
          publicId,
          resourceType,
          width,
          height,
          format,
          bytes,
          filename: file.name,
        });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please check your Cloudinary configuration.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1200);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Upload trigger */}
      <div className="flex justify-between items-center">
        <label className="block text-[10px] uppercase tracking-wider text-neutral-600 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[10px] text-neutral-400 font-sans tracking-wider">
          Auto-uploads to Cloudinary
        </span>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Input row + Upload button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            required={required}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 pr-8 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-mono text-[11px]"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              title="Clear link"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2.5 bg-[#111] text-white hover:bg-neutral-800 disabled:opacity-50 text-xs uppercase tracking-wider rounded-sm font-medium flex items-center space-x-1.5 shrink-0 transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>{progress > 0 ? `${progress}%` : "Uploading"}</span>
            </>
          ) : (
            <>
              <Upload size={13} />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>

      {/* Drag & Drop Quick Zone (visible when empty or dragging) */}
      {!value && !isUploading && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed p-4 rounded-sm text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-black bg-neutral-100"
              : "border-[#E6E4DD] bg-[#FAF9F5] hover:border-neutral-400"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1 text-neutral-500">
            <div className="flex items-center space-x-2 text-neutral-400">
              <ImageIcon size={18} />
              <Film size={18} />
            </div>
            <p className="text-xs font-sans text-neutral-700">
              Drag & drop image or video here, or <span className="underline font-medium">browse</span>
            </p>
            <p className="text-[10px] text-neutral-400">
              Uploaded files are stored in Cloudinary and the link fills automatically
            </p>
          </div>
        </div>
      )}

      {/* Uploading progress bar */}
      {isUploading && (
        <div className="p-3 bg-neutral-50 border border-[#E6E4DD] rounded-sm space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-neutral-600">
            <span className="flex items-center space-x-1.5 font-medium">
              <Loader2 size={11} className="animate-spin text-black" />
              <span>Uploading to Cloudinary...</span>
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-[#E6E4DD] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-start space-x-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Preview */}
      {value && (
        <div className="p-2.5 border border-[#E6E4DD] rounded-sm bg-[#FAF9F5] space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-neutral-500">
            <span className="flex items-center space-x-1 font-medium">
              {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
              <span>{isVideo ? "Video Preview" : "Image Preview"}</span>
            </span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-black flex items-center space-x-0.5"
            >
              <span>Open</span>
              <ExternalLink size={10} />
            </a>
          </div>

          <div className="rounded-xs overflow-hidden bg-black/5 flex items-center justify-center max-h-48 border border-neutral-200">
            {isVideo ? (
              <video
                src={value}
                controls
                className="max-h-48 w-full object-contain bg-black"
                preload="metadata"
              />
            ) : (
              <img
                src={value}
                alt="Uploaded Preview"
                className="max-h-48 w-full object-contain"
                onError={(e) => {
                  (e.target as any).src = "/images/placeholder.jpg";
                }}
              />
            )}
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-neutral-500 font-sans tracking-wide">{helperText}</p>
      )}
    </div>
  );
}

