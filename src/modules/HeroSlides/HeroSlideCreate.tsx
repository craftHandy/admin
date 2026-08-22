import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { fileApi } from "@/lib/file-api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, X, Image, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, FormCheckbox } from "@/components/ui/form-controls";
import { useLocalFilePreview } from "@/hooks/use-local-file-preview";

const heroSlideSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    fileId: z.number().optional().nullable(),
    backgroundImageUrl: z.string().optional().nullable(),
    active: z.boolean(),
});

type HeroSlideFormValues = z.infer<typeof heroSlideSchema>;

export default function HeroSlideCreate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const { previewUrl: localPreview, setPreview, clearPreview } = useLocalFilePreview();

    const { control, handleSubmit, reset, watch, setValue } = useForm<HeroSlideFormValues>({
        resolver: zodResolver(heroSlideSchema),
        defaultValues: {
            title: "",
            subtitle: "",
            ctaText: "",
            ctaLink: "",
            fileId: null,
            backgroundImageUrl: null,
            active: true,
        },
    });

    const backgroundImageUrl = watch("backgroundImageUrl");

    const { data: existing } = useQuery({
        queryKey: ["hero-slide", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const response = await api.get(`/api/v1/admin/hero-slide/${id}`);
            return response.data?.data ?? response.data;
        },
    });

    useEffect(() => {
        if (existing) {
            reset({
                title: existing.title ?? "",
                subtitle: existing.subtitle ?? "",
                ctaText: existing.ctaText ?? "",
                ctaLink: existing.ctaLink ?? "",
                fileId: existing.fileId ?? null,
                backgroundImageUrl: existing.backgroundImageUrl ?? null,
                active: existing.active ?? true,
            });
        }
    }, [existing, reset]);

    const mutation = useMutation({
        mutationFn: async (payload: HeroSlideFormValues) => {
            const body: Record<string, unknown> = { ...payload };
            delete body.backgroundImageUrl;
            if (!body.fileId) delete body.fileId;

            if (id) {
                const response = await api.put(`/api/v1/admin/hero-slide/${id}`, body);
                return response.data;
            }
            const response = await api.post("/api/v1/admin/hero-slide", body);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
            navigate("/hero-slides");
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { message?: string } } };
            const message = error instanceof Error ? error.message : "Failed to save hero slide";
            console.error(error);
            toast.error(apiError.response?.data?.message || message);
        },
    });

    const handleUpload = async (file: File) => {
        setPreview(file);
        setIsUploading(true);
        try {
            const item = await fileApi.uploadSingle(file, "HERO_SLIDE");
            if (item?.fileId) {
                setValue("fileId", item.fileId, { shouldValidate: true });
            }
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        clearPreview();
        setValue("fileId", null, { shouldValidate: true });
        setValue("backgroundImageUrl", null, { shouldValidate: true });
    };

    const onSubmit = (values: HeroSlideFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/hero-slides")} className="h-9 w-9 rounded-full border border-border">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{id ? "Edit Hero Slide" : "Create Hero Slide"}</h1>
                    <p className="text-sm text-muted-foreground">{id ? "Update the hero slide details." : "Add a new slide to the homepage banner."}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
                <FormInput control={control} name="title" label="Title *" placeholder="E.g., Summer Collection 2024" />

                <FormTextarea
                    control={control}
                    name="subtitle"
                    label="Subtitle"
                    placeholder="E.g., Discover handcrafted treasures"
                    rows={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput control={control} name="ctaText" label="CTA Text" placeholder="E.g., Shop Now" />
                    <FormInput control={control} name="ctaLink" label="CTA Link" placeholder="E.g., /products" />
                </div>

                <FormCheckbox
                    control={control}
                    name="active"
                    label="Active"
                    description="Show this slide on the homepage banner."
                />

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Background Image</label>
                    {localPreview || backgroundImageUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-border">
                            <img
                                src={localPreview ?? backgroundImageUrl ?? ""}
                                alt="Background"
                                className="w-full h-52 object-cover"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                                aria-label="Remove image"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleUpload(file);
                            }}
                            className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors hover:border-muted-foreground/40 hover:bg-muted/20"
                        >
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.gif,.webp"
                                className="sr-only"
                                disabled={isUploading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(file);
                                    e.target.value = "";
                                }}
                            />
                            {isUploading ? (
                                <>
                                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="text-sm font-medium text-foreground">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Image className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium text-foreground">Drag & drop an image, or click to browse</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Single image, PNG/JPG/WebP up to 5MB</p>
                                </>
                            )}
                        </label>
                    )}
                    {!(localPreview || backgroundImageUrl) && !isUploading && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ImageOff className="h-3.5 w-3.5" /> No image uploaded yet.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate("/hero-slides")}>Cancel</Button>
                    <Button type="submit" disabled={mutation.isPending} className="min-w-36">
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            id ? "Update Hero Slide" : "Create Hero Slide"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
