"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle, Plus, Trash2 } from "lucide-react";
import { AboutPageContent } from "@/types/cms";
import MediaUploadField from "@/components/admin/MediaUploadField";

export default function AdminAboutCMS() {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pages/about");
        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error("Failed to load about content:", err);
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
      const res = await fetch("/api/pages/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!res.ok) throw new Error("Save failed");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save About page content");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading about content...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            About Page CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage Bunty Patel's biography, founder imagery, studio philosophies, and creative ethos.
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
          <span>About page content updated successfully. Live website reflects these changes.</span>
        </div>
      )}

      {/* Hero & Intro */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Hero & Studio Introduction
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Hero Title
            </label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Studio Introduction Text
            </label>
            <textarea
              rows={4}
              value={content.studioIntro}
              onChange={(e) => setContent({ ...content, studioIntro: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Founder Information */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Founder Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Founder Name
            </label>
            <input
              type="text"
              value={content.founder.name}
              onChange={(e) =>
                setContent({
                  ...content,
                  founder: { ...content.founder, name: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Role
            </label>
            <input
              type="text"
              value={content.founder.role}
              onChange={(e) =>
                setContent({
                  ...content,
                  founder: { ...content.founder, role: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-2">
            <MediaUploadField
              label="Founder Portrait Image"
              value={content.founder.imageUrl}
              onChange={(url) =>
                setContent({
                  ...content,
                  founder: { ...content.founder, imageUrl: url },
                })
              }
              folder="oddbox/about"
              accept="image/*"
              helperText="Portrait of the founder / creative director."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Biography
            </label>
            <textarea
              rows={4}
              value={content.founder.bio}
              onChange={(e) =>
                setContent({
                  ...content,
                  founder: { ...content.founder, bio: e.target.value },
                })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Philosophies */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-4">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Studio Philosophies
        </h2>

        {content.philosophies.map((phil, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <span className="text-[10px] font-mono text-neutral-400">0{idx + 1}</span>
            <input
              type="text"
              value={phil}
              onChange={(e) => {
                const updated = [...content.philosophies];
                updated[idx] = e.target.value;
                setContent({ ...content, philosophies: updated });
              }}
              className="flex-1 bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        ))}
      </div>
    </form>
  );
}

