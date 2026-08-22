import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/api/image-service';
import { TransformImageParams, APIResponse, APIError } from '@/lib/types/image';
import { getUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        } as APIResponse,
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Get image and parameters
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const prompt = formData.get('prompt') as string;
    const negativePrompt = formData.get('negativePrompt') as string | null;
    const strength = formData.get('strength') ? parseFloat(formData.get('strength') as string) : undefined;
    const guidance = formData.get('guidance') ? parseFloat(formData.get('guidance') as string) : undefined;
    const preserveAspectRatio = formData.get('preserveAspectRatio') === 'true';
    
    // Validate input
    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Prompt is required'
          }
        } as APIResponse,
        { status: 400 }
      );
    }
    
    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Either image file or image URL is required'
          }
        } as APIResponse,
        { status: 400 }
      );
    }
    
    // Validate file size if file is provided
    if (imageFile) {
      const maxSize = parseInt(process.env.MAX_IMAGE_SIZE || '5242880'); // 5MB default
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `Image file is too large. Maximum size is ${maxSize / 1024 / 1024}MB`
            }
          } as APIResponse,
          { status: 400 }
        );
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
            }
          } as APIResponse,
          { status: 400 }
        );
      }
    }
    
    // Build transformation parameters
    const params: TransformImageParams = {
      image: imageFile || imageUrl!,
      prompt,
      negativePrompt: negativePrompt || undefined,
      strength,
      guidance,
      preserveAspectRatio
    };
    
    // Initialize image service
    const imageService = new ImageService();
    
    // Transform image
    const result = await imageService.generateFromImage(params);
    
    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: Date.now(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          version: '1.0.0'
        }
      } as APIResponse,
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Transform API error:', error);
    
    // Handle APIError
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        } as APIResponse,
        { status: error.statusCode }
      );
    }
    
    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while transforming the image'
        }
      } as APIResponse,
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}