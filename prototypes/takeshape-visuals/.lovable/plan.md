## Goal
Improve readability of the chat text over the video on the second slide ("YOUR HOUSE" panel) without re-adding message boxes.

## Approach
Combine a subtle darkening scrim over the video with a stronger text shadow on the chat lines.

## Changes (src/routes/index.tsx)

1. **Add a scrim** to the second panel of `HorizontalStatement`, layered between the `<video>` and the `ChatDemo` overlay:
   - A full-bleed `absolute inset-0` div
   - Background: a vertical linear gradient from `rgba(0,0,0,0.15)` at the top to `rgba(0,0,0,0.55)` at the bottom (where most chat text sits)
   - `pointer-events-none`

2. **Strengthen the chat text shadow** inside `ChatDemo`:
   - Replace the current `textShadow: "0 2px 18px rgba(0,0,0,0.55)"` with a layered shadow for crisper edges:
     `"0 1px 2px rgba(0,0,0,0.6), 0 2px 20px rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.35)"`
   - Keep the cream color and serif type unchanged.

3. **Leave the composer alone** — it already has a white background and reads clearly.

## Out of scope
- No changes to message structure, timing, script, or layout.
- No changes to the video file itself.