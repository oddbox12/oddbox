"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Star,
  Check,
  X,
  Loader2,
  Grid,
  List,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { GalleryItem, GalleryCategory } from "@/types/cms";
import MediaUploadField from "@/components/admin/MediaUploadField";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete confirm state & frontend notifications
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [galleryRes, catRes] = await Promise.all([
        fetch(`/api/gallery?limit=200&category=${selectedCategory}`).then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);

      if (galleryRes.items) {
        setItems(galleryRes.items);
      }
      if (Array.isArray(catRes)) {
        setCategories(catRes);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleOpenCreate = () => {
    setEditingItem({
      id: `gallery-${Date.now()}`,
      title: "",
      projectName: "Oddbox Studio",
      categoryId: categories[0]?.slug || "couple",
      imageUrl: "",
      mediaType: "image",
      isFeatured: false,
      isPublished: true,
      displayOrder: items.length + 1,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem({ ...item });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.imageUrl) {
      setModalError("Title and Image URL are required");
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const isNew = !items.some((i) => i.id === editingItem.id);
      const url = isNew ? "/api/gallery" : `/api/gallery/${editingItem.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save item");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || "Error saving item");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async (item: GalleryItem) => {
    const id = item.id;
    setDeletingId(id);
    const previousItems = [...items];
    // Immediate optimistic removal from view
    setItems((prev) => prev.filter((i) => i.id !== id && i.sourceAssetId !== id));
    setItemToDelete(null);

    if (editingItem?.id === id) {
      setIsModalOpen(false);
    }

    try {
      const res = await fetch(`/api/gallery/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      showToast("Gallery item deleted successfully", "success");
    } catch (err: any) {
      // Revert if deletion failed
      setItems(previousItems);
      showToast(`Failed to delete gallery item: ${err.message}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    const updated = { ...item, isPublished: !item.isPublished };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await fetch(`/api/gallery/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: updated.isPublished }),
    });
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    const updated = { ...item, isFeatured: !item.isFeatured };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await fetch(`/api/gallery/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: updated.isFeatured }),
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Gallery Management
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage all 97 photography records, categories, publication state, and featured works.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add Media</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-[#E6E4DD] rounded-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FAF9F5] border border-[#E6E4DD] text-xs py-2 px-3 pr-8 rounded-sm text-[#111] focus:outline-none focus:border-black uppercase tracking-wider"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.id}>
                  {c.name} ({c.itemCount || 8})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by title or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E6E4DD] text-xs py-2 pl-9 pr-3 rounded-sm text-[#111] focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#E6E4DD]">
          <span className="text-xs text-neutral-400 font-light mr-2">
            Showing {filteredItems.length} records
          </span>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-sm border ${
              viewMode === "grid" ? "bg-[#111] text-white border-black" : "bg-white text-neutral-500 border-[#E6E4DD]"
            }`}
            title="Grid View"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-sm border ${
              viewMode === "table" ? "bg-[#111] text-white border-black" : "bg-white text-neutral-500 border-[#E6E4DD]"
            }`}
            title="List/Table View"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Gallery Content */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading gallery records...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E6E4DD] rounded-sm">
          <p className="text-xs text-neutral-500">No gallery items found matching your filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-[#E6E4DD] rounded-sm overflow-hidden flex flex-col justify-between hover:border-black transition-colors"
            >
              <div className="relative aspect-3/4 bg-[#F0EFEA] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`p-1 rounded-full text-xs backdrop-blur-xs transition-colors ${
                      item.isFeatured ? "bg-amber-400 text-black" : "bg-black/40 text-white hover:bg-black/70"
                    }`}
                    title={item.isFeatured ? "Featured on Home" : "Not featured"}
                  >
                    <Star size={11} fill={item.isFeatured ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`p-1 rounded-full text-xs backdrop-blur-xs transition-colors ${
                      item.isPublished ? "bg-emerald-500 text-white" : "bg-neutral-600 text-white"
                    }`}
                    title={item.isPublished ? "Published" : "Hidden"}
                  >
                    {item.isPublished ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                </div>
              </div>

              <div className="p-3">
                <p className="text-xs font-medium text-[#111] truncate">{item.title}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5 truncate">
                  {item.projectName} · {item.categoryId}
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0EFEA]">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest">
                    #{item.displayOrder}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-neutral-500 hover:text-black transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => setItemToDelete(item)}
                      className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={12} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[#E6E4DD] rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E4DD] bg-[#FAF9F5] text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4 font-medium">Thumb</th>
                <th className="py-3 px-4 font-medium">Title & Project</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Featured</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DD]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-2 px-4">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-10 h-12 object-cover rounded-xs"
                      loading="lazy"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <p className="font-medium text-[#111]">{item.title}</p>
                    <p className="text-[10px] text-neutral-400 font-light">{item.projectName}</p>
                  </td>
                  <td className="py-2 px-4 uppercase tracking-wider text-[10px] text-neutral-600">
                    {item.categoryId}
                  </td>
                  <td className="py-2 px-4 font-mono text-[10px] text-neutral-500">{item.displayOrder}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={`text-xs ${item.isFeatured ? "text-amber-500 font-medium" : "text-neutral-300"}`}
                    >
                      {item.isFeatured ? "★ Featured" : "☆ Standard"}
                    </button>
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-xs ${
                        item.isPublished
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-neutral-500 hover:text-black"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => setItemToDelete(item)}
                      className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={13} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-lg w-full p-6 md:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E6E4DD] pb-4">
              <h2 className="font-serif text-xl font-medium tracking-tight">
                {items.some((i) => i.id === editingItem.id) ? "Edit Gallery Item" : "New Gallery Item"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Reflections in Motion"
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editingItem.projectName || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, projectName: e.target.value })}
                  placeholder="e.g. Surat Editorial 2026"
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Category
                  </label>
                  <select
                    value={editingItem.categoryId || "couple"}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm uppercase tracking-wider"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.displayOrder || 1}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value, 10) })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                  />
                </div>
              </div>

              <MediaUploadField
                label="Image or Video"
                value={editingItem.imageUrl || ""}
                onChange={(url) => setEditingItem({ ...editingItem, imageUrl: url })}
                onUploadComplete={(data) => {
                  setEditingItem((prev) =>
                    prev
                      ? {
                          ...prev,
                          imageUrl: data.url,
                          mediaType: data.resourceType,
                          title: prev.title || data.filename?.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "",
                        }
                      : prev
                  );
                }}
                folder={`oddbox/gallery/${editingItem.categoryId || "general"}`}
                required
                helperText="Upload any JPG, PNG, WEBP, or MP4/MOV video. Stored securely on Cloudinary."
              />

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPublished !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                    className="rounded-xs"
                  />
                  <span>Published on Website</span>
                </label>

                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isFeatured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                    className="rounded-xs"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-[#E6E4DD]">
                <div>
                  {items.some((i) => i.id === editingItem.id) && (
                    <button
                      type="button"
                      disabled={deletingId === editingItem.id}
                      onClick={() => {
                        const target = items.find((i) => i.id === editingItem.id);
                        if (target) setItemToDelete(target);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs uppercase tracking-wider rounded-sm flex items-center space-x-1.5 transition-colors"
                    >
                      {deletingId === editingItem.id ? (
                        <Loader2 size={12} className="animate-spin text-red-600" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      <span>Delete</span>
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
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
                    <span>Save Item</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Frontend Delete Confirmation Modal (no browser alerts) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-xs shrink-0 mt-0.5">
                <Trash2 size={16} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-medium text-[#111]">
                  Delete Gallery Item?
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to remove &ldquo;<span className="font-medium text-[#111]">{itemToDelete.title || "Untitled"}</span>&rdquo;? This will immediately delete it from the studio gallery.
                </p>
              </div>
            </div>

            {/* Thumbnail Preview */}
            {itemToDelete.imageUrl && (
              <div className="h-32 w-full bg-[#FAF9F5] border border-[#E6E4DD] rounded-xs overflow-hidden flex items-center justify-center">
                {itemToDelete.mediaType === "video" ? (
                  <video src={itemToDelete.imageUrl} className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={itemToDelete.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = "/images/placeholder.jpg";
                    }}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0EFEA]">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 border border-[#E6E4DD] text-xs uppercase tracking-wider rounded-sm text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === itemToDelete.id}
                onClick={() => executeDelete(itemToDelete)}
                className="px-4 py-1.5 bg-red-600 text-white text-xs uppercase tracking-wider rounded-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {deletingId === itemToDelete.id ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
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

