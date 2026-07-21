import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-controls";

const categoryFormSchema = z.object({
    categoryName: z.string().min(1, "Category name is required"),
    categoryCode: z.string().min(1, "Category code is required"),
    description: z.string().min(1, "Description is required"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryCreate() {
    const navigate = useNavigate();
    const { control, handleSubmit } = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            categoryName: "",
            categoryCode: "",
            description: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: CategoryFormValues) => {
            const response = await api.post("/api/v1/admin/add-category", payload);
            return response.data;
        },
        onSuccess: () => {
            navigate("/categories");
        },
        onError: (error: any) => {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || "Failed to create category");
        },
    });

    const onSubmit = (data: CategoryFormValues) => {
        mutation.mutate(data);
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
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Category</h1>
                    <p className="text-sm text-muted-foreground">Add a new category with its code.</p>
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

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending} className="min-w-36">
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Category"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
