#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
mod tray;
fn main() {
    
    let context = tauri::generate_context!();
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .menu(tauri::Menu::new()) //关闭系统菜单
        .system_tray(tray::menu()) // 将 `tauri.conf.json` 上配置的图标添加到系统托盘
        .on_system_tray_event(tray::handler) //注册托盘菜单事件
        .on_window_event(|event| match event.event() {
            
            tauri::WindowEvent::CloseRequested {api, .. } => {
              // hide window whenever it loses focus
              println!("Destroyed");
              event.window().hide().unwrap();
                api.prevent_close()
            }
            _ => {}
        })
        .run(context)
        .expect("error while running tauri application");

    let tray_menu =
        SystemTrayMenu::new().add_item(CustomMenuItem::new("quite".to_string(), "退出"));
    SystemTray::new().with_menu(tray_menu);
}
