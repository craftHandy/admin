import { useEffect } from "react";
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
    fileId: z.union([z.number(), z.string()]).optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryCreate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { previewUrl: localPreview, setPreview, clearPreview } = useLocalFilePreview();

    const { control, handleSubmit, reset, watch, setValue } = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            categoryName: "",
            categoryCode: "",
            description: "",
        },
    });

    const existingFile = watch("fileId");

    const fileSrc = typeof existingFile === "string" && existingFile ? existingFile : null;
    const previewSrc = localPreview ?? fileSrc;

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
            reset({
                categoryName: existing.categoryName ?? "",
                categoryCode: existing.categoryCode ?? "",
                description: existing.description ?? "",
                fileId: existing.fileId ?? "",
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: async (payload: CategoryFormValues) => {
            const body: any = { ...payload };
            if (body.file === "") body.file = undefined;

            if (id) {
                const response = await api.put(`/api/v1/admin//category/${id}`, body);
                return response.data;
            }
            const response = await api.post("/api/v1/admin/add-category", body);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
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
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            setPreview(acceptedFiles[0]);
            try {
                const uploaded = await fileApi.uploadSingle(acceptedFiles[0], "CATEGORY");
                if (uploaded?.fileId) {
                    setValue("fileId", uploaded.fileId, { shouldValidate: true });
                }
            } catch {
                toast.error("Failed to upload image");
            }
        },
    });

    const removeFile = () => {
        clearPreview();
        setValue("fileId", "", { shouldValidate: true });
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
                    {previewSrc ? (
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
                    <Button type="submit" disabled={mutation.isPending} className="min-w-36">
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
