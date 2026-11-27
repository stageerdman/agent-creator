// A short, fair sample of a file for an AI judge: its head, middle and tail,
// so a batch of files fits one call and a file isn't judged by its cover alone.

export const EXCERPT_PIECE_CHARS = 600;
export const GAP_MARK = "\n[…]\n";

export function excerptOf(text, piece = EXCERPT_PIECE_CHARS) {
  const whole = text.trim();
  if (whole.length <= piece * 3 + GAP_MARK.length * 2) return whole;
  const middle = Math.floor((whole.length - piece) / 2);
  return [whole.slice(0, piece), whole.slice(middle, middle + piece), whole.slice(-piece)].join(GAP_MARK);
}
