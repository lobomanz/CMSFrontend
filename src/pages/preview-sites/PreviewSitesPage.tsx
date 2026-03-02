import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

import { previewSitesApi } from "../../api/previewSites";
import type {
  PreviewSiteDto,
  PreviewSiteCreationData,
} from "../../api/types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

// --- Zod Schemas ---
const miniProjectSectionSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  paragraph: z.string().min(1, "Paragraph is required"),
});

const miniProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sections: z.array(miniProjectSectionSchema).length(3, "Exactly 3 sections are required"),
  galleryFiles: z
    .instanceof(FileList)
    .refine((fileList) => fileList.length > 0, "At least one gallery file is required")
    .optional(),
  sortOrder: z.number().int().nullable().optional(), // Updated to allow null
});

const previewSiteCreationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  logoFile: z
    .instanceof(FileList)
    .refine((fileList) => fileList.length > 0, "Logo file is required")
    .optional(),
  miniProjects: z.array(miniProjectSchema).optional(),
});

type PreviewSiteFormInputs = z.infer<typeof previewSiteCreationSchema>;

const PreviewSitesPage: React.FC = () => {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
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

  const {
    fields: miniProjectFields,
    append: appendMiniProject,
    remove: removeMiniProject,
  } = useFieldArray({
    control,
    name: "miniProjects",
  });

  const createMut = useMutation({
    mutationFn: (data: PreviewSiteCreationData) => previewSitesApi.createWithMiniProjects(data),
    onSuccess: () => {
      toast.success("Preview site created successfully!");
      reset(); // Reset the form fields after successful submission
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
    // Convert FileList to File for logoFile and galleryFiles
    const submissionData: PreviewSiteCreationData = {
      ...data,
      logoFile: data.logoFile?.[0] ?? null,
      miniProjects: data.miniProjects?.map((mp) => ({
        ...mp,
        galleryFiles: Array.from(mp.galleryFiles || []),
        sortOrder: mp.sortOrder === undefined ? null : mp.sortOrder, // Fix: convert undefined to null for sortOrder
      })),
    };
    createMut.mutate(submissionData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h1 className="text-xl font-semibold">Preview Sites</h1>

        <div className="mt-4 flex gap-2">
          <Input
            id="searchTerm" // Added id
            className="w-full"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && <p className="mt-4 text-sm text-gray-600">Loading...</p>}
        {error && <p className="mt-4 text-sm text-red-600">Failed to load sites.</p>}

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
                <Button
                  className="bg-red-600 text-white text-sm"
                  onClick={() => deleteMut.mutate(s.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {!isLoading && sites.length === 0 && (
            <p className="py-6 text-sm text-gray-600">No preview sites found.</p>
          )}
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Create New Preview Site</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Main Site Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Input id="name" placeholder="Name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Input id="slug" placeholder="Slug (unique)" {...register("slug")} />
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div>
            <textarea
              id="description" // Added id
              className="border rounded-md p-2 w-full"
              placeholder="Description (optional)"
              rows={3}
              {...register("description")}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label htmlFor="logoFile" className="text-sm text-gray-700 block mb-1">Logo (optional)</label>
            <Input id="logoFile" type="file" accept="image/*" {...register("logoFile")} />
            {errors.logoFile && <p className="text-red-500 text-sm mt-1">{errors.logoFile.message}</p>}
          </div>

          {/* Mini-Projects Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-md font-semibold">Mini-Projects (Optional)</h3>
            {miniProjectFields.map((item, mpIndex) => (
              <div key={item.id} className="p-3 border rounded-md space-y-3 relative">
                <Button
                  type="button"
                  onClick={() => removeMiniProject(mpIndex)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                >
                  X
                </Button>
                <div>
                  <Input
                    id={`miniProjects.${mpIndex}.title`} // Added id
                    placeholder={`Mini-Project ${mpIndex + 1} Title`}
                    {...register(`miniProjects.${mpIndex}.title`)}
                  />
                  {errors.miniProjects?.[mpIndex]?.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.miniProjects[mpIndex]?.title?.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    id={`miniProjects.${mpIndex}.sortOrder`} // Added id
                    type="number"
                    placeholder={`Mini-Project ${mpIndex + 1} Sort Order (optional)`}
                    {...register(`miniProjects.${mpIndex}.sortOrder`, { valueAsNumber: true })}
                  />
                  {errors.miniProjects?.[mpIndex]?.sortOrder && (
                    <p className="text-red-500 text-sm mt-1">{errors.miniProjects[mpIndex]?.sortOrder?.message}</p>
                  )}
                </div>

                <div className="space-y-2 pl-2 border-l">
                  <p className="text-sm font-medium">Sections (exactly 3)</p>
                  {Array.from({ length: 3 }).map((_, secIndex) => (
                    <div key={secIndex} className="space-y-1">
                      <Input
                        id={`miniProjects.${mpIndex}.sections.${secIndex}.heading`} // Added id
                        placeholder={`Section ${secIndex + 1} Heading`}
                        {...register(`miniProjects.${mpIndex}.sections.${secIndex}.heading`)}
                      />
                      {errors.miniProjects?.[mpIndex]?.sections?.[secIndex]?.heading && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.miniProjects[mpIndex]?.sections?.[secIndex]?.heading?.message}
                        </p>
                      )}
                      <textarea
                        id={`miniProjects.${mpIndex}.sections.${secIndex}.paragraph`} // Added id
                        className="border rounded-md p-2 w-full text-sm"
                        placeholder={`Section ${secIndex + 1} Paragraph`}
                        rows={2}
                        {...register(`miniProjects.${mpIndex}.sections.${secIndex}.paragraph`)}
                      />
                      {errors.miniProjects?.[mpIndex]?.sections?.[secIndex]?.paragraph && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.miniProjects[mpIndex]?.sections?.[secIndex]?.paragraph?.message}
                        </p>
                      )}
                    </div>
                  ))}
                  {/* Error for sections array length */}
                  {errors.miniProjects?.[mpIndex]?.sections && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.miniProjects[mpIndex]?.sections?.message as string}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label htmlFor={`miniProjects.${mpIndex}.galleryFiles`} className="text-sm text-gray-700 block mb-1">Gallery Files (multiple, optional)</label>
                  <Input
                    id={`miniProjects.${mpIndex}.galleryFiles`} // Added id
                    type="file"
                    multiple
                    {...register(`miniProjects.${mpIndex}.galleryFiles`)}
                  />
                  {errors.miniProjects?.[mpIndex]?.galleryFiles && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.miniProjects[mpIndex]?.galleryFiles?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() =>
                appendMiniProject({
                  title: "",
                  sections: [{ heading: "", paragraph: "" }, { heading: "", paragraph: "" }, { heading: "", paragraph: "" }],
                  sortOrder: null, // Default to null
                })
              }
              className="bg-blue-500 text-white"
            >
              Add Mini-Project
            </Button>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white mt-4">
            {isSubmitting ? "Creating..." : "Create Preview Site with Mini-Projects"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PreviewSitesPage;