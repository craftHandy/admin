import * as React from "react";
import { Controller } from "react-hook-form";
import type {
    Control,
    FieldPath,
    FieldValues,
    RegisterOptions,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type CommonFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    control: Control<TFieldValues>;
    name: TName;
    label?: React.ReactNode;
    rules?: RegisterOptions<TFieldValues, TName>;
    className?: string;
    inputClassName?: string;
    description?: React.ReactNode;
    disabled?: boolean;
};

type FormInputProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = CommonFieldProps<TFieldValues, TName> & {
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    step?: string;
    min?: number;
    max?: number;
    autoComplete?: string;
    value?: string | number;
    onValueChange?: (value: string | number) => void;
};

export function FormInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    rules,
    className,
    inputClassName,
    description,
    disabled,
    type = "text",
    placeholder,
    step,
    min,
    max,
    autoComplete,
    value,
    onValueChange,
}: FormInputProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => {
                const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                    const nextValue = type === "number" ? event.target.value : event.target.value;
                    field.onChange(nextValue);
                    if (onValueChange) {
                        onValueChange(nextValue);
                    }
                };

                return (
                    <div className={cn("space-y-1", className)}>
                        {label ? (
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {label}
                            </label>
                        ) : null}
                        <Input
                            {...field}
                            type={type}
                            placeholder={placeholder}
                            step={step}
                            min={min}
                            max={max}
                            autoComplete={autoComplete}
                            disabled={disabled}
                            value={value ?? field.value ?? ""}
                            onChange={handleChange}
                            onBlur={field.onBlur}
                            className={cn(inputClassName, fieldState.error ? "border-destructive!" : "border-border")}
                        />
                        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                        {fieldState.error ? (
                            <p className="text-xs text-destructive mt-0.5">{fieldState.error.message}</p>
                        ) : null}
                    </div>
                );
            }}
        />
    );
}

type FormTextareaProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = CommonFieldProps<TFieldValues, TName> & {
    placeholder?: string;
    rows?: number;
    className?: string;
};

export function FormTextarea<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    rules,
    className,
    description,
    disabled,
    placeholder,
    rows = 4,
}: FormTextareaProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div className={cn("space-y-1", className)}>
                    {label ? (
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {label}
                        </label>
                    ) : null}
                    <textarea
                        {...field}
                        placeholder={placeholder}
                        rows={rows}
                        disabled={disabled}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        className={cn(
                            "flex min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            fieldState.error ? "border-destructive!" : "border-border"
                        )}
                    />
                    {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                    {fieldState.error ? (
                        <p className="text-xs text-destructive mt-0.5">{fieldState.error.message}</p>
                    ) : null}
                </div>
            )}
        />
    );
}

type FormSelectProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = CommonFieldProps<TFieldValues, TName> & {
    placeholder?: string;
    options: Array<{ value: string | number; label: string }>;
};

export function FormSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    rules,
    className,
    description,
    disabled,
    placeholder,
    options,
}: FormSelectProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div className={cn("space-y-1", className)}>
                    {label ? (
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {label}
                        </label>
                    ) : null}
                    <select
                        {...field}
                        disabled={disabled}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            fieldState.error ? "border-destructive!" : "border-border"
                        )}
                    >
                        {placeholder ? <option value="">{placeholder}</option> : null}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                    {fieldState.error ? (
                        <p className="text-xs text-destructive mt-0.5">{fieldState.error.message}</p>
                    ) : null}
                </div>
            )}
        />
    );
}

type FormCheckboxProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = CommonFieldProps<TFieldValues, TName> & {
    description?: React.ReactNode;
    onValueChange?: (checked: boolean) => void;
};

export function FormCheckbox<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    label,
    rules,
    className,
    description,
    disabled,
    onValueChange,
}: FormCheckboxProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div className={cn("flex items-start space-x-2", className)}>
                    <input
                        type="checkbox"
                        id={String(name)}
                        checked={Boolean(field.value)}
                        disabled={disabled}
                        onChange={(event) => {
                            field.onChange(event.target.checked);
                            onValueChange?.(event.target.checked);
                        }}
                        onBlur={field.onBlur}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="space-y-1">
                        {label ? (
                            <label htmlFor={String(name)} className="text-sm font-medium text-foreground cursor-pointer select-none">
                                {label}
                            </label>
                        ) : null}
                        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                        {fieldState.error ? (
                            <p className="text-xs text-destructive">{fieldState.error.message}</p>
                        ) : null}
                    </div>
                </div>
            )}
        />
    );
}
