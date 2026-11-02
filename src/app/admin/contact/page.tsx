"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { ContactPageContent } from "@/types/cms";

export default function AdminContactCMS() {
  const [content, setContent] = useState<ContactPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pages/contact");
        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error("Failed to load contact content:", err);
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
      const res = await fetch("/api/pages/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!res.ok) throw new Error("Save failed");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save Contact page content");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading contact content...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Contact Page CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage inquiry headings, studio studio location, WhatsApp connection, and form options.
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
          <span>Contact page content updated successfully. Live website reflects these changes.</span>
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Contact Headings & Intro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Page Heading
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-serif text-base"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Subheading / Description
            </label>
            <input
              type="text"
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* Direct Contact Info */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Studio Contact Channels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Official Email
            </label>
            <input
              type="email"
              value={content.email}
              onChange={(e) => setContent({ ...content, email: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Direct Phone
            </label>
            <input
              type="text"
              value={content.phone}
              onChange={(e) => setContent({ ...content, phone: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              WhatsApp (with country code)
            </label>
            <input
              type="text"
              value={content.whatsapp}
              onChange={(e) => setContent({ ...content, whatsapp: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Physical Studio Address
            </label>
            <input
              type="text"
              value={content.address}
              onChange={(e) => setContent({ ...content, address: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

