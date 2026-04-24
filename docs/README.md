# Docs & demo assets

## Regenerate the README demo GIF

The README shows `docs/demo.gif` as a hero image. It's generated from `docs/demo.tape` using [VHS](https://github.com/charmbracelet/vhs) — a tool that turns a declarative script into a polished terminal GIF.

### 1. Install VHS (once)

```bash
# macOS
brew install vhs

# Windows
winget install charmbracelet.vhs

# Any OS with Go
go install github.com/charmbracelet/vhs@latest
```

VHS also needs `ffmpeg` on your PATH — most package managers install it as a dep, but install it manually if `vhs` complains.

### 2. Regenerate

From the repo root:

```bash
vhs docs/demo.tape
```

This writes a fresh `docs/demo.gif` (~2–4 MB, 20 seconds). Commit the new GIF along with any tape changes.

### 3. Tweaking the recording

Open `docs/demo.tape`. Useful knobs:

- `Set TypingSpeed` — slow down / speed up the typed characters.
- `Set PlaybackSpeed` — global speed multiplier on the final GIF.
- `Sleep` — pause between actions (makes the recording readable).
- `Set Theme "Dracula"` — any of [tinted-shell's themes](https://github.com/mbadolato/iTerm2-Color-Schemes) works.

Keep the tape under 25 seconds. Long demos feel slow and blow up the GIF size on GitHub's image CDN.
