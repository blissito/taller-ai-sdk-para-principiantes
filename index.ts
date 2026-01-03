import "dotenv/config";

// Re-exportar las funciones del thumbnail generator
export {
  generateThumbnailPrompt,
  generateSingleThumbnail,
  generateAllThumbnails,
  generateThumbnail,
  THUMBNAIL_STYLES,
  THUMBNAIL_FORMATS,
  type ThumbnailStyle,
  type ThumbnailFormat,
} from "./thumbnail-generator.js";
