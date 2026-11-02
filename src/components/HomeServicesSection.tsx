"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { siteConfig } from "@/data/site";
import { servicesData as fallbackServices } from "@/data/services";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeServicesSection() {
  const [services, setServices] = useState(fallbackServices);
  const [activeImage, setActiveImage] = useState(fallbackServices[0]?.image || "/images/services/services-01.jpg");

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data
            .filter((s: any) => s.isActive !== false)
            .map((s: any) => ({
              id: s.id,
              num: s.number,
              title: s.title,
              categorySlug: s.categoryId || "corporate",
              description: s.shortDescription || s.description,
              image: s.coverImageUrl || "/images/services/services-01.jpg",
            }));
          setServices(mapped);
          if (mapped[0]) setActiveImage(mapped[0].image);
        }
      } catch (err) {
        // Fallback to static services
      }
    }
    loadServices();
  }, []);

  return (
    <section className="w-full bg-[#FAF9F5] py-16 px-6 md:py-24 md:px-16 border-t border-[#E6E4DD]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Numbered list with triggers */}
        <div className="flex flex-col">
          <p className="font-sans text-[10px] tracking-widest text-[#707070] uppercase mb-4">
            03 — Scope of Work
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-[#111] mb-8 max-w-lg">
            Creative visual production for modern brands.
          </h2>

          <div className="flex flex-col">
            {services.map((service) => (
              <div
                key={service.id}
                onMouseEnter={() => setActiveImage(service.image)}
                className="group border-t border-[#E6E4DD] py-4 md:py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 cursor-pointer transition-colors hover:border-[#111]"
              >
                <div className="flex items-start gap-5">
                  <span className="font-sans text-[10px] tracking-widest text-[#707070] mt-1">
                    {service.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl text-[#111] transition-transform duration-300 group-hover:translate-x-2">
                      {service.title}
                    </h3>
                    <p className="font-sans text-xs text-[#707070] mt-1.5 max-w-md font-light leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t border-[#E6E4DD]" />
          </div>
        </div>

        {/* Right Column: Large Dynamic Photograph */}
        <div className="hidden lg:block w-full aspect-[4/5] bg-neutral-100 overflow-hidden rounded-sm shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <img
                src={activeImage}
                alt="Service Representation"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
