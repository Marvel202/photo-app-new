import { Cloudinary } from '@cloudinary/url-gen';

// Cloudinary configuration
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!, 
  },
});

// Types for upload response
export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  original_filename: string;
}

export const uploadToCloudinary = async (fileUri: string): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sample_preset';
  
  if (!cloudName) {
    throw new Error('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  try {
    console.log('Starting Cloudinary upload...');
    
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'photo-app');
    formData.append('tags', 'mobile,photo-app');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const result: CloudinaryUploadResult = await response.json();
    console.log('Cloudinary upload success:', result.public_id);
    return result;
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error}`);
  }
};

