import React, { useState } from 'react';

export default function App() {
  const [currentDarkMode, setCurrentDarkMode] = useState('System');
  const [result, setResult] = useState('');

  const handelNotify = () => {
    electron.notificationApi.sendNotification('My custom notification!');
  };

  const handelNotifyTwo = async () => {
    const resultFromMain = await electron.notificationApi.sendNotificationTwo(
      'My custom notification Two!'
    );
    setResult(resultFromMain);
  };

  const handelToggle = async () => {
    const isDarkMode = await window.darkMode.toggle();
    setCurrentDarkMode(isDarkMode ? 'Dark' : 'Light');
  };

  const handelSystem = async () => {
    await window.darkMode.system();
    setCurrentDarkMode('System');
  };

  const renderCurrentMode = () => {
    return <strong>{currentDarkMode}</strong>;
  };

  return (
    <>
      <h1>I am App Component!!!</h1>
      <button onClick={handelNotify}>Notify</button>
      <button onClick={handelNotifyTwo}>Notify Two</button>
      <p>Current theme source: {renderCurrentMode()}</p>
      <div>
        <button onClick={handelToggle}>Toggle Dark Mode</button>
        <button onClick={handelSystem}>Reset to System Theme</button>
      </div>
      <h2>{result}</h2>
    </>
  );
}
