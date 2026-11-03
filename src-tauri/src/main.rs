// src-tauri/src/main.rs
// Genuine Windows Smart Notch native desktop runtime with System Tray & Multi-Monitor positioning.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, Position, LogicalPosition,
};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            
            // Center the notch at the top of the active primary monitor
            if let Ok(Some(monitor)) = window.current_monitor() {
                let screen_size = monitor.size();
                let scale_factor = monitor.scale_factor();
                let screen_w = screen_size.width as f64 / scale_factor;
                let notch_x = (screen_w - 780.0) / 2.0;
                let _ = window.set_position(Position::Logical(LogicalPosition {
                    x: notch_x,
                    y: 6.0,
                }));
            }

            // System Tray Menu (Show, Hide, Exit)
            let quit_i = MenuItem::with_id(app, "quit", "Quit NOVA", true, None::<&str>)?;
            let toggle_i = MenuItem::with_id(app, "toggle", "Toggle Notch", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("NOVA Smart Notch")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "toggle" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = if win.is_visible().unwrap_or(true) {
                                win.hide()
                            } else {
                                win.show()
                            };
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running NOVA Windows application");
}
