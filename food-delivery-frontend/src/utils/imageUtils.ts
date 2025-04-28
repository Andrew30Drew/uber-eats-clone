/**
 * Compresses an image file to a target size in KB
 * @param file The image file to compress
 * @param targetSizeKB The target size in KB (default: 800KB to stay under 1MB limit)
 * @returns A promise that resolves to a compressed file
 */
export const compressImage = (
  file: File,
  targetSizeKB: number = 800
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // Create canvas for image manipulation
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        // Start with original dimensions
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        const aspectRatio = width / height;

        // Set initial quality - start with high quality
        let quality = 0.9;

        // Maximum dimensions for reasonable display
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        // Resize if too large while maintaining aspect ratio
        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = width / aspectRatio;
        }

        if (height > MAX_HEIGHT) {
          height = MAX_HEIGHT;
          width = height * aspectRatio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Function to compress and check size
        const compressWithQuality = (q: number): Promise<Blob> => {
          return new Promise((resolve) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to create blob"));
              },
              "image/jpeg",
              q
            );
          });
        };

        // Try to compress the image until it's under target size
        const attemptCompression = async () => {
          try {
            let blob = await compressWithQuality(quality);

            // If still too large, reduce quality and try again
            if (blob.size > targetSizeKB * 1024 && quality > 0.1) {
              quality -= 0.1; // Reduce quality
              blob = await attemptCompression();
            }

            return blob;
          } catch (error) {
            reject(error);
            throw error;
          }
        };

        // Start compression process
        attemptCompression().then(resolve).catch(reject);
      };

      img.onerror = () => {
        reject(new Error("Error loading image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
  });
};

/**
 * Converts a Blob to a base64 string
 * @param blob The blob to convert
 * @returns A promise that resolves to the base64 string without the data URL prefix
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Remove the data URL prefix (e.g., data:image/jpeg;base64,)
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
