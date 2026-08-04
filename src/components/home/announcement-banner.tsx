"use client";

import { useState } from "react";
import { X, Megaphone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
}

const typeColors: Record<string, string> = {
  info:    "bg-blue-600",
  success: "bg-green-600",
  warning: "bg-amber-500",
  error:   "bg-red-600",
};

export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className={cn("w-full py-2 px-4 flex items-center justify-center gap-3 text-white text-sm", typeColors[announcement.type] ?? "bg-brand-600")}>
      <Megaphone className="w-4 h-4 flex-shrink-0" />
      <p className="flex-1 text-center">
        <strong>{announcement.title}</strong> — {announcement.message}
        {announcement.link && (
          <Link href={announcement.link} className="ml-2 underline font-medium">
            Learn more
          </Link>
        )}
      </p>
      <button onClick={() => setDismissed(true)} className="flex-shrink-0 opacity-80 hover:opacity-100" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
