"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isAuthenticated) {
          router.replace("/admin");
        }
      } catch {}
    }
    checkExisting();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#111] flex flex-col justify-between p-6 md:p-12 font-sans">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Website</span>
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-neutral-400">Oddbox Studio Admin</span>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-white border border-[#E6E4DD] p-8 md:p-10 shadow-sm rounded-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight mb-2">ODDBOX CMS</h1>
          <p className="text-xs text-neutral-500 font-light tracking-wide">
            Sign in to manage studio content, gallery, services & enquiries.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-2 font-medium">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@oddboxstudio.in"
                className="w-full bg-[#FAF9F5] border border-[#E6E4DD] rounded-none pl-10 pr-3 py-2.5 text-xs text-[#111] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF9F5] border border-[#E6E4DD] rounded-none pl-10 pr-3 py-2.5 text-xs text-[#111] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white py-3 text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E6E4DD] text-center">
          <p className="text-[11px] text-neutral-400">
            Protected studio administration · Wireverse Private Limited
          </p>
        </div>
      </div>

      <div className="text-center text-[10px] text-neutral-400 uppercase tracking-widest">
        Oddbox Studio © {new Date().getFullYear()}
      </div>
    </div>
  );
}

