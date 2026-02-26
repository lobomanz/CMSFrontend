import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { previewSitesApi } from "../../api/previewSites";
import type { MiniProjectDto, MiniProjectSectionDto, PreviewSiteDto } from "../../api/types";

const emptySections = (): MiniProjectSectionDto[] => [
  { heading: "", paragraph: "" },
  { heading: "", paragraph: "" },
  { heading: "", paragraph: "" },
];

const PreviewSiteEditPage: React.FC = () => {
  const { id } = useParams();
  const siteId = id as string;

  const qc = useQueryClient();

  const siteQ = useQuery({
    queryKey: ["previewSite", siteId],
    queryFn: () => previewSitesApi.get(siteId),
    enabled: !!siteId,
  });

  const projectsQ = useQuery({
    queryKey: ["miniProjects", siteId],
    queryFn: () => previewSitesApi.listMiniProjects(siteId, { pageNumber: 1, pageSize: 200 }),
    enabled: !!siteId,
  });

  const site = siteQ.data;
  const projects = useMemo(() => projectsQ.data ?? [], [projectsQ.data]);

  // ---- site form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!site) return;
    setName(site.name);
    setSlug(site.slug);
    setDescription(site.description ?? "");
  }, [site?.id]);

  const updateSiteMut = useMutation({
    mutationFn: () =>
      previewSitesApi.update(siteId, {
        name,
        slug,
        description: description || undefined,
        logoFile,
      }),
    onSuccess: () => {
      toast.success("Preview site updated");
      setLogoFile(null);
      qc.invalidateQueries({ queryKey: ["previewSite", siteId] });
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to update"),
  });

  // ---- create mini project
  const [mpTitle, setMpTitle] = useState("");
  const [mpSortOrder, setMpSortOrder] = useState<number | "">("");
  const [mpSections, setMpSections] = useState<MiniProjectSectionDto[]>(emptySections());
  const [mpGalleryFiles, setMpGalleryFiles] = useState<File[]>([]);

  const createMpMut = useMutation({
    mutationFn: () =>
      previewSitesApi.createMiniProject(siteId, {
        title: mpTitle,
        sections: mpSections,
        sortOrder: mpSortOrder === "" ? null : mpSortOrder,
        galleryFiles: mpGalleryFiles,
      }),
    onSuccess: () => {
      toast.success("Mini project created");
      setMpTitle("");
      setMpSortOrder("");
      setMpSections(emptySections());
      setMpGalleryFiles([]);
      qc.invalidateQueries({ queryKey: ["miniProjects", siteId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create mini project"),
  });

  const deleteMpMut = useMutation({
    mutationFn: ({ projectId }: { projectId: string }) => previewSitesApi.deleteMiniProject(siteId, projectId),
    onSuccess: () => {
      toast.success("Mini project deleted");
      qc.invalidateQueries({ queryKey: ["miniProjects", siteId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to delete mini project"),
  });

  // Simple inline editor for one selected project
  const [editing, setEditing] = useState<MiniProjectDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number | "">("");
  const [editSections, setEditSections] = useState<MiniProjectSectionDto[]>(emptySections());
  const [editGalleryFiles, setEditGalleryFiles] = useState<File[]>([]);

  const startEdit = (p: MiniProjectDto) => {
    setEditing(p);
    setEditTitle(p.title);
    setEditSortOrder(p.sortOrder ?? "");
    setEditSections(
      p.sections?.length === 3 ? p.sections : emptySections()
    );
    setEditGalleryFiles([]);
  };

  const updateMpMut = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No project selected");
      return previewSitesApi.updateMiniProject(siteId, editing.id, {
        title: editTitle,
        sections: editSections, // keep exact 3 to avoid binder/validation headaches
        sortOrder: editSortOrder === "" ? null : editSortOrder,
        galleryFiles: editGalleryFiles.length ? editGalleryFiles : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Mini project updated");
      setEditing(null);
      setEditGalleryFiles([]);
      qc.invalidateQueries({ queryKey: ["miniProjects", siteId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to update mini project"),
  });

  if (siteQ.isLoading) return <p className="text-sm text-gray-600">Loading...</p>;
  if (siteQ.error) return <p className="text-sm text-red-600">Failed to load preview site.</p>;
  if (!site) return <p className="text-sm text-gray-600">Not found.</p>;

  return (
    <div className="space-y-6">
      {/* Site editor */}
      <div className="p-4 rounded-xl bg-white shadow space-y-3">
        <h1 className="text-xl font-semibold">Edit Preview Site</h1>

        <div className="flex items-center gap-3">
          {site.logoUrl ? (
            <img src={site.logoUrl} alt={site.name} className="w-14 h-14 rounded object-cover border" />
          ) : (
            <div className="w-14 h-14 rounded border bg-gray-50" />
          )}
          <div className="text-sm text-gray-600">
            <div>ID: {site.id}</div>
            <div>Updated: {new Date(site.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded-md p-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input className="border rounded-md p-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" />
        </div>

        <textarea
          className="border rounded-md p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={3}
        />

        <div>
          <label className="text-sm text-gray-700">Replace logo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
        </div>

        <button
          className="px-4 py-2 rounded-md bg-black text-white"
          onClick={() => updateSiteMut.mutate()}
          disabled={updateSiteMut.isPending}
        >
          {updateSiteMut.isPending ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* Mini projects list */}
      <div className="p-4 rounded-xl bg-white shadow space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mini Projects</h2>
          {projectsQ.isFetching && <span className="text-xs text-gray-500">Refreshing…</span>}
        </div>

        <div className="divide-y">
          {projects.map((p) => (
            <div key={p.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-600">Sort: {p.sortOrder ?? "-"}</p>
                <p className="text-sm text-gray-600">Gallery: {p.galleryImageUrls?.length ?? 0}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button className="px-3 py-2 rounded-md bg-red-600 text-white text-sm" onClick={() => deleteMpMut.mutate({ projectId: p.id })}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {projects.length === 0 && <p className="py-6 text-sm text-gray-600">No mini projects yet.</p>}
        </div>
      </div>

      {/* Create mini project */}
      <div className="p-4 rounded-xl bg-white shadow space-y-3">
        <h2 className="text-lg font-semibold">Create Mini Project</h2>

        <input className="border rounded-md p-2 w-full" placeholder="Title" value={mpTitle} onChange={(e) => setMpTitle(e.target.value)} />

        <input
          className="border rounded-md p-2 w-full"
          placeholder="Sort order (optional)"
          value={mpSortOrder}
          onChange={(e) => setMpSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
          type="number"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mpSections.map((s, idx) => (
            <div key={idx} className="border rounded-md p-3 space-y-2">
              <p className="text-sm font-medium">Section {idx + 1}</p>
              <input
                className="border rounded-md p-2 w-full"
                placeholder="Heading"
                value={s.heading}
                onChange={(e) => {
                  const next = [...mpSections];
                  next[idx] = { ...next[idx], heading: e.target.value };
                  setMpSections(next);
                }}
              />
              <textarea
                className="border rounded-md p-2 w-full"
                placeholder="Paragraph"
                rows={4}
                value={s.paragraph}
                onChange={(e) => {
                  const next = [...mpSections];
                  next[idx] = { ...next[idx], paragraph: e.target.value };
                  setMpSections(next);
                }}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm text-gray-700">Gallery images (optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setMpGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
          />
        </div>

        <button
          className="px-4 py-2 rounded-md bg-black text-white"
          onClick={() => createMpMut.mutate()}
          disabled={createMpMut.isPending}
        >
          {createMpMut.isPending ? "Creating..." : "Create mini project"}
        </button>
      </div>

      {/* Edit mini project (simple inline panel) */}
      {editing && (
        <div className="p-4 rounded-xl bg-white shadow space-y-3 border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Edit Mini Project</h2>
            <button className="text-sm underline" onClick={() => setEditing(null)}>
              Close
            </button>
          </div>

          <input className="border rounded-md p-2 w-full" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />

          <input
            className="border rounded-md p-2 w-full"
            placeholder="Sort order (optional)"
            value={editSortOrder}
            onChange={(e) => setEditSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
            type="number"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {editSections.map((s, idx) => (
              <div key={idx} className="border rounded-md p-3 space-y-2">
                <p className="text-sm font-medium">Section {idx + 1}</p>
                <input
                  className="border rounded-md p-2 w-full"
                  value={s.heading}
                  onChange={(e) => {
                    const next = [...editSections];
                    next[idx] = { ...next[idx], heading: e.target.value };
                    setEditSections(next);
                  }}
                />
                <textarea
                  className="border rounded-md p-2 w-full"
                  rows={4}
                  value={s.paragraph}
                  onChange={(e) => {
                    const next = [...editSections];
                    next[idx] = { ...next[idx], paragraph: e.target.value };
                    setEditSections(next);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">Existing gallery</p>
            <div className="flex flex-wrap gap-2">
              {editing.galleryImageUrls?.map((u) => (
                <img key={u} src={u} className="w-20 h-20 object-cover rounded border" />
              ))}
              {(!editing.galleryImageUrls || editing.galleryImageUrls.length === 0) && (
                <p className="text-sm text-gray-600">No images.</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Add more gallery images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setEditGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </div>

          <button
            className="px-4 py-2 rounded-md bg-black text-white"
            onClick={() => updateMpMut.mutate()}
            disabled={updateMpMut.isPending}
          >
            {updateMpMut.isPending ? "Saving..." : "Save mini project"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PreviewSiteEditPage;