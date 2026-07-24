import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Ruler,
  Info,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from "@/components/ui/form-controls";
import { MultiSelect } from "@/components/ui/multi-select";
import { ProductImageUpload } from "@/modules/Products/ProductImageUpload";
import { useCategoryQuery } from "@/shared/api/query";

const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  price: z.coerce.number().min(0, "Price must be non-negative").nonnegative(),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  description: z.string().min(1, "Description is required"),
  materials: z.array(z.string()).default([]),
  craftType: z.string().min(1, "Craft type is required"),
  origin: z.string().min(1, "Origin is required"),
  occasions: z.array(z.string()).default([]),
  height: z.coerce.number().min(0).default(0.1),
  width: z.coerce.number().min(0).default(0.1),
  depth: z.coerce.number().min(0).default(0.1),
  weight: z.coerce.number().min(0).default(0.1),
  stockStatus: z.string().min(1, "Stock status is required"),
  stockQuantity: z.coerce.number().int().min(0, "Stock quantity is required"),
  featured: z.boolean().default(false),
  categoryId: z.coerce.number().int().min(0, "Category ID is required"),
  images: z.any()
});

type ProductFormValues = z.input<typeof productFormSchema>;

export default function ProductCreate() {
  const navigate = useNavigate();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const { data: categoryData } = useCategoryQuery()
  const categoryOptions = categoryData?.data?.map((item) => ({ label: item?.categoryName, value: item?.id })) ?? []

  const { data: materialsData } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/material");
      return res.data?.data ?? res.data;
    },
  });
  const materialOptions = (materialsData ?? []).map((m: any) => ({ value: m.name, label: m.name }));

  const { data: occasionsData } = useQuery({
    queryKey: ["occasions"],
    queryFn: async () => {
      const res = await api.get("/api/v1/admin/occasion");
      return res.data?.data ?? res.data;
    },
  });
  const occasionOptions = (occasionsData ?? []).map((o: any) => ({ value: o.name, label: o.name }));

  const {
    handleSubmit,
    control,
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      price: 0,
      discountPercentage: 0,
      description: "",
      materials: [],
      craftType: "",
      origin: "",
      occasions: [],
      height: 0,
      width: 0,
      depth: 0,
      weight: 0,
      stockStatus: "IN_STOCK",
      stockQuantity: 0,
      featured: false,
      categoryId: 0,
      images: [],
    },
  });

  const watchTitle = watch("title");

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
      const response = await api.post("/api/v1/admin/product", payload);
      return response.data;
    },
    onSuccess: () => {
      navigate("/products");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to create product"
      );
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    const payload = {
      title: data.title,
      slug: data.slug,
      price: data.price,
      discountPercentage: data.discountPercentage,
      description: data.description,
      materials: data.materials,
      craftType: data.craftType,
      origin: data.origin,
      occasions: data.occasions,
      height: data.height,
      width: data.width,
      depth: data.depth,
      weight: data.weight,
      stockStatus: data.stockStatus,
      stockQuantity: Number(data.stockQuantity),
      featured: data.featured,
      categoryId: data.categoryId,
      images: data.images.map((img: any) => ({
        fileId: Number(img.fileId),
        alt: img.alt,
        isPrimary: img.isPrimary,
      })),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
          className="h-9 w-9 rounded-full border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Product</h1>
          <p className="text-sm text-muted-foreground">Add a new unique handmade item to the catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Primary Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <FormInput
                    control={control}
                    name="title"
                    label="Product Title *"
                    placeholder="E.g., Handcrafted Wooden Vase"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product Slug *
                    </label>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      {isGeneratingSlug ? "Generating..." : "Generate from Title"}
                    </button>
                  </div>
                  <FormInput
                    control={control}
                    name="slug"
                    placeholder="e.g. handcrafted-wooden-vase"
                  />
                </div>

                <div className="space-y-1">
                  <FormInput
                    control={control}
                    name="price"
                    label="Price ($) *"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-1">
                  <FormInput
                    control={control}
                    name="discountPercentage"
                    label="Discount Percentage (%)"
                    type="number"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <FormTextarea
                  control={control}
                  name="description"
                  label="Description *"
                  placeholder="Write a descriptive details about how the product was crafted, its features, and details..."
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Ruler className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Dimensions & Physical Specs</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormInput control={control} name="height" label="Height (cm)" type="number" step="0.01" />
                <FormInput control={control} name="width" label="Width (cm)" type="number" step="0.01" />
                <FormInput control={control} name="depth" label="Depth (cm)" type="number" step="0.01" />
                <FormInput control={control} name="weight" label="Weight (kg)" type="number" step="0.01" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Product Images</h3>
              </div>
              <ProductImageUpload control={control} name="images" />
            </div>

          </div>

          <div className="space-y-6">

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
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
                />

                <FormSelect
                  control={control}
                  name="categoryId"
                  label="Category *"
                  options={categoryOptions}
                />

                <FormInput
                  control={control}
                  name="stockQuantity"
                  label="Stock Quantity *"
                  type="number"
                  placeholder="0"
                />

                <FormCheckbox
                  control={control}
                  name="featured"
                  label="Feature on Home Page"
                  className="pt-2 border-t border-border/60"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Attributes</h3>
              </div>

              <div className="space-y-4">
                <FormInput
                  control={control}
                  name="craftType"
                  label="Craft Type *"
                  placeholder="e.g. Woodcarving, Pottery"
                />

                <FormInput
                  control={control}
                  name="origin"
                  label="Origin Country/Region *"
                  placeholder="e.g. Nepal, Morocco"
                />

                <Controller name="materials" control={control} render={({ field }) => (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Materials</label>
                    <MultiSelect<string>
                      options={materialOptions}
                      selected={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Select materials..."
                    />
                  </div>
                )} />

                <Controller name="occasions" control={control} render={({ field }) => (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Occasions</label>
                    <MultiSelect<string>
                      options={occasionOptions}
                      selected={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Select occasions..."
                    />
                  </div>
                )} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 h-10 font-medium"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  "Publish Product"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
                className="w-full border-border hover:bg-muted h-10"
              >
                Cancel
              </Button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
