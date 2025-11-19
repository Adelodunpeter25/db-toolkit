"""Migrator CLI command executor."""
import asyncio
from typing import Dict, Any


class MigratorExecutor:
    """Execute migrator CLI commands."""

    @staticmethod
    async def execute_command(command: str, timeout: int = 10) -> Dict[str, Any]:
        """Execute migrator command and return result."""
        try:
            migrator_cmd = ["migrator"] + command.split()
            
            process = await asyncio.create_subprocess_exec(
                *migrator_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )
                
                return {
                    "success": process.returncode == 0,
                    "output": stdout.decode(),
                    "error": stderr.decode(),
                    "exit_code": process.returncode
                }
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                return {
                    "success": False,
                    "output": "",
                    "error": "Command timed out",
                    "exit_code": -1
                }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "exit_code": -1
            }

    @staticmethod
    async def execute_command_stream(command: str, websocket):
        """Execute migrator command and stream output via WebSocket."""
        try:
            migrator_cmd = ["migrator"] + command.split()
            
            process = await asyncio.create_subprocess_exec(
                *migrator_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            async def read_stream(stream, stream_type):
                while True:
                    line = await stream.readline()
                    if not line:
                        break
                    await websocket.send_json({
                        "type": stream_type,
                        "data": line.decode().rstrip()
                    })
            
            await asyncio.gather(
                read_stream(process.stdout, "stdout"),
                read_stream(process.stderr, "stderr")
            )
            
            await process.wait()
            
            await websocket.send_json({
                "type": "exit",
                "code": process.returncode,
                "success": process.returncode == 0
            })
        except Exception as e:
            await websocket.send_json({
                "type": "error",
                "data": str(e)
            })

    @staticmethod
    async def get_version() -> Dict[str, Any]:
        """Get migrator CLI version."""
        try:
            process = await asyncio.create_subprocess_exec(
                "migrator", "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, _ = await asyncio.wait_for(process.communicate(), timeout=3)
            
            return {
                "version": stdout.decode().strip(),
                "installed": process.returncode == 0
            }
        except Exception:
            return {"version": None, "installed": False}
