# PLUS-FIREFLY — wiki

- A control that "becomes" an animation must hand over in one frame: paint the
  canvas copy and hide the real element in the same rAF callback. If no frame
  ever paints (hidden tab), the real element is never hidden.
- Hide by opacity only, never `display`, so a second click still lands on the
  same control and joins the running animation.
- The morphing element is one of the crowd, not the star: it lands mid-window,
  never first or last, with no extra glow, burst or sound.
- The total time does not grow for the extra moment; it fits inside D.
- Key-held shortcuts (`e.repeat`) count as one press.
