// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    menu::{MenuBuilder, MenuItemBuilder},
    Manager, Emitter, Position, PhysicalPosition, Size, PhysicalSize,
};

#[tauri::command]
fn toggle_notch_visibility(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("main") {
        let is_visible = window.is_visible().map_err(|e| e.to_string())?;
        if is_visible {
            window.hide().map_err(|e| e.to_string())?;
            Ok(false)
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
            Ok(true)
        }
    } else {
        Err("Main window not found".into())
    }
}

#[tauri::command]
fn trigger_haptic_feedback(feedback_type: String) -> Result<(), String> {
    // Windows haptic / sound trigger
    println!("[NOVA Haptic] {}", feedback_type);
    Ok(())
}

#[tauri::command]
fn sync_notch_window(app: tauri::AppHandle, is_expanded: bool, width: u32, height: u32) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(Some(monitor)) = window.current_monitor() {
            let scale_factor = monitor.scale_factor();
            let screen_size = monitor.size();
            let monitor_pos = monitor.position();
            // Convert logical CSS dimensions from frontend to physical screen pixels based on Windows DPI
            let phys_w = (width as f64 * scale_factor).round() as u32;
            let phys_h = (height as f64 * scale_factor).round() as u32;
            let x = monitor_pos.x + ((screen_size.width as i32) - (phys_w as i32)) / 2;
            let y = monitor_pos.y;
            let _ = window.set_size(Size::Physical(PhysicalSize { width: phys_w, height: phys_h }));
            let _ = window.set_position(Position::Physical(PhysicalPosition { x, y }));
        }
        let _ = window.set_always_on_top(true);
        let _ = is_expanded;
        Ok(())
    } else {
        Err("Main window not found".into())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacPreferredMethod::Auto,
            Some(vec!["--minimized"]),
        ))
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            toggle_notch_visibility,
            trigger_haptic_feedback,
            sync_notch_window
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Set up Windows System Tray
            let toggle_item = MenuItemBuilder::with_id("toggle", "Toggle Dynamic Notch (Alt+N)").build(app)?;
            let settings_item = MenuItemBuilder::with_id("settings", "NOVA Preferences...").build(app)?;
            let separator = MenuItemBuilder::with_id("sep", "---").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Exit NOVA").build(app)?;

            let tray_menu = MenuBuilder::new(app)
                .item(&toggle_item)
                .item(&settings_item)
                .item(&separator)
                .item(&quit_item)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .tooltip("NOVA — Windows Smart Notch")
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "toggle" => {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    "settings" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.emit("open-tab", "settings");
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Apply Windows 11 top-center positioning, compact initial bounds and always-on-top behavior
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen_size = monitor.size();
                    let scale_factor = monitor.scale_factor();
                    let monitor_pos = monitor.position();
                    let initial_logical_w = 210.0;
                    let initial_logical_h = 42.0;
                    let phys_w = (initial_logical_w * scale_factor).round() as u32;
                    let phys_h = (initial_logical_h * scale_factor).round() as u32;
                    let x = monitor_pos.x + ((screen_size.width as i32) - (phys_w as i32)) / 2;
                    let y = monitor_pos.y;
                    let _ = window.set_size(Size::Physical(PhysicalSize { width: phys_w, height: phys_h }));
                    let _ = window.set_position(Position::Physical(PhysicalPosition { x, y }));
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running NOVA application");
}
