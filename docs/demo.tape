# VHS tape — regenerate the README demo GIF with:
#   vhs docs/demo.tape
#
# Install VHS (once):
#   brew install vhs                  # macOS
#   winget install charmbracelet.vhs  # Windows
#   go install github.com/charmbracelet/vhs@latest

Output docs/demo.gif

Require node

Set FontSize 14
Set Width 1200
Set Height 720
Set Theme "Dracula"
Set TypingSpeed 45ms
Set PlaybackSpeed 1.0

# Ensure the build is fresh before recording.
Hide
Type "npm run build"
Enter
Sleep 3s
Type "clear"
Enter
Sleep 300ms
Show

Type "npx quickstart-spec"
Enter
Sleep 2500ms

# "Where should we write the output?" — default is fine
Sleep 500ms
Enter
Sleep 800ms

# "Which AI coding agent(s)..." multiselect — Claude Code pre-selected
Sleep 600ms
Enter
Sleep 1000ms

# Identity — Project name
Type "grep-notes"
Sleep 400ms
Enter
Sleep 600ms

# Tagline
Type "Fuzzy-search your markdown notes from the terminal."
Sleep 400ms
Enter
Sleep 600ms

# 2-3 sentence description
Type "A single-binary CLI for devs to instantly search their notes/ folder."
Sleep 400ms
Enter
Sleep 600ms

# Audience
Type "developers with a notes folder"
Sleep 400ms
Enter
Sleep 600ms

# Problem
Type "existing search tools don't understand markdown structure"
Sleep 400ms
Enter
Sleep 1200ms

# Hold the final frame so viewers can read the last prompt.
Sleep 2500ms
