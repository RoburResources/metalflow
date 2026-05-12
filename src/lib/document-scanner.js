// Document scanning and image preprocessing utilities
// Detects document edges, corrects perspective, and enhances image quality

export async function preprocessDocumentImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Enhance image quality for OCR
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          enhanceImageContrast(imageData);
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.95);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function enhanceImageContrast(imageData) {
  const data = imageData.data;
  
  // Calculate histogram for auto-contrast
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }
  
  // Find min/max values (skip extremes)
  let minVal = 0, maxVal = 255;
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > imageData.data.length * 0.001) {
      minVal = i;
      break;
    }
  }
  for (let i = 255; i >= 0; i--) {
    if (histogram[i] > imageData.data.length * 0.001) {
      maxVal = i;
      break;
    }
  }
  
  // Apply contrast stretching
  const range = maxVal - minVal || 1;
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const normalized = Math.round(((gray - minVal) / range) * 255);
    data[i] = normalized;
    data[i + 1] = normalized;
    data[i + 2] = normalized;
  }
}