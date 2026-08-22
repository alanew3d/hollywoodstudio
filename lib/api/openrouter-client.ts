import OpenAI from 'openai';

export class OpenRouterClient {
  private client: OpenAI;
  
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not configured. Please check your .env.local file.');
    }
    
    if (apiKey === 'your_api_key_here' || apiKey.length < 10) {
      throw new Error('OPENROUTER_API_KEY appears to be invalid. Please set a valid API key from https://openrouter.ai/keys');
    }
    
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Image Generation App',
      }
    });
  }
  
  async generateImage(params: {
    prompt: string;
    negativePrompt?: string;
    model?: string;
  }) {
    const maxRetries = 3;
    let attempt = 0;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const modelName = params.model || 'google/gemini-2.5-flash-image-preview';
    
    console.log(`🚀 [${requestId}] Starting image generation request`);
    console.log(`📝 [${requestId}] Model: ${modelName}`);
    console.log(`💬 [${requestId}] Prompt: "${params.prompt}"`);
    if (params.negativePrompt) {
      console.log(`🚫 [${requestId}] Negative prompt: "${params.negativePrompt}"`);
    }
    
    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(`🔄 [${requestId}] Attempt ${attempt}/${maxRetries}`);
        
        // Build the prompt for image generation (avoid duplicate "Generate an image")
        let imagePrompt = params.prompt;
        if (params.negativePrompt) {
          imagePrompt += `. Avoid: ${params.negativePrompt}`;
        }
        
        console.log(`📤 [${requestId}] Sending request to OpenRouter...`);
        const startTime = Date.now();
        
        // Try different request formats for Gemini image generation
        let requestPayload: any;
        
        // For Gemini image generation models, try Google native format first
        if (modelName.includes('gemini') && modelName.includes('image')) {
          console.log(`${requestId} Using Google native format for Gemini image model`);
          requestPayload = {
            model: modelName,
            // Try Google native format through OpenRouter
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: imagePrompt
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          };
        } else {
          console.log(`${requestId} Using standard OpenAI format`);
          requestPayload = {
            model: modelName,
            messages: [
              {
                role: 'user',
                content: imagePrompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          };
        }
        
        console.log(`📋 [${requestId}] Request payload:`, JSON.stringify(requestPayload, null, 2));
        
        const response = await this.client.chat.completions.create(requestPayload);
        
        const duration = Date.now() - startTime;
        console.log(`✅ [${requestId}] Response received in ${duration}ms`);
        console.log(`📥 [${requestId}] Full response:`, JSON.stringify(response, null, 2));
        
        // Log specific parts of the response
        if (response?.choices?.[0]?.message?.content) {
          console.log(`💭 [${requestId}] Response content:`, response.choices[0].message.content);
        } else {
          console.warn(`⚠️ [${requestId}] No content in response choices[0].message`);
        }
        
        if (response?.usage) {
          console.log(`📊 [${requestId}] Token usage:`, response.usage);
        }
        
        return response;
        
      } catch (error: any) {
        const duration = Date.now() - (Date.now() - 1000); // Approximate
        console.error(`❌ [${requestId}] Error on attempt ${attempt}:`, {
          status: error.status,
          message: error.message,
          code: error.code,
          type: error.type,
          headers: error.headers ? Object.fromEntries(error.headers.entries()) : undefined,
          duration
        });
        
        // Handle rate limiting with retry
        if (error.status === 429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ [${requestId}] Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Handle specific error types
        if (error.status === 429) {
          console.error(`🚫 [${requestId}] Rate limit exceeded after all retries`);
          throw new Error('服务当前请求过多，请稍后重试（通常1-2分钟后恢复）');
        }
        
        if (error.message?.includes('insufficient credits')) {
          console.error(`💳 [${requestId}] Insufficient credits`);
          throw new Error('API配额不足，请检查OpenRouter账户余额');
        }
        
        if (error.status === 401) {
          console.error(`🔐 [${requestId}] Authentication failed`);
          throw new Error('API密钥无效，请检查OPENROUTER_API_KEY环境变量');
        }
        
        console.error(`💥 [${requestId}] Unexpected error after ${attempt} attempts`);
        throw error;
      }
    }
  }
  
  async generateImageWithReference(params: {
    imageUrl: string;
    prompt: string;
    negativePrompt?: string;
    model?: string;
  }) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        // Build the prompt for image transformation
        let transformPrompt = `Transform this image: ${params.prompt}`;
        if (params.negativePrompt) {
          transformPrompt += `. Avoid: ${params.negativePrompt}`;
        }
        
        const response = await this.client.chat.completions.create({
          model: params.model || 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: transformPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: params.imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });
        
        return response;
        
      } catch (error: any) {
        console.error('OpenRouter API Error:', error);
        attempt++;
        
        // Handle rate limiting with retry
        if (error.status === 429 && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Handle specific error types
        if (error.status === 429) {
          throw new Error('服务当前请求过多，请稍后重试（通常1-2分钟后恢复）');
        }
        
        if (error.message?.includes('insufficient credits')) {
          throw new Error('API配额不足，请检查OpenRouter账户余额');
        }
        
        if (error.status === 401) {
          throw new Error('API密钥无效，请检查OPENROUTER_API_KEY环境变量');
        }
        
        throw error;
      }
    }
  }
  
  getClient() {
    return this.client;
  }
}