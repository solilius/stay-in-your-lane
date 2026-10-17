# Stay in Your Lane website

Static site, no build step. Served by GitHub Pages from the `main` branch root.

- **Links:** Steam, demo, Discord, YouTube, X and Instagram URLs live in `LINKS` at the top of `js/main.js`. Empty links become "coming soon" buttons, and empty social icons are hidden. Setting `youtube` swaps the local trailer for the YouTube embed.
- **Unit stats and copy:** `js/data.js` (copied from the game's GDD.md, so update it when balance changes).
- **Images and clips:** regenerate from the Unity project with `python3 tools/prepare_media.py` (needs ffmpeg and Pillow; expects the game at `../Unity/TagOfWar`, or set `GAME_DIR`).
- **Preview locally:** `python3 -m http.server 8765`, then open http://localhost:8765.
