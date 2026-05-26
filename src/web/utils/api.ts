interface Data {
  id: number;
  name: string;
}

const fetchData = async (data: Data): Promise<void> => {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const jsonData = await response.json();
    console.log(jsonData);
  } catch (error) {
    console.error(error);
  }
};

export default fetchData;
