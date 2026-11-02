export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverMediaId?: string;
  coverImageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  sourceAssetId: string;
  title: string;
  slug: string;
  projectName: string;
  description?: string;
  categoryId: string; // matches category slug e.g. "couple", "events"
  categoryLabel?: string;
  mediaId?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  originalSourceUrl?: string;
  webUrl1800?: string;
  filename: string;
  mediaType: "image" | "video";
  altText?: string;
  displayOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  migrationStatus: "verified" | "pending" | "failed" | "legacy_fallback";
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaAsset {
  id: string;
  cloudinaryPublicId?: string;
  cloudinaryAssetId?: string;
  secureUrl: string;
  resourceType: "image" | "video";
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  thumbnailUrl?: string;
  originalFilename?: string;
  originalSourceUrl?: string;
  altText?: string;
  title?: string;
  folder?: string;
  migrationStatus: "verified" | "pending" | "failed";
  usedIn?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  number: string;
  shortDescription: string;
  description: string;
  coverImageUrl: string;
  coverMediaId?: string;
  additionalMediaIds?: string[];
  categoryId?: string;
  features?: string[];
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    bgImageUrl: string;
    bgVideoUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  aboutPreview: {
    title: string;
    description: string;
    imageUrl: string;
    linkUrl?: string;
  };
  visualBreak: {
    label: string;
    title: string;
    description: string;
    imageUrl: string;
  };
  selectedWork: Array<{
    num: string;
    label: string;
    subtitle: string;
    image: string;
    aspect: "portrait" | "landscape";
  }>;
  updatedAt?: string;
}

export interface AboutPageContent {
  heroTitle: string;
  heroSubtitle: string;
  studioIntro: string;
  founder: {
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
  };
  philosophies: string[];
  ethos: Array<{
    title: string;
    description: string;
  }>;
  milestones?: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  updatedAt?: string;
}

export interface ContactPageContent {
  title: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  interestsList: string[];
  successMessage?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  location: string;
  instagramUrl: string;
  socialLinks: Array<{ label: string; url: string }>;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  updatedAt?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  status: "new" | "read" | "contacted" | "closed";
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImageUrl: string;
  coverMediaId?: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MigrationRunRecord {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  categoriesSeeded: number;
  totalCategories: number;
  gallerySeeded: number;
  totalGallery: number;
  servicesSeeded: number;
  totalServices: number;
  cloudinarySuccessful: number;
  cloudinaryFailed: number;
  cloudinaryPending: number;
  failedAssets: Array<{
    asset_id: string;
    filename: string;
    category: string;
    url: string;
    error: string;
  }>;
  report?: string;
}

