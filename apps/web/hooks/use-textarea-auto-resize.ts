import { useRef, useLayoutEffect } from 'react';

export function useTextareaAutoResize(value: string | undefined, dependencies: any[] = []) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;

    // Maintain parent scroll position to prevent "jumping"
    const parent = textarea.closest('main');
    const scrollPos = parent ? parent.scrollTop : 0;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (parent) {
      parent.scrollTop = scrollPos;
    }
  };

  useLayoutEffect(() => {
    if (value !== undefined) {
      resizeTextarea(textareaRef.current);
    }
  }, [value, ...dependencies]);

  return textareaRef;
}
