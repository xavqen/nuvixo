"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload, FileText, Image as ImageIcon, Loader2, X, CheckCircle,
  Cloud, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

const uploadSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  shortDescription: z.string().max(300).optional(),
  classId: z.string().min(1, "Select a class"),
  subjectId: z.string().min(1, "Select a subject"),
  boardId: z.string().min(1, "Select a board"),
  chapterId: z.string().optional(),
  language: z.string().default("ENGLISH"),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().optional(),
  isFree: z.boolean().default(false),
  isPremium: z.boolean().default(true),
  isDownloadable: z.boolean().default(true),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false), // ADD
  tags: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

interface Props {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  boards: { id: string; name: string }[];
  chapters: { id: string; title: string; number: number; bookId: string }[];
}

export function NoteUploadForm({ classes, subjects, boards, chapters }: Props) {
  const router = useRouter();
  const [pdfPublicId, setPdfPublicId] = useState("");
  const [previewPublicId, setPreviewPublicId] = useState("");
  const [coverPublicId, setCoverPublicId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfUploadState, setPdfUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [covUploadState, setCovUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const covRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "", slug: "", description: "", classId: "", subjectId: "",
      boardId: "", language: "ENGLISH", price: 49, isFree: false, isPremium: true,
      isDownloadable: true, difficulty: "EASY", isPublished: false, isFeatured: false, isTrending: false,
      tags: "",
    },
  });

  const titleValue = form.watch("title");

  async function uploadFile(file: File, type: "pdf" | "image") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploadState("uploading");
    try {
      const data = await uploadFile(file, "pdf");
      setPdfPublicId(data.publicId);
      setPreviewPublicId(data.publicId);
      setTotalPages(data.pages ?? 0);
      setPdfUploadState("done");
      toast.success(`PDF uploaded! ${data.pages ?? 0} pages detected.`);
    } catch {
      setPdfUploadState("error");
      toast.error("PDF upload failed.");
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCovUploadState("uploading");
    try {
      const data = await uploadFile(file, "image");
      setCoverPublicId(data.publicId);
      setCoverUrl(data.secureUrl);
      setCovUploadState("done");
    } catch {
      setCovUploadState("error");
      toast.error("Cover upload failed.");
    }
  }

  async function onSubmit(values: UploadForm) {
    if (!pdfPublicId) { toast.error("Please upload a PDF first."); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        slug: values.slug || slugify(values.title),
        tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
        keywords: [],
        pdfPublicId,
        previewPublicId,
        coverPublicId,
        coverUrl,
        totalPages,
        previewPages: 4,
      };
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success("Note created!");
      router.push("/admin/notes");
    } finally {
      setSubmitting(false);
    }
  }

  const UploadStatus = ({ state }: { state: string }) => (
    state === "uploading" ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
      : state === "done" ? <CheckCircle className="w-5 h-5 text-green-500" />
        : state === "error" ? <AlertCircle className="w-5 h-5 text-red-500" />
          : null
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* File Uploads */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-5 flex items-center gap-2"><Cloud className="w-5 h-5" />File Uploads</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* PDF */}
          <div>
            <Label className="mb-2 block text-sm">PDF File *</Label>
            <input type="file" ref={pdfRef} accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
            <button
              type="button"
              onClick={() => pdfRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-colors text-center"
            >
              <FileText className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm font-medium">{pdfPublicId ? "Change PDF" : "Upload PDF"}</span>
              <span className="text-xs text-muted-foreground">Max 50MB</span>
            </button>
            {(pdfUploadState !== "idle") && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <UploadStatus state={pdfUploadState} />
                {pdfUploadState === "done" && <span className="text-green-600">{totalPages} pages</span>}
                {pdfUploadState === "uploading" && <span className="text-muted-foreground">Uploading…</span>}
              </div>
            )}
          </div>

          {/* Cover */}
          <div>
            <Label className="mb-2 block text-sm">Cover Image</Label>
            <input type="file" ref={covRef} accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button
              type="button"
              onClick={() => covRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50/30 transition-colors text-center"
            >
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="Cover" className="w-16 h-20 object-cover rounded" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{coverUrl ? "Change Cover" : "Upload Cover"}</span>
              <span className="text-xs text-muted-foreground">JPEG, PNG, WebP · Max 5MB</span>
            </button>
            {(covUploadState !== "idle") && (
              <div className="flex items-center gap-2 mt-2">
                <UploadStatus state={covUploadState} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>

        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            {...form.register("title")}
            placeholder="NCERT Class 6 Science Chapter 1: Food Notes"
            onChange={(e) => {
              form.setValue("title", e.target.value);
              if (!form.getValues("slug")) {
                form.setValue("slug", slugify(e.target.value));
              }
            }}
          />
          {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>URL Slug *</Label>
          <Input {...form.register("slug")} placeholder="ncert-class-6-science-chapter-1-notes" />
          {form.formState.errors.slug && <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea {...form.register("description")} rows={4} placeholder="Comprehensive notes covering all key concepts..." />
          {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Short Description</Label>
          <Input {...form.register("shortDescription")} placeholder="Brief summary for cards..." />
        </div>
      </div>

      {/* Classification */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Classification</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Class *</Label>
            <Controller control={form.control} name="classId" render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Controller control={form.control} name="subjectId" render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-2">
            <Label>Board *</Label>
            <Controller control={form.control} name="boardId" render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
                <SelectContent>{boards.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Chapter (optional)</Label>
            <Controller control={form.control} name="chapterId" render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                <SelectContent>{chapters.map((ch) => <SelectItem key={ch.id} value={ch.id}>Ch.{ch.number} – {ch.title}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Controller control={form.control} name="difficulty" render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Pricing</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" {...form.register("price")} min={0} />
          </div>
          <div className="space-y-2">
            <Label>Original Price (₹) — for discount display</Label>
            <Input type="number" {...form.register("originalPrice")} min={0} />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Controller control={form.control} name="isFree" render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} id="isFree" />
              <Label htmlFor="isFree">Free Note</Label>
            </div>
          )} />
          <Controller control={form.control} name="isDownloadable" render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} id="isDownloadable" />
              <Label htmlFor="isDownloadable">Downloadable</Label>
            </div>
          )} />
        </div>
      </div>

      {/* Publishing */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Publishing & SEO</h2>
        <div className="flex items-center gap-6">
          <Controller control={form.control} name="isPublished" render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} id="isPublished" />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          )} />
          <Controller control={form.control} name="isFeatured" render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} id="isFeatured" />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          )} />
        </div>
        <div className="space-y-2">
          <Label>Tags (comma-separated)</Label>
          <Input {...form.register("tags")} placeholder="class 6, science, ncert, chapter 1" />
        </div>
        <div className="grid sm:grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input {...form.register("metaTitle")} placeholder="SEO title..." />
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea {...form.register("metaDescription")} rows={2} placeholder="SEO description..." />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={submitting || pdfUploadState === "uploading"}
          className="bg-gradient-to-r from-brand-600 to-violet-600 text-white px-8"
        >
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Note"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/notes")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
