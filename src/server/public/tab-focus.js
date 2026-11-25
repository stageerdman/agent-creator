// Tab reaches every control, in every engine. WKWebView (the Mac app's
// window) follows macOS "Keyboard navigation", which is off by default, and
// then Tab skips buttons and only visits text fields. So the page moves Tab
// itself. Inside an open sheet (aria-modal) Tab stays in the sheet.

const TABBABLE = "a[href], button, input, select, textarea, summary, [tabindex]";

const isTabbable = (node) =>
  !node.disabled && node.tabIndex >= 0 && !node.closest("[hidden], [inert]") && node.getClientRects().length > 0;

function scope() {
  const modals = document.querySelectorAll('[aria-modal="true"]');
  return modals[modals.length - 1] ?? document;
}

// The stop after `current` (or before it, going back), wrapping round; the
// first (or last) stop when focus is outside the list.
export function nextStop(stops, current, back) {
  if (!stops.length) return null;
  const at = stops.indexOf(current);
  if (at < 0) return back ? stops[stops.length - 1] : stops[0];
  return stops[(at + (back ? -1 : 1) + stops.length) % stops.length];
}

export function installTabFocus(root = document) {
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const stops = [...scope().querySelectorAll(TABBABLE)].filter(isTabbable);
    const next = nextStop(stops, document.activeElement, e.shiftKey);
    if (!next) return;
    e.preventDefault();
    next.focus();
  });
}
