# Star City Cup

The Star City Cup is Star City Golf Club's year-long points race, modeled on the FedExCup. Players earn points in every club event, and the player with the most points at the end of the year wins the Cup. There's one champion across all events and divisions.

This repo holds everything that runs it:

- a **Google Sheet tracker** where staff enter results and the sheet works out everyone's points;
- a **script** for the sheet that fills in last week's positions and locks final scores;
- a **standings page** (`index.html`) that reads the sheet and shows the live standings on a website.

Live standings: https://spencerholladay.com/standings.html

## What's in the repo

| File | What it is |
|---|---|
| `index.html` | The standings page. One self-contained file with the logo built in. No server needed. |
| `star-city-cup.gs` | The Apps Script for the tracker. It fills the Last Week tab and locks scores when an event is Final. |
| `tracker/star-city-cup-tracker.xlsx` | The blank tracker to start a season with. Upload it to Google Sheets. |
| `tracker/star-city-cup-tracker-sample.xlsx` | The same tracker filled with made-up results, as an example. |
| `tracker/points-calculator.xlsx` | The Points Calculator tab on its own, for copying into a tracker that's already set up. |
| `assets/star-city-golf-club-logo.png` | The club logo, full size. |

## How the points work

**Winner's points**

| Event | Winner gets |
|---|---|
| Club Championship | 1,000 |
| Each Major (Masters, US Open, The Open, PGA Championship) | 600 |
| 2-Man Scramble League (5 seasons a year) | 300 |
| Tuesday Night League (5 seasons a year) | 200 |
| One Hour Wednesday (OHW) | 50 per week |

**Everyone else** earns a share of the winner's points based on their finish and the size of the field:

```
points = winner's points × (10% + 90% × ((N − place) / (N − 1))³)
```

`N` is the number of players or teams that finished. First place gets 100%, and last place gets 10%. Tied players split the points for the places they cover. Points are rounded to whole numbers.

Field size matters. In a small field there are fewer players to beat, so points drop off faster after first place. For example, here's a Scramble League, where the winner gets 300:

| Finish | 4 teams | 12 teams |
|---|---|---|
| 1st | 300 | 300 |
| 2nd | 110 | 233 |
| 3rd | 40 | 178 |
| 4th | 30 | 134 |
| Last | 30 | 30 |

**Event rules**

- **Team events:** every player on a team gets the team's full points.
- **Majors:** scores are gross. The Open and Senior divisions are separate fields with the same points. Each division has one winner, who gets 600. Anyone tied with the winner is scored from 2nd place down. While a Major is in progress, points are projected from the current leaderboard.
- **Club Championship:** the top 16 qualifiers play match play. Points are fixed by how far a player gets:

  | Result | Points |
  |---|---|
  | Champion | 1,000 |
  | Runner-up | 650 |
  | Semifinal | 450 |
  | Quarterfinal | 300 |
  | Round of 16 | 200 |
  | Qualifying rank 17 to 32 | 50 |
  | Qualifying rank 33 and below | 20 |

- **One Hour Wednesday:**
  - The gross winner and the net winner each get 50. Everyone else is scored on their gross finish.
  - Weeks with fewer than 6 players pay half.
  - Only each player's 12 best weeks count, so 12 weekly wins equal one Major win.

## Setup

### 1. Put the tracker in Google Sheets

1. In Google Drive, choose **New > File upload** and upload `tracker/star-city-cup-tracker.xlsx`.
2. Open it and choose **File > Save as Google Sheets**. Work in the Google Sheets copy from now on.
3. On the **Players** tab, add every player once, spelled the way it should appear, with their division (Open or Senior). Every player dropdown in the tracker reads from this list.

### 2. Install the script

Google Sheets doesn't bring scripts in from an uploaded file, so you paste this one in.

1. In the Google Sheet, choose **Extensions > Apps Script**.
2. Delete what's in the editor, paste in all of `star-city-cup.gs`, and click **Save**.
3. Choose **setup** in the function list at the top, then click **Run**.
4. When Google asks for access, choose your account, then click **Advanced**, then **Go to (project name)**, then **Allow**. The warning appears because the script is your own and not from Google's store.
5. Reload the sheet. A **Star City Cup** menu appears.

The script does two things:

- **Fills in Last Week.** The first time a new week's OHW score is entered, it saves the standings from before that week to the Last Week tab. The ▲▼ arrows on the page compare against it. To do it by hand, use **Star City Cup > Save current standings as Last Week**.
- **Locks final scores.** When the Club Championship or a Major's Status is set to Final, it protects that tab's scores, along with the Winner column on Majors and the bracket results on the Club Championship. Anyone who edits a locked cell gets a warning first. Setting Status back to In progress unlocks the tab.

Without the script, everything else still works. The arrows won't appear, and Final won't lock the scores.

If you update `star-city-cup.gs` later, paste the new version over the old one and run **setup** again.

### 3. Publish the Web Feed tab

1. In the Google Sheet, choose **File > Share > Publish to web**.
2. Under **Link**, choose the **Web Feed** tab (not "Entire document") and **Comma-separated values (.csv)**.
3. Click **Publish** and copy the link. It looks like `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=...&single=true&output=csv`.

Anyone with this link can read the Web Feed tab. It holds the same names, events and points the standings page shows publicly. The sheet itself stays editable only by the people you share it with. Google republishes on its own after edits, usually within about 5 minutes.

### 4. Connect the page

Open `index.html` in a text editor, find this line near the bottom, and paste the link between the quotes:

```js
var SHEET_CSV_URL = "";
```

Open the file in a browser to check it. The "Sample data" note should be gone, and your players should appear. With no link, the page shows made-up sample standings.

### 5. Put the page on a website

**Option A, host the file (recommended).** Upload `index.html` to the site, renamed if you like (it's `standings.html` on spencerholladay.com). Link to it, or embed it in another page with:

```html
<iframe id="star-city-cup" src="https://YOUR-SITE.com/standings.html" title="Star City Cup standings"
  style="width:100%;border:0;min-height:700px"></iframe>
<script>
window.addEventListener("message", function (e) {
  if (e.data && e.data.starCityCupHeight) document.getElementById("star-city-cup").style.height = e.data.starCityCupHeight + "px";
});
</script>
```

The script lets the frame grow when someone opens a player's details, so there's no inner scrollbar.

**Option B, paste it in.** Site builders such as Squarespace, Wix and WordPress have an "Embed" or "Custom HTML" block. Paste the whole contents of `index.html` into it.

Moving to starcitygolfclub.com later uses the same steps on that site. The Google Sheet doesn't change.

## Using the tracker

Fill in the **white** columns only. The **grey** columns calculate themselves. Every event tab has a **Check** column that says OK or explains what to fix. All scores are in strokes, and lower scores rank higher. Dates show as month and day (Jan 6).

| Tab | What to enter |
|---|---|
| Club Championship | One row per qualifier with their best qualifying score. As the bracket plays out, pick each top-16 player's result in **Bracket Result**. Until then, the top 16 are projected at Round of 16 points. |
| Masters, US Open, The Open, PGA Championship | One row per player with their best score so far. Type over it when they beat it. When the Major ends, pick **Winner** for one player in each division. |
| Scramble Leagues | One row per team when a season ends: season name (the same on every row of that season), end date, team, both players, final place. |
| Tuesday Leagues | The same as Scramble, with up to four players. |
| OHW | One block per Wednesday of 2027, already dated. Pick the players, enter their gross scores, and pick the **Gross winner** and **Net winner** in the Winner column. Collapse finished weeks with the − button in the left margin. |
| Players | Every player once, with their division. |
| Standings | Cup totals by event type, for review. |
| Last Week | Filled in by the script. |
| Points Calculator | Pick an event and enter the field size to see what each place earns, what tied players get, and the fixed Club Championship values. It's a reference only and doesn't affect the standings. |
| Points | The point values (see below). |
| Web Feed | What the website reads. Don't edit or rename it. |

**Status (Club Championship and Majors).** Each of these tabs has a Status cell at the top:

- **Not started:** no points count, and the page doesn't show the event.
- **In progress:** points are projected from the current leaderboard, and the page shows a "Projected standings" note.
- **Final:** points are official, and the script locks the scores. On Majors, the Check column reminds you to pick each division's winner.

Also fill in the **End date** cell, which sorts the event in each player's history.

### Weekly routine

1. Enter the OHW results and pick the gross and net winners.
2. Update any Major or Club Championship in progress with new best scores.
3. Enter any league seasons that finished.
4. Check that every Check column says OK.

The standings page updates the next time someone opens it after Google republishes, which is usually within a few minutes.

### Adding the Points Calculator to an existing tracker

New copies of the tracker already include this tab. To add it to a tracker that's already set up:

1. Upload `tracker/points-calculator.xlsx` to Google Drive and open it in Google Sheets.
2. Right-click the **Points Calculator** tab and choose **Copy to > Existing spreadsheet**, then pick the tracker.

A copied calculator keeps its own point values. If you change a value on the Points tab, change it on the calculator too.

## Changing point values

All point values live on the **Points** tab:

- **A2:B6:** winner's points for each event type.
- **D2:E6:** Club Championship bracket points.
- **H2:H3:** Club Championship qualifying tiers.
- **H4:H5:** the OHW small-field rule (fewer than 6 players pays 0.5).
- **H6:** how many OHW weeks count (12).
- **H7:** last place's share of the winner's points (0.1).

Change a number, and every result and the standings recalculate. Don't rename the event types or the bracket results, because the other tabs look them up by name.

## Good to know

- Don't rename tabs or column headings. The Web Feed tab and the page rely on them.
- Start a new copy of the tracker each season. The OHW blocks are dated for 2027.
- The page reads only the published Web Feed tab. Nobody can edit the sheet through it.
