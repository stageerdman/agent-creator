//! Finds the user's own Node.js. Apps opened from Finder get a bare PATH,
//! so the usual install places are tried by hand.

use std::path::{Path, PathBuf};

/// Where to look, best first: an explicit override, the node the app was
/// built with (written by scripts/stage-mac-app.mjs), then common installs.
pub fn candidates(override_path: Option<String>, built_with: Option<String>, home: &Path) -> Vec<PathBuf> {
    let mut list: Vec<PathBuf> = override_path.into_iter().chain(built_with).map(PathBuf::from).collect();
    list.extend(
        ["/opt/homebrew/bin/node", "/usr/local/bin/node"].iter().map(PathBuf::from),
    );
    list.push(home.join(".local/bin/node"));
    list.push(home.join(".volta/bin/node"));
    list
}

pub fn first_executable(candidates: &[PathBuf], is_executable: impl Fn(&Path) -> bool) -> Option<PathBuf> {
    candidates.iter().find(|p| is_executable(p)).cloned()
}

pub fn is_executable(path: &Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    path.metadata().map(|m| m.is_file() && m.permissions().mode() & 0o111 != 0).unwrap_or(false)
}

/// Finds node for an app whose code lives in `app_dir`.
pub fn find(app_dir: &Path, home: &Path) -> Option<PathBuf> {
    let built_with = std::fs::read_to_string(app_dir.join("node-path")).ok().map(|s| s.trim().to_string());
    let list = candidates(std::env::var("AGENT_CREATOR_NODE").ok(), built_with, home);
    first_executable(&list, is_executable)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn override_wins_then_build_time_node_then_common_places() {
        let list = candidates(Some("/x/node".into()), Some("/built/node".into()), Path::new("/home/u"));
        assert_eq!(list[0], PathBuf::from("/x/node"));
        assert_eq!(list[1], PathBuf::from("/built/node"));
        assert_eq!(list[2], PathBuf::from("/opt/homebrew/bin/node"));
        assert!(list.contains(&PathBuf::from("/home/u/.local/bin/node")));
    }

    #[test]
    fn picks_the_first_one_that_runs() {
        let list = candidates(None, Some("/gone/node".into()), Path::new("/home/u"));
        let found = first_executable(&list, |p| p == Path::new("/usr/local/bin/node"));
        assert_eq!(found, Some(PathBuf::from("/usr/local/bin/node")));
    }

    #[test]
    fn none_when_node_is_missing_everywhere() {
        let list = candidates(None, None, Path::new("/home/u"));
        assert_eq!(first_executable(&list, |_| false), None);
    }
}
