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

const resolveFileUrl = (item: Record<string, unknown>): string | undefined => {
  const direct =
    (item.fileUrl as string | undefined) ??
    (item.url as string | undefined) ??
    (item.imageUrl as string | undefined) ??
    (item.key as string | undefined) ??
    (item.path as string | undefined) ??
    (item.previewUrl as string | undefined);
  if (direct) return direct;
  const file = item.file as Record<string, unknown> | string | undefined;
  if (typeof file === "string") return file;
  if (file && typeof file === "object") {
    return (
      (file.fileUrl as string | undefined) ??
      (file.url as string | undefined) ??
      (file.key as string | undefined) ??
      (file.path as string | undefined)
    );
  }
  return undefined;
};

const toUploadedFile = (item: FileItem & Record<string, any>): UploadedFile => ({
  fileId: Number(item.fileId ?? item.id ?? 0),
  fileUrl: resolveFileUrl(item),
  fileName: (item.fileName ?? item.originalFileName ?? item.name ?? undefined) as string | undefined,
});

export const fileApi = {
  uploadSingle: async (file: File, fileContext: FileContext): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/api/v1/file/upload?fileContext=${fileContext}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const body = response.data as Record<string, any>;
    const result = (body.data ?? body) as FileItem & Record<string, any>;
    return toUploadedFile(result);
  },

  uploadMultiple: async (files: File[], fileContext: FileContext): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("fileContext", fileContext);

    const response = await api.post("/api/v1/file/upload-multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const body = response.data as Record<string, any>;
    const raw: any =
      body.data ?? body.files ?? body.content ?? body.result ?? body;
    const list: Array<FileItem & Record<string, any>> = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, any>)?.files)
        ? ((raw as Record<string, any>).files as Array<FileItem & Record<string, any>>)
        : raw && typeof raw === "object"
          ? [raw as FileItem & Record<string, any>]
          : [];

    return list
      .map(toUploadedFile)
      .filter((item) => Number(item.fileId) > 0);
  },
};
