#!/usr/bin/env bash
# Add an event to events.json, then commit + push.
#
# Usage:
#   ./add_event.sh "Name" "2026-10-11" "Location" "10am-4pm" "Booth 14" ["notes"]
#   ./add_event.sh "Name" "2026-10-11,2026-10-12" "Location" "10am-4pm" "Booth 14"
#
# Only name and date(s) are required.

set -euo pipefail
cd "$(dirname "$0")"

if [ $# -lt 2 ]; then
  echo "Usage: $0 \"Name\" \"YYYY-MM-DD[,YYYY-MM-DD]\" [\"Location\"] [\"Hours\"] [\"Booth\"] [\"Notes\"]" >&2
  echo "Example: $0 \"Fall Festival\" \"2026-10-11\" \"Town Square, Abbottstown PA\" \"10am-4pm\" \"Booth 14\"" >&2
  exit 1
fi

NAME="$1"
DATES="$2"
LOCATION="${3:-}"
HOURS="${4:-}"
BOOTH="${5:-}"
NOTES="${6:-}"

command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

python3 - "$NAME" "$DATES" "$LOCATION" "$HOURS" "$BOOTH" "$NOTES" <<'PY'
import json, sys, os, re

name, dates, location, hours, booth, notes = sys.argv[1:7]

path = "events.json"
events = []
if os.path.exists(path):
    with open(path) as f:
        txt = f.read().strip()
    if txt:
        events = json.loads(txt)
if not isinstance(events, list):
    print("events.json is not a list — aborting", file=sys.stderr); sys.exit(1)

parts = [d.strip() for d in dates.split(",") if d.strip()]
for d in parts:
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", d):
        print(f"Date '{d}' is not YYYY-MM-DD — aborting", file=sys.stderr); sys.exit(1)
if not parts:
    print("No valid date given — aborting", file=sys.stderr); sys.exit(1)

ev = {"name": name}
if len(parts) == 1:
    ev["date"] = parts[0]
else:
    ev["dates"] = parts
for k, v in (("location", location), ("hours", hours), ("booth", booth), ("notes", notes)):
    if v:
        ev[k] = v

events.append(ev)
events.sort(key=lambda e: (e.get("date") or (e.get("dates") or [""])[0] or e.get("start") or "9999"))

with open(path, "w") as f:
    json.dump(events, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"Added: {name} ({', '.join(parts)})")
PY

git add events.json
git commit -m "Add event: $NAME ($DATES)"
git push

echo "Pushed. The site will update in a minute or two."
