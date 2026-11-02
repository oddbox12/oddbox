"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CustomCursor from "@/components/CustomCursor";
import GalleryLightbox from "@/components/GalleryLightbox";
import { portfolioCategories } from "@/data/portfolio";
import manifestJson from "@/asset-manifest.json";
import { getThumbnailUrl, getLightboxUrl } from "@/lib/cloudinary";
import { Loader2 } from "lucide-react";

interface GalleryImageItem {
  id?: string;
  url: string;
  highResUrl?: string;
  filename: string;
  project: string;
  category: string;
  categoryLabel: string;
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Dynamic pagination state
  const [dynamicItems, setDynamicItems] = useState<GalleryImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(manifestJson.length);

  // Map categories for lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    portfolioCategories.forEach((cat) => {
      map.set(cat.id, cat.label);
      map.set(cat.folder, cat.label);
    });
    return map;
  }, []);

  // Fetch paginated gallery items (16 items per page for fast initial load)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPage(1);

    const fetchCategoryItems = async () => {
      try {
        const res = await fetch(`/api/gallery?category=${selectedCategory}&page=1&limit=16&isPublished=true`);
        const data = await res.json();

        if (isMounted && data.items && data.items.length > 0) {
          const formatted: GalleryImageItem[] = data.items.map((i: any) => ({
            id: i.id,
            url: getThumbnailUrl(i.imageUrl || `/images/${i.categoryId}/${i.filename}`),
            highResUrl: getLightboxUrl(i.webUrl1800 || i.imageUrl || `/images/${i.categoryId}/${i.filename}`),
            filename: i.filename,
            project: i.projectName || i.title,
            category: i.categoryId,
            categoryLabel: i.categoryLabel || categoryMap.get(i.categoryId) || i.categoryId,
          }));
          setDynamicItems(formatted);
          setHasMore(data.hasMore);
          setTotalCount(data.total);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("API gallery fetch fallback to manifest:", err);
      }

      // Fallback to local manifest
      if (isMounted) {
        let filtered = manifestJson;
        if (selectedCategory !== "all") {
          const currentCat = portfolioCategories.find((c) => c.id === selectedCategory);
          const folder = currentCat ? currentCat.folder : selectedCategory;
          filtered = manifestJson.filter((item) => item.category === folder);
        }

        const initialSlice = filtered.slice(0, 16).map((item) => ({
          url: `/images/${item.category}/${item.filename}`,
          highResUrl: item.web_url_1800 || `/images/${item.category}/${item.filename}`,
          filename: item.filename,
          project: item.project,
          category: item.category,
          categoryLabel: categoryMap.get(item.category) || item.category,
        }));

        setDynamicItems(initialSlice);
        setHasMore(filtered.length > 16);
        setTotalCount(filtered.length);
        setLoading(false);
      }
    };

    fetchCategoryItems();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, categoryMap]);

  // Load more handler
  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`/api/gallery?category=${selectedCategory}&page=${nextPage}&limit=16&isPublished=true`);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const nextBatch: GalleryImageItem[] = data.items.map((i: any) => ({
          id: i.id,
          url: getThumbnailUrl(i.imageUrl || `/images/${i.categoryId}/${i.filename}`),
          highResUrl: getLightboxUrl(i.webUrl1800 || i.imageUrl || `/images/${i.categoryId}/${i.filename}`),
          filename: i.filename,
          project: i.projectName || i.title,
          category: i.categoryId,
          categoryLabel: i.categoryLabel || categoryMap.get(i.categoryId) || i.categoryId,
        }));

        setDynamicItems((prev) => [...prev, ...nextBatch]);
        setHasMore(data.hasMore);
        setPage(nextPage);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback pagination
      let filtered = manifestJson;
      if (selectedCategory !== "all") {
        const currentCat = portfolioCategories.find((c) => c.id === selectedCategory);
        const folder = currentCat ? currentCat.folder : selectedCategory;
        filtered = manifestJson.filter((item) => item.category === folder);
      }

      const nextSlice = filtered.slice(page * 16, (page + 1) * 16).map((item) => ({
        url: `/images/${item.category}/${item.filename}`,
        highResUrl: item.web_url_1800 || `/images/${item.category}/${item.filename}`,
        filename: item.filename,
        project: item.project,
        category: item.category,
        categoryLabel: categoryMap.get(item.category) || item.category,
      }));

      setDynamicItems((prev) => [...prev, ...nextSlice]);
      setHasMore(filtered.length > (page + 1) * 16);
      setPage(nextPage);
      setLoading(false);
    }
  };

  // Current active category details
  const activeCategoryObj = portfolioCategories.find((c) => c.id === selectedCategory);
  const displayTitle = selectedCategory === "all" ? "ALL" : activeCategoryObj ? activeCategoryObj.label : selectedCategory;

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (typeof window !== "undefined") {
      const newUrl = catId === "all" ? "/work" : `/work?category=${catId}`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  const allFilterTabs = [
    { id: "all", label: "All" },
    ...portfolioCategories,
  ];

  return (
    <>
      <CustomCursor />
      <SiteHeader />

      <main className="w-full bg-[#FAF9F5] select-none min-h-screen pt-32 pb-16 px-6 md:pt-44 md:px-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Metadata */}
          <div className="border-b border-[#E6E4DD]/60 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="font-sans text-[10px] tracking-widest text-[#707070] uppercase">
                Collection
              </span>
              <h1 className="font-serif text-5xl md:text-6xl text-[#111] tracking-tight mt-4 uppercase">
                {displayTitle}
              </h1>
            </div>
            <div className="flex items-center gap-8 text-xs font-sans text-[#707070]">
              <span>Oddbox Studio Portfolio</span>
              <span>{totalCount} frames</span>
            </div>
          </div>

          {/* Elegant Horizontal Category Switcher */}
          <div className="flex gap-6 md:gap-8 overflow-x-auto pb-4 mb-16 border-b border-[#E6E4DD]/30 scrollbar-none [scrollbar-width:_none] [-ms-overflow-style:_none] [&::-webkit-scrollbar]:hidden">
            {allFilterTabs.map((cat) => {
              const isActive = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`font-sans text-xs tracking-widest uppercase transition-all pb-2 whitespace-nowrap border-b-2 cursor-pointer text-left hover:text-[#111] ${
                    isActive
                      ? "text-[#111] border-[#111] font-medium"
                      : "text-[#707070]/60 border-transparent hover:border-[#E6E4DD]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Premium Masonry Grid with natural aspect ratios */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 w-full [column-fill:_balance]">
            {dynamicItems.map((img, index) => {
              return (
                <motion.div
                  key={`${img.category}-${img.filename}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(index * 0.03, 0.3),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => setLightboxIndex(index)}
                  className="break-inside-avoid relative overflow-hidden bg-neutral-100 cursor-pointer custom-hover-area group rounded-sm shadow-sm transition-all duration-300 hover:shadow-md"
                  data-cursor-text="VIEW"
                >
                  <img
                    src={img.url}
                    alt={img.filename}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                  {/* Subtle Elegant Text Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                    <span className="font-sans text-[9px] tracking-widest text-[#FAF9F5]/70 uppercase mb-1">
                      {img.categoryLabel}
                    </span>
                    <h3 className="font-serif text-base text-[#FAF9F5] leading-snug">
                      {img.project}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More Button for progressive pagination */}
          {hasMore && (
            <div className="text-center pt-16">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3.5 border border-[#111] text-[#111] text-xs font-sans tracking-[0.2em] uppercase hover:bg-[#111] hover:text-white transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 size={13} className="animate-spin" />
                    <span>Loading Moments...</span>
                  </span>
                ) : (
                  <span>Load More Frames ({totalCount - dynamicItems.length} Remaining)</span>
                )}
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Fullscreen premium Lightbox with high-resolution imagery */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={dynamicItems.map((item) => ({
            url: item.highResUrl || item.url,
            project: item.project,
            filename: item.filename,
          }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <SiteFooter />
    </>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F5]" />}>
      <GalleryContent />
    </Suspense>
  );
}
