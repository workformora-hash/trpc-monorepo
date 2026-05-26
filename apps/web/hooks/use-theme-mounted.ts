import { useState, useEffect } from 'react';

export function useThemeMounted() {
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  return themeMounted;
}
