import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "INR"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trim()}...`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `NVX-${year}${month}-${random}`;
}

export function getDiscountPercentage(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function calculateGST(amount: number, gstRate = 18): { base: number; gst: number; total: number } {
  const base = Math.round((amount / (1 + gstRate / 100)) * 100) / 100;
  const gst = Math.round((amount - base) * 100) / 100;
  return { base, gst, total: amount };
}

export function readingTimeMinutes(pages: number): number {
  return Math.ceil(pages * 3); // ~3 min per page
}

export function getRatingText(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4) return "Very Good";
  if (rating >= 3) return "Good";
  if (rating >= 2) return "Fair";
  return "Poor";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function rateLimit(requestsPerWindow: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return function checkLimit(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = requests.get(identifier);

    if (!record || now > record.resetAt) {
      requests.set(identifier, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: requestsPerWindow - 1 };
    }

    if (record.count >= requestsPerWindow) {
      return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: requestsPerWindow - record.count };
  };
}

export const apiRateLimiter = rateLimit(60, 60_000);       // 60/min
export const authRateLimiter = rateLimit(5, 15 * 60_000);  // 5/15min
export const pdfRateLimiter  = rateLimit(30, 60_000);      // 30/min
