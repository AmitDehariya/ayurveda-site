"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Loader2, Minus, Quote,
  Redo2, Strikethrough, Underline as UnderlineIcon, Undo2, Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-client";
import { acceptAttr } from "@/lib/upload-rules";
import { cn } from "@/lib/utils";

type Props = { value: string; onChange: (html: string) => void; placeholder?: string; id?: string };

function ToolButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn("grid h-8 w-8 place-items-center rounded-md text-forest-800 transition hover:bg-forest-100 disabled:opacity-40", active && "bg-forest-700 text-white hover:bg-forest-700")}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Paste the link (https://…)", prev ?? "https://");
    if (url === null) return;
    if (url === "" || url === "https://") return editor.chain().focus().unsetLink().run();
    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(url)) return toast.error("Links must start with https://");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadFile(file, "image");
      const alt = window.prompt("Short description of the image (for accessibility)", "") ?? "";
      editor.chain().focus().setImage({ src, alt }).run();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-0.5 border-b bg-cream-50 p-1.5" role="toolbar" aria-label="Formatting">
      <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}><Bold className="h-4 w-4" /></ToolButton>
      <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><Italic className="h-4 w-4" /></ToolButton>
      <ToolButton label="Underline" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></ToolButton>
      <ToolButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></ToolButton>
      <span className="mx-1 w-px bg-border" />
      <ToolButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Sub-heading" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}><List className="h-4 w-4" /></ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></ToolButton>
      <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}><Quote className="h-4 w-4" /></ToolButton>
      <ToolButton label="Divider line" onClick={() => c().setHorizontalRule().run()}><Minus className="h-4 w-4" /></ToolButton>
      <span className="mx-1 w-px bg-border" />
      <ToolButton label="Add link" active={editor.isActive("link")} onClick={setLink}><LinkIcon className="h-4 w-4" /></ToolButton>
      {editor.isActive("link") ? <ToolButton label="Remove link" onClick={() => c().unsetLink().run()}><Unlink className="h-4 w-4" /></ToolButton> : null}
      <ToolButton label="Insert image" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      </ToolButton>
      <span className="mx-1 w-px bg-border" />
      <ToolButton label="Undo" onClick={() => c().undo().run()} disabled={!editor.can().undo()}><Undo2 className="h-4 w-4" /></ToolButton>
      <ToolButton label="Redo" onClick={() => c().redo().run()} disabled={!editor.can().redo()}><Redo2 className="h-4 w-4" /></ToolButton>
      <input ref={fileRef} type="file" accept={acceptAttr("image")} className="hidden" onChange={(e) => { insertImage(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

/** TipTap rich-text editor. Output HTML is sanitised again on the server. */
export function RichTextEditor({ value, onChange, placeholder = "Start writing…", id }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https" } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: false, // avoid SSR hydration mismatch
    shouldRerenderOnTransaction: true, // keep toolbar "active" states in sync
    editorProps: { attributes: { class: "rich-content prose-base max-w-none", ...(id ? { id } : {}) } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-white focus-within:ring-2 focus-within:ring-ring">
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b bg-cream-50" />}
      <div className="max-h-[60vh] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
