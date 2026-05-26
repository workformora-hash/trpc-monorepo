import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dfq6joxe8';
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare signed upload params
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'formora';
    
    const paramsToSign = {
      folder,
      timestamp,
    };

    // Alphabetical sorted keys for signing
    const sortedKeys = Object.keys(paramsToSign).sort() as (keyof typeof paramsToSign)[];
    const signatureString = sortedKeys
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // Prepare standard Cloudinary payload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', String(timestamp));
    cloudinaryFormData.append('folder', folder);
    cloudinaryFormData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Cloudinary error: ${errorText}` }, { status: 520 });
    }

    const data = await response.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
