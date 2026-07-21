import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { Category } from "./CategoryList";
import type { ApiResponse } from "@/utils/interface";

export default function CategoryView() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isLoading, isError, error } = useQuery<ApiResponse<Category>>({
        queryKey: ["category", id],
        queryFn: async () => {
            const response = await api.get(`/api/v1/category/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const category = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading category...</p>
                </div>
            </div>
        );
    }

    if (isError || !category) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <h3 className="font-semibold text-lg text-foreground">Category not found</h3>
                <p className="text-sm text-muted-foreground">
                    {(error as any)?.response?.data?.message || error?.message || "Unable to load this category."}
                </p>
                <Button variant="outline" onClick={() => navigate("/categories")}>Back to Categories</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/categories")} className="h-9 w-9 rounded-full border">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{category.categoryName}</h1>
                    <p className="text-sm text-muted-foreground">#{category.id} · {category.categoryCode}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
                        <p className="mt-2 text-sm leading-7 text-foreground">
                            {category.description || "No description provided for this category."}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border bg-background/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Name</p>
                            <p className="mt-2 font-medium text-foreground">{category.categoryName}</p>
                        </div>
                        <div className="rounded-lg border bg-background/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Code</p>
                            <p className="mt-2 font-medium text-foreground">{category.categoryCode}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</p>
                    {category.file ? (
                        <img
                            src={category.file}
                            alt={category.categoryName}
                            className="mt-4 h-64 w-full rounded-lg object-cover"
                        />
                    ) : (
                        <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed bg-background/60">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <ImageIcon className="h-8 w-8" />
                                <p className="text-sm">No image available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
