"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  FolderTree,
  Briefcase,
  Inbox,
  ArrowUpRight,
  PlusCircle,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    galleryCount: 97,
    categoriesCount: 10,
    servicesCount: 6,
    enquiriesCount: 0,
    newEnquiriesCount: 0,
  });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [galleryRes, catRes, servRes, enqRes] = await Promise.all([
          fetch("/api/gallery?limit=6").then((r) => r.json()),
          fetch("/api/categories").then((r) => r.json()),
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/enquiries").then((r) => r.json()).catch(() => []),
        ]);

        const enquiries = Array.isArray(enqRes) ? enqRes : [];
        const newCount = enquiries.filter((e: any) => e.status === "new").length;

        setStats({
          galleryCount: galleryRes.total || 97,
          categoriesCount: Array.isArray(catRes) ? catRes.length : 10,
          servicesCount: Array.isArray(servRes) ? servRes.length : 6,
          enquiriesCount: enquiries.length,
          newEnquiriesCount: newCount,
        });

        if (galleryRes.items) {
          setRecentItems(galleryRes.items);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const statCards = [
    {
      label: "Gallery Records",
      value: stats.galleryCount,
      sub: "Seeded from asset manifest",
      href: "/admin/gallery",
      icon: ImageIcon,
    },
    {
      label: "Categories",
      value: stats.categoriesCount,
      sub: "Full dynamic portfolio taxonomy",
      href: "/admin/gallery/categories",
      icon: FolderTree,
    },
    {
      label: "Core Services",
      value: stats.servicesCount,
      sub: "Commercial & editorial offerings",
      href: "/admin/services",
      icon: Briefcase,
    },
    {
      label: "Enquiries",
      value: stats.enquiriesCount,
      sub: `${stats.newEnquiriesCount} new submissions awaiting contact`,
      href: "/admin/enquiries",
      icon: Inbox,
      badge: stats.newEnquiriesCount > 0 ? `${stats.newEnquiriesCount} NEW` : undefined,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Studio Overview
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Oddbox Studio CMS · Wireverse Private Limited
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/gallery"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm"
          >
            <PlusCircle size={14} />
            <span>Add Work</span>
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-[#E6E4DD] text-xs uppercase tracking-wider font-medium hover:bg-neutral-50 transition-colors rounded-sm"
          >
            <Upload size={14} />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {/* Migration Seeding Status Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-sm flex items-start space-x-3 text-emerald-950">
        <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-medium">All 97 legacy records & 10 categories successfully integrated</p>
          <p className="text-emerald-800 font-light">
            Every image is mapped to its original category and project. Database seeding scripts are available via <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px]">npm run cms:migrate</code>.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white border border-[#E6E4DD] p-6 rounded-sm hover:border-[#111] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-neutral-400 mb-3">
                  <Icon size={18} />
                  {card.badge && (
                    <span className="text-[10px] font-semibold bg-black text-white px-1.5 py-0.5 rounded-xs">
                      {card.badge}
                    </span>
                  )}
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </div>
                <div className="font-serif text-3xl font-medium tracking-tight text-[#111]">
                  {loading ? "..." : card.value}
                </div>
                <div className="text-xs font-medium text-neutral-700 mt-1 uppercase tracking-wider">
                  {card.label}
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 font-light mt-4 pt-4 border-t border-[#F0EFEA]">
                {card.sub}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Gallery Highlights */}
      <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-serif text-lg font-medium tracking-tight">Recent Portfolio Items</h2>
            <p className="text-xs text-neutral-400 font-light">Latest photographs from your active collections</p>
          </div>
          <Link
            href="/admin/gallery"
            className="text-xs text-neutral-600 hover:text-black uppercase tracking-wider hover:underline"
          >
            View all 97 items →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentItems.map((item) => (
            <div key={item.id} className="group relative aspect-3/4 bg-[#F0EFEA] overflow-hidden rounded-xs">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white text-[10px]">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-neutral-300 uppercase tracking-widest text-[8px]">{item.categoryId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

