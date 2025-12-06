use std::process::{Command, Child, Stdio};
use std::sync::Mutex;
use std::io::{BufRead, BufReader};
use std::thread;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

mod menu;

struct BackendState {
    process: Mutex<Option<Child>>,
    port: Mutex<Option<u16>>,
}

#[tauri::command]
fn get_backend_port(state: tauri::State<BackendState>) -> Result<u16, String> {
    let port = state.port.lock().unwrap();
    port.ok_or_else(|| "Backend not started".to_string())
}

#[tauri::command]
async fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let folder = app.dialog()
        .file()
        .blocking_pick_folder();
    
    Ok(folder.map(|p| p.to_string()))
}

#[tauri::command]
async fn read_file(file_path: String) -> Result<String, String> {
    std::fs::read_to_string(&file_path)
        .map_err(|_| "Failed to read file".to_string())
}

#[tauri::command]
async fn delete_file(file_path: String) -> Result<(), String> {
    std::fs::remove_file(&file_path)
        .map_err(|_| "Failed to delete file".to_string())
}

#[tauri::command]
async fn rename_file(old_path: String, new_name: String) -> Result<(), String> {
    let path = std::path::Path::new(&old_path);
    let dir = path.parent().ok_or("Invalid path")?;
    let new_path = dir.join(new_name);
    std::fs::rename(&old_path, &new_path)
        .map_err(|_| "Failed to rename file".to_string())
}

#[tauri::command]
async fn open_in_editor(file_path: String) -> Result<(), String> {
    opener::open(&file_path)
        .map_err(|_| "Failed to open file".to_string())
}

#[tauri::command]
async fn open_folder(folder_path: String) -> Result<(), String> {
    opener::open(&folder_path)
        .map_err(|_| "Failed to open folder".to_string())
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;
    
    let updater = app.updater_builder().build().map_err(|e| e.to_string())?;
    
    match updater.check().await {
        Ok(Some(update)) => {
            let _ = update.download_and_install(|_, _| {}, || {}).await;
            Ok(())
        }
        Ok(None) => Ok(()),
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
async fn get_system_metrics() -> Result<serde_json::Value, String> {
    use std::process::Command;
    
    let load_avg = if cfg!(target_os = "macos") {
        // macOS doesn't have /proc/loadavg, use sysctl
        Command::new("sysctl")
            .args(["-n", "vm.loadavg"])
            .output()
            .ok()
            .and_then(|output| {
                let stdout = String::from_utf8_lossy(&output.stdout);
                stdout.split_whitespace().nth(1).and_then(|n| n.parse::<f64>().ok())
            })
            .unwrap_or(0.0)
    } else if cfg!(target_os = "linux") {
        std::fs::read_to_string("/proc/loadavg")
            .ok()
            .and_then(|s| s.split_whitespace().next().and_then(|n| n.parse::<f64>().ok()))
            .unwrap_or(0.0)
    } else {
        0.0
    };
    
    let disk = if cfg!(target_os = "macos") || cfg!(target_os = "linux") {
        Command::new("df")
            .args(["-k", "/"])
            .output()
            .ok()
            .and_then(|output| {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let lines: Vec<&str> = stdout.lines().collect();
                if lines.len() > 1 {
                    let parts: Vec<&str> = lines[1].split_whitespace().collect();
                    if parts.len() >= 4 {
                        let used_kb = parts[2].parse::<f64>().ok()?;
                        let avail_kb = parts[3].parse::<f64>().ok()?;
                        return Some(serde_json::json!({
                            "used": used_kb / 1024.0 / 1024.0,
                            "free": avail_kb / 1024.0 / 1024.0,
                            "total": (used_kb + avail_kb) / 1024.0 / 1024.0
                        }));
                    }
                }
                None
            })
            .unwrap_or_else(|| serde_json::json!({"used": 0, "free": 0, "total": 0}))
    } else if cfg!(target_os = "windows") {
        Command::new("wmic")
            .args(["logicaldisk", "get", "size,freespace,caption"])
            .output()
            .ok()
            .and_then(|output| {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let lines: Vec<&str> = stdout.lines().collect();
                if lines.len() > 1 {
                    let parts: Vec<&str> = lines[1].split_whitespace().collect();
                    if parts.len() >= 2 {
                        let free_bytes = parts[1].parse::<f64>().ok()?;
                        let total_bytes = parts[2].parse::<f64>().ok()?;
                        return Some(serde_json::json!({
                            "free": free_bytes / 1024.0 / 1024.0 / 1024.0,
                            "total": total_bytes / 1024.0 / 1024.0 / 1024.0,
                            "used": (total_bytes - free_bytes) / 1024.0 / 1024.0 / 1024.0
                        }));
                    }
                }
                None
            })
            .unwrap_or_else(|| serde_json::json!({"used": 0, "free": 0, "total": 0}))
    } else {
        serde_json::json!({"used": 0, "free": 0, "total": 0})
    };
    
    Ok(serde_json::json!({
        "loadAvg": load_avg,
        "disk": disk
    }))
}

#[tauri::command]
async fn list_migration_files(project_path: String) -> Result<Vec<serde_json::Value>, String> {
    let migrations_path = std::path::Path::new(&project_path).join("migrations");
    
    match std::fs::read_dir(&migrations_path) {
        Ok(entries) => {
            let files: Vec<serde_json::Value> = entries
                .filter_map(|entry| entry.ok())
                .filter(|entry| {
                    if let Some(name) = entry.file_name().to_str() {
                        name.ends_with(".py") && name != "__init__.py"
                    } else {
                        false
                    }
                })
                .map(|entry| {
                    serde_json::json!({
                        "name": entry.file_name().to_string_lossy(),
                        "path": entry.path().to_string_lossy()
                    })
                })
                .collect();
            Ok(files)
        }
        Err(_) => Ok(vec![])
    }
}

fn start_backend(app_handle: tauri::AppHandle) -> Result<u16, String> {
    let backend_state: tauri::State<BackendState> = app_handle.state();
    
    let is_dev = cfg!(debug_assertions);
    let backend_path = if is_dev {
        std::env::current_dir()
            .unwrap()
            .join("../db-toolkit/dist/db-toolkit-backend/db-toolkit-backend")
    } else {
        app_handle.path()
            .resource_dir()
            .unwrap()
            .join("resources/db-toolkit-backend/db-toolkit-backend")
    };

    println!("Starting backend from: {:?}", backend_path);

    let mut child = Command::new(&backend_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start backend: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let reader = BufReader::new(stdout);
    
    let (tx, rx) = std::sync::mpsc::channel();
    
    thread::spawn(move || {
        for line in reader.lines() {
            if let Ok(line) = line {
                println!("Backend: {}", line);
                if let Some(port_str) = line.strip_prefix("BACKEND_PORT:") {
                    if let Ok(port) = port_str.trim().parse::<u16>() {
                        let _ = tx.send(port);
                        break;
                    }
                }
            }
        }
    });

    let port = rx.recv_timeout(std::time::Duration::from_secs(10))
        .map_err(|_| "Backend startup timeout")?;

    *backend_state.process.lock().unwrap() = Some(child);
    *backend_state.port.lock().unwrap() = Some(port);

    println!("Backend started on port: {}", port);
    Ok(port)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(BackendState {
        process: Mutex::new(None),
        port: Mutex::new(None),
    })
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      app.handle().plugin(tauri_plugin_dialog::init())?;
      app.handle().plugin(tauri_plugin_shell::init())?;
      app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
      
      let app_handle = app.handle().clone();
      thread::spawn(move || {
          if let Err(e) = start_backend(app_handle) {
              eprintln!("Failed to start backend: {}", e);
          }
      });
      
      let menu = menu::create_menu(&app.handle())?;
      app.set_menu(menu)?;
      app.on_menu_event(menu::handle_menu_event);
      
      Ok(())
    })
    .on_window_event(|window, event| {
      if let tauri::WindowEvent::CloseRequested { .. } = event {
        let app_handle = window.app_handle();
        let backend_state = app_handle.state::<BackendState>();
        if let Ok(mut process) = backend_state.process.lock() {
          if let Some(mut child) = process.take() {
            let _ = child.kill();
          }
        };
      }
    })
    .invoke_handler(tauri::generate_handler![
        get_backend_port,
        select_folder,
        read_file,
        delete_file,
        rename_file,
        open_in_editor,
        open_folder,
        list_migration_files,
        get_system_metrics,
        check_for_updates
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
