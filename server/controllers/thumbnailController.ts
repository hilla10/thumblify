import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const stylePrompts = {
  'Bold & Graphic':
    'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
  'Tech/Futuristic':
    'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
  Minimalist:
    'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
  Photorealistic:
    'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
  Illustrated:
    'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative catoon or vector art style',
};

const colorSchemeDescriptions = {
  vibrant:
    'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
  sunset:
    'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
  forest:
    'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
  neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
  purple:
    'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
  monochrome:
    'black and white color scheme high contrast, dramatic lighting, timeless aesthetic',
  ocean:
    'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
  pastel:
    'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
};

export const generateThumbnail = async (req: Request, res: Response) => {
  let filePath: string | undefined;
  let thumbnail: any = null;

  try {
    const { userId } = req.session;

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    // Create the database record.
    thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio: aspect_ratio || '16:9',
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // Build the prompt using your existing style and color descriptions.
    let prompt = `Create a professional YouTube thumbnail for: "${title}". `;

    if (style && stylePrompts[style as keyof typeof stylePrompts]) {
      prompt += stylePrompts[style as keyof typeof stylePrompts] + '. ';
    }

    // if (color_scheme) {
    //   prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
    // }

    if (
      color_scheme &&
      colorSchemeDescriptions[
        color_scheme as keyof typeof colorSchemeDescriptions
      ]
    ) {
      prompt += `Use this color scheme: ${
        colorSchemeDescriptions[
          color_scheme as keyof typeof colorSchemeDescriptions
        ]
      }. `;
    }

    if (user_prompt) {
      prompt += `Additional details: ${user_prompt}.`;
    }

    if (text_overlay) {
      prompt += `Include this exact text in the thumbnail: ${text_overlay}. `;
    }

    prompt += `Make the thumbnail bold and professional,
with a clear focal point, strong contrast, and readable composition.
Aspect ratio: ${aspect_ratio || '16:9'}.`;

    //   Generate the image using the ai model

    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: 'Image generation is not configured.',
      });
    }

    const url = new URL(
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`,
    );

    // Select an image model available to your API key.
    url.searchParams.set('model', 'flux');

    const dimensions: Record<string, [number, number]> = {
      '16:9': [1280, 720],
      '1:1': [1024, 1024],
      '4:3': [1024, 768],
      '3:2': [1200, 800],
      '9:16': [720, 1280],
    };

    const ratio =
      typeof aspect_ratio === 'string' && dimensions[aspect_ratio]
        ? aspect_ratio
        : '16:9';

    const [width, height] = dimensions[ratio];

    url.searchParams.set('width', String(width));
    url.searchParams.set('height', String(height));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const details = await response.text();

      console.error('Pollinations error:', response.status, details);

      throw new Error(
        `Pollinations API error (${response.status}): ${details}`,
      );
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.startsWith('image/')) {
      throw new Error('Pollinations did not return an image');
    }

    const finalBuffer = Buffer.from(await response.arrayBuffer());

    if (!finalBuffer.length) {
      throw new Error('The generated image is empty');
    }

    // Choose a file extension matching the returned image.
    const extensionByType: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
    };

    const extension = extensionByType[contentType.split(';')[0]] || '.img';

    const imageDirectory = path.join(process.cwd(), 'images');

    //   create the image directory if it doesn't exist
    fs.mkdirSync('images', { recursive: true });

    fs.mkdirSync(imageDirectory, { recursive: true });

    filePath = path.join(
      imageDirectory,
      `thumbnail-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${extension}`,
    );

    fs.writeFileSync(filePath, finalBuffer);

    // Upload the image to Cloudinary.
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
    });

    // Update and save the thumbnail.
    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;

    await thumbnail.save();

    return res.status(201).json({
      message: 'Thumbnail generated successfully.',
      thumbnail,
    });
  } catch (error: unknown) {
    console.error('Thumbnail generation error:', error);

    if (thumbnail) {
      try {
        thumbnail.isGenerating = false;
        await thumbnail.save();
      } catch (saveError) {
        console.error('Failed to update thumbnail status:', saveError);
      }
    }

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : 'Server error while generating thumbnail.',
    });
  } finally {
    // Remove the temporary file even if an operation fails.
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Failed to remove temporary image:', cleanupError);
      }
    }
  }
};

// Controllers for thumbnail deletion
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findByIdAndDelete({ _id: id, userId });

    res.status(200).json({ message: 'Thumbnail deleted successfully.' });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message || 'Server Error!' });
  }
};
