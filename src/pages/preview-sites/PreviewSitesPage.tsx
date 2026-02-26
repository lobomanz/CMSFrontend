import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { previewSitesApi } from "../../api/previewSites";
import type { PreviewSiteDto } from "../../api/types";
import { Link } from "react-router-dom";

const PreviewSitesPage: React.FC = () => {
  const qc = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLogo, setNewLogo] = useState<File | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["previewSites", { searchTerm }],
    queryFn: () => previewSitesApi.list({ pageNumber: 1, pageSize: 50, searchTerm: searchTerm || undefined }),
  });

  const sites = useMemo(() => data ?? [], [data]);

  const createMut = useMutation({
    mutationFn: () =>
      previewSitesApi.create({
        name: newName,
        slug: newSlug,
        description: newDesc || undefined,
        logoFile: newLogo,
      }),
    onSuccess: () => {
      toast.success("Preview site created");
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setNewLogo(null);
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => previewSitesApi.remove(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to delete"),
  });

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white shadow">
        <h1 className="text-xl font-semibold">Preview Sites</h1>

        <div className="mt-4 flex gap-2">
          <input
            className="w-full border rounded-md p-2"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && <p className="mt-4 text-sm text-gray-600">Loading...</p>}
        {error && <p className="mt-4 text-sm text-red-600">Failed to load.</p>}

        <div className="mt-4 divide-y">
          {sites.map((s: PreviewSiteDto) => (
            <div key={s.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={s.name} className="w-10 h-10 rounded object-cover border" />
                  ) : (
                    <div className="w-10 h-10 rounded border bg-gray-50" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-sm text-gray-600 truncate">/{s.slug}</p>
                  </div>
                </div>
                {s.description && <p className="text-sm text-gray-700 mt-1">{s.description}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/preview-sites/${s.id}`}
                  className="px-3 py-2 rounded-md bg-black text-white text-sm"
                >
                  Edit
                </Link>
                <button
                  className="px-3 py-2 rounded-md bg-red-600 text-white text-sm"
                  onClick={() => deleteMut.mutate(s.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!isLoading && sites.length === 0 && (
            <p className="py-6 text-sm text-gray-600">No preview sites found.</p>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white shadow space-y-3">
        <h2 className="text-lg font-semibold">Create new Preview Site</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded-md p-2" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input className="border rounded-md p-2" placeholder="Slug (unique)" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
        </div>

        <textarea
          className="border rounded-md p-2 w-full"
          placeholder="Description (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          rows={3}
        />

        <div>
          <label className="text-sm text-gray-700">Logo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setNewLogo(e.target.files?.[0] ?? null)} />
        </div>

        <button
          className="px-4 py-2 rounded-md bg-black text-white"
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
        >
          {createMut.isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
};

export default PreviewSitesPage;