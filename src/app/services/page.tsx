"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CustomCursor from "@/components/CustomCursor";
import { servicesData as fallbackServices } from "@/data/services";
import { siteConfig } from "@/data/site";

export default function ServicesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [services, setServices] = useState(fallbackServices);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data
            .filter((s) => s.isActive !== false)
            .map((s) => ({
              id: s.id,
              num: s.number,
              title: s.title,
              categorySlug: s.categoryId || "commercial-photography",
              description: s.shortDescription || s.description,
              image: s.coverImageUrl || "/images/services/services-01.jpg",
            }));
          setServices(mapped);
        }
      } catch (err) {
        // Fallback to static servicesData
      }
    }
    load();
  }, []);

  return (
    <>
      <CustomCursor />
      <SiteHeader />

      <main className="w-full bg-[#FAF9F5] select-none min-h-screen pt-32 pb-24 px-6 md:pt-44 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* EDITORIAL HERO HEADER */}
          <section className="border-b border-[#E6E4DD]/80 pb-12 md:pb-16 mb-12 md:mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
                  <span className="font-sans text-[10px] tracking-[0.3em] text-[#707070] uppercase font-medium">
                    Oddbox Production Capabilities
                  </span>
                </motion.div>

                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#111] tracking-tight uppercase leading-[0.92]"
                  >
                    SERVICES
                  </motion.h1>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-sans text-xs text-[#707070] md:text-right max-w-sm font-light leading-relaxed"
              >
                <p className="font-serif italic text-base text-[#111] mb-2">
                  "Some moments deserve more than memory — let's capture them forever."
                </p>
                <p className="tracking-widest uppercase text-[10px] text-[#707070]">
                  Surat / Global Production
                </p>
              </motion.div>
            </div>
          </section>

          {/* ACTIVE INDICATOR DOTS */}
          <div className="flex justify-center items-center gap-2 mb-12">
            {services.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Select service ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === idx
                    ? "w-2.5 h-2.5 bg-[#111]"
                    : "w-1.5 h-1.5 bg-[#111]/20 hover:bg-[#111]/50"
                }`}
              />
            ))}
          </div>

          {/* MINIMAL PREMIUM SERVICES CARDS GRID (3 CARDS PER LINE) */}
          <section className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {services.map((service, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className="flex flex-col group cursor-pointer"
                  >
                    {/* Rounded Image Container */}
                    <Link href={`/work?category=${service.categorySlug}`}>
                      <div className="relative aspect-[16/10] w-full rounded-2xl md:rounded-[1.25rem] overflow-hidden bg-[#E6E4DD]/40 mb-4 transition-all duration-500">
                        <img
                          src={service.image}
                          alt={service.title}
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            isActive
                              ? "scale-105 filter-none"
                              : "scale-100 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                          }`}
                        />
                      </div>
                    </Link>

                    {/* Card Footer Info */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans text-[11px] text-[#707070] font-light tracking-wider">
                        {service.num}
                      </span>
                      <Link
                        href={`/work?category=${service.categorySlug}`}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "border-[#111] bg-[#111] text-[#FAF9F5]"
                            : "border-[#E6E4DD] text-[#707070] group-hover:border-[#111] group-hover:text-[#111]"
                        }`}
                      >
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>

                    {/* Title & Description */}
                    <Link href={`/work?category=${service.categorySlug}`}>
                      <h3
                        className={`font-serif text-xl md:text-2xl tracking-tight transition-colors duration-300 font-medium ${
                          isActive ? "text-[#111]" : "text-[#707070] group-hover:text-[#111]"
                        }`}
                      >
                        {service.title}
                      </h3>
                      <p className="font-sans text-xs text-[#707070] font-light leading-relaxed mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* MINIMALIST STUDIO INQUIRY BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="pt-16 border-t border-[#E6E4DD] flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          >
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#111] tracking-tight">
                Have a campaign or production in mind?
              </h2>
              <p className="font-sans text-xs text-[#707070] font-light mt-2 max-w-md">
                Reach out directly to discuss production dates, creative treatments, and bespoke booking packages.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#111] text-[#FAF9F5] text-xs font-sans tracking-widest uppercase rounded-full hover:bg-[#333] transition-colors"
              >
                <span>Start An Inquiry</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
