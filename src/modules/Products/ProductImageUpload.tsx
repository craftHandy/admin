// import { useState, useCallback, useEffect, useRef } from "react";
// import { useDropzone } from "react-dropzone";
// import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
// import { Upload, X, Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { fileApi } from "@/lib/file-api";

// type ImageItem = {
//   fileId: number;
//   alt: string;
//   isPrimary: boolean;
//   previewUrl?: string;
// };

// type ProductImageUploadProps<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// > = {
//   control: Control<TFieldValues>;
//   name: TName;
// };

// export function ProductImageUpload<
//   TFieldValues extends FieldValues = FieldValues,
//   TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// >({ control, name }: ProductImageUploadProps<TFieldValues, TName>) {
//   const [uploading, setUploading] = useState(false);
//   const createdUrlsRef = useRef<string[]>([]);

//   useEffect(
//     () => () => {
//       createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
//     },
//     []
//   );

//   return (
//     <Controller
//       control={control}
//       name={name}
//       render={({ field, fieldState }) => {
//         const images: ImageItem[] = field.value ?? [];

//         const setImages = (next: ImageItem[]) => {
//           field.onChange(next);
//         };

//         const handleUpload = async (files: File[]) => {
//           if (files.length === 0) return;
//           setUploading(true);
//           const baseIndex = images.length;
//           const previewItems: ImageItem[] = files.map((file, i) => {
//             const url = URL.createObjectURL(file);
//             createdUrlsRef.current.push(url);
//             return {
//               fileId: 0,
//               alt: "",
//               isPrimary: images.length === 0 && i === 0,
//               previewUrl: url,
//             };
//           });
//           setImages([...images, ...previewItems]);

//           try {
//             const uploaded = await fileApi.uploadMultiple(files, "PRODUCT");
//             const withFileIds = [...images, ...previewItems].map((img, idx) => {
//               const offset = idx - baseIndex;
//               if (offset >= 0 && offset < uploaded.length && uploaded[offset]?.fileId) {
//                 return { ...img, fileId: uploaded[offset].fileId };
//               }
//               return img;
//             });
//             setImages(withFileIds);
//           } catch {
//             setImages([...images, ...previewItems].filter((img) => img.fileId !== 0));
//           } finally {
//             setUploading(false);
//           }
//         };

//         const removeImage = (index: number) => {
//           const removed = images[index];
//           if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
//           const next = images.filter((_, i) => i !== index);
//           if (images[index]?.isPrimary && next.length > 0) {
//             next[0].isPrimary = true;
//           }
//           setImages(next);
//         };

//         const setPrimary = (index: number) => {
//           setImages(
//             images.map((img, i) => ({ ...img, isPrimary: i === index }))
//           );
//         };

//         const updateAlt = (index: number, alt: string) => {
//           setImages(
//             images.map((img, i) => (i === index ? { ...img, alt } : img))
//           );
//         };

//         return (
//           <div className="space-y-4">
//             <DropzoneArea onUpload={handleUpload} uploading={uploading} />

//             {fieldState.error && typeof fieldState.error.message === "string" && (
//               <p className="text-xs text-destructive">{fieldState.error.message}</p>
//             )}

//             {images.length === 0 ? (
//               <p className="text-sm text-muted-foreground text-center py-4">
//                 No images uploaded yet. Drag & drop or click above.
//               </p>
//             ) : (
//               <div className="space-y-3">
//                 {images.map((img, index) => (
//                   <div
//                     key={index}
//                     className="flex flex-col md:flex-row items-start md:items-end gap-3 p-3 rounded-lg border bg-muted/20"
//                   >
//                     <div className="w-full md:w-24 h-16 rounded-md bg-muted border overflow-hidden flex items-center justify-center shrink-0">
//                       {img.previewUrl ? (
//                         <img
//                           src={img.previewUrl}
//                           alt={img.alt || "Product"}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <span className="text-xs text-muted-foreground">#{img.fileId}</span>
//                       )}
//                     </div>

//                     <div className="flex-1 w-full space-y-1">
//                       <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//                         Alt Text *
//                       </label>
//                       <Input
//                         value={img.alt}
//                         onChange={(e) => updateAlt(index, e.target.value)}
//                         placeholder="Image description"
//                       />
//                     </div>

//                     <div className="flex items-center h-10 gap-2 select-none">
//                       <input
//                         type="checkbox"
//                         id={`img-primary-${index}`}
//                         checked={img.isPrimary}
//                         onChange={() => setPrimary(index)}
//                         className="h-4 w-4 rounded border-border text-primary"
//                       />
//                       <label
//                         htmlFor={`img-primary-${index}`}
//                         className="text-xs font-medium text-muted-foreground cursor-pointer"
//                       >
//                         Primary
//                       </label>
//                     </div>

//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => removeImage(index)}
//                       className="text-destructive hover:bg-destructive/10 h-10 w-10 md:self-end self-start"
//                       disabled={images.length === 1}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         );
//       }}
//     />
//   );
// }

// function DropzoneArea({
//   onUpload,
//   uploading,
// }: {
//   onUpload: (files: File[]) => Promise<void>;
//   uploading: boolean;
// }) {
//   const onDrop = useCallback(
//     (accepted: File[]) => {
//       onUpload(accepted);
//     },
//     [onUpload]
//   );

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
//     maxSize: 5 * 1024 * 1024,
//     disabled: uploading,
//   });

//   return (
//     <div
//       {...getRootProps()}
//       className={cn(
//         "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
//         isDragActive
//           ? "border-primary bg-primary/5"
//           : "border-border hover:border-muted-foreground/40 hover:bg-muted/20",
//         uploading && "pointer-events-none opacity-60"
//       )}
//     >
//       <input {...getInputProps()} />
//       {uploading ? (
//         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//       ) : (
//         <Upload className="mb-1.5 h-6 w-6 text-muted-foreground" />
//       )}
//       {isDragActive ? (
//         <p className="text-sm font-medium text-primary">Drop images here</p>
//       ) : (
//         <>
//           <p className="text-sm font-medium text-foreground">
//             {uploading ? "Uploading..." : "Drag & drop images, or click to browse"}
//           </p>
//           <p className="mt-0.5 text-xs text-muted-foreground">
//             PNG, JPG or WebP up to 5MB
//           </p>
//         </>
//       )}
//     </div>
//   );
// }
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { fileApi } from "@/lib/file-api";

import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                              Image Type                                    */
/* -------------------------------------------------------------------------- */

export type ProductImageItem = {
  fileId: number;
  alt: string;
  isPrimary: boolean;
  previewUrl?: string;
  url?: string;
  fileUrl?: string;
  imageUrl?: string;
  path?: string;
  key?: string;
  file?: string | { key?: string; url?: string; fileUrl?: string; path?: string; id?: number } | null;
};

export const resolveProductImageUrl = (
  image: ProductImageItem | Record<string, unknown> | null | undefined,
): string | undefined => {
  if (!image || typeof image !== "object") return undefined;
  const item = image as Record<string, unknown>;
  const preview = item.previewUrl as string | undefined;
  if (preview) return preview;
  for (const field of ["url", "fileUrl", "imageUrl", "path", "key"] as const) {
    const value = item[field] as string | undefined;
    if (typeof value === "string" && value.length > 0) return value;
  }
  const file = item.file as unknown;
  if (typeof file === "string" && file.length > 0) return file;
  if (file && typeof file === "object") {
    const nested = file as Record<string, unknown>;
    for (const field of ["fileUrl", "url", "key", "path", "previewUrl"] as const) {
      const value = nested[field] as string | undefined;
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return undefined;
};

export const getProductImageFileId = (image: unknown): number => {
  if (!image || typeof image !== "object") return 0;
  const item = image as Record<string, unknown>;
  const direct =
    item.fileId ?? item.file_id ?? item.id;
  const nestedFile = item.file as Record<string, unknown> | undefined;
  const nestedId =
    nestedFile && typeof nestedFile === "object"
      ? (nestedFile.id ?? nestedFile.fileId)
      : undefined;
  return Number(direct ?? nestedId ?? 0);
};

/* -------------------------------------------------------------------------- */
/*                           Props                                            */
/* -------------------------------------------------------------------------- */

type ProductImageUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> =
    FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;

  /**
   * Optional function to resolve an existing
   * fileId to an actual image URL.
   */
  getFileUrl?: (
    fileId: number,
  ) => string | undefined;

  /**
   * Allows disabling upload controls.
   */
  disabled?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                           Component                                        */
/* -------------------------------------------------------------------------- */

export function ProductImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> =
    FieldPath<TFieldValues>,
>({
  control,
  name,
  getFileUrl,
  disabled = false,
}: ProductImageUploadProps<
  TFieldValues,
  TName
>) {
  const [uploading, setUploading] =
    useState(false);

  /**
   * Track only object URLs created by this
   * component.
   */
  const createdUrlsRef =
    useRef<Set<string>>(new Set());

  /* ------------------------------------------------------------------------ */
  /*                              Cleanup                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach(
        (url) => {
          URL.revokeObjectURL(url);
        },
      );

      createdUrlsRef.current.clear();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                              Render                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field,
        fieldState,
      }) => {
        const images: ProductImageItem[] =
          Array.isArray(field.value)
            ? field.value
            : [];

        /* ------------------------------------------------------------------ */
        /*                         Set Images                                  */
        /* ------------------------------------------------------------------ */

        const setImages = (
          nextImages: ProductImageItem[],
        ) => {
          field.onChange(nextImages);
        };

        /* ------------------------------------------------------------------ */
        /*                           Upload                                    */
        /* ------------------------------------------------------------------ */

        const handleUpload = async (
          files: File[],
        ) => {
          if (
            disabled ||
            uploading ||
            files.length === 0
          ) {
            return;
          }

          setUploading(true);

          /**
           * Remember where the newly uploaded
           * images start.
           */
          const baseIndex =
            images.length;

          /**
           * Create previews immediately so
           * the user sees the image while
           * uploading.
           */
          const previewItems: ProductImageItem[] =
            files.map(
              (file, index) => {
                const previewUrl =
                  URL.createObjectURL(
                    file,
                  );

                createdUrlsRef.current.add(
                  previewUrl,
                );

                return {
                  fileId: 0,
                  alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
                  isPrimary:
                    images.length ===
                      0 &&
                    index === 0,
                  previewUrl,
                };
              },
            );

          /**
           * Immediately add previews.
           */
          setImages([
            ...images,
            ...previewItems,
          ]);

          try {
            const uploaded =
              await fileApi.uploadMultiple(
                files,
                "PRODUCT",
              );

            /**
             * Map returned file IDs
             * back to the preview items.
             */
            const currentImages = [
              ...images,
              ...previewItems,
            ];

            const updatedImages =
              currentImages.map(
                (
                  image,
                  index,
                ) => {
                  const offset =
                    index -
                    baseIndex;

                  if (
                    offset >= 0 &&
                    offset <
                      uploaded.length
                  ) {
                    const uploadedFile =
                      uploaded[
                        offset
                      ];

                    if (
                      uploadedFile?.fileId
                    ) {
                      return {
                        ...image,
                        fileId:
                          Number(
                            uploadedFile.fileId,
                          ),
                        fileUrl:
                          uploadedFile.fileUrl ??
                          image.fileUrl ??
                          image.previewUrl,
                      };
                    }
                  }

                  return image;
                },
              );

            setImages(
              updatedImages,
            );
          } catch (error) {
            toast.error("Image upload failed. Please try again.");
            console.error(
              "Product image upload failed:",
              error,
            );

            /**
             * Remove failed uploads.
             */
            const failedPreviewUrls =
              previewItems
                .map(
                  (image) =>
                    image.previewUrl,
                )
                .filter(
                  (
                    url,
                  ): url is string =>
                    Boolean(url),
                );

            failedPreviewUrls.forEach(
              (url) => {
                URL.revokeObjectURL(
                  url,
                );

                createdUrlsRef.current.delete(
                  url,
                );
              },
            );

            setImages(images);

            field.onChange(images);
          } finally {
            setUploading(false);
          }
        };

        /* ------------------------------------------------------------------ */
        /*                            Remove                                   */
        /* ------------------------------------------------------------------ */

        const removeImage = (
          index: number,
        ) => {
          if (disabled) {
            return;
          }

          const removed =
            images[index];

          /**
           * Revoke local preview.
           */
          if (
            removed?.previewUrl &&
            removed.previewUrl.startsWith(
              "blob:",
            )
          ) {
            URL.revokeObjectURL(
              removed.previewUrl,
            );

            createdUrlsRef.current.delete(
              removed.previewUrl,
            );
          }

          const nextImages =
            images.filter(
              (_, imageIndex) =>
                imageIndex !==
                index,
            );

          /**
           * If primary image was
           * removed, make first image
           * primary.
           */
          if (
            removed?.isPrimary &&
            nextImages.length > 0
          ) {
            nextImages[0] = {
              ...nextImages[0],
              isPrimary: true,
            };
          }

          setImages(
            nextImages,
          );
        };

        /* ------------------------------------------------------------------ */
        /*                         Set Primary                                 */
        /* ------------------------------------------------------------------ */

        const setPrimary = (
          index: number,
        ) => {
          if (disabled) {
            return;
          }

          setImages(
            images.map(
              (
                image,
                imageIndex,
              ) => ({
                ...image,
                isPrimary:
                  imageIndex ===
                  index,
              }),
            ),
          );
        };

        /* ------------------------------------------------------------------ */
        /*                           Alt Text                                  */
        /* ------------------------------------------------------------------ */

        const updateAlt = (
          index: number,
          alt: string,
        ) => {
          if (disabled) {
            return;
          }

          setImages(
            images.map(
              (
                image,
                imageIndex,
              ) =>
                imageIndex ===
                index
                  ? {
                      ...image,
                      alt,
                    }
                  : image,
            ),
          );
        };

        /* ------------------------------------------------------------------ */
        /*                       Resolve Image URL                             */
        /* ------------------------------------------------------------------ */

        const resolveImageUrl = (
          image: ProductImageItem,
        ) => {
          const resolved = resolveProductImageUrl(image);
          if (resolved) return resolved;
          if (
            image.fileId &&
            getFileUrl
          ) {
            return getFileUrl(
              image.fileId,
            );
          }
          return undefined;
        };

        return (
          <div className="space-y-4">
            {/* -------------------------------------------------------------- */}
            {/* Dropzone                                                        */}
            {/* -------------------------------------------------------------- */}

            <DropzoneArea
              onUpload={
                handleUpload
              }
              uploading={
                uploading
              }
              disabled={
                disabled
              }
            />

            {/* -------------------------------------------------------------- */}
            {/* Validation Error                                               */}
            {/* -------------------------------------------------------------- */}

            {fieldState.error &&
              typeof fieldState
                .error.message ===
                "string" && (
                <p className="text-xs text-destructive">
                  {
                    fieldState
                      .error
                      .message
                  }
                </p>
              )}

            {/* -------------------------------------------------------------- */}
            {/* Empty State                                                     */}
            {/* -------------------------------------------------------------- */}

            {images.length ===
            0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
                <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  No images uploaded
                  yet.
                </p>

                {!disabled && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Drag & drop or
                    click above.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {images.map(
                  (
                    image,
                    index,
                  ) => {
                    const imageUrl =
                      resolveImageUrl(
                        image,
                      );

                    return (
                      <div
                        key={`${image.fileId}-${index}`}
                        className={cn(
                          "flex flex-col gap-3 rounded-lg border bg-muted/20 p-3",
                          "md:flex-row md:items-end",
                        )}
                      >
                        {/* -------------------------------------------------- */}
                        {/* Image Preview                                      */}
                        {/* -------------------------------------------------- */}

                        <div className="flex h-16 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted md:w-24">
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                image.alt ||
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <ImageIcon className="h-5 w-5" />

                              <span className="text-[10px]">
                                #
                                {
                                  image.fileId
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* Alt Text                                            */}
                        {/* -------------------------------------------------- */}

                        <div className="w-full flex-1 space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Alt Text *
                          </label>

                          <Input
                            value={
                              image.alt
                            }
                            onChange={(
                              event,
                            ) =>
                              updateAlt(
                                index,
                                event
                                  .target
                                  .value,
                              )
                            }
                            placeholder="Image description"
                            disabled={
                              disabled
                            }
                          />
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* Primary                                             */}
                        {/* -------------------------------------------------- */}

                        <div className="flex h-10 select-none items-center gap-2">
                          <input
                            type="checkbox"
                            id={`img-primary-${image.fileId}-${index}`}
                            checked={
                              image.isPrimary
                            }
                            onChange={() =>
                              setPrimary(
                                index,
                              )
                            }
                            disabled={
                              disabled
                            }
                            className="h-4 w-4 rounded border-border text-primary"
                          />

                          <label
                            htmlFor={`img-primary-${image.fileId}-${index}`}
                            className={cn(
                              "text-xs font-medium text-muted-foreground",
                              !disabled &&
                                "cursor-pointer",
                            )}
                          >
                            Primary
                          </label>
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* Remove                                             */}
                        {/* -------------------------------------------------- */}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeImage(
                              index,
                            )
                          }
                          disabled={
                            disabled ||
                            images.length ===
                              1
                          }
                          className="h-10 w-10 self-start text-destructive hover:bg-destructive/10 md:self-end"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                             Dropzone                                      */
/* -------------------------------------------------------------------------- */

function DropzoneArea({
  onUpload,
  uploading,
  disabled = false,
}: {
  onUpload: (
    files: File[],
  ) => Promise<void>;

  uploading: boolean;

  disabled?: boolean;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void onUpload(
        acceptedFiles,
      );
    },
    [onUpload],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,

    accept: {
      "image/*": [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
      ],
    },

    maxSize:
      5 * 1024 * 1024,

    multiple: true,

    disabled:
      disabled ||
      uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors",

        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/40 hover:bg-muted/20",

        (disabled ||
          uploading) &&
          "pointer-events-none cursor-not-allowed opacity-60",
      )}
    >
      <input
        {...getInputProps()}
      />

      {uploading ? (
        <Loader2 className="mb-1.5 h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <Upload className="mb-1.5 h-6 w-6 text-muted-foreground" />
      )}

      {isDragActive ? (
        <p className="text-sm font-medium text-primary">
          Drop images here
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            {uploading
              ? "Uploading..."
              : disabled
                ? "Image upload disabled"
                : "Drag & drop images, or click to browse"}
          </p>

          {!disabled && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              PNG, JPG or WebP up
              to 5MB
            </p>
          )}
        </>
      )}
    </div>
  );
}