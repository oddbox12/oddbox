"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderTree,
  Briefcase,
  Home,
  User,
  PhoneCall,
  Inbox,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";
  const [isVerifying, setIsVerifying] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;

    let active = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok || !data.isAuthenticated) {
          router.replace("/admin/login");
        } else {
          if (active) setIsVerifying(false);
        }
      } catch (err) {
        router.replace("/admin/login");
      }
    }
    checkAuth();
    return () => {
      active = false;
    };
  }, [isLoginPage, router]);

  // If on login page, render without sidebar shell or guard
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={24} className="animate-spin text-neutral-400 mb-3" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-sans">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { label: "Categories", href: "/admin/gallery/categories", icon: FolderTree },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Services", href: "/admin/services", icon: Briefcase },
    { label: "Homepage", href: "/admin/homepage", icon: Home },
    { label: "About Page", href: "/admin/about", icon: User },
    { label: "Contact Page", href: "/admin/contact", icon: PhoneCall },
    { label: "Enquiries", href: "/admin/enquiries", icon: Inbox },
    { label: "Journal", href: "/admin/journal", icon: BookOpen },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#111] flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#E6E4DD] px-4 py-3 flex justify-between items-center z-30">
        <Link href="/admin" className="font-serif text-lg font-bold tracking-tight">
          ODDBOX CMS
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-neutral-600 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#E6E4DD] flex flex-col justify-between p-6 z-40 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="mb-8">
            <Link href="/admin" className="block">
              <h1 className="font-serif text-xl font-semibold tracking-tight text-[#111]">ODDBOX</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-0.5">
                Studio CMS
              </p>
            </Link>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 text-xs font-medium rounded-sm transition-colors ${
                    isActive
                      ? "bg-[#111] text-white"
                      : "text-neutral-600 hover:text-black hover:bg-[#FAF9F5]"
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#E6E4DD] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-neutral-600 hover:text-black hover:bg-[#FAF9F5] rounded-sm transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink size={14} />
              <span>Live Website</span>
            </span>
            <span className="text-[10px] text-neutral-400">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-sm transition-colors text-left"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

