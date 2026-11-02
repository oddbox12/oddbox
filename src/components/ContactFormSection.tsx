"use client";

import { useState } from "react";
import { siteConfig } from "@/data/site";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function ContactFormSection() {
  const [interest, setInterest] = useState("Photography");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestsList = [
    "Photography",
    "Brand Shoot",
    "Cinematography Project",
    "Creative Production",
    "Podcast",
    "TV Commercial",
    "Textile / Fashion Photography",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          interest,
          message,
          honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="w-full bg-[#FAF9F5] py-20 px-6 md:py-32 md:px-16 border-t border-[#E6E4DD]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Left side details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-5xl md:text-6xl tracking-tight text-[#111] mb-12">
              Let's create something together.
            </h2>
          </div>

          <div className="space-y-8 border-t border-[#E6E4DD]/60 pt-8 mt-8">
            <div>
              <p className="text-[10px] tracking-widest text-[#707070] uppercase font-sans mb-2">Email</p>
              <a href={`mailto:${siteConfig.email}`} className="text-xl text-[#111] hover:underline font-serif">
                {siteConfig.email}
              </a>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-[#707070] uppercase font-sans mb-2">Phone / WhatsApp</p>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} className="text-xl text-[#111] hover:underline font-serif block">
                {siteConfig.phone}
              </a>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-[#707070] uppercase font-sans mb-2">Location</p>
              <p className="text-sm text-[#111] leading-relaxed font-sans font-light max-w-sm">
                {siteConfig.address}
              </p>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className="lg:col-span-7 bg-[#FAF9F5] border border-[#E6E4DD] p-8 md:p-12">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col justify-center items-center text-center py-20"
            >
              <h3 className="font-serif text-3xl text-[#111] mb-4">Thank you.</h3>
              <p className="font-sans text-sm text-[#707070] max-w-xs leading-relaxed font-light mb-8">
                Your message has been received and saved. We will get back to you within 24 hours.
              </p>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-[#111] text-[#FAF9F5] text-xs font-sans tracking-widest uppercase hover:bg-neutral-800 transition-colors"
              >
                CHAT ON WHATSAPP ↗
              </a>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  {error}
                </div>
              )}

              {/* Honeypot anti-spam (hidden) */}
              <input
                type="text"
                name="b_oddbox_honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Interest toggle selectors */}
              <div>
                <p className="text-[10px] tracking-widest text-[#707070] uppercase font-sans mb-4">
                  I am interested in
                </p>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setInterest(item)}
                      className={`px-4 py-2 border text-xs font-sans tracking-wider transition-colors duration-200 ${
                        interest === item
                          ? "border-[#111] bg-[#111] text-[#FAF9F5]"
                          : "border-[#E6E4DD] text-[#707070] hover:border-[#111]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line-based Inputs */}
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="YOUR NAME"
                    className="w-full bg-transparent border-b border-[#E6E4DD] py-4 text-xs font-sans tracking-widest uppercase text-[#111] placeholder-[#707070] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL ADDRESS"
                    className="w-full bg-transparent border-b border-[#E6E4DD] py-4 text-xs font-sans tracking-widest uppercase text-[#111] placeholder-[#707070] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="PHONE NUMBER"
                    className="w-full bg-transparent border-b border-[#E6E4DD] py-4 text-xs font-sans tracking-widest uppercase text-[#111] placeholder-[#707070] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="TELL US ABOUT YOUR PROJECT"
                    className="w-full bg-transparent border-b border-[#E6E4DD] py-4 text-xs font-sans tracking-widest uppercase text-[#111] placeholder-[#707070] focus:outline-none focus:border-[#111] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 bg-[#111] text-[#FAF9F5] text-xs font-sans tracking-widest uppercase hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{submitting ? "SENDING..." : "SEND ENQUIRY ↗"}</span>
                </button>

                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-[#E6E4DD] hover:border-[#111] text-[#111] text-xs font-sans tracking-widest uppercase transition-colors text-center"
                >
                  CHAT ON WHATSAPP ↗
                </a>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
