import { useState, useEffect } from 'react';

interface FetchResponse {
  data: string;
  error: string;
}

const useFetch = (url: string): FetchResponse => {
  const [response, setResponse] = useState<FetchResponse>({ data: '', error: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const jsonData = await response.json();
        setResponse({ data: JSON.stringify(jsonData), error: '' });
      } catch (error) {
        setResponse({ data: '', error: error.message });
      }
    };

    fetchData();
  }, [url]);

  return response;
};

export default useFetch;
