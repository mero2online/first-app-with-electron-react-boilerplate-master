import React, { useState } from 'react';
import ThemeMode from './ThemeMode';
import Actions from './Actions';
import LoadingSpinner from './LoadingSpinner';

export default function App() {
  const [loading, setLoading] = useState(false);

  window.api.receive('fromMain', (data) => {
    if (data.loading) {
      setLoading(data.loading);
    }
  });

  const renderLoadingSpinner = () => {
    if (loading === 'TRUE') {
      return <LoadingSpinner />;
    } else {
      return null;
    }
  };

  return (
    <div className='container text-center'>
      <h1>App Component</h1>
      <ThemeMode />
      <hr className='divider' />
      <Actions />
      <hr className='divider' />
      {renderLoadingSpinner()}
    </div>
  );
}
