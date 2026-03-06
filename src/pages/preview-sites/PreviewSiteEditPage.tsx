import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams} from "react-router-dom";
import { toast } from "react-hot-toast";
import { previewSitesApi } from "../../api/previewSites";
import JsonEditor from "../../components/ui/JsonEditor";
import styles from "./PreviewSiteEditPage.module.css";

const sections = [
  "site",
  "header",
  "footer",
  "homepage",
  "contact_modal",
  "about",
  "project",
  "gallery",
  "months",
  "projects_data",
];

const PreviewSiteEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("general");

  // State for all fields
  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    description: "",
    site: {},
    header: {},
    footer: {},
    homepage: {},
    contact_modal: {},
    about: {},
    project: {},
    gallery: {},
    months: {},
    projects_data: {},
  });

  const { data: site, isLoading, error } = useQuery({
    queryKey: ["previewSite", id],
    queryFn: () => previewSitesApi.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || "",
        slug: site.slug || "",
        description: site.description || "",
        site: site.site || {},
        header: site.header || {},
        footer: site.footer || {},
        homepage: site.homepage || {},
        contact_modal: site.contact_modal || {},
        about: site.about || {},
        project: site.project || {},
        gallery: site.gallery || {},
        months: site.months || {},
        projects_data: site.projects_data || {},
      });
    }
  }, [site]);

  const updateMut = useMutation({
    mutationFn: (payload: any) => previewSitesApi.update(id!, payload),
    onSuccess: () => {
      toast.success("Site updated successfully!");
      qc.invalidateQueries({ queryKey: ["previewSite", id] });
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Failed to update site.");
    },
  });

  const handleSave = () => {
    updateMut.mutate(formData);
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error loading site.</div>;
  if (!site) return <div className={styles.error}>Site not found.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumbs}>
              <Link to="/preview-sites" className={styles.breadcrumbLink}>
                Preview Sites
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>{site.slug}</span>
            </div>
            <h1 className={styles.title}>Edit Preview Site</h1>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Sidebar / Tabs */}
          <aside className={styles.sidebar}>
            <button
              className={`${styles.tabBtn} ${activeTab === "general" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("general")}
            >
              General Info
            </button>
            {sections.map((s) => (
              <button
                key={s}
                className={`${styles.tabBtn} ${activeTab === s ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(s)}
              >
                {s.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main className={styles.mainContent}>
            {activeTab === "general" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>General Information</h2>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Slug *</label>
                  <input
                    className={styles.input}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                  <p className={styles.help}>Unique identifier used in URLs.</p>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </section>
            )}

            {sections.includes(activeTab) && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>{activeTab.replace("_", " ").toUpperCase()} Data</h2>
                <p className={styles.cardSub}>Flexible JSON structure for {activeTab}.</p>
                <JsonEditor
                  id={activeTab}
                  value={formData[activeTab]}
                  onChange={(val) => setFormData({ ...formData, [activeTab]: val })}
                  rows={20}
                />
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PreviewSiteEditPage;