import React, { useState } from 'react';

export default function App() {
  const [darkMode, setDarkMode] = useState('System');

  const handelNotify = () => {
    electron.notificationApi.sendNotification('My custom notification!');
  };

  const handelToggle = async () => {
    const isDarkMode = await window.darkMode.toggle();
    setDarkMode(isDarkMode ? 'Dark' : 'Light');
  };

  const handelSystem = async () => {
    await window.darkMode.system();
    setDarkMode('System');
  };

  const renderCurrentMode = () => {
    return <strong>{darkMode}</strong>;
  };

  return (
    <>
      <h1>I am App Component!!!</h1>
      <button onClick={handelNotify}>Notify</button>
      <p>Current theme source: {renderCurrentMode()}</p>
      <div>
        <button onClick={handelToggle}>Toggle Dark Mode</button>
        <button onClick={handelSystem}>Reset to System Theme</button>
      </div>
    </>
  );
}
