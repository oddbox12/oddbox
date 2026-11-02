"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { SiteSettings } from "@/types/cms";

export default function AdminSettingsCMS() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Save failed");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ text: "Please enter your current and new passwords.", isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: "New password must be at least 6 characters.", isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match.", isError: true });
      return;
    }

    setPasswordUpdating(true);
    setPasswordMessage(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setPasswordMessage({
        text: "Password updated and encrypted in database successfully!",
        isError: false,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ text: err.message || "Failed to update password", isError: true });
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
        <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading studio settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Global Studio Settings
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Configure legal brand name, contact coordinates, social channels, and search engine SEO.
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
          <span>Global settings updated. Footer, metadata, and contact links reflect these changes.</span>
        </div>
      )}

      {/* Brand & Entity */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Brand Identity & Legal Entity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Studio Name
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Legal Operating Entity
            </label>
            <input
              type="text"
              value={settings.legalName}
              onChange={(e) => setSettings({ ...settings, legalName: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Location City / State
            </label>
            <input
              type="text"
              value={settings.location}
              onChange={(e) => setSettings({ ...settings, location: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.instagramUrl}
              onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* Contact Coordinates */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Contact Channels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Studio Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Phone Number
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              WhatsApp Link
            </label>
            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Full Studio Postal Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* SEO Defaults */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <h2 className="font-serif text-xl font-medium tracking-tight border-b border-[#F0EFEA] pb-3">
          Default SEO Metadata
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Default Page Title
            </label>
            <input
              type="text"
              value={settings.defaultSeoTitle}
              onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Default Meta Description
            </label>
            <textarea
              rows={2}
              value={settings.defaultSeoDescription}
              onChange={(e) =>
                setSettings({ ...settings, defaultSeoDescription: e.target.value })
              }
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Security & Admin Password (Encrypted in DB) */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6">
        <div className="border-b border-[#F0EFEA] pb-3 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-medium tracking-tight text-[#111] flex items-center space-x-2">
              <Lock size={18} />
              <span>Admin Password & Security</span>
            </h2>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Passwords are cryptographically salted and encrypted using scrypt in the database.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase tracking-wider rounded-xs font-mono">
            <ShieldCheck size={12} />
            <span>Encrypted Hash</span>
          </span>
        </div>

        {passwordMessage && (
          <div
            className={`p-3 text-xs rounded-sm flex items-center space-x-2 ${
              passwordMessage.isError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {passwordMessage.isError ? (
              <AlertCircle size={14} className="shrink-0" />
            ) : (
              <CheckCircle size={14} className="shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={passwordUpdating}
            onClick={handlePasswordChange}
            className="px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider rounded-sm font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
          >
            {passwordUpdating && <Loader2 size={12} className="animate-spin" />}
            <span>Update Password</span>
          </button>
        </div>
      </div>
    </form>
  );
}

