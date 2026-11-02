"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  Search,
  Filter,
  Trash2,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Enquiry } from "@/types/cms";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/enquiries?status=${statusFilter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEnquiries(data);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSelectEnquiry = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setInternalNotes(enq.internalNotes || "");
  };

  const handleUpdateStatus = async (status: Enquiry["status"]) => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes }),
      });

      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();

      setSelectedEnquiry(updated);
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
    } catch (err) {
      alert("Failed to delete enquiry");
    }
  };

  const filtered = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.interest.toLowerCase().includes(q) ||
      e.message.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: Enquiry["status"]) => {
    switch (status) {
      case "new":
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-xs text-[9px] uppercase tracking-wider font-semibold">New</span>;
      case "read":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-xs text-[9px] uppercase tracking-wider">Read</span>;
      case "contacted":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-xs text-[9px] uppercase tracking-wider">Contacted</span>;
      case "closed":
        return <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-xs text-[9px] uppercase tracking-wider">Closed</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Contact Enquiries
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Real customer enquiries submitted from the contact form, preserved in Firestore.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-[#E6E4DD] rounded-sm">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "new", "read", "contacted", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs rounded-sm uppercase tracking-wider transition-colors ${
                statusFilter === st ? "bg-[#111] text-white font-medium" : "bg-[#FAF9F5] text-neutral-600 hover:text-black"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-[#E6E4DD] text-xs py-1.5 pl-9 pr-3 rounded-sm text-[#111] focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Main Grid: List + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Enquiries List */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <div className="py-20 text-center bg-white border border-[#E6E4DD] rounded-sm">
              <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
              <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading enquiries...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center bg-white border border-[#E6E4DD] rounded-sm">
              <Inbox size={24} className="mx-auto text-neutral-400 mb-2" />
              <p className="text-xs text-neutral-500">No enquiries found.</p>
            </div>
          ) : (
            filtered.map((enq) => {
              const isSelected = selectedEnquiry?.id === enq.id;
              return (
                <div
                  key={enq.id}
                  onClick={() => handleSelectEnquiry(enq)}
                  className={`bg-white border p-5 rounded-sm cursor-pointer transition-all ${
                    isSelected ? "border-black shadow-sm" : "border-[#E6E4DD] hover:border-neutral-400"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-serif text-base font-medium text-[#111]">{enq.name}</h3>
                      <p className="text-[11px] text-neutral-500 font-light">{enq.email} · {enq.phone}</p>
                    </div>
                    {getStatusBadge(enq.status)}
                  </div>

                  <p className="text-xs text-neutral-700 font-light line-clamp-2 mt-2 leading-relaxed">
                    "{enq.message}"
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-3 mt-3 border-t border-[#F0EFEA]">
                    <span className="uppercase tracking-wider font-medium text-neutral-600">
                      Interest: {enq.interest}
                    </span>
                    <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Enquiry Details Panel */}
        <div className="lg:col-span-5">
          {selectedEnquiry ? (
            <div className="bg-white border border-[#E6E4DD] p-6 rounded-sm space-y-6 sticky top-24">
              <div className="flex justify-between items-start border-b border-[#E6E4DD] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-medium tracking-tight text-[#111]">
                    {selectedEnquiry.name}
                  </h2>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
                    Received {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(selectedEnquiry.status)}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Oddbox Studio Inquiry`}
                  className="flex items-center justify-center space-x-2 py-2 px-3 border border-[#E6E4DD] text-xs hover:border-black rounded-sm transition-colors text-center"
                >
                  <Mail size={13} />
                  <span>Send Email</span>
                </a>
                <a
                  href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-600 text-white text-xs hover:bg-emerald-700 rounded-sm transition-colors text-center"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Message Details */}
              <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-sm border border-[#E6E4DD]">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Selected Service Scope</p>
                  <p className="text-xs text-[#111] font-medium">{selectedEnquiry.interest}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Client Message</p>
                  <p className="text-xs text-neutral-800 leading-relaxed font-light mt-1 whitespace-pre-wrap">
                    {selectedEnquiry.message || "(No message provided)"}
                  </p>
                </div>
              </div>

              {/* Status Updater */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium mb-2">Update Status</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["new", "read", "contacted", "closed"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      disabled={updating}
                      className={`py-1.5 text-[10px] uppercase tracking-wider rounded-sm border transition-colors ${
                        selectedEnquiry.status === st
                          ? "bg-[#111] text-white border-black"
                          : "bg-white text-neutral-600 border-[#E6E4DD] hover:border-black"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-600 font-medium mb-1">
                  Internal Studio Notes
                </p>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes on budget, shoot date, quotes shared..."
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                />
                <button
                  onClick={() => handleUpdateStatus(selectedEnquiry.status)}
                  disabled={updating}
                  className="mt-2 w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-800 rounded-sm font-medium transition-colors"
                >
                  Save Internal Notes
                </button>
              </div>

              <div className="pt-4 border-t border-[#E6E4DD] flex justify-between items-center">
                <button
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  className="text-xs text-red-600 hover:underline flex items-center space-x-1"
                >
                  <Trash2 size={13} />
                  <span>Delete Enquiry</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E6E4DD] p-12 text-center rounded-sm text-neutral-400 text-xs">
              Select an enquiry from the list to view client message and manage status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

