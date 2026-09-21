# Sawyer's Squishys 🫧

One-page website for Sawyer's Squishys. Live at **https://invalidprince.github.io/sawyers-squishys/**

Plain HTML/CSS/JS — no frameworks, no build step. Hosted free on GitHub Pages.

---

## To add an event

Edit **`events.json`** and push. That's it — the site updates automatically within a minute or two.

The file is a JSON list. Add one `{ ... }` block per event:

```json
[
  {
    "name": "Abbottstown Fall Festival",
    "date": "2026-10-11",
    "location": "Town Square, Abbottstown, PA",
    "hours": "10:00 AM – 4:00 PM",
    "booth": "Booth 14, near the food trucks",
    "notes": "New donut squishys this time!"
  }
]
```

### Fields

| Field      | Required | What it is                                              |
| ---------- | -------- | ------------------------------------------------------- |
| `name`     | yes      | Event name                                               |
| `date`     | yes\*    | Single day, `YYYY-MM-DD`                                 |
| `dates`    | \*       | Multi-day: `["2026-10-11", "2026-10-12"]` (use instead of `date`) |
| `start`/`end` | \*    | Multi-day alternative: `"start": "2026-10-11", "end": "2026-10-13"` |
| `dateText` | no       | Override the displayed date text, e.g. `"Every Saturday in October"` |
| `location` | no       | Address or place                                         |
| `hours`    | no       | e.g. `"10:00 AM – 4:00 PM"`                              |
| `booth`    | no       | Booth number / where to find the table                   |
| `notes`    | no       | Anything extra (shown in a yellow highlight box)         |

\* Use **one** of `date`, `dates`, or `start`/`end`.

**Past events hide themselves automatically** the day after they end — no cleanup needed.
When the list is empty the site shows "Events coming soon — follow along!"

---

## Easier way: the helper script

```bash
./add_event.sh "Abbottstown Fall Festival" "2026-10-11" "Town Square, Abbottstown PA" "10am-4pm" "Booth 14"
```

Arguments in order: **name, date(s), location, hours, booth**.
For a multi-day event pass a comma-separated date list: `"2026-10-11,2026-10-12"`.

The script appends the event to `events.json`, then commits and pushes for you.

---

## Files

| File               | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `index.html`       | The page                                          |
| `style.css`        | Styling (logo palette: navy + pastel rainbow)     |
| `app.js`           | Renders events, handles the contact form          |
| `events.json`      | **The only file you normally edit**               |
| `add_event.sh`     | Helper to add an event + push                     |
| `assets/logo.png`  | Logo                                              |
| `assets/favicon.png` | Browser tab icon                                |

## Contact form

Runs on [Web3Forms](https://web3forms.com) (free tier). Messages are emailed automatically.
The access key in `app.js` is a public submit-only key — it does not expose the destination inbox.
