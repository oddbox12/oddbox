"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { HomePageContent } from "@/types/cms";
import MediaUploadField from "@/components/admin/MediaUploadField";

export default function AdminHomepageCMS() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pages/home");
        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error("Failed to load homepage content:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/pages/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!res.ok) throw new Error("Save failed");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save homepage content");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading homepage content...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Homepage CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Edit the cinematic hero, brand statement, visual break, and curated portfolio highlights.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center space-x-2">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>Homepage content updated successfully. Live website reflects these changes.</span>
        </div>
      )}

      {/* 01: Hero Section */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          01. Cinematic Hero Section
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Hero Brand Title
            </label>
            <input
              type="text"
              value={content.hero.title}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-serif text-base"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Hero Subtitle / Scope
            </label>
            <input
              type="text"
              value={content.hero.subtitle}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Hero Background Image URL (Cloudinary or Local)
            </label>
            <input
              type="text"
              value={content.hero.bgImageUrl}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, bgImageUrl: e.target.value } })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* 02: About Preview Section */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          02. Studio Statement Preview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Section Heading
            </label>
            <input
              type="text"
              value={content.aboutPreview.title}
              onChange={(e) =>
                setContent({
                  ...content,
                  aboutPreview: { ...content.aboutPreview, title: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-2">
            <MediaUploadField
              label="Preview Portrait Image"
              value={content.aboutPreview.imageUrl}
              onChange={(url) =>
                setContent({
                  ...content,
                  aboutPreview: { ...content.aboutPreview, imageUrl: url },
                })
              }
              folder="oddbox/homepage"
              accept="image/*"
              helperText="Editorial portrait preview displayed on homepage."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Statement Text
            </label>
            <textarea
              rows={3}
              value={content.aboutPreview.description}
              onChange={(e) =>
                setContent({
                  ...content,
                  aboutPreview: { ...content.aboutPreview, description: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 03: Visual Break */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          03. Parallax Visual Break
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Break Title
            </label>
            <input
              type="text"
              value={content.visualBreak.title}
              onChange={(e) =>
                setContent({
                  ...content,
                  visualBreak: { ...content.visualBreak, title: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-2">
            <MediaUploadField
              label="Break Image or Video"
              value={content.visualBreak.imageUrl}
              onChange={(url) =>
                setContent({
                  ...content,
                  visualBreak: { ...content.visualBreak, imageUrl: url },
                })
              }
              folder="oddbox/homepage"
              helperText="Full-width parallax visual break media."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Philosophy Quote
            </label>
            <input
              type="text"
              value={content.visualBreak.description}
              onChange={(e) =>
                setContent({
                  ...content,
                  visualBreak: { ...content.visualBreak, description: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

