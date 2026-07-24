import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, X, FileText, Settings, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-controls";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MultiSelect } from "@/components/ui/multi-select";
import { useDropzone } from "react-dropzone";

const blogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    coverImage: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    tagIds: z.array(z.number()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function BlogCreate() {
    const navigate = useNavigate();
    const params = useParams();
    const id = params.id;
    const queryClient = useQueryClient();
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

    const { control, handleSubmit, reset, watch, setValue } = useForm<BlogFormValues>({
        resolver: zodResolver(blogSchema),
        defaultValues: { title: "", slug: "", coverImage: "", excerpt: "", content: "", tagIds: [], status: "DRAFT" },
    });

    const watchTitle = watch("title");
    const coverImage = watch("coverImage");

    const generateSlug = () => {
        if (!watchTitle) return;
        setIsGeneratingSlug(true);
        const slug = watchTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setValue("slug", slug);
        setTimeout(() => setIsGeneratingSlug(false), 300);
    };

    const { data: tagsData } = useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
            const res = await api.get("/api/v1/admin/tag");
            return res.data?.data ?? res.data;
        },
    });

    const { data: existing } = useQuery({
        queryKey: ["blog", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const res = await api.get(`/api/v1/admin/blog/${id}`);
            return res.data?.data ?? res.data;
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title ?? "",
                slug: existing.slug ?? "",
                coverImage: existing.coverImage ?? "",
                excerpt: existing.excerpt ?? "",
                content: existing.content ?? "",
                tagIds: existing.tags?.map((t: any) => t.id) ?? existing.tagIds ?? [],
                status: existing.status ?? "DRAFT",
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: async (payload: BlogFormValues) => {
            if (id) {
                const res = await api.put(`/api/v1/admin/blog/${id}`, payload);
                return res.data;
            }
            const res = await api.post("/api/v1/admin/blog", payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            navigate("/blogs");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to save blog");
        },
    });

    const onSubmit = (values: BlogFormValues) => {
        mutation.mutate(values);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
        maxFiles: 1,
        multiple: false,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            const file = acceptedFiles[0];
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await api.post("/api/v1/file/upload?fileContext=BLOG", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                const uploaded = res.data?.data ?? res.data;
                const url = uploaded?.fileUrl ?? uploaded?.url ?? uploaded;
                setValue("coverImage", url, { shouldValidate: true });
            } catch {
                toast.error("Failed to upload cover image");
            }
        },
    });

    const removeCover = () => {
        setValue("coverImage", "", { shouldValidate: true });
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/blogs")} className="h-9 w-9 rounded-full border border-border">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{id ? "Edit Blog" : "Create Blog"}</h1>
                    <p className="text-sm text-muted-foreground">{id ? "Update your blog post." : "Write and publish a new blog post."}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg text-foreground">Post Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <FormInput control={control} name="title" label="Title *" placeholder="Enter blog title" />
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slug *</label>
                                        <button type="button" onClick={generateSlug} className="text-xs text-primary font-medium hover:underline">
                                            {isGeneratingSlug ? "Generating..." : "Generate from Title"}
                                        </button>
                                    </div>
                                    <FormInput control={control} name="slug" placeholder="e.g. getting-started-with-spring-boot" />
                                </div>

                                <div className="md:col-span-2">
                                    <FormInput control={control} name="excerpt" label="Excerpt" placeholder="Short description for previews" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg text-foreground">Content</h3>
                            </div>

                            <Controller name="content" control={control} render={({ field }) => (
                                <RichTextEditor value={field.value ?? ""} onChange={field.onChange} placeholder="Start writing..." />
                            )} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <Settings className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg text-foreground">Publishing</h3>
                            </div>

                            <Controller name="status" control={control} render={({ field }) => (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                                    <select {...field} className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="PUBLISHED">PUBLISHED</option>
                                    </select>
                                </div>
                            )} />

                            <Controller name="tagIds" control={control} render={({ field }) => (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</label>
                                    <MultiSelect
                                        options={(tagsData ?? []).map((t: any) => ({ value: t.id, label: t.name }))}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                        placeholder="Select tags..."
                                    />
                                </div>
                            )} />
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <Image className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg text-foreground">Cover Image</h3>
                            </div>

                            {coverImage ? (
                                <div className="relative rounded-lg overflow-hidden border border-border">
                                    <img src={coverImage} alt="Cover" className="w-full h-40 object-cover" />
                                    <button type="button" onClick={removeCover} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div {...getRootProps()} className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 hover:bg-muted/20"}`}>
                                    <input {...getInputProps()} />
                                    <Image className="mb-2 h-8 w-8 text-muted-foreground" />
                                    {isDragActive ? (
                                        <p className="text-sm font-medium text-primary">Drop image here</p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-foreground">Upload cover image</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Single image, up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button type="submit" disabled={mutation.isPending} className="w-full h-10 font-medium">
                                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (id ? "Update Blog" : "Publish Blog")}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate("/blogs")} className="w-full border-border hover:bg-muted h-10">
                                Cancel
                            </Button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}
