"""Configuration management for DB Toolkit."""

import os
from pathlib import Path
from typing import Optional


class Config:
    """Application configuration settings."""
    
    def __init__(self):
        """Initialize configuration with default values."""
        self.app_name = "DB Toolkit"
        self.app_version = "0.1.0"
        self.config_dir = self._get_config_dir()
        self.connections_file = self.config_dir / "connections.json"
        
    def _get_config_dir(self) -> Path:
        """Get application configuration directory."""
        if os.name == 'nt':  # Windows
            config_dir = Path(os.environ.get('APPDATA', '')) / self.app_name
        else:  # macOS/Linux
            config_dir = Path.home() / '.config' / 'dbtoolkit'
        
        config_dir.mkdir(parents=True, exist_ok=True)
        return config_dir
    
    def get_env_var(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get environment variable with optional default."""
        return os.environ.get(key, default)


# Global config instance
config = Config()