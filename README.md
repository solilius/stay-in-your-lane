# Stay in Your Lane website

Static site, no build step. Upload this folder to GitHub Pages, Netlify, itch.io or any web host.

- **Links:** paste the Steam, demo, Discord, YouTube, X and Instagram URLs into `LINKS` at the top of `js/main.js`. Empty links become "coming soon" buttons, and empty social icons are hidden. Setting `youtube` swaps the local trailer for the YouTube embed.
- **Unit stats and copy:** `js/data.js` (copied from GDD.md, so update it when balance changes).
- **Images and clips:** regenerate from the Unity sprites and `Trailer/*.mov` with `python3 Website/tools/prepare_media.py` (needs ffmpeg and Pillow).
- **Preview locally:** `python3 -m http.server 8765 --directory Website`, then open http://localhost:8765.
# stay-in-your-lane-website
