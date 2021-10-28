import React, { useState } from 'react';

function Actions() {
  const [result, setResult] = useState('');

  window.api.receive('fromMain', (data) => {
    if (data.runBatStatus) {
      setResult(data.runBatStatus);
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

  return (
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
  );
}

export default Actions;
