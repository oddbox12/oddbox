"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Video,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { MediaAsset } from "@/types/cms";

export default function AdminMediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMedia(data);
      }
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(10);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // 1. Get signed params
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "oddbox/uploads" }),
        });
        const signData = await signRes.json();

        let secureUrl = "";
        let publicId = "";

        if (signData.signature && signData.apiKey) {
          // Direct signed upload to normal Cloudinary
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", signData.apiKey);
          formData.append("timestamp", signData.timestamp.toString());
          formData.append("signature", signData.signature);
          formData.append("folder", signData.folder);

          const resourceType = file.type.startsWith("video") ? "video" : "image";
          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          const uploadData = await uploadRes.json();
          if (uploadData.secure_url) {
            secureUrl = uploadData.secure_url;
            publicId = uploadData.public_id;
          }
        } else {
          // Local development fallback
          secureUrl = URL.createObjectURL(file);
          publicId = `local-${file.name}`;
        }

        if (secureUrl) {
          await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cloudinaryPublicId: publicId,
              secureUrl,
              resourceType: file.type.startsWith("video") ? "video" : "image",
              originalFilename: file.name,
              format: file.name.split(".").pop(),
              bytes: file.size,
              title: file.name,
              folder: "oddbox/uploads",
            }),
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(null);
      fetchMedia();
    }, 500);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset from the media library?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Cannot delete media");
        return;
      }
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete media asset");
    }
  };

  const filteredMedia = media.filter((m) => {
    const matchesType = filterType === "all" || m.resourceType === filterType;
    const matchesSearch =
      !searchQuery ||
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.originalFilename && m.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Media Library
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Normal Cloudinary image & video repository with signed delivery and automatic optimization.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload Media</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Zone / Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#E6E4DD] hover:border-black p-8 text-center cursor-pointer bg-white rounded-sm transition-colors"
      >
        <Upload size={24} className="mx-auto text-neutral-400 mb-2" />
        <p className="text-xs font-medium text-[#111]">Click or Drag & Drop to upload photography & films</p>
        <p className="text-[10px] text-neutral-400 mt-1">
          Direct signed upload to normal Cloudinary (auto f_auto, q_auto, responsive sizes)
        </p>
        {uploadProgress !== null && (
          <div className="w-48 bg-neutral-100 h-1.5 rounded-full mx-auto mt-4 overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-[#E6E4DD] rounded-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
              filterType === "all" ? "bg-[#111] text-white" : "bg-[#FAF9F5] text-neutral-600 hover:text-black"
            }`}
          >
            All Media ({media.length})
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={`px-3 py-1.5 text-xs rounded-sm transition-colors flex items-center space-x-1 ${
              filterType === "image" ? "bg-[#111] text-white" : "bg-[#FAF9F5] text-neutral-600 hover:text-black"
            }`}
          >
            <ImageIcon size={12} />
            <span>Images</span>
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={`px-3 py-1.5 text-xs rounded-sm transition-colors flex items-center space-x-1 ${
              filterType === "video" ? "bg-[#111] text-white" : "bg-[#FAF9F5] text-neutral-600 hover:text-black"
            }`}
          >
            <Video size={12} />
            <span>Videos</span>
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-[#E6E4DD] text-xs py-1.5 pl-9 pr-3 rounded-sm text-[#111] focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading media library...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E6E4DD] rounded-sm">
          <p className="text-xs text-neutral-500">No media assets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white border border-[#E6E4DD] rounded-sm overflow-hidden flex flex-col justify-between hover:border-black transition-colors"
            >
              <div className="relative aspect-square bg-[#F0EFEA] overflow-hidden">
                {asset.resourceType === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white">
                    <Video size={24} />
                  </div>
                ) : (
                  <img
                    src={asset.secureUrl}
                    alt={asset.title || "Asset"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyUrl(asset.secureUrl, asset.id)}
                    className="p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 rounded-full bg-black/60 text-white hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <p className="text-xs font-medium text-[#111] truncate">{asset.title || asset.originalFilename}</p>
                <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-1 uppercase font-mono">
                  <span>{asset.format || "img"}</span>
                  <span>{asset.bytes ? `${Math.round(asset.bytes / 1024)} KB` : "1.2 MB"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

