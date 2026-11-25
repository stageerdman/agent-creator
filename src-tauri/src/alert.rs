//! A native alert for errors that stop the app before its window exists.

use std::process::Command;

pub fn fatal(title: &str, message: &str) {
    let script = format!("display alert {} message {} as critical", quote(title), quote(message));
    if let Err(e) = Command::new("/usr/bin/osascript").args(["-e", &script]).status() {
        eprintln!("alert: could not show \"{title}: {message}\": {e}");
    }
}

/// An AppleScript string literal.
fn quote(text: &str) -> String {
    format!("\"{}\"", text.replace('\\', "\\\\").replace('"', "\\\""))
}

#[cfg(test)]
mod tests {
    #[test]
    fn quotes_are_escaped() {
        assert_eq!(super::quote(r#"say "hi" \ bye"#), r#""say \"hi\" \\ bye""#);
    }
}
