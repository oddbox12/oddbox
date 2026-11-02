"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Loader2, X, Eye, EyeOff } from "lucide-react";
import { JournalPost } from "@/types/cms";
import MediaUploadField from "@/components/admin/MediaUploadField";

export default function AdminJournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<JournalPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal?all=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingPost({
      id: `post-${Date.now()}`,
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "Perspective",
      author: "Bunty Patel",
      coverImageUrl: "/images/couple/couple-01.jpg",
      isPublished: true,
      publishedAt: new Date().toISOString().split("T")[0],
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: JournalPost) => {
    setEditingPost({ ...post });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const isNew = !posts.some((p) => p.id === editingPost.id);
      const url = isNew ? "/api/journal" : `/api/journal/${editingPost.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save post");
      }

      setIsModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      setError(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal post?")) return;
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#111]">
            Journal CMS
          </h1>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Publish studio perspectives, behind-the-scenes stories, and photography essays.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#111] text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors rounded-sm self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Article</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-neutral-400 mb-2" />
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading journal posts...</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E6E4DD] rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6E4DD] bg-[#FAF9F5] text-[10px] uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4 font-medium">Article</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Author</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DD]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#111]">{post.title}</p>
                    <p className="text-[10px] text-neutral-400 font-light line-clamp-1">{post.excerpt}</p>
                  </td>
                  <td className="py-3 px-4 text-[10px] uppercase tracking-wider text-neutral-600">
                    {post.category}
                  </td>
                  <td className="py-3 px-4 text-neutral-700">{post.author}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-neutral-500">{post.publishedAt}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-xs ${
                        post.isPublished
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(post)}
                      className="p-1 text-neutral-500 hover:text-black"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1 text-neutral-400 hover:text-red-600"
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
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E4DD] rounded-sm max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E6E4DD] pb-4">
              <h2 className="font-serif text-xl font-medium tracking-tight">
                {posts.some((p) => p.id === editingPost.id) ? "Edit Article" : "New Article"}
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
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={editingPost.title || ""}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      title: e.target.value,
                      slug: editingPost.id ? editingPost.slug : e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  placeholder="e.g. The Quiet Geometry of Light"
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-serif text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPost.slug || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingPost.category || "Perspective"}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Excerpt (Short Summary)
                </label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 font-medium">
                  Full Article Content
                </label>
                <textarea
                  rows={8}
                  value={editingPost.content || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="Write story paragraphs..."
                  className="w-full bg-[#FAF9F5] border border-[#E6E4DD] p-2.5 text-xs text-[#111] focus:outline-none focus:border-black rounded-sm leading-relaxed"
                />
              </div>

              <MediaUploadField
                label="Cover Image"
                value={editingPost.coverImageUrl || ""}
                onChange={(url) => setEditingPost({ ...editingPost, coverImageUrl: url })}
                folder="oddbox/journal"
                accept="image/*"
                helperText="Editorial cover image for this journal article."
              />

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="pub"
                  checked={editingPost.isPublished !== false}
                  onChange={(e) => setEditingPost({ ...editingPost, isPublished: e.target.checked })}
                  className="rounded-xs"
                />
                <label htmlFor="pub" className="text-xs cursor-pointer">
                  Published on Website
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
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

