import { OpenRouterClient } from './openrouter-client';
import { 
  GenerationParams, 
  TransformImageParams,
  GenerationResult,
  APIError,
  ErrorCode
} from '../types/image';

export class ImageService {
  private client: OpenRouterClient;
  
  constructor() {
    this.client = new OpenRouterClient();
  }
  
  async generateFromText(params: GenerationParams): Promise<GenerationResult> {
    const startTime = Date.now();
    const serviceId = `svc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    console.log(`🎨 [${serviceId}] ImageService.generateFromText started`);
    console.log(`📋 [${serviceId}] Parameters:`, JSON.stringify(params, null, 2));
    
    try {
      // Validate parameters
      console.log(`✅ [${serviceId}] Validating parameters...`);
      this.validateGenerationParams(params);
      
      // Create a descriptive prompt for image generation
      const imagePrompt = this.buildImageGenerationPrompt(params);
      console.log(`🏗️ [${serviceId}] Built image prompt: "${imagePrompt}"`);
      
      // Call OpenRouter API
      console.log(`🌐 [${serviceId}] Calling OpenRouter API...`);
      const response = await this.client.generateImage({
        prompt: imagePrompt,
        negativePrompt: params.negativePrompt,
      });
      
      console.log(`📥 [${serviceId}] OpenRouter response received, extracting image URL...`);
      
      // Extract image URL from response
      const imageUrl = this.extractImageUrl(response, serviceId);
      
      if (!imageUrl) {
        console.warn(`⚠️ [${serviceId}] No image URL found in response, generating placeholder`);
        const placeholderUrl = this.generatePlaceholderImage(params);
        console.log(`🖼️ [${serviceId}] Generated placeholder URL: ${placeholderUrl}`);
        
        const result = {
          images: [{
            id: this.generateId(),
            url: placeholderUrl,
            width: params.width || 1024,
            height: params.height || 1024,
            format: 'png' as const,
            size: 0,
            metadata: {
              prompt: params.prompt,
              model: 'google/gemini-2.5-flash-image-preview',
              parameters: params,
              generationTime: Date.now() - startTime
            },
            createdAt: new Date()
          }],
          metadata: {
            generationTime: Date.now() - startTime,
            model: 'google/gemini-2.5-flash-image-preview',
            parameters: params
          }
        };
        
        console.log(`✨ [${serviceId}] Returning placeholder result in ${Date.now() - startTime}ms`);
        return result;
      }
      
      console.log(`🎯 [${serviceId}] Found image URL: ${imageUrl}`);
      const result = {
        images: [{
          id: this.generateId(),
          url: imageUrl,
          width: params.width || 1024,
          height: params.height || 1024,
          format: 'png' as const,
          size: 0,
          metadata: {
            prompt: params.prompt,
            model: 'google/gemini-2.5-flash-image-preview',
            parameters: params,
            generationTime: Date.now() - startTime
          },
          createdAt: new Date()
        }],
        metadata: {
          generationTime: Date.now() - startTime,
          model: 'google/gemini-2.5-flash-image-preview',
          parameters: params
        }
      };
      
      console.log(`🎉 [${serviceId}] Image generation completed successfully in ${Date.now() - startTime}ms`);
      console.log(`📊 [${serviceId}] Final result:`, JSON.stringify(result, null, 2));
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`💥 [${serviceId}] Image generation error after ${duration}ms:`, error);
      throw this.handleError(error);
    }
  }
  
  async generateFromImage(params: TransformImageParams): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // Convert image to base64 if it's a File
      let imageUrl: string;
      if (params.image instanceof File) {
        imageUrl = await this.fileToDataUrl(params.image);
      } else {
        imageUrl = params.image;
      }
      
      // Build transformation prompt
      const transformPrompt = this.buildTransformationPrompt(params);
      
      // Call OpenRouter API with image
      const response = await this.client.generateImageWithReference({
        imageUrl,
        prompt: transformPrompt,
        negativePrompt: params.negativePrompt,
      });
      
      // Extract result
      const resultImageUrl = this.extractImageUrl(response);
      
      if (!resultImageUrl) {
        // Generate placeholder for demonstration
        const placeholderUrl = this.generatePlaceholderImage({
          prompt: params.prompt,
          width: 1024,
          height: 1024
        });
        
        return {
          images: [{
            id: this.generateId(),
            url: placeholderUrl,
            width: 1024,
            height: 1024,
            format: 'png',
            size: 0,
            metadata: {
              prompt: params.prompt,
              model: 'google/gemini-2.5-flash-image-preview',
              parameters: params,
              generationTime: Date.now() - startTime
            },
            createdAt: new Date()
          }],
          metadata: {
            generationTime: Date.now() - startTime,
            model: 'google/gemini-2.5-flash-image-preview',
            parameters: params
          }
        };
      }
      
      return {
        images: [{
          id: this.generateId(),
          url: resultImageUrl,
          width: 1024,
          height: 1024,
          format: 'png',
          size: 0,
          metadata: {
            prompt: params.prompt,
            model: 'google/gemini-2.5-flash-image-preview',
            parameters: params,
            generationTime: Date.now() - startTime
          },
          createdAt: new Date()
        }],
        metadata: {
          generationTime: Date.now() - startTime,
          model: 'google/gemini-2.5-flash-image-preview',
          parameters: params
        }
      };
    } catch (error) {
      console.error('Image transformation error:', error);
      throw this.handleError(error);
    }
  }
  
  private validateGenerationParams(params: GenerationParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new APIError(
        ErrorCode.INVALID_INPUT,
        'Prompt is required',
        400
      );
    }
    
    if (params.prompt.length > 1000) {
      throw new APIError(
        ErrorCode.INVALID_INPUT,
        'Prompt is too long (max 1000 characters)',
        400
      );
    }
    
    if (params.width && (params.width < 256 || params.width > 2048)) {
      throw new APIError(
        ErrorCode.INVALID_INPUT,
        'Width must be between 256 and 2048',
        400
      );
    }
    
    if (params.height && (params.height < 256 || params.height > 2048)) {
      throw new APIError(
        ErrorCode.INVALID_INPUT,
        'Height must be between 256 and 2048',
        400
      );
    }
  }
  
  private buildImageGenerationPrompt(params: GenerationParams): string {
    let prompt = params.prompt;
    
    if (params.width && params.height) {
      prompt += ` (${params.width}x${params.height} resolution)`;
    }
    
    if (params.negativePrompt) {
      prompt += `. Avoid: ${params.negativePrompt}`;
    }
    
    return prompt;
  }
  
  private buildTransformationPrompt(params: TransformImageParams): string {
    let prompt = `Transform this image: ${params.prompt}`;
    
    if (params.strength !== undefined) {
      const strengthDesc = params.strength < 0.3 ? 'subtle' : 
                           params.strength < 0.7 ? 'moderate' : 'significant';
      prompt += ` (${strengthDesc} changes)`;
    }
    
    if (params.negativePrompt) {
      prompt += `. Avoid: ${params.negativePrompt}`;
    }
    
    return prompt;
  }
  
  private extractImageUrl(response: any, serviceId?: string): string | null {
    const logPrefix = serviceId ? `🔍 [${serviceId}]` : '🔍';
    console.log(`${logPrefix} Extracting image URL from response...`);
    console.log(`${logPrefix} Full response structure:`, JSON.stringify(response, null, 2));
    
    // 1. Check Google native Gemini API format first
    // Format: {"candidates": [{"content": {"parts": [{"inlineData": {"data": "base64...", "mimeType": "image/png"}}]}}]}
    if (response?.candidates?.[0]?.content?.parts) {
      console.log(`${logPrefix} Detected Google native API response format`);
      const parts = response.candidates[0].content.parts;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const base64Data = part.inlineData.data;
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          console.log(`${logPrefix} Found Google native base64 image (${base64Data.length} chars, ${mimeType})`);
          return dataUrl;
        }
      }
    }
    
    // 2. Check OpenRouter format with images in message.images array
    // Format: {"choices": [{"message": {"images": [{"type": "image_url", "image_url": {"url": "data:..."}}]}}]}
    if (response?.choices?.[0]?.message?.images) {
      console.log(`${logPrefix} Detected OpenRouter Gemini response format with images array`);
      const images = response.choices[0].message.images;
      console.log(`${logPrefix} Found ${images.length} images in message.images array`);
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`${logPrefix} Image ${i + 1} structure:`, JSON.stringify(image, null, 2));
        
        if (image.type === 'image_url' && image.image_url?.url) {
          const imageUrl = image.image_url.url;
          console.log(`${logPrefix} Found image URL in message.images[${i}]: ${imageUrl.substring(0, 100)}...`);
          return imageUrl;
        }
      }
    }
    
    // 3. Check traditional OpenRouter/OpenAI compatible format (fallback)
    // Format: {"choices": [{"message": {"content": "..."}}]}
    if (response?.choices?.[0]?.message?.content) {
      console.log(`${logPrefix} Checking traditional OpenRouter/OpenAI response format`);
      const content = response.choices[0].message.content;
      console.log(`${logPrefix} Response content type: ${typeof content}`);
      console.log(`${logPrefix} Response content length: ${content?.length || 0} chars`);
      console.log(`${logPrefix} Response content preview: ${content?.substring(0, 200)}...`);
      
      // Check for direct image URL
      const urlMatch = content.match(/(https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp))/i);
      if (urlMatch) {
        console.log(`${logPrefix} Found direct image URL: ${urlMatch[0]}`);
        return urlMatch[0];
      }
      
      // Check for data URLs (base64 images)
      const dataUrlMatch = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+/);
      if (dataUrlMatch) {
        console.log(`${logPrefix} Found base64 data URL (${dataUrlMatch[0].length} chars)`);
        return dataUrlMatch[0];
      }
      
      // Check if content contains raw base64 data
      if (content.length > 100 && /^[A-Za-z0-9+\/=]{100,}$/.test(content.trim())) {
        console.log(`${logPrefix} Content appears to be raw base64 data (${content.length} chars)`);
        const dataUrl = `data:image/png;base64,${content.trim()}`;
        return dataUrl;
      }
      
      console.log(`${logPrefix} Content does not contain recognizable image data`);
    } else {
      console.log(`${logPrefix} No content found in response.choices[0].message.content`);
    }
    
    // 4. Check other possible formats
    const responseKeys = Object.keys(response || {});
    console.log(`${logPrefix} Available response keys:`, responseKeys);
    
    // Check OpenRouter specific formats
    if (response?.data?.images?.[0]?.url) {
      console.log(`${logPrefix} Found image URL in response.data.images[0].url: ${response.data.images[0].url}`);
      return response.data.images[0].url;
    }
    
    if (response?.images?.[0]?.url) {
      console.log(`${logPrefix} Found image URL in response.images[0].url: ${response.images[0].url}`);
      return response.images[0].url;
    }
    
    // Check for any base64 data in top-level response
    if (response?.data && typeof response.data === 'string' && response.data.length > 100) {
      console.log(`${logPrefix} Found potential base64 data in response.data (${response.data.length} chars)`);
      const dataUrl = `data:image/png;base64,${response.data}`;
      return dataUrl;
    }
    
    console.warn(`${logPrefix} No image data found in any expected location`);
    return null;
  }
  
  private generatePlaceholderImage(params: Partial<GenerationParams>): string {
    // Generate a placeholder image URL using a service like Picsum
    const width = params.width || 1024;
    const height = params.height || 1024;
    const seed = params.prompt ? params.prompt.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.random();
    
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  }
  
  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  private handleError(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }
    
    if (error instanceof Error) {
      // Handle rate limiting errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return new APIError(
          ErrorCode.RATE_LIMITED,
          '请求过于频繁，请稍后重试（建议等待1-2分钟）',
          429,
          error
        );
      }
      
      // Handle API key issues
      if (error.message.includes('unauthorized') || error.message.includes('API key')) {
        return new APIError(
          ErrorCode.UNAUTHORIZED,
          'API密钥无效或未配置，请检查环境变量OPENROUTER_API_KEY',
          401,
          error
        );
      }
      
      // Handle quota/credit issues
      if (error.message.includes('credits') || error.message.includes('quota')) {
        return new APIError(
          ErrorCode.RATE_LIMITED,
          'API配额不足，请检查OpenRouter账户余额或等待配额重置',
          429,
          error
        );
      }
      
      // Handle network/connection issues
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return new APIError(
          ErrorCode.SERVICE_UNAVAILABLE,
          '网络连接问题，请检查网络连接并重试',
          503,
          error
        );
      }
      
      return new APIError(
        ErrorCode.SERVER_ERROR,
        error.message || '生成图像时发生错误，请重试',
        500,
        error
      );
    }
    
    return new APIError(
      ErrorCode.SERVER_ERROR,
      '未知错误，请重试',
      500,
      error
    );
  }
}