import type { OpenGraph } from '@astrolib/seo';
import type { ImageMetadata } from 'astro';
import type { ImagesOptimizer } from './images-optimization';
import { astroAssetsOptimizer, isUnpicCompatible, unpicOptimizer } from './images-optimization';
/** The optimized image shape returned by our ImagesOptimizer */
type OptimizedImage = Awaited<ReturnType<ImagesOptimizer>>[0];

const load = async function () {
  let images: Record<string, () => Promise<unknown>> | undefined = undefined;
  try {
    images = import.meta.glob('~/assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // continue regardless of error
  }
  return images;
};

let _images: Record<string, () => Promise<unknown>> | undefined = undefined;

/** */
export const fetchLocalImages = async () => {
  _images = _images || (await load());
  return _images;
};

/** */
export const findImage = async (
  imagePath?: string | ImageMetadata | null
): Promise<string | ImageMetadata | undefined | null> => {
  // Not string
  if (typeof imagePath !== 'string') {
    return imagePath;
  }

  // Absolute paths
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
    return imagePath;
  }

  // Relative paths or not "~/assets/"
  if (!imagePath.startsWith('~/assets/images')) {
    return imagePath;
  }

  const images = await fetchLocalImages();
  const key = imagePath.replace('~/', '/src/');

  return images && typeof images[key] === 'function'
    ? ((await images[key]()) as { default: ImageMetadata })['default']
    : null;
};

/** 生成品牌色渐变占位图 */
export const generatePlaceholderImage = (title: string): string => {
  // 使用品牌色渐变作为占位图
  const gradient = 'linear-gradient(135deg, #3b82f6, #1e40af)';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = 400;
  canvas.height = 225; // 16:9 比例

  // 创建渐变
  const gradientObj = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradientObj.addColorStop(0, '#3b82f6');
  gradientObj.addColorStop(1, '#1e40af');

  // 绘制背景
  ctx.fillStyle = gradientObj;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 添加文字首字母
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = 'bold 48px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
};

/** 检查图片是否存在，不存在则返回占位图 */
export const getImageWithPlaceholder = async (
  imagePath?: string | ImageMetadata | null,
  title?: string
): Promise<string | ImageMetadata | undefined | null> => {
  const image = await findImage(imagePath);

  if (!image && title) {
    // 如果图片不存在且有标题，生成占位图
    return generatePlaceholderImage(title);
  }

  return image;
};

/** */
export const adaptOpenGraphImages = async (
  openGraph: OpenGraph = {},
  astroSite: URL | undefined = new URL('')
): Promise<OpenGraph> => {
  if (!openGraph?.images?.length) {
    return openGraph;
  }

  const defaultWidth = 1200;
  const defaultHeight = 630;
  const site = astroSite ?? new URL('');

  const adaptedImages = openGraph.images
    .filter((img) => Boolean(img?.url))
    .map((img) => {
      const rawUrl = String(img?.url || '');
      const absoluteUrl =
        rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
          ? rawUrl
          : String(new URL(rawUrl.replace(/^\//, ''), site)); // 统一转为绝对URL
      return {
        url: absoluteUrl,
        width: Number(img?.width) || defaultWidth,
        height: Number(img?.height) || defaultHeight,
      };
    });

  return { ...openGraph, images: adaptedImages };
};
