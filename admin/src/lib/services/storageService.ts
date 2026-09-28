import { storage, isFirebaseConfigured } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export interface UploadProgressCallback {
  (progress: number): void;
}

export const storageService = {
  /**
   * Upload an image to Firebase Storage or create a base64/object URL fallback
   */
  async uploadImage(
    file: File,
    folder: 'menu' | 'staff' | 'branding' = 'menu',
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be less than 5MB');
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WEBP, and AVIF image formats are allowed');
    }

    if (isFirebaseConfigured && storage) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });
    }

    // Client-side fallback: simulate upload progress and return object URL / data URL
    if (onProgress) {
      onProgress(30);
      await new Promise(r => setTimeout(r, 150));
      onProgress(70);
      await new Promise(r => setTimeout(r, 150));
      onProgress(100);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }
};
