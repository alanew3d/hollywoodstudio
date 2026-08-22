export type ExampleCategory = 'text-to-image' | 'image-edit' | 'style-transfer';

export interface ExampleItem {
  id: string;
  category: ExampleCategory;
  title: string;
  description: string;
  beforeImage?: string; // For image editing/style transfer
  afterImage: string;
  prompt?: string; // For text-to-image and some edits
  generationTime: number; // in seconds
  tags: string[];
  userTestimonial?: string;
  userName?: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export interface CategoryInfo {
  id: ExampleCategory;
  label: string;
  icon: string;
  description: string;
}