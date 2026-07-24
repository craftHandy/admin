import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-controls";
import { Loader2, X } from "lucide-react";
import { api } from "@/lib/api";

const resourceFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

type ResourceFormProps = {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    resourceName: string;
    endpoint: string;
    selectedItem?: { id: number; name: string } | null;
    onSuccess: () => void;
};

export function ResourceForm({
    open,
    onOpenChange,
    resourceName,
    endpoint,
    selectedItem,
    onSuccess,
}: ResourceFormProps) {
    const isEditing = Boolean(selectedItem);
    const { control, handleSubmit, reset } = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceFormSchema),
        defaultValues: {
            name: selectedItem?.name ?? "",
        },
    });

    useEffect(() => {
        reset({ name: selectedItem?.name ?? "" });
    }, [selectedItem, reset]);

    const mutation = useMutation({
        mutationFn: async (payload: ResourceFormValues) => {
            if (isEditing && selectedItem) {
                const response = await api.put(`${endpoint}/${selectedItem.id}`, payload);
                return response.data;
            }
            const response = await api.post(endpoint, payload);
            return response.data;
        },
        onSuccess: () => {
            onSuccess();
            onOpenChange(false);
        },
        onError: (error: any) => {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || `Failed to ${isEditing ? "update" : "create"} ${resourceName.toLowerCase()}`);
        },
    });

    const onSubmit = (values: ResourceFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-lg font-semibold text-foreground">
                                {isEditing ? `Edit ${resourceName}` : `Create ${resourceName}`}
                            </Dialog.Title>
                            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                                {isEditing ? `Update the ${resourceName.toLowerCase()} name.` : `Add a new ${resourceName.toLowerCase()} to the system.`}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="icon" aria-label="Close">
                                <X className="h-4 w-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormInput
                            control={control}
                            name="name"
                            label="Name *"
                            placeholder={`Enter ${resourceName.toLowerCase()} name`}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditing ? "Updating..." : "Creating..."}
                                    </>
                                ) : isEditing ? (
                                    "Update"
                                ) : (
                                    "Create"
                                )}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
