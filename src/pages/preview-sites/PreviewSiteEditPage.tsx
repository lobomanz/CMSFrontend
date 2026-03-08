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
import ImageUpload from "../../components/ui/ImageUpload";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
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


interface EditFormData {
  name: string;
  slug: string;
  logoUrl?: string;
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
  logoUrl: site.logoUrl || "",
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

  const updateSection = (section: keyof EditFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const updateNestedField = (section: keyof EditFormData, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const handleAddImage = (section: "homepage" | "contact_modal", url: string) => {
    if (!url) return;
    const currentImages = (formData[section] as HomepageConfigDto | ContactModalConfigDto).images || [];
    updateNestedField(section, "images", [...currentImages, url]);
  };

  const handleRemoveImage = (section: "homepage" | "contact_modal", index: number) => {
    const currentImages = (formData[section] as HomepageConfigDto | ContactModalConfigDto).images || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    updateNestedField(section, "images", newImages);
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
            <Button
              variant="primary"
              onClick={() => onSave(formData)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
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

                <FormField label="Name" htmlFor="name">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateSection("name", e.target.value)}
                  />
                </FormField>

                <FormField label="Slug *" htmlFor="slug" >
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => updateSection("slug", e.target.value)}
                  />
                </FormField>

                <FormField label="Logo">
                  <ImageUpload
                    value={formData.logoUrl}
                    onChange={(url) => updateSection("logoUrl", url)}
                  />
                </FormField>
              </section>
            )}

            {activeTab === "site" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Site Configuration</h2>
                <FormField label="Site Name" htmlFor="siteName">
                  <Input
                    id="siteName"
                    value={formData.site.name}
                    onChange={(e) => updateNestedField("site", "name", e.target.value)}
                  />
                </FormField>
                <FormField label="Email" htmlFor="siteEmail">
                  <Input
                    id="siteEmail"
                    value={formData.site.email}
                    onChange={(e) => updateNestedField("site", "email", e.target.value)}
                  />
                </FormField>
                <FormField label="Phone" htmlFor="sitePhone">
                  <Input
                    id="sitePhone"
                    value={formData.site.phone}
                    onChange={(e) => updateNestedField("site", "phone", e.target.value)}
                  />
                </FormField>
              </section>
            )}

            {activeTab === "header" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Header Labels</h2>
                <FormField label="Projects Label" htmlFor="headerProjects">
                  <Input
                    id="headerProjects"
                    value={formData.header.projects}
                    onChange={(e) => updateNestedField("header", "projects", e.target.value)}
                  />
                </FormField>
                <FormField label="About Label" htmlFor="headerAbout">
                  <Input
                    id="headerAbout"
                    value={formData.header.about}
                    onChange={(e) => updateNestedField("header", "about", e.target.value)}
                  />
                </FormField>
                <FormField label="Contact Label" htmlFor="headerContact">
                  <Input
                    id="headerContact"
                    value={formData.header.contact}
                    onChange={(e) => updateNestedField("header", "contact", e.target.value)}
                  />
                </FormField>
              </section>
            )}

            {activeTab === "footer" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Footer Content</h2>
                <FormField label="Contact Us Title" htmlFor="footerContactUs">
                  <Input
                    id="footerContactUs"
                    value={formData.footer.contactUs}
                    onChange={(e) => updateNestedField("footer", "contactUs", e.target.value)}
                  />
                </FormField>
                <FormField label="Or At Text" htmlFor="footerOrAt">
                  <Input
                    id="footerOrAt"
                    value={formData.footer.orAt}
                    onChange={(e) => updateNestedField("footer", "orAt", e.target.value)}
                  />
                </FormField>
                <FormField label="Copyright Text" htmlFor="footerCopyright">
                  <Input
                    id="footerCopyright"
                    value={formData.footer.copyright}
                    onChange={(e) => updateNestedField("footer", "copyright", e.target.value)}
                  />
                </FormField>
              </section>
            )}

            {activeTab === "homepage" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Homepage Settings</h2>
                <FormField label="No Images Message" htmlFor="hpNoImages">
                  <Input
                    id="hpNoImages"
                    value={formData.homepage.noImages}
                    onChange={(e) => updateNestedField("homepage", "noImages", e.target.value)}
                  />
                </FormField>
                <div className={styles.imageGridSection}>
                  <label className={styles.label}>Slider/Gallery Images</label>
                  <div className={styles.imageGrid}>
                    {formData.homepage.images.map((img, idx) => (
                      <div key={idx} className={styles.imageItem}>
                        <img src={img} alt="" />
                        <button onClick={() => handleRemoveImage("homepage", idx)}>×</button>
                      </div>
                    ))}
                    <ImageUpload onChange={(url) => handleAddImage("homepage", url)} />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "contact_modal" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Contact Modal</h2>
                <FormField label="Title" htmlFor="cmTitle">
                  <Input
                    id="cmTitle"
                    value={formData.contact_modal.title}
                    onChange={(e) => updateNestedField("contact_modal", "title", e.target.value)}
                  />
                </FormField>
                <FormField label="Name Placeholder" htmlFor="cmName">
                  <Input
                    id="cmName"
                    value={formData.contact_modal.namePlaceholder}
                    onChange={(e) => updateNestedField("contact_modal", "namePlaceholder", e.target.value)}
                  />
                </FormField>
                <FormField label="Email Placeholder" htmlFor="cmEmail">
                  <Input
                    id="cmEmail"
                    value={formData.contact_modal.emailPlaceholder}
                    onChange={(e) => updateNestedField("contact_modal", "emailPlaceholder", e.target.value)}
                  />
                </FormField>
                <FormField label="Message Placeholder" htmlFor="cmMsg">
                  <Textarea
                    id="cmMsg"
                    value={formData.contact_modal.messagePlaceholder}
                    onChange={(e) => updateNestedField("contact_modal", "messagePlaceholder", e.target.value)}
                  />
                </FormField>
                <FormField label="Send Button Text" htmlFor="cmSend">
                  <Input
                    id="cmSend"
                    value={formData.contact_modal.sendButton}
                    onChange={(e) => updateNestedField("contact_modal", "sendButton", e.target.value)}
                  />
                </FormField>
                <div className={styles.imageGridSection}>
                  <label className={styles.label}>Modal Images</label>
                  <div className={styles.imageGrid}>
                    {formData.contact_modal.images.map((img, idx) => (
                      <div key={idx} className={styles.imageItem}>
                        <img src={img} alt="" />
                        <button onClick={() => handleRemoveImage("contact_modal", idx)}>×</button>
                      </div>
                    ))}
                    <ImageUpload onChange={(url) => handleAddImage("contact_modal", url)} />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "about" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>About Page Configuration</h2>
                
                <h3 className={styles.subTitle}>Hero Section</h3>
                <FormField label="Hero Title" htmlFor="aboutHeroTitle">
                  <Input
                    id="aboutHeroTitle"
                    value={formData.about.heroTitle}
                    onChange={(e) => updateNestedField("about", "heroTitle", e.target.value)}
                  />
                </FormField>
                <FormField label="Hero Image">
                  <ImageUpload
                    value={formData.about.heroImg}
                    onChange={(url) => updateNestedField("about", "heroImg", url)}
                  />
                </FormField>

                <hr className={styles.divider} />
                <h3 className={styles.subTitle}>Section 1</h3>
                <FormField label="Title" htmlFor="aboutS1Title">
                  <Input
                    id="aboutS1Title"
                    value={formData.about.section1Title}
                    onChange={(e) => updateNestedField("about", "section1Title", e.target.value)}
                  />
                </FormField>
                <FormField label="Description" htmlFor="aboutS1Desc">
                  <Textarea
                    id="aboutS1Desc"
                    value={formData.about.section1Desc}
                    onChange={(e) => updateNestedField("about", "section1Desc", e.target.value)}
                  />
                </FormField>
                <FormField label="Image">
                  <ImageUpload
                    value={formData.about.section1Img}
                    onChange={(url) => updateNestedField("about", "section1Img", url)}
                  />
                </FormField>

                <hr className={styles.divider} />
                <h3 className={styles.subTitle}>Section 2</h3>
                <FormField label="Title" htmlFor="aboutS2Title">
                  <Input
                    id="aboutS2Title"
                    value={formData.about.section2Title}
                    onChange={(e) => updateNestedField("about", "section2Title", e.target.value)}
                  />
                </FormField>
                <FormField label="Description" htmlFor="aboutS2Desc">
                  <Textarea
                    id="aboutS2Desc"
                    value={formData.about.section2Desc}
                    onChange={(e) => updateNestedField("about", "section2Desc", e.target.value)}
                  />
                </FormField>

                <hr className={styles.divider} />
                <h3 className={styles.subTitle}>Section 3</h3>
                <FormField label="Main Image">
                  <ImageUpload
                    value={formData.about.section3Img}
                    onChange={(url) => updateNestedField("about", "section3Img", url)}
                  />
                </FormField>
                <div className={styles.grid2}>
                  <div>
                    <FormField label="Subtitle 1" htmlFor="aboutS3T1">
                      <Input
                        id="aboutS3T1"
                        value={formData.about.section3Title1}
                        onChange={(e) => updateNestedField("about", "section3Title1", e.target.value)}
                      />
                    </FormField>
                    <FormField label="Description 1" htmlFor="aboutS3D1">
                      <Textarea
                        id="aboutS3D1"
                        value={formData.about.section3Desc1}
                        onChange={(e) => updateNestedField("about", "section3Desc1", e.target.value)}
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Subtitle 2" htmlFor="aboutS3T2">
                      <Input
                        id="aboutS3T2"
                        value={formData.about.section3Title2}
                        onChange={(e) => updateNestedField("about", "section3Title2", e.target.value)}
                      />
                    </FormField>
                    <FormField label="Description 2" htmlFor="aboutS3D2">
                      <Textarea
                        id="aboutS3D2"
                        value={formData.about.section3Desc2}
                        onChange={(e) => updateNestedField("about", "section3Desc2", e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "project" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Project Labels</h2>
                <FormField label="Untitled Project Label" htmlFor="pUntitled">
                  <Input
                    id="pUntitled"
                    value={formData.project.untitled}
                    onChange={(e) => updateNestedField("project", "untitled", e.target.value)}
                  />
                </FormField>
              </section>
            )}

            {activeTab === "gallery" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Gallery Navigation</h2>
                <FormField label="Previous Label" htmlFor="galPrev">
                  <Input
                    id="galPrev"
                    value={formData.gallery.previous}
                    onChange={(e) => updateNestedField("gallery", "previous", e.target.value)}
                  />
                </FormField>
                <FormField label="Next Label" htmlFor="galNext">
                  <Input
                    id="galNext"
                    value={formData.gallery.next}
                    onChange={(e) => updateNestedField("gallery", "next", e.target.value)}
                  />
                </FormField>
              </section>
            )}

            {activeTab === "months" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Months Labels</h2>
                <div className={styles.grid2}>
                  {formData.months.map((month, idx) => (
                    <FormField key={idx} label={`Month ${idx + 1}`} htmlFor={`month-${idx}`}>
                      <Input
                        id={`month-${idx}`}
                        value={month}
                        onChange={(e) => {
                          const newMonths = [...formData.months];
                          newMonths[idx] = e.target.value;
                          updateSection("months", newMonths);
                        }}
                      />
                    </FormField>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "projects_data" && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Projects Data</h2>
                <p className={styles.cardSub}>Individual project configurations.</p>
                <div className={styles.projectsList}>
                  {Object.entries(formData.projects_data).map(([key, project]) => (
                    <div key={key} className={styles.projectItem}>
                      <h4 className={styles.projectKey}>{key}</h4>
                      <FormField label="Title" htmlFor={`proj-${key}-title`}>
                        <Input
                          id={`proj-${key}-title`}
                          value={project.title}
                          onChange={(e) => {
                            const newData = { ...formData.projects_data };
                            newData[key] = { ...project, title: e.target.value };
                            updateSection("projects_data", newData);
                          }}
                        />
                      </FormField>
                      <FormField label="Thumbnail">
                        <ImageUpload
                          value={project.thumbnailUrl}
                          onChange={(url) => {
                            const newData = { ...formData.projects_data };
                            newData[key] = { ...project, thumbnailUrl: url };
                            updateSection("projects_data", newData);
                          }}
                        />
                      </FormField>
                    </div>
                  ))}
                </div>
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
