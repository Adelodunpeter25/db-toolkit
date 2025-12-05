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
async fn select_folder() -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    // Dialog will be called from frontend using @tauri-apps/plugin-dialog
    Ok(None)
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
    .invoke_handler(tauri::generate_handler![get_backend_port, select_folder])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
