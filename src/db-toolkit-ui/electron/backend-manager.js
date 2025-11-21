const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

class BackendManager {
  constructor() {
    this.process = null;
    this.port = null;
    this.baseUrl = null;
  }

  getBackendPath() {
    const isDev = !require('electron').app.isPackaged;
    
    if (isDev) {
      return null; // In dev, backend runs separately
    }

    const platform = process.platform;
    const resourcesPath = process.resourcesPath;
    
    if (platform === 'win32') {
      return path.join(resourcesPath, 'backend', 'db-toolkit-backend.exe');
    } else if (platform === 'darwin') {
      return path.join(resourcesPath, 'backend', 'db-toolkit-backend');
    } else {
      return path.join(resourcesPath, 'backend', 'db-toolkit-backend');
    }
  }

  async waitForBackend(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await axios.get(`${this.baseUrl}/api/v1/health`, { timeout: 1000 });
        console.log('Backend is ready');
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Backend failed to start within timeout');
  }

  async start() {
    const backendPath = this.getBackendPath();
    
    if (!backendPath) {
      // Development mode - backend runs separately
      this.port = 8000;
      this.baseUrl = `http://127.0.0.1:${this.port}`;
      console.log('Development mode: Using external backend on port 8000');
      return this.baseUrl;
    }

    if (!fs.existsSync(backendPath)) {
      throw new Error(`Backend executable not found at: ${backendPath}`);
    }

    return new Promise((resolve, reject) => {
      console.log('Starting backend:', backendPath);
      
      this.process = spawn(backendPath, [], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });

      let portFound = false;

      this.process.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Backend:', output);

        // Look for port in output
        const match = output.match(/BACKEND_PORT:(\d+)/);
        if (match && !portFound) {
          portFound = true;
          this.port = parseInt(match[1]);
          this.baseUrl = `http://127.0.0.1:${this.port}`;
          console.log(`Backend started on port ${this.port}`);
          
          // Wait for backend to be ready
          this.waitForBackend()
            .then(() => resolve(this.baseUrl))
            .catch(reject);
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('Backend error:', data.toString());
      });

      this.process.on('error', (error) => {
        console.error('Failed to start backend:', error);
        reject(error);
      });

      this.process.on('exit', (code) => {
        console.log(`Backend process exited with code ${code}`);
        if (!portFound) {
          reject(new Error(`Backend exited before starting (code ${code})`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!portFound) {
          this.stop();
          reject(new Error('Backend startup timeout'));
        }
      }, 30000);
    });
  }

  stop() {
    if (this.process) {
      console.log('Stopping backend...');
      this.process.kill();
      this.process = null;
      this.port = null;
      this.baseUrl = null;
    }
  }

  getBaseUrl() {
    return this.baseUrl;
  }
}

module.exports = new BackendManager();
