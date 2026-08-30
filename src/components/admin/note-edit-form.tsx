"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

type NoteFormValues = {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  isDownloadable: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string;
  metaTitle: string;
  metaDescription: string;
  classId: string;
  subjectId: string;
  boardId: string;
  chapterId: string;
  previewPages: number;
};

interface NoteEditFormProps {
  note: {
    id: string; title: string; slug: string; description: string;
    shortDescription: string | null; price: number; originalPrice: number | null;
    isFree: boolean; isPremium: boolean; isDownloadable: boolean;
    isPublished: boolean; isFeatured: boolean; isTrending: boolean;
    difficulty: "EASY" | "MEDIUM" | "HARD"; tags: string[]; metaTitle: string | null;
    metaDescription: string | null; classId: string; subjectId: string;
    boardId: string; chapterId: string | null; language: string;
    previewPages: number;
  };
  classes:  { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  boards:   { id: string; name: string }[];
  chapters: { id: string; title: string; number: number }[];
}

export function NoteEditForm({ note, classes, subjects, boards, chapters }: NoteEditFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<NoteFormValues>({
    defaultValues: {
      title:            note.title,
      slug:             note.slug,
      description:      note.description,
      shortDescription: note.shortDescription ?? "",
      price:            note.price,
      originalPrice:    note.originalPrice ?? undefined,
      isFree:           note.isFree,
      isDownloadable:   note.isDownloadable,
      isPublished:      note.isPublished,
      isFeatured:       note.isFeatured,
      isTrending:       note.isTrending,
      difficulty:       note.difficulty,
      tags:             note.tags.join(", "),
      metaTitle:        note.metaTitle ?? "",
      metaDescription:  note.metaDescription ?? "",
      classId:          note.classId,
      subjectId:        note.subjectId,
      boardId:          note.boardId,
      chapterId:        note.chapterId ?? "",
      previewPages:     note.previewPages,
    },
  });

  async function onSubmit(values: NoteFormValues) {
    setSaving(true);
    try {
      const payload = { ...values, tags: String(values.tags).split(",").map((t) => t.trim()).filter(Boolean) };
      const res = await fetch(`/api/admin/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success("Note updated!");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/notes/${note.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note deleted.");
        router.push("/admin/notes");
      } else {
        toast.error("Delete failed.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Basic Info</h2>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input {...form.register("title")} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input {...form.register("slug")} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea {...form.register("description")} rows={5} />
        </div>
        <div className="space-y-2">
          <Label>Short Description</Label>
          <Input {...form.register("shortDescription")} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Pricing & Settings</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" {...form.register("price", { valueAsNumber: true })} min={0} />
          </div>
          <div className="space-y-2">
            <Label>Original Price (₹)</Label>
            <Input type="number" {...form.register("originalPrice", { valueAsNumber: true })} min={0} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preview Pages</Label>
            <Input type="number" {...form.register("previewPages", { valueAsNumber: true })} min={1} max={10} />
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
        <div className="flex flex-wrap gap-6">
          {[
            { name: "isFree" as const,       label: "Free" },
            { name: "isDownloadable" as const,label: "Downloadable" },
            { name: "isPublished" as const,   label: "Published" },
            { name: "isFeatured" as const,    label: "Featured" },
            { name: "isTrending" as const,    label: "Trending" },
          ].map(({ name, label }) => (
            <Controller key={name} control={form.control} name={name} render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                  id={name}
                />
                <Label htmlFor={name}>{label}</Label>
              </div>
            )} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">SEO</h2>
        <div className="space-y-2">
          <Label>Tags (comma-separated)</Label>
          <Input {...form.register("tags")} />
        </div>
        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input {...form.register("metaTitle")} />
        </div>
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea {...form.register("metaDescription")} rows={2} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-brand-600 to-violet-600 text-white gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" className="gap-2" disabled={deleting}>
              <Trash2 className="w-4 h-4" />Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this note?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The note and its associated PDF will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button type="button" variant="outline" onClick={() => router.push("/admin/notes")}>
          Back
        </Button>
      </div>
    </form>
  );
}
