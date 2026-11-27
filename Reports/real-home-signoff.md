# Sign-off: real home and DNA logos

**Verdict: APPROVED**

- Commit checked: `eb757b4` (Home: the row Enter will open wears the hover tint; Enter during the plus gather is ignored)
- Installed app: `dist/stage/app` built from `eb757b4`. This is the same server code the Mac app runs.
- Engines: Chrome and WebKit. WebKit is the engine the Mac app's WKWebView uses.
- Checks: `node checks/real-home-check.cjs <url> chrome|webkit`, and `checks/seed-home.cjs`, which makes a scratch home with real agents.
- Homes used:
  - The real home `~/.agent-creator`. It has 0 agents today.
  - A seeded home with 4 real agents made through the app's own data path:
    - Coach: 900 B
    - Archivist: 120 MB
    - Tax Helper: 3.2 MB + 4 KB
    - Red Pen: no files

Both engines passed every check on both homes.

## Goal and step count

Goal: open the app, then either open one of my agents or start a new one.

1. Open the app. The home is the first screen, so this costs 0 steps.
2. Open an agent: 1 click on its row. Or type in search and press Enter, which opens the top match.
3. New agent: 1 click on +. Cmd+N also works.

The step count is 1 for each path, which meets the target.

## Results by brief item

1. **Designed home: PASS**
   - Constellation rows show logo, name, description and age, newest first.
   - The search box is centred and iOS-style (`type=search`, placeholder "Search").
   - Pressing + plays the gather (fly-to-plus) and lands on `/new`.
   - With 0 agents, the home shows "Press + to make your first agent".
2. **One way to start a new agent: PASS**
   - There is exactly one /new control (`#plus`, aria-label "New agent").
   - Cmd+N and a second + press are shortcuts to that same control, not extra buttons.
   - None of the old home's wording is left.
3. **Every face is the DNA cluster: PASS**
   - Every home row face and the agent page face is one lit DNA canvas.
   - No `img` or `svg` faces are left anywhere.
4. **Blink timing: PASS**
   - Files added 1 s apart blink 600 ms apart on screen. Both the phase and the real `lastBlink` moments were measured.
   - Files added 1 day apart are squashed: the phase step is 0.595, so they blink 1217 ms apart within a 3023 ms period.
   - Files added at the same moment blink on the same frame.
5. **One dot per started MB, max 60, extra adds glow: PASS**

   | Size | Dots | Glow |
   |---|---|---|
   | 900 B (Coach) | 1 | none |
   | 3.2 MB + 4 KB (Tax Helper) | 5 | none |
   | 3.2 MB | 4 | none |
   | 60 MB | 60 | none |
   | 61 MB | 60 | 0.06 |
   | 120 MB (Archivist) | 60 | 0.3 |
   | 200 MB | 60 | 0.3 (the cap) |

6. **Reduce Motion: PASS**
   - The 6 dots light one at a time, 50 to 67 ms apart (60 ms plus frame rounding).
   - A new dot never grows in, so there is no pop.
7. **Dot size 2.5 to 6.0, no size control: PASS**
   - Dot radii run from 2.5 to 6.0.
   - Dense clusters go as small as 2.27. The 2.0 floor is kept on purpose (`Reports/real-home-roadmap.md:56`).
   - There is no dot-size control on any screen.
8. **No files still looks calm: PASS**
   - Red Pen shows one steady dot. Its alpha was 376 in both samples.
   - Its brightest pixel is 56/255 in Chrome and 57/255 in WebKit. A resting normal dot is 30/255, so the empty face is soft but still visible.

## Watch items for Jony (not fixes)

- **Live arrivals:** the app never calls `setFiles` while it is running. So dots landing one by one can only be seen when a file arrives live, and today that needs a reload. Wire this up when live file arrival lands.
- **Descriptions:** a row's description is the first sentence of the agent's persona. An agent with no persona will have an empty description line.
- **Reduce Motion cluster:** while the cluster fills under Reduce Motion, older dots tighten by up to 0.68 px of radius at once. The new dot never grows, so this meets "no grow, no pop" (`Reports/real-home-roadmap.md:55`). Keep an eye on it if clusters get denser.

No fixes are needed.
