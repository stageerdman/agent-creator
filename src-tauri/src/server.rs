//! The local Node server the window shows: started by the shell, gone with it.

use std::fs::{File, OpenOptions};
use std::net::{SocketAddr, TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

const PREFERRED_PORT: u16 = 3517;
const READY_TIMEOUT: Duration = Duration::from_secs(15);

pub struct Server {
    child: Child,
    pub port: u16,
}

pub struct Launch<'a> {
    pub node: &'a Path,
    pub app_dir: &'a Path,
    pub data_dir: &'a Path,
    pub home: &'a Path,
}

impl Server {
    pub fn start(launch: &Launch) -> Result<Server, String> {
        let port = pick_port(PREFERRED_PORT)?;
        std::fs::create_dir_all(launch.data_dir).map_err(|e| format!("server: cannot create {}: {e}", launch.data_dir.display()))?;
        let log = open_log(&launch.data_dir.join("app.log"))?;
        let log_err = log.try_clone().map_err(|e| format!("server: cannot share app.log: {e}"))?;
        let child = Command::new(launch.node)
            .arg("src/server/main.mjs")
            .current_dir(launch.app_dir)
            .env("PORT", port.to_string())
            .env("PATH", child_path(launch.node, launch.home))
            // The server exits when this pipe closes, so a crashed shell leaves no orphan.
            .env("AGENT_CREATOR_EXIT_WITH_STDIN", "1")
            .stdin(Stdio::piped())
            .stdout(log)
            .stderr(log_err)
            .spawn()
            .map_err(|e| format!("server: cannot start {} in {}: {e}", launch.node.display(), launch.app_dir.display()))?;
        let mut server = Server { child, port };
        server.wait_ready()?;
        Ok(server)
    }

    pub fn url(&self) -> String {
        format!("http://localhost:{}/", self.port)
    }

    fn wait_ready(&mut self) -> Result<(), String> {
        let addr = SocketAddr::from(([127, 0, 0, 1], self.port));
        let started = Instant::now();
        while started.elapsed() < READY_TIMEOUT {
            if let Ok(Some(status)) = self.child.try_wait() {
                return Err(format!("server: exited before it was ready ({status})"));
            }
            if TcpStream::connect_timeout(&addr, Duration::from_millis(200)).is_ok() {
                return Ok(());
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        Err(format!("server: no answer on port {} after {}s", self.port, READY_TIMEOUT.as_secs()))
    }
}

impl Drop for Server {
    fn drop(&mut self) {
        let _ = self.child.kill(); // already gone is fine
        let _ = self.child.wait();
    }
}

/// The preferred port when it is free, else any free one.
pub fn pick_port(preferred: u16) -> Result<u16, String> {
    TcpListener::bind(("127.0.0.1", preferred))
        .or_else(|_| TcpListener::bind(("127.0.0.1", 0)))
        .and_then(|l| l.local_addr())
        .map(|a| a.port())
        .map_err(|e| format!("server: no free port: {e}"))
}

/// PATH for the server: node's own folder and the usual tool places, so it
/// can find the user's `claude` CLI when opened from Finder.
fn child_path(node: &Path, home: &Path) -> String {
    let mut dirs: Vec<PathBuf> = node.parent().map(Path::to_path_buf).into_iter().collect();
    dirs.extend(["/opt/homebrew/bin", "/usr/local/bin"].iter().map(PathBuf::from));
    dirs.push(home.join(".local/bin"));
    let inherited = std::env::var("PATH").unwrap_or_else(|_| "/usr/bin:/bin:/usr/sbin:/sbin".into());
    let mut parts: Vec<String> = dirs.iter().map(|d| d.display().to_string()).collect();
    parts.push(inherited);
    parts.join(":")
}

fn open_log(path: &Path) -> Result<File, String> {
    OpenOptions::new().create(true).append(true).open(path).map_err(|e| format!("server: cannot open {}: {e}", path.display()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn takes_another_port_when_the_preferred_one_is_busy() {
        let busy = TcpListener::bind(("127.0.0.1", 0)).unwrap();
        let busy_port = busy.local_addr().unwrap().port();
        let port = pick_port(busy_port).unwrap();
        assert_ne!(port, busy_port);
        assert_ne!(port, 0);
    }

    #[test]
    fn server_path_starts_with_the_node_folder() {
        let path = child_path(Path::new("/n/bin/node"), Path::new("/home/u"));
        assert!(path.starts_with("/n/bin:/opt/homebrew/bin:/usr/local/bin:/home/u/.local/bin:"));
    }
}
