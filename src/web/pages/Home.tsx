import React from 'react';

const Home: React.FC = () => {
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event);
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Click me</button>
    </div>
  );
};

export default Home;
