use std::process::{Command, Child, Stdio};
use std::sync::Mutex;
use std::io::{BufRead, BufReader};
use std::thread;
use tauri::Manager;

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
        app_handle.path_resolver()
            .resource_dir()
            .unwrap()
            .join("backend/db-toolkit-backend")
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
      
      let app_handle = app.handle();
      thread::spawn(move || {
          if let Err(e) = start_backend(app_handle) {
              eprintln!("Failed to start backend: {}", e);
          }
      });
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        get_backend_port,
        read_file,
        delete_file,
        rename_file,
        open_in_editor,
        open_folder,
        list_migration_files
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
