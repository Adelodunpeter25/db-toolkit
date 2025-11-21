const { dialog, shell, app, BrowserWindow } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const GITHUB_REPO = 'Adelodunpeter25/db-toolkit';
const CURRENT_VERSION = '0.5.1';

function compareVersions(current, latest) {
  const c = current.replace('v', '').split('.').map(Number);
  const l = latest.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (l[i] > c[i]) return 1;
    if (l[i] < c[i]) return -1;
  }
  return 0;
}

function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: { 'User-Agent': 'DB-Toolkit' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error('Failed to fetch release'));
        }
      });
    }).on('error', reject);
  });
}

function getAssetForPlatform(assets) {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    return assets.find(a => a.name.endsWith('.dmg'));
  } else if (platform === 'win32') {
    return assets.find(a => a.name.endsWith('.exe'));
  } else if (platform === 'linux') {
    return assets.find(a => a.name.endsWith('.AppImage')) || 
           assets.find(a => a.name.endsWith('.deb'));
  }
  return null;
}

function downloadFile(url, destPath, progressCallback) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    https.get(url, { headers: { 'User-Agent': 'DB-Toolkit' } }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, destPath, progressCallback)
          .then(resolve)
          .catch(reject);
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = (downloadedSize / totalSize) * 100;
        progressCallback(progress);
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function createProgressWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 150,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 10px;
          }
          .container {
            text-align: center;
          }
          .title {
            font-size: 16px;
            margin-bottom: 15px;
          }
          .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #2563eb);
            width: 0%;
            transition: width 0.3s;
          }
          .percentage {
            margin-top: 10px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Downloading Update...</div>
          <div class="progress-bar">
            <div class="progress-fill" id="progress"></div>
          </div>
          <div class="percentage" id="percentage">0%</div>
        </div>
      </body>
    </html>
  `)}`);
  
  return win;
}

async function downloadUpdate(release) {
  const asset = getAssetForPlatform(release.assets);
  
  if (!asset) {
    dialog.showMessageBox({
      type: 'error',
      title: 'Download Failed',
      message: 'No installer found for your platform',
      buttons: ['OK']
    });
    return;
  }
  
  const progressWin = createProgressWindow();
  const downloadPath = path.join(os.homedir(), 'Downloads', asset.name);
  
  try {
    await downloadFile(asset.browser_download_url, downloadPath, (progress) => {
      progressWin.webContents.executeJavaScript(`
        document.getElementById('progress').style.width = '${progress}%';
        document.getElementById('percentage').textContent = '${Math.round(progress)}%';
      `);
    });
    
    progressWin.close();
    
    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'Download Complete',
      message: 'Update downloaded successfully!',
      detail: `The installer has been saved to your Downloads folder.\n\nClick "Quit and Install" to close DB Toolkit and open the installer.`,
      buttons: ['Quit and Install', 'Install Later'],
      defaultId: 0
    });
    
    if (response.response === 0) {
      shell.openPath(downloadPath);
      app.quit();
    } else {
      shell.showItemInFolder(downloadPath);
    }
  } catch (error) {
    progressWin.close();
    dialog.showMessageBox({
      type: 'error',
      title: 'Download Failed',
      message: 'Failed to download update',
      detail: error.message,
      buttons: ['OK']
    });
  }
}

async function checkForUpdates() {
  try {
    const release = await fetchLatestRelease();
    const latestVersion = release.tag_name;
    const comparison = compareVersions(CURRENT_VERSION, latestVersion);

    if (comparison < 0) {
      const response = await dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `DB Toolkit ${latestVersion} is available!`,
        detail: `You are currently using version ${CURRENT_VERSION}.\n\n${release.name}\n\n${release.body?.substring(0, 200) || ''}...`,
        buttons: ['Download Update', 'Later'],
        defaultId: 0
      });

      if (response.response === 0) {
        await downloadUpdate(release);
      }
    } else {
      dialog.showMessageBox({
        type: 'info',
        title: 'No Updates',
        message: 'You\'re up to date!',
        detail: `DB Toolkit ${CURRENT_VERSION} is the latest version.`,
        buttons: ['OK']
      });
    }
  } catch (error) {
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Check Failed',
      message: 'Unable to check for updates',
      detail: 'Please check your internet connection and try again.',
      buttons: ['OK']
    });
  }
}

module.exports = { checkForUpdates };
