// Global type augmentations and shared interfaces

export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

export interface ApiResponse<T> {
  data?:  T;
  error?: string;
  message?: string;
}

export interface NoteCardData {
  id:               string;
  title:            string;
  slug:             string;
  shortDescription: string | null;
  coverUrl:         string | null;
  price:            number;
  originalPrice:    number | null;
  isFree:           boolean;
  difficulty:       string;
  totalPages:       number | null;
  language:         string;
  isTrending:       boolean;
  isNew:            boolean;
  avgRating:        number;
  reviewCount:      number;
  class:   { name: string; slug: string };
  subject: { name: string; slug: string; color: string | null; icon: string | null };
  chapter: { number: number } | null;
}
