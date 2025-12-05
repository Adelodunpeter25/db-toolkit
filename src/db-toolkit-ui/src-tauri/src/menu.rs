use tauri::menu::*;
use tauri::{Manager, Emitter};

pub fn create_menu(app: &tauri::AppHandle) -> Result<Menu<tauri::Wry>, tauri::Error> {
    let menu = Menu::new(app)?;
    
    // App Menu (macOS only)
    #[cfg(target_os = "macos")]
    {
        let app_menu = Submenu::with_items(
            app,
            "DB Toolkit",
            true,
            &[
                &MenuItem::with_id(app, "about", "About DB Toolkit", true, None::<&str>)?,
                &MenuItem::with_id(app, "check-updates", "Check for Updates...", true, None::<&str>)?,
                &PredefinedMenuItem::separator(app)?,
                &PredefinedMenuItem::services(app, None)?,
                &PredefinedMenuItem::separator(app)?,
                &PredefinedMenuItem::hide(app, None)?,
                &PredefinedMenuItem::hide_others(app, None)?,
                &PredefinedMenuItem::show_all(app, None)?,
                &PredefinedMenuItem::separator(app)?,
                &PredefinedMenuItem::quit(app, None)?,
            ],
        )?;
        menu.append(&app_menu)?;
    }
    
    // File Menu
    let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(app, "new-connection", "New Connection", true, Some("CmdOrCtrl+N"))?,
            &MenuItem::with_id(app, "new-query-tab", "New Query Tab", true, Some("CmdOrCtrl+T"))?,
            &MenuItem::with_id(app, "close-tab", "Close Tab", true, Some("CmdOrCtrl+W"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "preferences", "Preferences", true, Some("CmdOrCtrl+,"))?,
        ],
    )?;
    
    // Edit Menu
    let edit_menu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &PredefinedMenuItem::undo(app, None)?,
            &PredefinedMenuItem::redo(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::cut(app, None)?,
            &PredefinedMenuItem::copy(app, None)?,
            &PredefinedMenuItem::paste(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "find", "Find", true, Some("CmdOrCtrl+F"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::select_all(app, None)?,
        ],
    )?;
    
    // View Menu
    let view_menu = Submenu::with_items(
        app,
        "View",
        true,
        &[
            &MenuItem::with_id(app, "toggle-sidebar", "Toggle Sidebar", true, Some("CmdOrCtrl+B"))?,
            &MenuItem::with_id(app, "toggle-terminal", "Toggle Terminal", true, Some("CmdOrCtrl+`"))?,
            &MenuItem::with_id(app, "toggle-ai", "Toggle AI Assistant", true, Some("CmdOrCtrl+Shift+A"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "toggle-theme", "Toggle Theme", true, Some("CmdOrCtrl+Shift+D"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "reload", "Reload", true, Some("CmdOrCtrl+R"))?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::fullscreen(app, None)?,
        ],
    )?;
    
    // Database Menu
    let database_menu = Submenu::with_items(
        app,
        "Database",
        true,
        &[
            &MenuItem::with_id(app, "connect-database", "Connect to Database", true, Some("CmdOrCtrl+Shift+C"))?,
            &MenuItem::with_id(app, "disconnect-database", "Disconnect", true, None::<&str>)?,
            &MenuItem::with_id(app, "refresh-schema", "Refresh Schema", true, Some("CmdOrCtrl+R"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "run-query", "Run Query", true, Some("CmdOrCtrl+Enter"))?,
            &MenuItem::with_id(app, "stop-query", "Stop Query", true, Some("CmdOrCtrl+."))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "view-er-diagram", "View ER Diagram", true, None::<&str>)?,
            &MenuItem::with_id(app, "analyze-schema", "Analyze Schema with AI", true, None::<&str>)?,
        ],
    )?;
    
    // Tools Menu
    let tools_menu = Submenu::with_items(
        app,
        "Tools",
        true,
        &[
            &MenuItem::with_id(app, "open-migrations", "Migrations", true, None::<&str>)?,
            &MenuItem::with_id(app, "open-backups", "Backups & Restore", true, None::<&str>)?,
            &MenuItem::with_id(app, "open-analytics", "Analytics Dashboard", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "command-palette", "Command Palette", true, Some("CmdOrCtrl+K"))?,
        ],
    )?;
    
    // Window Menu
    let window_menu = Submenu::with_items(
        app,
        "Window",
        true,
        &[
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::close_window(app, None)?,
        ],
    )?;
    
    // Help Menu
    let help_menu = Submenu::with_items(
        app,
        "Help",
        true,
        &[
            &MenuItem::with_id(app, "documentation", "Documentation", true, Some("F1"))?,
            &MenuItem::with_id(app, "keyboard-shortcuts", "Keyboard Shortcuts", true, Some("CmdOrCtrl+/"))?,
            &MenuItem::with_id(app, "report-issue", "Report Issue", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "check-updates", "Check for Updates", true, None::<&str>)?,
        ],
    )?;
    
    menu.append(&file_menu)?;
    menu.append(&edit_menu)?;
    menu.append(&view_menu)?;
    menu.append(&database_menu)?;
    menu.append(&tools_menu)?;
    menu.append(&window_menu)?;
    menu.append(&help_menu)?;
    
    Ok(menu)
}

pub fn handle_menu_event(app: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
    let event_id = event.id().as_ref();
    
    // Handle Check for Updates
    if event_id == "check-updates" {
        let app_clone = app.clone();
        tauri::async_runtime::spawn(async move {
            use tauri_plugin_updater::UpdaterExt;
            if let Ok(updater) = app_clone.updater_builder().build() {
                match updater.check().await {
                    Ok(Some(update)) => {
                        let _ = update.download_and_install(|_, _| {}, || {}).await;
                    }
                    Ok(None) => {
                        use tauri_plugin_dialog::DialogExt;
                        let _ = app_clone.dialog()
                            .message("You're up to date!\n\nDB Toolkit 0.1.0 is the latest version.")
                            .title("No Updates")
                            .blocking_show();
                    }
                    Err(_) => {
                        use tauri_plugin_dialog::DialogExt;
                        let _ = app_clone.dialog()
                            .message("Unable to check for updates.\n\nPlease check your internet connection and try again.")
                            .title("Update Check Failed")
                            .blocking_show();
                    }
                }
            }
        });
        return;
    }
    
    // Handle About dialog directly in Rust
    if event_id == "about" {
        use tauri_plugin_dialog::DialogExt;
        let _ = app.dialog()
            .message("DB Toolkit\n\nVersion: 0.1.0\nA modern database management tool\n\n© 2025 DB Toolkit")
            .title("About DB Toolkit")
            .blocking_show();
        return;
    }
    
    let window = app.get_webview_window("main").unwrap();
    let _ = window.emit("menu-action", event_id);
}
