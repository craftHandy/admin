import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type MultiSelectOption<TValue extends string | number = number> = {
  value: TValue;
  label: string;
};

type MultiSelectProps<TValue extends string | number = number> = {
  options: MultiSelectOption<TValue>[];
  selected: TValue[];
  onChange: (selected: TValue[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelect<TValue extends string | number = number>({
  options, selected, onChange, placeholder = "Select...", className,
}: MultiSelectProps<TValue>) {
  const [open, setOpen] = useState(false);

  const toggle = (val: TValue) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm",
            className
          )}
        >
          <span className={selected.length === 0 ? "text-muted-foreground" : ""}>
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-card p-1 shadow-md"
        >
          {options.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No options</p>
          ) : (
            options.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox.Root
                    checked={checked}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3 w-3" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span>{opt.label}</span>
                </button>
              );
            })
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
