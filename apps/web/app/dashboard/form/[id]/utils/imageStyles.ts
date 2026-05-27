import type { CSSProperties } from 'react';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'blur' | 'invert' | 'contrast' | 'warm' | 'cool';

const FILTER_MAP: Record<FilterType, string> = {
  none: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  vintage: 'sepia(40%) brightness(85%) contrast(115%)',
  blur: 'blur(4px)',
  invert: 'invert(100%)',
  contrast: 'contrast(150%)',
  warm: 'hue-rotate(20deg) saturate(120%)',
  cool: 'hue-rotate(-20deg) saturate(120%)',
};

function buildFilterString(filterType: string, brightness: number): string {
  const filters: string[] = [`brightness(${brightness}%)`];
  const extra = FILTER_MAP[filterType as FilterType];
  if (extra) filters.push(extra);
  return filters.join(' ');
}

/** CSS properties for the main layout image (imageUrl) */
export function getImageStyles(validation: Record<string, unknown>): CSSProperties {
  if (!validation) return {};
  const brightness = (validation.imageBrightness as number) ?? 100;
  return {
    objectFit: 'cover',
    objectPosition: (validation.imageFocalPoint as string) || undefined,
    aspectRatio: validation.imageAspectRatio && validation.imageAspectRatio !== 'auto'
      ? (validation.imageAspectRatio as string)
      : undefined,
    width: (validation.imageWidth as string) || '100%',
    height: (validation.imageHeight as string) || 'auto',
    filter: buildFilterString((validation.imageFilter as string) || 'none', brightness),
  };
}

/** CSS properties for the full-bleed background image (bgImageUrl) */
export function getBgImageStyles(validation: Record<string, unknown>): CSSProperties {
  if (!validation) return {};
  const brightness = (validation.bgImageBrightness as number) ?? 100;
  return {
    objectFit: 'cover',
    objectPosition: (validation.bgImageFocalPoint as string) || undefined,
    filter: buildFilterString((validation.bgImageFilter as string) || 'none', brightness),
  };
}
