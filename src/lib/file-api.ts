import { api } from "@/lib/api";
import type { FileContext, UploadedFile } from "@/components/ui/form-file-upload";

interface FileItem {
  fileId?: number;
  id?: number;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  name?: string;
}

export const fileApi = {
  uploadMultiple: async (files: File[], fileContext: FileContext): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("fileContext", fileContext);

    const response = await api.post("/api/v1/file/multiple-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const body = response.data as Record<string, unknown>;
    const result = (body.data ?? body) as FileItem[] | FileItem;

    if (Array.isArray(result)) {
      return result.map((item) => ({
        fileId: item.fileId ?? item.id ?? 0,
        fileUrl: item.fileUrl ?? item.url,
        fileName: item.fileName ?? item.name,
      }));
    }

    return [];
  },
};
