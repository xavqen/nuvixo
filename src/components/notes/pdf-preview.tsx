"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Lock, ShoppingCart, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewProps {
  noteId: string;
  title: string;
  onClose: () => void;
  onPurchase: () => void;
}

interface PreviewPage {
  page: number;
  url: string;
}

export function PDFPreview({ noteId, title, onClose, onPurchase }: PDFPreviewProps) {
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    fetch(`/api/pdf/preview/${noteId}`)
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [noteId]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl bg-background rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{title}</p>
              <p className="text-xs text-muted-foreground">
                Preview — Page {currentPage + 1} of {pages.length}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : pages.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Preview not available for this note.</p>
              </div>
            ) : (
              <div className="pdf-preview-container select-none relative">
                <div
                  style={{ transform: `scale(${scale})`, transformOrigin: "top center", transition: "transform 0.2s" }}
                  className="p-4"
                >
                  <div className="relative bg-white shadow-lg">
                    <Image
                      src={pages[currentPage].url}
                      alt={`Page ${currentPage + 1}`}
                      width={800}
                      height={1100}
                      className="w-full h-auto"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    {/* Last page blur overlay */}
                    {currentPage === pages.length - 1 && (
                      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
                    )}
                  </div>
                </div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] rotate-[-35deg] text-4xl font-bold text-black select-none">
                  STUDIYA PREVIEW
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {pages.length > 1 && (
            <div className="flex items-center justify-center gap-4 p-3 border-t border-border">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentPage ? "bg-primary" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === pages.length - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Premium unlock bar */}
          <div className="p-4 bg-gradient-to-r from-brand-600 to-violet-600 text-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Purchase to unlock full notes</p>
                  <p className="text-xs text-white/80">Get access to all {`${pages.length}+`} pages instantly</p>
                </div>
              </div>
              <Button
                onClick={onPurchase}
                className="bg-white text-brand-700 hover:bg-white/90 font-semibold text-sm gap-2 flex-shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />Unlock Now
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
