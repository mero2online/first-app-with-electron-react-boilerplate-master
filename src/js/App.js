import React, { useState } from 'react';

export default function App() {
  const [currentDarkMode, setCurrentDarkMode] = useState('System');
  const [result, setResult] = useState('');
  const [resultBat, setResultBat] = useState('');

  window.api.receive('fromMain', (data) => {
    setResultBat(data);
  });

  const handleNotify = () => {
    electron.notificationApi.sendNotification('My custom notification!');
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

  return (
    <>
      <h1>I am App Component!!!</h1>
      <button onClick={handleNotify}>Notify</button>
      <button onClick={handleNotifyTwo}>Notify Two</button>
      <button onClick={handleRunBat}>Run Bat</button>
      <p>Current theme source: {renderCurrentMode()}</p>
      <div>
        <button onClick={handleToggle}>Toggle Dark Mode</button>
        <button onClick={handleSystem}>Reset to System Theme</button>
      </div>
      <h2>{result}</h2>
      <h2>{resultBat}</h2>
    </>
  );
}
