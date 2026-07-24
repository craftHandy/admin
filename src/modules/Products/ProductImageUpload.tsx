import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileApi } from "@/lib/file-api";

type ImageItem = {
  fileId: number;
  alt: string;
  isPrimary: boolean;
};

type ProductImageUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
};

export function ProductImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name }: ProductImageUploadProps<TFieldValues, TName>) {
  const [uploading, setUploading] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const images: ImageItem[] = field.value ?? [];

        const setImages = (next: ImageItem[]) => {
          field.onChange(next);
        };

        const handleUpload = async (files: File[]) => {
          if (files.length === 0) return;
          setUploading(true);
          try {
            const uploaded = await fileApi.uploadMultiple(files, "PRODUCT");
            const newItems: ImageItem[] = uploaded.map((f, i) => ({
              fileId: f.fileId,
              alt: "",
              isPrimary: images.length === 0 && i === 0,
            }));
            setImages([...images, ...newItems]);
          } finally {
            setUploading(false);
          }
        };

        const removeImage = (index: number) => {
          const next = images.filter((_, i) => i !== index);
          if (images[index]?.isPrimary && next.length > 0) {
            next[0].isPrimary = true;
          }
          setImages(next);
        };

        const setPrimary = (index: number) => {
          setImages(
            images.map((img, i) => ({ ...img, isPrimary: i === index }))
          );
        };

        const updateAlt = (index: number, alt: string) => {
          setImages(
            images.map((img, i) => (i === index ? { ...img, alt } : img))
          );
        };

        return (
          <div className="space-y-4">
            <DropzoneArea onUpload={handleUpload} uploading={uploading} />

            {fieldState.error && typeof fieldState.error.message === "string" && (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}

            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No images uploaded yet. Drag & drop or click above.
              </p>
            ) : (
              <div className="space-y-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-start md:items-end gap-3 p-3 rounded-lg border bg-muted/20"
                  >
                    <div className="w-full md:w-24 h-16 rounded-md bg-muted border overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={`https://backend-4gle.onrender.com/api/v1/file/download/${img.fileId}`}
                        alt={img.alt || "Product"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Alt Text *
                      </label>
                      <Input
                        value={img.alt}
                        onChange={(e) => updateAlt(index, e.target.value)}
                        placeholder="Image description"
                      />
                    </div>

                    <div className="flex items-center h-10 gap-2 select-none">
                      <input
                        type="checkbox"
                        id={`img-primary-${index}`}
                        checked={img.isPrimary}
                        onChange={() => setPrimary(index)}
                        className="h-4 w-4 rounded border-border text-primary"
                      />
                      <label
                        htmlFor={`img-primary-${index}`}
                        className="text-xs font-medium text-muted-foreground cursor-pointer"
                      >
                        Primary
                      </label>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="text-destructive hover:bg-destructive/10 h-10 w-10 md:self-end self-start"
                      disabled={images.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

function DropzoneArea({
  onUpload,
  uploading,
}: {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onUpload(accepted);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/40 hover:bg-muted/20",
        uploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <Upload className="mb-1.5 h-6 w-6 text-muted-foreground" />
      )}
      {isDragActive ? (
        <p className="text-sm font-medium text-primary">Drop images here</p>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Uploading..." : "Drag & drop images, or click to browse"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            PNG, JPG or WebP up to 5MB
          </p>
        </>
      )}
    </div>
  );
}
