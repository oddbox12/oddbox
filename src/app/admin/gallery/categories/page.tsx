"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, FolderTree, Loader2, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { GalleryCategory } from "@/types/cms";
import MediaUploadField from "@/components/admin/MediaUploadField";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<GalleryCategory> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory({
      id: "",
      name: "",
      slug: "",
      description: "",
      coverImageUrl: "",
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: GalleryCategory) => {
    setEditingCategory({ ...category });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name || !editingCategory?.slug) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const isNew = !categories.some((c) => c.id === editingCategory.id);
      const url = isNew ? "/api/categories" : `/api/categories/${editingCategory.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const [catToDelete, setCatToDelete] = useState<GalleryCategory | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const executeDelete = async (cat: GalleryCategory) => {
    if (cat.itemCount && cat.itemCount > 0) {
      showToast(
        `Cannot delete "${cat.name}". It currently contains ${cat.itemCount} gallery items. Reassign or delete those items first.`,
        "error"
      );
      setCatToDelete(null);
      return;
    }

    setCatToDelete(null);
    const previous = [...categories];
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete");
      }
      showToast("Category deleted successfully", "success");
    } catch (err: any) {
      setCategories(previous);
      showToast(err.message || "Failed to delete category", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Categories CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Manage your 10 portfolio categories, slugs, cover imagery, and display priorities.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Category</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E6E4DD] rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E4DD] bg-[#FAF9F5] text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Slug / Folder</th>
                <th className="py-3 px-4 font-medium">Gallery Count</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DD]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                    #{cat.displayOrder}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#111]">{cat.name}</p>
                    <p className="text-[10px] text-neutral-400 font-light max-w-sm truncate">
                      {cat.description}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">{cat.slug}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-800">{cat.itemCount || 0}</span>
                    <span className="text-[10px] text-neutral-400 font-light ml-1">items</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-xs ${
                        cat.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 text-neutral-500 hover:text-black"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setCatToDelete(cat)}
                      className="p-1 text-neutral-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-md w-full p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#E6E4DD] pb-4">
              <h2 className="font-serif text-xl font-medium tracking-tight">
                {editingCategory.id ? "Edit Category" : "New Category"}
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
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: editingCategory.id ? editingCategory.slug : e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  placeholder="e.g. Newborn"
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="e.g. newborn"
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Brief editorial description..."
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                />
              </div>

              <MediaUploadField
                label="Cover Image (Optional)"
                value={editingCategory.coverImageUrl || ""}
                onChange={(url) => setEditingCategory({ ...editingCategory, coverImageUrl: url })}
                folder="oddbox/categories"
                accept="image/*"
                helperText="Representative image for category headers and previews."
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.displayOrder || 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        displayOrder: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.isActive !== false}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, isActive: e.target.checked })
                      }
                      className="rounded-xs"
                    />
                    <span>Active in Nav</span>
                  </label>
                </div>
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
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Delete Confirmation Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-xs shrink-0 mt-0.5">
                <Trash2 size={16} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-medium text-[#111]">
                  Delete Category?
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to delete &ldquo;<span className="font-medium text-[#111]">{catToDelete.name}</span>&rdquo;?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0EFEA]">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-3.5 py-1.5 border border-[#E6E4DD] text-xs uppercase tracking-wider rounded-sm text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDelete(catToDelete)}
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

