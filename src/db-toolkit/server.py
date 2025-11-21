"""Server entry point with dynamic port allocation."""

import sys
import socket
import uvicorn
from pathlib import Path


def find_free_port(start_port=8000, max_attempts=100):
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"No free port found in range {start_port}-{start_port + max_attempts}")


def main():
    """Start FastAPI server on available port."""
    port = find_free_port()
    
    # Write port to file for Electron to read
    port_file = Path.home() / '.db-toolkit' / 'backend.port'
    port_file.parent.mkdir(parents=True, exist_ok=True)
    port_file.write_text(str(port))
    
    print(f"BACKEND_PORT:{port}", flush=True)
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=port,
        log_level="info",
        access_log=False
    )


if __name__ == "__main__":
    main()
