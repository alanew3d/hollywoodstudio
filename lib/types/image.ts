export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg' | 'webp';
  size: number;
  metadata: ImageMetadata;
  createdAt: Date;
}

export interface ImageMetadata {
  prompt: string;
  model: string;
  parameters: GenerationParams;
  generationTime: number;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  dimensions: { width: number; height: number };
}

export interface BatchJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalImages: number;
  processedImages: number;
  results: GeneratedImage[];
  error?: string;
}

export interface TransformImageParams {
  image: File | string;  // File object or base64 string
  prompt: string;
  negativePrompt?: string;
  strength?: number;  // 0-1, how much to transform
  guidance?: number;
  preserveAspectRatio?: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    requestId: string;
    version: string;
  };
}

export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE'
}

export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export type GenerationMode = 'text-to-image' | 'image-to-image';

export interface GenerationResult {
  images: GeneratedImage[];
  metadata: {
    generationTime: number;
    model: string;
    parameters: GenerationParams | TransformImageParams;
  };
}