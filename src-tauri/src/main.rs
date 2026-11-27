//! Agent Creator's Mac shell: starts the local Node app and shows it in a
//! native window drawn by macOS's own WebKit. No browser is involved.

mod alert;
mod node;
mod server;

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::utils::config::WindowEffectsConfig;
use tauri::window::{Effect, EffectState, EffectsBuilder};
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
    let url: tauri::Url = url.parse().expect("main: server URL is always valid");
    let origin = url.origin();
    let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::External(url))
        // A chat link (http, https, mailto) opens in the default browser or
        // mail app; the window itself never leaves the local app.
        .on_navigation(move |to| !(to.origin() != origin && open_outside(to)))
        .on_new_window(|to, _features| {
            open_outside(&to);
            tauri::webview::NewWindowResponse::Deny
        })
        .title("Agent Creator")
        .inner_size(1200.0, 860.0)
        // Under 860 px the page switches to its one-pane layout; 640 also fits half a 13" screen.
        .min_inner_size(640.0, 640.0)
        // Let Finder drops reach the page's own dragenter/drop handlers.
        .disable_drag_drop_handler()
        .visible(false)
        .center()
        .initialization_script(GLASS_PAGE)
        .transparent(true)
        // Dark glass in both system themes: the Fireflies field is dark, and a
        // dark material keeps light text readable over a bright desktop. It
        // also means a launch shows dark glass first, never a white frame.
        .theme(Some(Theme::Dark))
        .effects(glass())
        .build()?;
    window.show()
}

/// The desktop shows through, blurred by macOS's own vibrancy. It stays glass
/// when the window is in the background too, so it never turns flat grey.
fn glass() -> WindowEffectsConfig {
    EffectsBuilder::new().effect(Effect::UnderWindowBackground).state(EffectState::Active).build()
}

/// Tells each page it sits on glass (`html.glass`), so it tints its field
/// instead of painting it solid. Runs before the page's own markup is parsed.
const GLASS_PAGE: &str = r#"(() => {
  const mark = () => {
    const root = document.documentElement;
    if (root) root.classList.add("glass");
    return Boolean(root);
  };
  if (!mark()) new MutationObserver((_, watch) => { if (mark()) watch.disconnect(); }).observe(document, { childList: true });
})();"#;

/// Hands an http, https or mailto link to macOS (`open`), so it lands in the
/// user's default browser or mail app. Returns whether it was handed off.
fn open_outside(url: &tauri::Url) -> bool {
    if !external(url) {
        return false;
    }
    if let Err(e) = std::process::Command::new("/usr/bin/open").arg(url.as_str()).spawn() {
        eprintln!("main: could not open {url}: {e}");
    }
    true
}

fn external(url: &tauri::Url) -> bool {
    matches!(url.scheme(), "http" | "https" | "mailto")
}

#[cfg(test)]
mod tests {
    use super::external;

    #[test]
    fn only_web_and_mail_links_leave_the_app() {
        for ok in ["https://example.com/a", "http://example.com", "mailto:a@b.c"] {
            assert!(external(&ok.parse().unwrap()), "{ok}");
        }
        for no in ["file:///etc/passwd", "javascript:alert(1)", "about:blank", "tauri://localhost"] {
            assert!(!external(&no.parse().unwrap()), "{no}");
        }
    }
}
