import { api } from "@/lib/api";
import type { FileContext, UploadedFile } from "@/components/ui/form-file-upload";

interface FileItem {
  fileId?: number;
  id?: number;
  fileUrl?: string;
  url?: string;
  fileName?: string;
  name?: string;
  originalFileName?: string;
  path?: string;
}

const toUploadedFile = (item: FileItem): UploadedFile => ({
  fileId: item.fileId ?? item.id ?? 0,
  fileUrl: item.fileUrl ?? item.url,
  fileName: item.fileName ?? item.originalFileName ?? item.name,
});

export const fileApi = {
  uploadSingle: async (file: File, fileContext: FileContext): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/api/v1/file/upload?fileContext=${fileContext}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const body = response.data as Record<string, unknown>;
    const result = (body.data ?? body) as FileItem;
    return toUploadedFile(result);
  },

  uploadMultiple: async (files: File[], fileContext: FileContext): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("fileContext", fileContext);

    const response = await api.post("/api/v1/file/upload-multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const body = response.data as Record<string, unknown>;
    const result = (body.data ?? body) as FileItem[] | FileItem;

    if (Array.isArray(result)) {
      return result.map(toUploadedFile);
    }

    return [];
  },
};
