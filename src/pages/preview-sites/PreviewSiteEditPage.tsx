import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { previewSitesApi } from "../../api/previewSites";
import type { MiniProjectDto, MiniProjectSectionDto } from "../../api/types";

import styles from "./PreviewSiteEditPage.module.css";

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

  // ---- edit mini project
  const [editing, setEditing] = useState<MiniProjectDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number | "">("");
  const [editSections, setEditSections] = useState<MiniProjectSectionDto[]>(emptySections());
  const [editGalleryFiles, setEditGalleryFiles] = useState<File[]>([]);

  const startEdit = (p: MiniProjectDto) => {
    setEditing(p);
    setEditTitle(p.title);
    setEditSortOrder(p.sortOrder ?? "");
    setEditSections(p.sections?.length === 3 ? p.sections : emptySections());
    setEditGalleryFiles([]);
  };

  const updateMpMut = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No project selected");
      return previewSitesApi.updateMiniProject(siteId, editing.id, {
        title: editTitle,
        sections: editSections,
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

  if (siteQ.isLoading) return <p className={styles.stateText}>Loading…</p>;
  if (siteQ.error) return <p className={styles.stateTextError}>Failed to load preview site.</p>;
  if (!site) return <p className={styles.stateText}>Not found.</p>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumbs}>
              <Link to="/admin/preview-sites" className={styles.breadcrumbLink}>
                Preview Sites
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{site.name}</span>
            </div>
            <h1 className={styles.title}>Edit Preview Site</h1>
            <p className={styles.subtitle}>Update site info and manage mini-projects.</p>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.pill}>ID: {site.id}</span>
            <span className={styles.pill}>Updated: {new Date(site.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Site details */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Site details</h2>
              <p className={styles.cardSub}>Name, slug, description, and branding.</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.siteMeta}>
              {site.logoUrl ? (
                <img src={site.logoUrl} alt={site.name} className={styles.logo} />
              ) : (
                <div className={styles.logoPlaceholder} />
              )}
              <div className={styles.siteMetaText}>
                <div className={styles.siteMetaName}>{site.name}</div>
                <div className={styles.siteMetaSlug}>/{site.slug}</div>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Name
                </label>
                <input id="name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="slug">
                  Slug
                </label>
                <input id="slug" className={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} />
                <div className={styles.help}>Used in the URL. Keep it unique.</div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className={styles.textarea}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description (optional)"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="logoFile">
                Replace logo (optional)
              </label>
              <input id="logoFile" type="file" accept="image/*" className={styles.file} onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
              <div className={styles.help}>Square images look best.</div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btnPrimary}
                onClick={() => updateSiteMut.mutate()}
                disabled={updateSiteMut.isPending}
              >
                {updateSiteMut.isPending ? "Saving…" : "Save changes"}
              </button>

              {logoFile && (
                <button className={styles.btnGhost} onClick={() => setLogoFile(null)} disabled={updateSiteMut.isPending}>
                  Clear logo
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Mini projects list */}
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h2 className={styles.cardTitle}>Mini projects</h2>
              <p className={styles.cardSub}>Edit, sort, and manage gallery images.</p>
            </div>
            <div className={styles.headerRight}>
              <span className={styles.pill}>Total: {projects.length}</span>
              {projectsQ.isFetching && <span className={styles.mutedSmall}>Refreshing…</span>}
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.list}>
              {projects.map((p) => (
                <div key={p.id} className={styles.listRow}>
                  <div className={styles.listMain}>
                    <div className={styles.listTitle}>{p.title}</div>
                    <div className={styles.listMeta}>
                      <span className={styles.pill}>Sort: {p.sortOrder ?? "-"}</span>
                      <span className={styles.pill}>Gallery: {p.galleryImageUrls?.length ?? 0}</span>
                    </div>
                  </div>

                  <div className={styles.rowActions}>
                    <button className={styles.btn} onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => {
                        const ok = window.confirm(`Delete mini project "${p.title}"?`);
                        if (ok) deleteMpMut.mutate({ projectId: p.id });
                      }}
                      disabled={deleteMpMut.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {projects.length === 0 && <div className={styles.empty}>No mini projects yet.</div>}
            </div>
          </div>
        </section>

        {/* Create mini project */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Create mini project</h2>
              <p className={styles.cardSub}>Exactly 3 sections. Gallery images optional.</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mpTitle">
                  Title
                </label>
                <input id="mpTitle" className={styles.input} value={mpTitle} onChange={(e) => setMpTitle(e.target.value)} />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="mpSort">
                  Sort order (optional)
                </label>
                <input
                  id="mpSort"
                  className={styles.input}
                  type="number"
                  value={mpSortOrder}
                  onChange={(e) => setMpSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <div className={styles.help}>Lower numbers usually appear earlier.</div>
              </div>
            </div>

            <div className={styles.grid3}>
              {mpSections.map((s, idx) => (
                <div key={idx} className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div className={styles.panelTitle}>Section {idx + 1}</div>
                    <span className={styles.pill}>#{idx + 1}</span>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Heading</label>
                    <input
                      className={styles.input}
                      value={s.heading}
                      onChange={(e) => {
                        const next = [...mpSections];
                        next[idx] = { ...next[idx], heading: e.target.value };
                        setMpSections(next);
                      }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Paragraph</label>
                    <textarea
                      className={styles.textarea}
                      rows={5}
                      value={s.paragraph}
                      onChange={(e) => {
                        const next = [...mpSections];
                        next[idx] = { ...next[idx], paragraph: e.target.value };
                        setMpSections(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="mpGallery">
                Gallery images (optional)
              </label>
              <input
                id="mpGallery"
                className={styles.file}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setMpGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
              />
              <div className={styles.help}>
                {mpGalleryFiles.length ? `${mpGalleryFiles.length} file(s) selected.` : "No files selected."}
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={() => createMpMut.mutate()} disabled={createMpMut.isPending}>
                {createMpMut.isPending ? "Creating…" : "Create mini project"}
              </button>
              <button
                className={styles.btnGhost}
                type="button"
                onClick={() => {
                  setMpTitle("");
                  setMpSortOrder("");
                  setMpSections(emptySections());
                  setMpGalleryFiles([]);
                }}
                disabled={createMpMut.isPending}
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Edit mini project */}
        {editing && (
          <section className={styles.cardAccent}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h2 className={styles.cardTitle}>Edit mini project</h2>
                <p className={styles.cardSub}>
                  Editing: <span className={styles.strong}>{editing.title}</span>
                </p>
              </div>

              <div className={styles.rowActions}>
                <button className={styles.btn} onClick={() => setEditing(null)}>
                  Close
                </button>
                <button className={styles.btnPrimary} onClick={() => updateMpMut.mutate()} disabled={updateMpMut.isPending}>
                  {updateMpMut.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="editTitle">
                    Title
                  </label>
                  <input id="editTitle" className={styles.input} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="editSort">
                    Sort order (optional)
                  </label>
                  <input
                    id="editSort"
                    className={styles.input}
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className={styles.grid3}>
                {editSections.map((s, idx) => (
                  <div key={idx} className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <div className={styles.panelTitle}>Section {idx + 1}</div>
                      <span className={styles.pill}>#{idx + 1}</span>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Heading</label>
                      <input
                        className={styles.input}
                        value={s.heading}
                        onChange={(e) => {
                          const next = [...editSections];
                          next[idx] = { ...next[idx], heading: e.target.value };
                          setEditSections(next);
                        }}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Paragraph</label>
                      <textarea
                        className={styles.textarea}
                        rows={5}
                        value={s.paragraph}
                        onChange={(e) => {
                          const next = [...editSections];
                          next[idx] = { ...next[idx], paragraph: e.target.value };
                          setEditSections(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.field}>
                <div className={styles.rowBetween}>
                  <label className={styles.label}>Existing gallery</label>
                  <span className={styles.pill}>{editing.galleryImageUrls?.length ?? 0} image(s)</span>
                </div>
                <div className={styles.gallery}>
                  {editing.galleryImageUrls?.map((u) => (
                    <img key={u} src={u} className={styles.galleryImg} />
                  ))}
                  {(!editing.galleryImageUrls || editing.galleryImageUrls.length === 0) && (
                    <div className={styles.empty}>No images.</div>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="editGallery">
                  Add more gallery images
                </label>
                <input
                  id="editGallery"
                  className={styles.file}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setEditGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
                />
                <div className={styles.help}>
                  {editGalleryFiles.length ? `${editGalleryFiles.length} file(s) selected.` : "No new files selected."}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PreviewSiteEditPage;