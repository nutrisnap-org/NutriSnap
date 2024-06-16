import sharp from 'sharp';
import axios from 'axios';
import FormData from 'form-data';
import { NextResponse } from 'next/server';

const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dd5khtlxa/image/upload';
const cloudinaryUploadPreset = 'ttoifqeh';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const urls = searchParams.getAll('url');

  if (urls.length === 0) {
    return NextResponse.json({ error: 'No image URLs provided' }, { status: 400 });
  }

  try {
    const images = await Promise.all(
      urls.map(async (url) => {
        const response = await axios({
          url,
          responseType: 'arraybuffer',
        });
        return sharp(response.data).resize(250, 250).toBuffer(); // Resize to 250x250
      })
    );

    // Combine images in a grid
    const collage = await sharp({
      create: {
        width: 250 * urls.length,
        height: 250,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
      .composite(images.map((buffer, i) => ({ input: buffer, top: 0, left: i * 250 })))
      .png()
      .toBuffer();

    // Upload the collage to Cloudinary
    const formData = new FormData();
    formData.append('file', collage, { filename: 'collage.png' });
    formData.append('upload_preset', cloudinaryUploadPreset);

    const cloudinaryResponse = await axios.post(cloudinaryUploadUrl, formData, {
      headers: formData.getHeaders(),
    });

    const imageUrl = cloudinaryResponse.data.secure_url;

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error creating collage:', error);
    return NextResponse.json({ error: 'Failed to create collage' }, { status: 500 });
  }
}

