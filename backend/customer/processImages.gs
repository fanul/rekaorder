/**
 * RekaOrder - Image Processing
 * Convert stored image IDs to viewable URLs
 */

function processProductImages(imagesField) {
  if (!imagesField) return [];

  // Try JSON first
  try {
    const parsed = JSON.parse(imagesField);
    if (Array.isArray(parsed)) {
      return parsed.map(img => ({
        id: img.id || img,
        url: img.url || getImageUrl(img.id || img)
      }));
    }
  } catch (e) {}

  // Comma-separated IDs
  const ids = imagesField.split(',').map(id => id.trim()).filter(id => id);
  return ids.map(id => ({
    id: id,
    url: getImageUrl(id)
  }));
}

function getImageUrl(fileIdOrUrl) {
  if (!fileIdOrUrl) return '';
  if (fileIdOrUrl.startsWith('http')) return fileIdOrUrl;
  return `https://docs.google.com/uc?export=download&id=${fileIdOrUrl}`;
}
