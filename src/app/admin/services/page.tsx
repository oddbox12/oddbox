"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Briefcase, Loader2, X, Check, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ServiceItem } from "@/types/cms";
import MediaUploadField from "@/components/admin/MediaUploadField";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingService({
      id: `service-${Date.now()}`,
      title: "",
      slug: "",
      number: `0${services.length + 1}`,
      shortDescription: "",
      description: "",
      coverImageUrl: "/images/services/services-01.jpg",
      displayOrder: services.length + 1,
      isFeatured: true,
      isActive: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService({ ...service });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const isNew = !services.some((s) => s.id === editingService.id);
      const url = isNew ? "/api/services" : `/api/services/${editingService.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save service");
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setError(err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const executeDelete = async (service: ServiceItem) => {
    setServiceToDelete(null);
    const previous = [...services];
    setServices((prev) => prev.filter((s) => s.id !== service.id));

    try {
      const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Service deleted successfully", "success");
    } catch (err: any) {
      setServices(previous);
      showToast(err.message || "Failed to delete service", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Services CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage your 6 core commercial & creative offerings, descriptions, and imagery.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add Service</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading services...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#E6E4DD] rounded-sm overflow-hidden flex flex-col justify-between hover:border-black transition-colors"
            >
              <div className="relative aspect-16/10 bg-[#F0EFEA] overflow-hidden">
                <img
                  src={service.coverImageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  {service.number}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#111] mb-2">{service.title}</h3>
                  <p className="text-xs text-neutral-600 font-light leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F0EFEA]">
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs ${
                      service.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-1.5 text-neutral-500 hover:text-black transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-lg w-full p-6 md:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E6E4DD] pb-4">
              <h2 className="font-serif text-xl font-medium tracking-tight">
                {services.some((s) => s.id === editingService.id) ? "Edit Service" : "New Service"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Num
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.number || ""}
                    onChange={(e) => setEditingService({ ...editingService, number: e.target.value })}
                    placeholder="01"
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-mono text-center"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Service Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ""}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    placeholder="e.g. Commercial Films"
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingService.shortDescription || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      shortDescription: e.target.value,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
                />
              </div>

              <MediaUploadField
                label="Cover Image"
                value={editingService.coverImageUrl || ""}
                onChange={(url) => setEditingService({ ...editingService, coverImageUrl: url })}
                folder="oddbox/services"
                required
                accept="image/*"
                helperText="Upload a high-resolution cover image for this service."
              />

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.isActive !== false}
                    onChange={(e) => setEditingService({ ...editingService, isActive: e.target.checked })}
                    className="rounded-xs"
                  />
                  <span>Active on Website</span>
                </label>
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.isFeatured !== false}
                    onChange={(e) => setEditingService({ ...editingService, isFeatured: e.target.checked })}
                    className="rounded-xs"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-[#E6E4DD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E6E4DD] text-xs uppercase tracking-wider rounded-sm text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#111] text-white text-xs uppercase tracking-wider rounded-sm font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-xs shrink-0 mt-0.5">
                <Trash2 size={16} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-medium text-[#111]">
                  Delete Service?
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to delete &ldquo;<span className="font-medium text-[#111]">{serviceToDelete.title}</span>&rdquo;?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0EFEA]">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-3.5 py-1.5 border border-[#E6E4DD] text-xs uppercase tracking-wider rounded-sm text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDelete(serviceToDelete)}
                className="px-4 py-1.5 bg-red-600 text-white text-xs uppercase tracking-wider rounded-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Frontend Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-[#111] text-white text-xs rounded-sm shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast.type === "success" ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
          )}
          <span className="font-light tracking-wide">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

