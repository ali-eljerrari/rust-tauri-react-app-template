use std::process::Command;


// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_rust_version() -> String {
    let output = Command::new("rustc")
        .arg("--version")
        .output()
        .expect("Failed to execute rustc");
    String::from_utf8(output.stdout).expect("Failed to convert output to string")
}

// #[tauri::command]
// fn resize_window(width: &str, height: &str) -> String {
//     println!("Resizing window to {}x{}", width, height);
//     format!("Window resized to {}x{}", width, height)
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let platform = tauri_plugin_os::platform();
    println!("Platform: {}", platform);
    // Prints "windows" to the terminal

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_rust_version])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_autostart::ManagerExt;

                let _ =app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec!["--flag1", "--flag2"]),
                ));

                // Get the autostart manager
                let autostart_manager = app.autolaunch();
                // Enable autostart
                // let _ = autostart_manager.enable();
                // Check enable state
                println!("registered for autostart? {}", autostart_manager.is_enabled().unwrap());
                // Disable autostart
                // let _ = autostart_manager.disable();
            }
            Ok(())
        })
        // .setup(|app| {
        //     use tauri_plugin_notification::NotificationExt;
        //     app.notification()
        //         .builder()
        //         .title("Tauri")
        //         .body("Tauri is awesome")
        //         .show()
        //         .unwrap();

        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
