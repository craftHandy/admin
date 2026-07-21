import { api } from "@/lib/api";
import type { Category } from "@/modules/Categories/CategoryList";
import type { ApiResponse } from "@/utils/interface";
import { useQuery } from "@tanstack/react-query";


export const useCategoryQuery = () => {
    return useQuery<ApiResponse<Category[]>>({
        queryKey: ["category"],
        queryFn: async () => {
            const response = await api.get("/api/v1/category/all");
            return response.data;
        },
    });
};