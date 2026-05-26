import React from "react";

export const getImageStyles = (validation: any) => {
  if (!validation) return {};
  const styles: React.CSSProperties = {
    objectFit: 'cover',
  };
  
  if (validation.imageFocalPoint) {
    styles.objectPosition = validation.imageFocalPoint;
  }
  
  if (validation.imageAspectRatio && validation.imageAspectRatio !== 'auto') {
    styles.aspectRatio = validation.imageAspectRatio;
  }
  
  styles.width = validation.imageWidth || '100%';
  styles.height = validation.imageHeight || 'auto';
  styles.maxWidth = '100%';
  styles.maxHeight = '100%';
  
  const filters: string[] = [];
  const brightness = validation.imageBrightness !== undefined ? validation.imageBrightness : 100;
  filters.push(`brightness(${brightness}%)`);
  
  const filterType = validation.imageFilter || 'none';
  if (filterType === 'grayscale') filters.push('grayscale(100%)');
  else if (filterType === 'sepia') filters.push('sepia(100%)');
  else if (filterType === 'vintage') filters.push('sepia(40%) brightness(85%) contrast(115%)');
  else if (filterType === 'blur') filters.push('blur(4px)');
  else if (filterType === 'invert') filters.push('invert(100%)');
  else if (filterType === 'contrast') filters.push('contrast(150%)');
  else if (filterType === 'warm') filters.push('hue-rotate(20deg) saturate(120%)');
  else if (filterType === 'cool') filters.push('hue-rotate(-20deg) saturate(120%)');
  
  styles.filter = filters.join(' ');
  return styles;
};

export const getBgImageStyles = (validation: any) => {
  if (!validation) return {};
  const styles: React.CSSProperties = {
    objectFit: 'cover',
  };
  
  if (validation.bgImageFocalPoint) {
    styles.objectPosition = validation.bgImageFocalPoint;
  }
  
  const filters: string[] = [];
  const brightness = validation.bgImageBrightness !== undefined ? validation.bgImageBrightness : 100;
  filters.push(`brightness(${brightness}%)`);
  
  const filterType = validation.bgImageFilter || 'none';
  if (filterType === 'grayscale') filters.push('grayscale(100%)');
  else if (filterType === 'sepia') filters.push('sepia(100%)');
  else if (filterType === 'vintage') filters.push('sepia(40%) brightness(85%) contrast(115%)');
  else if (filterType === 'blur') filters.push('blur(4px)');
  else if (filterType === 'invert') filters.push('invert(100%)');
  else if (filterType === 'contrast') filters.push('contrast(150%)');
  else if (filterType === 'warm') filters.push('hue-rotate(20deg) saturate(120%)');
  else if (filterType === 'cool') filters.push('hue-rotate(-20deg) saturate(120%)');
  
  styles.filter = filters.join(' ');
  return styles;
};