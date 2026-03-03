import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

import { previewSitesApi } from "../../api/previewSites";
import type { PreviewSiteDto, PreviewSiteCreationData } from "../../api/types";

import styles from "./PreviewSitesPage.module.css";

// --- Zod Schemas ---
const miniProjectSectionSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  paragraph: z.string().min(1, "Paragraph is required"),
});

const miniProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sections: z.array(miniProjectSectionSchema).length(3, "Exactly 3 sections are required"),
  galleryFiles: z.instanceof(FileList).optional(),
  sortOrder: z.number().int().nullable().optional(),
});

const previewSiteCreationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  logoFile: z.instanceof(FileList).optional(),
  miniProjects: z.array(miniProjectSchema).optional(),
});

type PreviewSiteFormInputs = z.infer<typeof previewSiteCreationSchema>;

const PreviewSitesPage: React.FC = () => {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["previewSites", { searchTerm }],
    queryFn: () => previewSitesApi.list({ pageNumber: 1, pageSize: 50, searchTerm: searchTerm || undefined }),
  });

  const sites = useMemo(() => data ?? [], [data]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreviewSiteFormInputs>({
    resolver: zodResolver(previewSiteCreationSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      miniProjects: [],
    },
  });

  const { fields: miniProjectFields, append: appendMiniProject, remove: removeMiniProject } = useFieldArray({
    control,
    name: "miniProjects",
  });

  const createMut = useMutation({
    mutationFn: (data: PreviewSiteCreationData) => previewSitesApi.createWithMiniProjects(data),
    onSuccess: () => {
      toast.success("Preview site created successfully!");
      reset();
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => {
      console.error("Creation error:", e);
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to create preview site.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => previewSitesApi.remove(id),
    onSuccess: () => {
      toast.success("Preview site deleted.");
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to delete preview site."),
  });

  const onSubmit = (data: PreviewSiteFormInputs) => {
    const submissionData: PreviewSiteCreationData = {
      ...data,
      logoFile: data.logoFile?.[0] ?? null,
      miniProjects: data.miniProjects?.map((mp) => ({
        ...mp,
        galleryFiles: Array.from(mp.galleryFiles || []),
        sortOrder: mp.sortOrder === undefined ? null : mp.sortOrder,
      })),
    };
    createMut.mutate(submissionData);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Preview Sites</h1>
            <p className={styles.subtitle}>Create and manage preview sites and their mini-projects.</p>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.pill}>Total: {sites.length}</span>
            {isFetching && <span className={styles.mutedSmall}>Refreshing…</span>}
          </div>
        </div>

        {/* List */}
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h2 className={styles.cardTitle}>All sites</h2>
              <p className={styles.cardSub}>Search, open, or delete preview sites.</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="searchTerm">
                Search
              </label>
              <input
                id="searchTerm"
                className={styles.input}
                placeholder="Search by name, slug…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading && <p className={styles.stateText}>Loading…</p>}
            {error && <p className={styles.stateTextError}>Failed to load sites.</p>}

            <div className={styles.list}>
              {sites.map((s: PreviewSiteDto) => (
                <div key={s.id} className={styles.listRow}>
                  <div className={styles.listMain}>
                    <div className={styles.siteLine}>
                      {s.logoUrl ? (
                        <img src={s.logoUrl} alt={s.name} className={styles.siteLogo} />
                      ) : (
                        <div className={styles.siteLogoPlaceholder} />
                      )}
                      <div className={styles.siteText}>
                        <div className={styles.siteName}>{s.name}</div>
                        <div className={styles.siteSlug}>/{s.slug}</div>
                      </div>
                    </div>

                    {s.description && <div className={styles.siteDesc}>{s.description}</div>}
                  </div>

                  <div className={styles.rowActions}>
                    <Link to={`/admin/preview-sites/${s.id}`} className={styles.btnPrimaryLink}>
                      Edit
                    </Link>

                    <button
                      className={styles.btnDanger}
                      onClick={() => {
                        const ok = window.confirm(`Delete "${s.name}"? This cannot be undone.`);
                        if (ok) deleteMut.mutate(s.id);
                      }}
                      disabled={deleteMut.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {!isLoading && sites.length === 0 && <div className={styles.empty}>No preview sites found.</div>}
            </div>
          </div>
        </section>

        {/* Create */}
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h2 className={styles.cardTitle}>Create new preview site</h2>
              <p className={styles.cardSub}>Optionally include mini-projects at creation time.</p>
            </div>
          </div>

          <div className={styles.cardBody}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name">
                    Name
                  </label>
                  <input id="name" className={styles.input} placeholder="e.g. ACME Studio" {...register("name")} />
                  {errors.name && <div className={styles.error}>{errors.name.message}</div>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="slug">
                    Slug
                  </label>
                  <input id="slug" className={styles.input} placeholder="e.g. acme-studio" {...register("slug")} />
                  {errors.slug && <div className={styles.error}>{errors.slug.message}</div>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="description">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  className={styles.textarea}
                  rows={4}
                  placeholder="Short description…"
                  {...register("description")}
                />
                {errors.description && <div className={styles.error}>{errors.description.message}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="logoFile">
                  Logo (optional)
                </label>
                <input id="logoFile" className={styles.file} type="file" accept="image/*" {...register("logoFile")} />
                {errors.logoFile && <div className={styles.error}>{errors.logoFile.message}</div>}
              </div>

              {/* Mini projects */}
              <div className={styles.block}>
                <div className={styles.blockHead}>
                  <div>
                    <div className={styles.blockTitle}>Mini-projects (optional)</div>
                    <div className={styles.blockSub}>Each mini-project requires exactly 3 sections.</div>
                  </div>

                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() =>
                      appendMiniProject({
                        title: "",
                        sections: [
                          { heading: "", paragraph: "" },
                          { heading: "", paragraph: "" },
                          { heading: "", paragraph: "" },
                        ],
                        sortOrder: null,
                      })
                    }
                  >
                    Add mini-project
                  </button>
                </div>

                <div className={styles.stack}>
                  {miniProjectFields.map((item, mpIndex) => (
                    <div key={item.id} className={styles.mpCard}>
                      <div className={styles.mpHead}>
                        <div>
                          <div className={styles.mpTitle}>Mini-project {mpIndex + 1}</div>
                          <div className={styles.mpSub}>Configure title, sort order, sections, and optional gallery.</div>
                        </div>
                        <button type="button" className={styles.iconBtn} onClick={() => removeMiniProject(mpIndex)} title="Remove">
                          ×
                        </button>
                      </div>

                      <div className={styles.grid2}>
                        <div className={styles.field}>
                          <label className={styles.label}>Title</label>
                          <input className={styles.input} {...register(`miniProjects.${mpIndex}.title`)} />
                          {errors.miniProjects?.[mpIndex]?.title && (
                            <div className={styles.error}>{errors.miniProjects[mpIndex]?.title?.message}</div>
                          )}
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>Sort order (optional)</label>
                          <input
                            className={styles.input}
                            type="number"
                            {...register(`miniProjects.${mpIndex}.sortOrder`, { valueAsNumber: true })}
                          />
                          {errors.miniProjects?.[mpIndex]?.sortOrder && (
                            <div className={styles.error}>{errors.miniProjects[mpIndex]?.sortOrder?.message}</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.grid3}>
                        {Array.from({ length: 3 }).map((_, secIndex) => (
                          <div key={secIndex} className={styles.panel}>
                            <div className={styles.panelHeader}>
                              <div className={styles.panelTitle}>Section {secIndex + 1}</div>
                              <span className={styles.pill}>#{secIndex + 1}</span>
                            </div>

                            <div className={styles.field}>
                              <label className={styles.label}>Heading</label>
                              <input className={styles.input} {...register(`miniProjects.${mpIndex}.sections.${secIndex}.heading`)} />
                              {errors.miniProjects?.[mpIndex]?.sections?.[secIndex]?.heading && (
                                <div className={styles.error}>
                                  {errors.miniProjects[mpIndex]?.sections?.[secIndex]?.heading?.message}
                                </div>
                              )}
                            </div>

                            <div className={styles.field}>
                              <label className={styles.label}>Paragraph</label>
                              <textarea
                                className={styles.textarea}
                                rows={4}
                                {...register(`miniProjects.${mpIndex}.sections.${secIndex}.paragraph`)}
                              />
                              {errors.miniProjects?.[mpIndex]?.sections?.[secIndex]?.paragraph && (
                                <div className={styles.error}>
                                  {errors.miniProjects[mpIndex]?.sections?.[secIndex]?.paragraph?.message}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {errors.miniProjects?.[mpIndex]?.sections && (
                        <div className={styles.error}>{errors.miniProjects[mpIndex]?.sections?.message as string}</div>
                      )}

                      <div className={styles.field}>
                        <label className={styles.label}>Gallery files (optional)</label>
                        <input className={styles.file} type="file" multiple {...register(`miniProjects.${mpIndex}.galleryFiles`)} />
                        {errors.miniProjects?.[mpIndex]?.galleryFiles && (
                          <div className={styles.error}>{errors.miniProjects[mpIndex]?.galleryFiles?.message}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {miniProjectFields.length === 0 && <div className={styles.empty}>No mini-projects added yet.</div>}
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnPrimary} type="submit" disabled={isSubmitting || createMut.isPending}>
                  {isSubmitting || createMut.isPending ? "Creating…" : "Create preview site"}
                </button>

                <button
                  className={styles.btnGhost}
                  type="button"
                  onClick={() => reset()}
                  disabled={isSubmitting || createMut.isPending}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PreviewSitesPage;