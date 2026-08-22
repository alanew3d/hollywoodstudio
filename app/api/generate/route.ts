import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/api/image-service';
import { GenerationParams, APIResponse, APIError } from '@/lib/types/image';
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

    // Parse request body
    const body = await request.json();
    
    // Validate required parameters
    if (!body.prompt) {
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
    
    // Build generation parameters
    const params: GenerationParams = {
      prompt: body.prompt,
      negativePrompt: body.negativePrompt,
      width: body.width || 1024,
      height: body.height || 1024,
      numImages: body.numImages || 1,
      steps: body.steps || 30,
      guidance: body.guidance || 7.5,
      seed: body.seed
    };
    
    // Initialize image service
    const imageService = new ImageService();
    
    // Generate image
    const result = await imageService.generateFromText(params);
    
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
    console.error('Generate API error:', error);
    
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
          message: 'An unexpected error occurred while generating the image'
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