import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { ProductImageUpload } from "@/modules/Products/ProductImageUpload";
import { useCategoryQuery } from "@/shared/api/query";

// Validation schema
const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  price: z.coerce.number().min(0, "Price must be non-negative").nonnegative(),
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
  stockQuantity: z.coerce.number().int().min(0, "Stock quantity is required"),
  featured: z.boolean().default(false),
  categoryId: z.coerce.number().int().min(0, "Category ID is required"),
  // images: z.array(
  //   z.object({
  //     fileId: z.coerce.number().int().min(1, "File ID must be a positive integer"),
  //     alt: z.string().min(1, "Alt text is required"),
  //     isPrimary: z.boolean().default(false),
  //   })
  // ).min(1, "At least one product image is required"),
  images: z.any()
});

type ProductFormValues = z.input<typeof productFormSchema>;

export default function ProductCreate() {
  const navigate = useNavigate();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const { data: categoryData } = useCategoryQuery()
  const categoryOptions = categoryData?.data?.map((item) => ({ label: item?.categoryName, value: item?.id })) ?? []
  // React Hook Form setup
  const {
    handleSubmit,
    control,
    setValue,
    watch,
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

  // Watch fields
  const watchTitle = watch("title");

  // Auto-generate slug from title
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

  // Mutation to create product
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
    // Transform materials and occasions from comma-separated input strings to string arrays
    const materials = data.materialsInput
      ? data.materialsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const occasions = data.occasionsInput
      ? data.occasionsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Construct the exact API payload format
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
      {/* Breadcrumb Header */}
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

          {/* Main Info Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Primary Details Card */}
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

            {/* Specifications Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Ruler className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Dimensions & Physical Specs</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormInput
                  control={control}
                  name="height"
                  label="Height (cm)"
                  type="number"
                  step="0.01"
                />

                <FormInput
                  control={control}
                  name="width"
                  label="Width (cm)"
                  type="number"
                  step="0.01"
                />

                <FormInput
                  control={control}
                  name="depth"
                  label="Depth (cm)"
                  type="number"
                  step="0.01"
                />

                <FormInput
                  control={control}
                  name="weight"
                  label="Weight (kg)"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            {/* Images Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Product Images</h3>
              </div>
              <ProductImageUpload control={control} name="images" />
            </div>

          </div>

          {/* Right Sidebar Form Config (1 col) */}
          <div className="space-y-6">

            {/* Meta & Inventory Settings */}
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

            {/* Extra Attributes (Materials, Occasions) */}
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

                <FormInput
                  control={control}
                  name="materialsInput"
                  label="Materials"
                  placeholder="e.g. Oak Wood, Brass, Glass"
                  description="Comma-separated"
                />

                <FormInput
                  control={control}
                  name="occasionsInput"
                  label="Occasions"
                  placeholder="e.g. Wedding, Anniversary"
                  description="Comma-separated"
                />
              </div>
            </div>

            {/* Action Bar */}
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
