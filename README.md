# SHADOW STRIKE: ASSASSIN PROTOCOL (2D run-and-gun)
Side-scrolling vector-style shooter. Playable: Ileri, Toshiro, Whizz (art cropped from the reference image, in-game sprites drawn to match). No runtime dependencies besides Vite.

## Run
    npm install
    npm run dev      # local
    npm run build    # production -> dist/

## Controls
Desktop: A/D move, W/Space jump (double jump), J or mouse fire, G bomb, L/Shift special, R reload, Q RAPID/HEAVY, T auto-fire, Esc pause.
Phone (landscape): joystick, FIRE, JUMP, BOMB, SP, R, AUTO, tap ARMS panel to switch mode.

## GitHub
    git init && git add . && git commit -m "Shadow Strike 2D"
    git branch -M main && git remote add origin https://github.com/YOU/shadow-strike.git && git push -u origin main

## Vercel
Import the repo at vercel.com/new (Framework: Vite, build `npm run build`, output `dist`).

## Tested / not tested
Tested in headless Chromium: menu, all 5 missions auto-played to completion with all 3 characters (no JS errors), both bosses, results screen.
NOT tested on a real phone (touch controls, performance, audio) or via `npm run build` (no network where it was built).
