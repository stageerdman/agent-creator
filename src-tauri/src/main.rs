//! Agent Creator's Mac shell: starts the local Node app and shows it in a
//! native window drawn by macOS's own WebKit. No browser is involved.

mod alert;
mod node;
mod server;

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::webview::NewWindowResponse;
use tauri::window::Color;
use tauri::{Manager, RunEvent, Theme, WebviewUrl, WebviewWindowBuilder};

/// Holds the server for the app's life; taking it out stops the server.
struct ServerSlot(Mutex<Option<server::Server>>);

fn main() {
    let app = tauri::Builder::default()
        .setup(|app| {
            let server = match start_server(app.path().resource_dir()?.join("app")) {
                Ok(server) => server,
                Err(e) => {
                    eprintln!("main: {e}");
                    alert::fatal("Agent Creator could not start", &e);
                    std::process::exit(1); // a clean quit, not a crash report
                }
            };
            open_window(app, &server.url())?;
            app.manage(ServerSlot(Mutex::new(Some(server))));
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("main: could not build the app");

    app.run(|handle, event| {
        if let RunEvent::Exit = event {
            if let Some(slot) = handle.try_state::<ServerSlot>() {
                if let Ok(mut server) = slot.0.lock() {
                    server.take(); // dropping it stops the server
                }
            }
        }
    });
}

fn start_server(app_dir: PathBuf) -> Result<server::Server, String> {
    let home = std::env::var("HOME").map(PathBuf::from).map_err(|_| "main: HOME is not set".to_string())?;
    let data_dir = std::env::var("AGENT_CREATOR_HOME").map(PathBuf::from).unwrap_or_else(|_| home.join(".agent-creator"));
    let node = node::find(&app_dir, &home)
        .ok_or("Agent Creator needs Node.js 22 or newer. Install it, then open Agent Creator again.")?;
    server::Server::start(&server::Launch { node: &node, app_dir: &app_dir, data_dir: &data_dir, home: &home })
        .map_err(|e| format!("{e}. See ~/.agent-creator/app.log."))
}

fn open_window(app: &tauri::App, url: &str) -> tauri::Result<()> {
    let url = url.parse().expect("main: server URL is always valid");
    let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::External(url))
        .title("Agent Creator")
        .inner_size(1200.0, 860.0)
        // Under 860 px the page switches to its one-pane layout; 640 also fits half a 13" screen.
        .min_inner_size(640.0, 640.0)
        // Let Finder drops reach the page's own dragenter/drop handlers.
        .disable_drag_drop_handler()
        // Chat links are target="_blank": hand them to the default browser or
        // mail app and keep the chat on screen.
        .on_new_window(|url, _| {
            open_outside(&url);
            NewWindowResponse::Deny
        })
        .visible(false)
        .center()
        .build()?;
    // Paint the home's Fireflies field first, so a launch never flashes white.
    window.set_background_color(Some(canvas(window.theme()?)))?;
    window.show()
}

/// Web and mail links only; anything else (file:, javascript:, custom schemes) is dropped.
fn opens_outside(url: &tauri::Url) -> bool {
    matches!(url.scheme(), "https" | "http" | "mailto")
}

fn open_outside(url: &tauri::Url) {
    if opens_outside(url) {
        if let Err(e) = std::process::Command::new("/usr/bin/open").arg(url.as_str()).spawn() {
            eprintln!("main: could not open {url}: {e}");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::opens_outside;

    #[test]
    fn only_web_and_mail_links_leave_the_app() {
        for ok in ["https://example.com/a", "http://example.com", "mailto:hi@example.com"] {
            assert!(opens_outside(&ok.parse().unwrap()), "{ok}");
        }
        for no in ["file:///etc/passwd", "javascript:alert(1)", "ftp://x.y", "tel:123"] {
            assert!(!opens_outside(&no.parse().unwrap()), "{no}");
        }
    }
}

/// The home's Fireflies field (#0B1410). It is dark in both themes, so the
/// native window is too: a light-mode Mac must not show a white first frame.
fn canvas(_theme: Theme) -> Color {
    Color(0x0B, 0x14, 0x10, 0xff)
}
