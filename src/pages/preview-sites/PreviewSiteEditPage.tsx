import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { previewSitesApi } from "../../api/previewSites";
import type {
  PreviewSiteDto,
  PreviewSiteUpdateDto,
  ApiError,
  SiteConfigDto,
  HeaderConfigDto,
  FooterConfigDto,
  HomepageConfigDto,
  ContactModalConfigDto,
  AboutConfigDto,
  ProjectLabelsConfigDto,
  GalleryConfigDto,
  MiniProjectDto,
} from "../../api/types";
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
] as const;

type PreviewSiteSection = (typeof sections)[number];

interface EditFormData {
  name: string;
  slug: string;
  site: SiteConfigDto;
  header: HeaderConfigDto;
  footer: FooterConfigDto;
  homepage: HomepageConfigDto;
  contact_modal: ContactModalConfigDto;
  about: AboutConfigDto;
  project: ProjectLabelsConfigDto;
  gallery: GalleryConfigDto;
  months: string[];
  projects_data: Record<string, MiniProjectDto>;
}

type ErrorWithResponse = {
  response?: {
    data?: ApiError;
  };
  message?: string;
};

type EditFormProps = {
  site: PreviewSiteDto;
  onSave: (payload: PreviewSiteUpdateDto) => void;
  isSaving: boolean;
};

const isErrorWithResponse = (error: unknown): error is ErrorWithResponse =>
  typeof error === "object" && error !== null;

const buildFormData = (site: PreviewSiteDto): EditFormData => ({
  name: site.name || "",
  slug: site.slug || "",
  site: site.site || { name: "", email: "", phone: "" },
  header: site.header || { projects: "", about: "", contact: "" },
  footer: site.footer || { contactUs: "", orAt: "", copyright: "" },
  homepage: site.homepage || { noImages: "", images: [] },
  contact_modal: site.contact_modal || {
    title: "",
    namePlaceholder: "",
    emailPlaceholder: "",
    messagePlaceholder: "",
    sendButton: "",
    images: [],
  },
  about: site.about || {
    heroTitle: "",
    heroImg: "",
    section1Title: "",
    section1Desc: "",
    section1Img: "",
    section2Title: "",
    section2Desc: "",
    section3Img: "",
    section3Title1: "",
    section3Desc1: "",
    section3Title2: "",
    section3Desc2: "",
  },
  project: site.project || { untitled: "" },
  gallery: site.gallery || { previous: "", next: "" },
  months: site.months || [],
  projects_data: site.projects_data || {},
});

const PreviewSiteEditForm: React.FC<EditFormProps> = ({ site, onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [formData, setFormData] = useState<EditFormData>(() => buildFormData(site));

  const updateSection = (section: PreviewSiteSection, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

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
              onClick={() => onSave(formData)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <button
              className={`${styles.tabBtn} ${activeTab === "general" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("general")}
            >
              General Info
            </button>

            {sections.map((section) => (
              <button
                key={section}
                className={`${styles.tabBtn} ${activeTab === section ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(section)}
              >
                {section.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </aside>

          <main className={styles.mainContent}>
            {activeTab === "general" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>General Information</h2>

                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Slug *</label>
                  <input
                    className={styles.input}
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                  <p className={styles.help}>Unique identifier used in URLs.</p>
                </div>
              </section>
            )}

            {sections.includes(activeTab as PreviewSiteSection) && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  {activeTab.replace("_", " ").toUpperCase()} Data
                </h2>
                <p className={styles.cardSub}>
                  Edit the {activeTab} configuration.
                </p>

                <JsonEditor
                  id={activeTab}
                  value={formData[activeTab as PreviewSiteSection] as Record<string, unknown>}
                  onChange={(val) =>
                    updateSection(activeTab as PreviewSiteSection, val)
                  }
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

const PreviewSiteEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: site, isLoading, error } = useQuery({
    queryKey: ["previewSite", id],
    queryFn: () => previewSitesApi.get(id!),
    enabled: !!id,
  });

  const updateMut = useMutation({
    mutationFn: (payload: PreviewSiteUpdateDto) => previewSitesApi.update(id!, payload),
    onSuccess: () => {
      toast.success("Site updated successfully!");
      qc.invalidateQueries({ queryKey: ["previewSite", id] });
      qc.invalidateQueries({ queryKey: ["previewSites"] });
    },
    onError: (error: unknown) => {
      if (isErrorWithResponse(error)) {
        toast.error(
          error.response?.data?.message ?? error.message ?? "Failed to update site."
        );
        return;
      }

      toast.error("Failed to update site.");
    },
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading site.</div>;
  }

  if (!site) {
    return <div className={styles.error}>Site not found.</div>;
  }

  return (
    <PreviewSiteEditForm
      key={`${site.id}-${site.updatedAt ?? ""}`}
      site={site}
      onSave={(payload) => updateMut.mutate(payload)}
      isSaving={updateMut.isPending}
    />
  );
};

export default PreviewSiteEditPage;
