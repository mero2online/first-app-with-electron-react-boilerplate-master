import React, { useState, useEffect } from 'react';

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
    await window.api.runScriptFile('script', '.bat');
  };

  const handleRunBatLock = async () => {
    await window.api.runScriptFile('Lock-PC', '.bat');
  };
  useEffect(() => {
    checkTask();
    console.log('mounted');
  }, []);

  const checkTask = async () => {
    let batFileExist = await window.api.checkFileExist(
      'Electron-cmd-elevated.bat'
    );
    let psFileExist = await window.api.checkFileExist(
      'Electron-powershell-elevated-Add.ps1'
    );

    if (!batFileExist) {
      await window.api.saveScript('Electron-cmd-elevated.bat', '');
    }
    if (!psFileExist) {
      await window.api.saveScript(
        'Electron-powershell-elevated-Add.ps1',
        `$Action= New-ScheduledTaskAction -Execute "cmd.exe" -Argument '/c start "" "{CURRENT_PATH}Electron-cmd-elevated.bat"'
      Register-ScheduledTask -TaskName "Electron-CMD-Elevated-Task" -Action $Action -RunLevel Highest -Force`
      );
      await window.api.saveScript(
        'Electron-powershell-elevated-Add-Run.ps1',
        `start-process powershell -argument {CURRENT_PATH}Electron-powershell-elevated-Add.ps1 -verb runas`
      );
      await window.api.runScriptFile(
        'Electron-powershell-elevated-Add-Run',
        '.ps1'
      );
    }
  };

  const handleSetIPWifi = async () => {
    let batFileExist = await window.api.checkFileExist(
      'Electron-cmd-elevated.bat'
    );
    let psFileExist = await window.api.checkFileExist(
      'Electron-CMD-Elevated-Task.ps1'
    );
    if (batFileExist) {
      await window.api.deleteFile('Electron-cmd-elevated.bat');
    }
    if (psFileExist) {
      await window.api.deleteFile('Electron-CMD-Elevated-Task.ps1');
    }

    await window.api.saveScript(
      'Electron-cmd-elevated.bat',
      `netsh interface ipv4 set address name="Wi-Fi" source=static ^
      addr=192.168.1.151 mask=255.255.255.0 gateway=192.168.1.1
      netsh interface ip add dns name="Wi-Fi" addr=192.168.1.1 validate=no
      netsh interface ip add dns name="Wi-Fi" addr=8.8.8.8 validate=no index=2
      netsh interface ipv4 add address "Wi-Fi" 192.168.10.99 255.255.255.0
      exit`
    );

    await window.api.saveScript(
      'Electron-CMD-Elevated-Task.ps1',
      `SCHTASKS /Run /TN "Electron-CMD-Elevated-Task"`
    );
    await window.api.runScriptFile('Electron-CMD-Elevated-Task', '.ps1');
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
      <button
        type='button'
        className='btn btn-primary ms-3'
        onClick={handleRunBatLock}
      >
        Run Bat Lock-PC
      </button>
      <button
        type='button'
        className='btn btn-primary ms-3'
        onClick={handleSetIPWifi}
      >
        Run Bat Set IP WiFi
      </button>
      <h2>{result}</h2>
    </div>
  );
}

export default Actions;
