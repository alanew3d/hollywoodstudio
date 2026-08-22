import { ExampleItem, CategoryInfo } from '@/types/examples';

export const CATEGORY_INFO: CategoryInfo[] = [
  {
    id: 'text-to-image',
    label: 'Text-to-Image',
    icon: '📝',
    description: 'Create stunning images from text descriptions'
  },
  {
    id: 'image-edit',
    label: 'Image Editing',
    icon: '🖼️',
    description: 'Transform and enhance existing images'
  },
  {
    id: 'style-transfer',
    label: 'Style Transfer',
    icon: '🎨',
    description: 'Apply artistic styles to your photos'
  }
];

export const EXAMPLE_DATA: ExampleItem[] = [
  // Text-to-Image Examples
  {
    id: 'txt2img-fantasy-dragon',
    category: 'text-to-image',
    title: 'Epic Fantasy Dragon',
    description: 'Majestic dragon soaring over mystical landscape',
    afterImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    prompt: 'A majestic dragon flying over a mystical forest at sunset, highly detailed fantasy art, cinematic lighting',
    generationTime: 4.2,
    tags: ['fantasy', 'dragon', 'epic', 'cinematic'],
    userTestimonial: 'Perfect for my D&D campaign artwork!',
    userName: 'Alex R., Game Master',
    difficulty: 'Medium'
  },
  {
    id: 'txt2img-professional-headshot',
    category: 'text-to-image',
    title: 'Professional Business Portrait',
    description: 'Studio-quality corporate headshot from text prompt',
    afterImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    prompt: 'Professional business portrait, studio lighting, clean white background, confident expression',
    generationTime: 2.8,
    tags: ['professional', 'portrait', 'business', 'studio'],
    userTestimonial: 'Saved me $300 on professional photography!',
    userName: 'Sarah M., Entrepreneur',
    difficulty: 'Easy'
  },
  {
    id: 'txt2img-product-shot',
    category: 'text-to-image',
    title: 'Luxury Product Photography',
    description: 'Commercial-grade product shots for e-commerce',
    afterImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    prompt: 'Luxury watch on marble surface, soft lighting, minimalist composition, commercial photography style',
    generationTime: 3.5,
    tags: ['product', 'luxury', 'commercial', 'minimalist'],
    userTestimonial: 'My product sales increased 40% with these images!',
    userName: 'Mike L., Store Owner',
    difficulty: 'Medium'
  },

  // Image Editing Examples  
  {
    id: 'img-edit-portrait-enhance',
    category: 'image-edit',
    title: 'Portrait Enhancement',
    description: 'Transform casual photos into professional portraits',
    beforeImage: 'https://images.unsplash.com/photo-1494790108755-2616c98c7715?w=400&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    prompt: 'Professional portrait enhancement with studio lighting and skin smoothing',
    generationTime: 2.1,
    tags: ['portrait', 'enhancement', 'professional', 'lighting'],
    userTestimonial: 'Looks like I hired a professional photographer!',
    userName: 'Jessica R., Influencer',
    difficulty: 'Easy'
  },
  {
    id: 'img-edit-background-remove',
    category: 'image-edit',
    title: 'Background Transformation',
    description: 'Seamlessly replace backgrounds with AI precision',
    beforeImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    prompt: 'Replace background with modern office environment, maintain natural lighting',
    generationTime: 3.7,
    tags: ['background', 'replacement', 'seamless', 'professional'],
    userTestimonial: 'Perfect for my LinkedIn profile update!',
    userName: 'David K., Consultant',
    difficulty: 'Medium'
  },
  {
    id: 'img-edit-object-removal',
    category: 'image-edit',
    title: 'Object Removal & Enhancement',
    description: 'Remove unwanted elements while enhancing quality',
    beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    prompt: 'Remove distracting elements and enhance landscape clarity',
    generationTime: 4.1,
    tags: ['removal', 'cleanup', 'landscape', 'enhancement'],
    userTestimonial: 'Turned my vacation snapshot into wall art!',
    userName: 'Emma T., Photographer',
    difficulty: 'Advanced'
  },

  // Style Transfer Examples
  {
    id: 'style-anime-portrait',
    category: 'style-transfer',
    title: 'Anime Style Transformation',
    description: 'Convert photos to stunning anime artwork',
    beforeImage: 'https://images.unsplash.com/photo-1494790108755-2616c98c7715?w=400&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    prompt: 'Transform to anime style with vibrant colors and detailed shading',
    generationTime: 5.2,
    tags: ['anime', 'style-transfer', 'artwork', 'vibrant'],
    userTestimonial: 'My social media engagement doubled!',
    userName: 'Ryan P., Content Creator',
    difficulty: 'Medium'
  },
  {
    id: 'style-oil-painting',
    category: 'style-transfer',
    title: 'Classical Oil Painting',
    description: 'Renaissance-style artistic transformation',
    beforeImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    prompt: 'Classical oil painting style with rich textures and Renaissance lighting',
    generationTime: 6.1,
    tags: ['oil-painting', 'classical', 'renaissance', 'artistic'],
    userTestimonial: 'Incredible artistic transformation!',
    userName: 'Maria S., Art Teacher',
    difficulty: 'Advanced'
  },
  {
    id: 'style-vintage-film',
    category: 'style-transfer',
    title: 'Vintage Film Aesthetic',
    description: 'Retro film photography with authentic grain',
    beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&sepia',
    prompt: 'Vintage 1970s film photography style with warm tones and film grain',
    generationTime: 3.9,
    tags: ['vintage', 'film', 'retro', 'nostalgia'],
    userTestimonial: 'Brings back amazing memories!',
    userName: 'Tom H., Photographer',
    difficulty: 'Easy'
  }
];

// Helper functions
export const getExamplesByCategory = (category: string) => 
  EXAMPLE_DATA.filter(example => category === 'all' || example.category === category);

export const getFeaturedExamples = () => 
  EXAMPLE_DATA.slice(0, 6); // Get first 6 examples for featured display

export const getExampleById = (id: string) => 
  EXAMPLE_DATA.find(example => example.id === id);