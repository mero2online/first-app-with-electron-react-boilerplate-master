import React, { useState } from 'react';

function ThemeMode() {
  const [currentDarkMode, setCurrentDarkMode] = useState('System');
  
  const handleToggle = async () => {
    const isDarkMode = await window.darkMode.toggle();
    setCurrentDarkMode(isDarkMode ? 'Dark' : 'Light');
  };

  const handleSystem = async () => {
    await window.darkMode.system();
    setCurrentDarkMode('System');
  };

  const renderCurrentMode = () => {
    return <strong>{currentDarkMode}</strong>;
  };

  return (
    <div>
      <p>Current theme source: {renderCurrentMode()}</p>
      <div className='container mt-3'>
        <button
          type='button'
          className='btn btn-primary ms-3'
          onClick={handleToggle}
        >
          Toggle Dark Mode
        </button>
        <button
          type='button'
          className='btn btn-primary ms-3'
          onClick={handleSystem}
        >
          Reset to System Theme
        </button>
      </div>
    </div>
  );
}

export default ThemeMode;
