import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type FileContext = "USER_PROFILE" | "CATEGORY" | "PRODUCT" | "BLOG";

export interface UploadedFile {
  fileId: number;
  fileUrl?: string;
  fileName?: string;
}

type FormFileUploadProps = {
  onUpload: (files: File[], fileContext: FileContext) => Promise<UploadedFile[]>;
  fileContext: FileContext;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  autoUpload?: boolean;
  className?: string;
  disabled?: boolean;
};

export function FormFileUpload({
  onUpload,
  fileContext,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  autoUpload = false,
  className,
  disabled,
}: FormFileUploadProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploaded, setUploaded] = React.useState<UploadedFile[]>([]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prev) => {
        const remaining = maxFiles - prev.length;
        return [...prev, ...acceptedFiles.slice(0, remaining)];
      });
    },
    [maxFiles]
  );

  const handleUpload = React.useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const result = await onUpload(files, fileContext);
      setUploaded((prev) => [...prev, ...result]);
      setFiles([]);
    } finally {
      setUploading(false);
    }
  }, [files, onUpload, fileContext]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
    disabled: disabled || uploading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // auto upload when a single file is selected and autoUpload is enabled
  React.useEffect(() => {
    if (autoUpload && files.length > 0) {
      // for single-file mode we upload immediately
      handleUpload();
    }
  }, [autoUpload, files, handleUpload]);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/40 hover:bg-muted/20",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm font-medium text-primary">Drop files here</p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Drag & drop files here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Max {maxFiles} file{maxFiles > 1 ? "s" : ""}, up to{" "}
              {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(file.size / 1024)} KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-destructive"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {!autoUpload && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
                disabled={uploading}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Uploaded files:</p>
          {uploaded.map((f) => (
            <div
              key={f.fileId}
              className="flex items-center gap-2 rounded-md bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-600"
            >
              <span className="font-medium">#{f.fileId}</span>
              {f.fileName && <span className="text-muted-foreground">{f.fileName}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
