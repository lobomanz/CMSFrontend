import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import { previewSitesApi } from "../../api/previewSites";
import type { PreviewSiteDto } from "../../api/types";

import styles from "./PreviewSitesPage.module.css";

const PreviewSitesPage: React.FC = () => {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Search/Pagination
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["previewSites", { searchTerm, pageNumber }],
    queryFn: () => previewSitesApi.list({ pageNumber, pageSize, searchTerm: searchTerm || undefined }),
  });

  const sites = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Create Site
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");

  const createMut = useMutation({
    mutationFn: (input: { slug: string; name?: string }) => previewSitesApi.create(input),
    onSuccess: () => {
      toast.success("Preview site created successfully!");
      setNewSlug("");
      setNewName("");
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => {
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug) {
      toast.error("Slug is required.");
      return;
    }
    createMut.mutate({ slug: newSlug, name: newName || undefined });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Preview Sites</h1>
            <p className={styles.subtitle}>Manage your site templates and configurations.</p>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.pill}>Total: {totalCount}</span>
            {isFetching && <span className={styles.mutedSmall}>Refreshing…</span>}
          </div>
        </div>

        {/* List */}
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <h2 className={styles.cardTitle}>All sites</h2>
            <div className={styles.field} style={{ marginBottom: 0, width: '300px' }}>
              <input
                id="searchTerm"
                className={styles.input}
                placeholder="Search by name, slug…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>
          </div>

          <div className={styles.cardBody}>
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
                        <div className={styles.siteName}>{s.name || 'Unnamed Site'}</div>
                        <div className={styles.siteSlug}>/{s.slug}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.rowActions}>
                    <Link to={`/preview-sites/${s.id}`} className={styles.btnPrimaryLink}>
                      Edit
                    </Link>

                    <button
                      className={styles.btnDanger}
                      onClick={() => {
                        if (window.confirm(`Delete "${s.slug}"?`)) deleteMut.mutate(s.id);
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(prev => prev - 1)}
                  className={styles.btn}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className={styles.btn}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Quick Create */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Create New Site</h2>
            <p className={styles.cardSub}>Only slug is required for initialization.</p>
          </div>

          <div className={styles.cardBody}>
            <form onSubmit={handleCreate} className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Slug *</label>
                <input
                  className={styles.input}
                  placeholder="e.g. acme-corp"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Name (optional)</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Acme Corporation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.btnPrimary}
                  type="submit"
                  disabled={createMut.isPending}
                >
                  {createMut.isPending ? "Creating…" : "Create Site"}
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