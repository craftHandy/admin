import * as React from "react";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type TableActionItem = {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    destructive?: boolean;
    disabled?: boolean;
};

export type TableActionsProps = {
    actions: TableActionItem[];
    triggerLabel?: string;
    className?: string;
};

export function TableActions({ actions, triggerLabel = "Actions", className }: TableActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={className} aria-label={triggerLabel}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {actions.map((action) => (
                    <DropdownMenuItem
                        key={action.label}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={action.destructive ? "text-destructive focus:text-destructive" : undefined}
                    >
                        <span className="mr-2 flex items-center">
                            {action.icon ?? (action.destructive ? <Trash2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
                        </span>
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const tableActionIcons = {
    view: <Eye className="h-4 w-4" />,
    edit: <Pencil className="h-4 w-4" />,
    delete: <Trash2 className="h-4 w-4" />,
};
