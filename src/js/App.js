import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function App() {
  const [currentDarkMode, setCurrentDarkMode] = useState('System');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  window.api.receive('fromMain', (data) => {
    if (data.runBatStatus) {
      setResult(data.runBatStatus);
    }
    if (data.loading) {
      setLoading(data.loading);
    }
  });

  const handleNotify = () => {
    setResult('');
    setTimeout(() => {
      electron.notificationApi.sendNotification('My custom notification!');
    }, 500);
  };

  const handleNotifyTwo = async () => {
    const resultFromMain = await electron.notificationApi.sendNotificationTwo(
      'My custom notification Two!'
    );
    setResult(resultFromMain);
  };

  const handleRunBat = async () => {
    await window.api.runBat();
  };

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
      <hr className='divider' />
      <div className='container mt-3'>
        <button
          type='button'
          className='btn btn-primary ms-3'
          onClick={handleNotify}
        >
          Notify
        </button>
        <button
          type='button'
          className='btn btn-primary ms-3'
          onClick={handleNotifyTwo}
        >
          Notify Two
        </button>
        <button
          type='button'
          className='btn btn-primary ms-3'
          onClick={handleRunBat}
        >
          Run Bat
        </button>
        <h2>{result}</h2>
      </div>
      <hr className='divider' />
      {renderLoadingSpinner()}
    </div>
  );
}
