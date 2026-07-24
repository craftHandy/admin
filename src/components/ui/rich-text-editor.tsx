import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import { Color } from "@tiptap/extension-text-style/color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Highlighter,
  Minus,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function ToolbarButton({
  icon: Icon,
  action,
  isActive,
  title,
  disabled = false,
}: {
  icon: React.ElementType;
  action: () => void;
  isActive: () => boolean;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) action();
      }}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded transition-colors",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : isActive()
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function HeadingSelect({ editor }: { editor: Editor }) {
  const currentLevel = editor.isActive("heading")
    ? editor.getAttributes("heading").level
    : 0;

  return (
    <select
      value={currentLevel.toString()}
      onChange={(e) => {
        const level = parseInt(e.target.value);
        if (level === 0) {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().toggleHeading({ level }).run();
        }
      }}
      className="h-8 text-xs px-2 rounded border border-border bg-background text-foreground cursor-pointer"
    >
      <option value="0">Paragraph</option>
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
      <option value="4">Heading 4</option>
      <option value="5">Heading 5</option>
      <option value="6">Heading 6</option>
    </select>
  );
}

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Gray", value: "#6b7280" },
  { label: "Brown", value: "#92400e" },
  { label: "Orange", value: "#ea580c" },
  { label: "Yellow", value: "#ca8a04" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#9333ea" },
  { label: "Pink", value: "#db2777" },
  { label: "Red", value: "#dc2626" },
];

const HIGHLIGHT_COLORS = [
  { label: "Default", value: "" },
  { label: "Gray", value: "#e5e7eb" },
  { label: "Brown", value: "#fde68a" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Red", value: "#fecaca" },
];

function ColorPicker({ editor, type }: { editor: Editor; type: "color" | "highlight" }) {
  const colors = type === "color" ? TEXT_COLORS : HIGHLIGHT_COLORS;
  const Icon = type === "color" ? Type : Highlighter;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={type === "color" ? "Text Color" : "Highlight"}
          className={cn(
            "p-1.5 rounded transition-colors",
            (type === "color" && editor.isActive("textStyle", { color: "" })) ||
              (type === "highlight" && editor.isActive("highlight"))
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 min-w-[180px]">
        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium">
          {type === "color" ? "Text Color" : "Highlight"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-5 gap-1 p-1">
          {colors.map((c) => (
            <button
              key={c.value || "default"}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!c.value) {
                  if (type === "color") {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().unsetHighlight().run();
                  }
                } else if (type === "color") {
                  editor.chain().focus().setColor(c.value).run();
                } else {
                  editor.chain().focus().setHighlight({ color: c.value }).run();
                }
              }}
              className={cn(
                "w-7 h-7 rounded border border-border transition-all hover:scale-110",
                ((type === "color" && editor.isActive("textStyle", { color: c.value })) ||
                  (type === "highlight" && editor.isActive("highlight", { color: c.value })))
                  ? "ring-2 ring-primary ring-offset-1"
                  : ""
              )}
              style={{ backgroundColor: c.value || undefined }}
              title={c.label}
            >
              {!c.value && (
                <RemoveFormatting className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href || "";
    setUrl(previousUrl);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [editor]);

  const normalizeUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^\/|^#/.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleApply = useCallback(() => {
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    }
    setOpen(false);
    setUrl("");
  }, [editor, url]);

  const handleRemove = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
    setUrl("");
  }, [editor]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Link"
          onClick={(e) => {
            e.preventDefault();
            handleOpen();
          }}
          className={cn(
            "p-1.5 rounded transition-colors",
            editor.isActive("link")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-3"
        side="bottom"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Insert Link</p>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleApply();
              }}
              className="flex-1 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {editor.isActive("link") ? "Update" : "Apply"}
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove();
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ImageButton({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [editor]
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <ToolbarButton
        icon={ImageIcon}
        action={() => fileInputRef.current?.click()}
        isActive={() => false}
        title="Insert Image"
      />
    </>
  );
}

function AlignMenu({ editor }: { editor: Editor }) {
  const currentAlign = editor.isActive({ textAlign: "center" })
    ? "center"
    : editor.isActive({ textAlign: "right" })
      ? "right"
      : editor.isActive({ textAlign: "justify" })
        ? "justify"
        : "left";

  const alignments = [
    { value: "left", icon: AlignLeft, label: "Align Left" },
    { value: "center", icon: AlignCenter, label: "Align Center" },
    { value: "right", icon: AlignRight, label: "Align Right" },
    { value: "justify", icon: AlignJustify, label: "Justify" },
  ];

  const CurrentIcon = alignments.find((a) => a.value === currentAlign)?.icon || AlignLeft;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Text Alignment"
          className="p-1.5 rounded transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <CurrentIcon className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 min-w-[140px]">
        {alignments.map((align) => (
          <DropdownMenuItem
            key={align.value}
            onSelect={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign(align.value).run();
            }}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5",
              currentAlign === align.value && "bg-primary/10 text-primary"
            )}
            inset={false}
          >
            <align.icon className="h-4 w-4" />
            <span className="text-sm">{align.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuBar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/30">
      <HeadingSelect editor={editor} />
      <span className="w-px h-5 mx-1 bg-border" />
      <ToolbarButton
        icon={Bold}
        action={() => editor.chain().focus().toggleBold().run()}
        isActive={() => editor.isActive("bold")}
        title="Bold"
      />
      <ToolbarButton
        icon={Italic}
        action={() => editor.chain().focus().toggleItalic().run()}
        isActive={() => editor.isActive("italic")}
        title="Italic"
      />
      <ToolbarButton
        icon={UnderlineIcon}
        action={() => editor.chain().focus().toggleUnderline().run()}
        isActive={() => editor.isActive("underline")}
        title="Underline"
      />
      <ToolbarButton
        icon={Strikethrough}
        action={() => editor.chain().focus().toggleStrike().run()}
        isActive={() => editor.isActive("strike")}
        title="Strikethrough"
      />
      <span className="w-px h-5 mx-1 bg-border" />
      <ColorPicker editor={editor} type="color" />
      <ColorPicker editor={editor} type="highlight" />
      <span className="w-px h-5 mx-1 bg-border" />
      <AlignMenu editor={editor} />
      <span className="w-px h-5 mx-1 bg-border" />
      <ToolbarButton
        icon={List}
        action={() => editor.chain().focus().toggleBulletList().run()}
        isActive={() => editor.isActive("bulletList")}
        title="Bullet List"
      />
      <ToolbarButton
        icon={ListOrdered}
        action={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={() => editor.isActive("orderedList")}
        title="Ordered List"
      />
      <ToolbarButton
        icon={Quote}
        action={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={() => editor.isActive("blockquote")}
        title="Blockquote"
      />
      <ToolbarButton
        icon={Minus}
        action={() => editor.chain().focus().setHorizontalRule().run()}
        isActive={() => false}
        title="Horizontal Rule"
      />
      <span className="w-px h-5 mx-1 bg-border" />
      <LinkButton editor={editor} />
      <ImageButton editor={editor} />
      <span className="w-px h-5 mx-1 bg-border" />
      <ToolbarButton
        icon={Undo}
        action={() => editor.chain().focus().undo().run()}
        isActive={() => false}
        title="Undo"
      />
      <ToolbarButton
        icon={Redo}
        action={() => editor.chain().focus().redo().run()}
        isActive={() => false}
        title="Redo"
      />
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap max-w-none min-h-[200px] px-3 py-3",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  return (
    <div
      className={cn(
        "rounded-md border border-border overflow-hidden",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}