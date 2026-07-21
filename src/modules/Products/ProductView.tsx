import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Ruler,
  Info,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from "@/components/ui/form-controls";

const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  description: z.string().min(1, "Description is required"),
  materialsInput: z.string().default(""),
  craftType: z.string().min(1, "Craft type is required"),
  origin: z.string().min(1, "Origin is required"),
  occasionsInput: z.string().default(""),
  height: z.coerce.number().min(0).default(0.1),
  width: z.coerce.number().min(0).default(0.1),
  depth: z.coerce.number().min(0).default(0.1),
  weight: z.coerce.number().min(0).default(0.1),
  stockStatus: z.string().min(1, "Stock status is required"),
  featured: z.boolean().default(false),
  categoryId: z.coerce.number().int().min(0, "Category ID is required"),
  collectionId: z.coerce.number().int().min(0, "Collection ID is required"),
  images: z.array(
    z.object({
      fileId: z.coerce.number().int().min(1, "File ID must be a positive integer"),
      alt: z.string().min(1, "Alt text is required"),
      isPrimary: z.boolean().default(false),
    })
  ).min(1, "At least one product image is required"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [isEditing, setIsEditing] = useState(() => location.pathname.endsWith("/edit"));

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/product/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const rawProduct = (productData as any)?.data ?? productData;

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      price: 0,
      discountPercentage: 0,
      description: "",
      materialsInput: "",
      craftType: "",
      origin: "",
      occasionsInput: "",
      height: 0.1,
      width: 0.1,
      depth: 0.1,
      weight: 0.1,
      stockStatus: "IN_STOCK",
      featured: false,
      categoryId: 1,
      collectionId: 1,
      images: [{ fileId: 1, alt: "Primary product image", isPrimary: true }],
    },
  });

  useEffect(() => {
    if (rawProduct) {
      reset({
        title: rawProduct.title ?? "",
        slug: rawProduct.slug ?? "",
        price: rawProduct.price ?? 0,
        discountPercentage: rawProduct.discountPercentage ?? 0,
        description: rawProduct.description ?? "",
        materialsInput: Array.isArray(rawProduct.materials) ? rawProduct.materials.join(", ") : "",
        craftType: rawProduct.craftType ?? "",
        origin: rawProduct.origin ?? "",
        occasionsInput: Array.isArray(rawProduct.occasions) ? rawProduct.occasions.join(", ") : "",
        height: rawProduct.height ?? 0.1,
        width: rawProduct.width ?? 0.1,
        depth: rawProduct.depth ?? 0.1,
        weight: rawProduct.weight ?? 0.1,
        stockStatus: rawProduct.stockStatus ?? "IN_STOCK",
        featured: rawProduct.featured ?? false,
        categoryId: rawProduct.categoryId ?? 1,
        collectionId: rawProduct.collectionId ?? 1,
        images: Array.isArray(rawProduct.images) && rawProduct.images.length > 0
          ? rawProduct.images.map((img: any) => ({
              fileId: img.fileId,
              alt: img.alt ?? "",
              isPrimary: img.isPrimary ?? false,
            }))
          : [{ fileId: 1, alt: "Primary product image", isPrimary: true }],
      });
    }
  }, [rawProduct, reset]);

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const watchTitle = watch("title");
  const watchImages = watch("images");

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

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.put(`/api/v1/product/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update product");
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    const materials = data.materialsInput
      ? data.materialsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const occasions = data.occasionsInput
      ? data.occasionsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      title: data.title,
      slug: data.slug,
      price: data.price,
      discountPercentage: data.discountPercentage,
      description: data.description,
      materials,
      craftType: data.craftType,
      origin: data.origin,
      occasions,
      height: data.height,
      width: data.width,
      depth: data.depth,
      weight: data.weight,
      stockStatus: data.stockStatus,
      featured: data.featured,
      categoryId: data.categoryId,
      collectionId: data.collectionId,
      images: data.images.map((img) => ({
        fileId: Number(img.fileId),
        alt: img.alt,
        isPrimary: img.isPrimary,
      })),
    };

    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !rawProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="font-semibold text-lg">Product not found</h3>
        <Button variant="outline" onClick={() => navigate("/products")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")} className="h-9 w-9 rounded-full border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Product" : rawProduct.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update product details below." : `#${rawProduct.id} · ${rawProduct.craftType ?? ""}`}
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Product
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Primary Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormInput control={control} name="title" label="Product Title *" placeholder="Product title" disabled={!isEditing} />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slug *</label>
                    {isEditing && (
                      <button type="button" onClick={generateSlug} className="text-xs text-primary hover:underline">
                        {isGeneratingSlug ? "Generating..." : "Generate from Title"}
                      </button>
                    )}
                  </div>
                  <FormInput control={control} name="slug" placeholder="product-slug" disabled={!isEditing} />
                </div>
                <FormInput control={control} name="price" label="Price ($) *" type="number" step="0.01" disabled={!isEditing} />
                <FormInput control={control} name="discountPercentage" label="Discount (%)" type="number" step="0.01" disabled={!isEditing} />
                <FormTextarea control={control} name="description" label="Description *" className="md:col-span-2" disabled={!isEditing} />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Ruler className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Dimensions & Physical Specs</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormInput control={control} name="height" label="Height (cm)" type="number" step="0.01" disabled={!isEditing} />
                <FormInput control={control} name="width" label="Width (cm)" type="number" step="0.01" disabled={!isEditing} />
                <FormInput control={control} name="depth" label="Depth (cm)" type="number" step="0.01" disabled={!isEditing} />
                <FormInput control={control} name="weight" label="Weight (kg)" type="number" step="0.01" disabled={!isEditing} />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg text-foreground">Product Images</h3>
                </div>
                {isEditing && (
                  <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ fileId: 1, alt: "", isPrimary: false })}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Image
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row items-start md:items-end gap-3 p-3 rounded-lg border bg-muted/20 relative">
                    <div className="w-full md:w-28 space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File ID *</label>
                      <FormInput control={control} name={`images.${index}.fileId` as "images.0.fileId"} type="number" disabled={!isEditing} />
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alt Text *</label>
                      <FormInput control={control} name={`images.${index}.alt` as "images.0.alt"} disabled={!isEditing} />
                    </div>
                    <div className="flex items-center h-10 gap-2">
                      <Controller
                        control={control}
                        name={`images.${index}.isPrimary` as "images.0.isPrimary"}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            id={`view-images.${index}.isPrimary`}
                            checked={Boolean(field.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                watchImages.forEach((_, idx) => {
                                  if (idx !== index) setValue(`images.${idx}.isPrimary`, false);
                                });
                              }
                              field.onChange(e.target.checked);
                            }}
                            className="h-4 w-4 rounded border-border"
                            disabled={!isEditing}
                          />
                        )}
                      />
                      <label htmlFor={`view-images.${index}.isPrimary`} className="text-xs font-medium text-muted-foreground cursor-pointer">Primary</label>
                    </div>
                    {isEditing && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)} className="text-destructive hover:bg-destructive/10" disabled={imageFields.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Layers className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Classification</h3>
              </div>
              <div className="space-y-4">
                <FormSelect
                  control={control}
                  name="stockStatus"
                  label="Stock Status *"
                  options={[
                    { value: "IN_STOCK", label: "In Stock" },
                    { value: "LOW_STOCK", label: "Low Stock" },
                    { value: "OUT_OF_STOCK", label: "Out of Stock" },
                  ]}
                  disabled={!isEditing}
                />
                <FormInput control={control} name="categoryId" label="Category ID *" type="number" disabled={!isEditing} />
                <FormInput control={control} name="collectionId" label="Collection ID *" type="number" disabled={!isEditing} />
                <FormCheckbox control={control} name="featured" label="Feature on Home Page" disabled={!isEditing} />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Attributes</h3>
              </div>
              <div className="space-y-4">
                <FormInput control={control} name="craftType" label="Craft Type *" disabled={!isEditing} />
                <FormInput control={control} name="origin" label="Origin *" disabled={!isEditing} />
                <FormInput control={control} name="materialsInput" label="Materials" description="Comma-separated" disabled={!isEditing} />
                <FormInput control={control} name="occasionsInput" label="Occasions" description="Comma-separated" disabled={!isEditing} />
              </div>
            </div>

            {isEditing && (
              <div className="space-y-3 pt-2">
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                  ) : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { reset(); setIsEditing(false); }} className="w-full">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
