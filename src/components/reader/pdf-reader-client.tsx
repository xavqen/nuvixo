"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download,
  Maximize2, Minimize2, Loader2, Moon, Sun, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

interface PDFReaderClientProps {
  noteId: string;
  title: string;
  totalPages: number | null;
  isDownloadable: boolean;
  initialPage: number;
  initialProgress: number;
}

export function PDFReaderClient({
  noteId, title, totalPages, isDownloadable, initialPage, initialProgress,
}: PDFReaderClientProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [urlExpiry, setUrlExpiry] = useState<number>(0);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchPdfUrl = useCallback(async () => {
    try {
      const res = await fetch(`/api/pdf/${noteId}`);
      if (!res.ok) throw new Error("Access denied");
      const data = await res.json();
      setPdfUrl(data.url);
      setUrlExpiry(Date.now() + (data.expiresIn - 60) * 1000); // refresh 1 min early
      setLoading(false);
    } catch {
      toast.error("Failed to load PDF. Please try again.");
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchPdfUrl();
  }, [fetchPdfUrl]);

  // Auto-refresh signed URL before expiry
  useEffect(() => {
    if (!urlExpiry) return;
    const timeout = setTimeout(fetchPdfUrl, urlExpiry - Date.now());
    return () => clearTimeout(timeout);
  }, [urlExpiry, fetchPdfUrl]);

  // Debounced progress save
  function saveProgress(page: number) {
    if (progressTimer.current) clearTimeout(progressTimer.current);
    progressTimer.current = setTimeout(async () => {
      const newProgress = totalPages ? Math.round((page / totalPages) * 100) : 0;
      setProgress(newProgress);
      try {
        await fetch("/api/user/reading-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId, currentPage: page, totalPages, progress: newProgress }),
        });
      } catch { /* silent */ }
    }, 1500);
  }

  function goToPage(page: number) {
    const p = Math.max(1, Math.min(page, totalPages ?? page));
    setCurrentPage(p);
    setPageInput(String(p));
    saveProgress(p);
  }

  async function handleDownload() {
    if (!isDownloadable) { toast.error("Download not available for this note."); return; }
    try {
      const res = await fetch(`/api/pdf/${noteId}`);
      const data = await res.json();
      const a = document.createElement("a");
      a.href = data.url;
      a.download = `${title}.pdf`;
      a.click();
    } catch {
      toast.error("Download failed. Try again.");
    }
  }

  const pageUrl = pdfUrl ? `${pdfUrl}#page=${currentPage}` : null;

  return (
    <div className={cn("flex flex-col h-screen overflow-hidden", nightMode && "dark")}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background z-20 flex-wrap">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/notes"><X className="w-4 h-4" /></Link>
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            <Input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => goToPage(Number(pageInput) || currentPage)}
              onKeyDown={(e) => e.key === "Enter" && goToPage(Number(pageInput) || currentPage)}
              className="w-12 h-7 text-xs text-center rounded p-0"
            />
            {totalPages && <span className="text-xs text-muted-foreground">/ {totalPages}</span>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToPage(currentPage + 1)} disabled={!!totalPages && currentPage >= totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setNightMode((n) => !n)}>
          {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen((f) => !f)}>
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        {isDownloadable && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {totalPages && (
        <Progress value={progress} className="h-0.5 rounded-none" />
      )}

      {/* Reader */}
      <div className={cn("flex-1 overflow-auto flex items-start justify-center bg-gray-200 dark:bg-gray-800 p-4", nightMode && "dark bg-gray-900")}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : pageUrl ? (
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", transition: "transform 0.2s" }} className="w-full">
            <iframe
              key={pageUrl}
              src={pageUrl}
              className="w-full bg-white shadow-xl"
              style={{ height: "calc(100vh - 120px)", minHeight: 600, border: "none" }}
              title={title}
              sandbox="allow-same-origin allow-scripts"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Failed to load PDF. Please refresh and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
