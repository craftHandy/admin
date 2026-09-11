import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { fileApi } from "@/lib/file-api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-controls";
import { useDropzone } from "react-dropzone";
import { useLocalFilePreview } from "@/hooks/use-local-file-preview";

const categoryFormSchema = z.object({
    categoryName: z.string().min(1, "Category name is required"),
    categoryCode: z.string().min(1, "Category code is required"),
    description: z.string().min(1, "Description is required"),
    fileId: z.number().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryCreate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { previewUrl: localPreview, setPreview, clearPreview } = useLocalFilePreview();

    const { control, handleSubmit, reset, setValue } = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            categoryName: "",
            categoryCode: "",
            description: "",
            fileId: null,
        },
    });

    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const previewSrc = localPreview ?? existingImageUrl;

    const { data: existing } = useQuery({
        queryKey: ["category", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const response = await api.get(`/api/v1/admin/category/${id}`);
            return response.data?.data ?? response.data;
        },
    });

    useEffect(() => {
        if (existing) {
            const fileId = typeof existing.file === "object" && existing.file !== null
                ? existing.file.id
                : (existing.fileId ?? null);
            const fileUrl = typeof existing.file === "object" && existing.file !== null
                ? (existing.file.key ?? null)
                : (typeof existing.file === "string" ? existing.file : null);
            reset({
                categoryName: existing.categoryName ?? "",
                categoryCode: existing.categoryCode ?? "",
                description: existing.description ?? "",
                fileId: fileId ?? null,
            });
            setExistingImageUrl(fileUrl);
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: async (payload: CategoryFormValues) => {
            const body: Record<string, unknown> = { ...payload };
            if (!body.fileId) delete body.fileId;

            if (id) {
                const response = await api.put(`/api/v1/admin/category/${id}`, body);
                return response.data;
            }
            const response = await api.post("/api/v1/admin/add-category", body);
            return response.data;
        },
        onSuccess: () => {
            toast.success(id ? "Category updated successfully" : "Category created successfully");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["category", id] });
            navigate("/categories");
        },
        onError: (error: any) => {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || "Failed to save category");
        },
    });

    const onSubmit = (data: CategoryFormValues) => {
        mutation.mutate(data);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
        maxFiles: 1,
        multiple: false,
        disabled: isUploading,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0 || isUploading) return;
            const file = acceptedFiles[0];
            setIsUploading(true);
            try {
                const uploaded = await fileApi.uploadSingle(file, "CATEGORY");
                if (uploaded?.fileId) {
                    setPreview(file);
                    setValue("fileId", uploaded.fileId, { shouldValidate: true });
                    if (uploaded.fileUrl) setExistingImageUrl(uploaded.fileUrl);
                } else {
                    toast.error("Failed to upload image");
                }
            } catch {
                toast.error("Failed to upload image");
            } finally {
                setIsUploading(false);
            }
        },
    });

    const removeFile = () => {
        clearPreview();
        setExistingImageUrl(null);
        setValue("fileId", null, { shouldValidate: true });
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/categories")}
                    className="h-9 w-9 rounded-full border border-border"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{id ? "Edit Category" : "Create Category"}</h1>
                    <p className="text-sm text-muted-foreground">{id ? "Update the category details." : "Add a new category with its code."}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
                <FormInput
                    control={control}
                    name="categoryName"
                    label="Category Name *"
                    placeholder="E.g., Handcrafted"
                />

                <FormInput
                    control={control}
                    name="categoryCode"
                    label="Category Code *"
                    placeholder="E.g., HC"
                />

                <FormInput
                    control={control}
                    name="description"
                    label="Description *"
                    placeholder="Enter a short description"
                />

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image</label>
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 px-4 py-10">
                            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-foreground">Uploading...</p>
                            <p className="mt-1 text-xs text-muted-foreground">Please wait while your image uploads</p>
                        </div>
                    ) : previewSrc ? (
                        <div className="relative rounded-lg overflow-hidden border border-border">
                            <img src={previewSrc} alt="Category" className="w-full h-40 object-cover" />
                            <button type="button" onClick={removeFile} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div {...getRootProps()} className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 hover:bg-muted/20"}`}>
                            <input {...getInputProps()} />
                            <svg className="mb-2 h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            {isDragActive ? <p className="text-sm font-medium text-primary">Drop image here</p> : <><p className="text-sm font-medium text-foreground">Drag & drop an image, or click to browse</p><p className="mt-1 text-xs text-muted-foreground">Single image</p></>}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate("/categories")}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending || isUploading} className="min-w-36">
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            id ? "Update Category" : "Create Category"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
