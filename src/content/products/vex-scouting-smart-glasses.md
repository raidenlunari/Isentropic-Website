---
title: "VEX Scouting Smart Glasses"
kind: software
status: "In development"
summary: "VEX Scout puts live competition data from RobotEvents on a pair of Even Realities G2 smart glasses, so a team can follow rankings, match schedules, skills standings, and its own scouting notes without looking at a phone."
links: []
---

## What it does

VEX Scout is an application for Even Realities G2 smart glasses built for
V5 Robotics Competition teams. It pulls live event data from
events.vex.com and shows the parts a team needs between matches in the
corner of its field of view:

- the team's own standing: rank, win-loss-tie record, WP, AP, and SP, and
  high score;
- the next match, with its number, scheduled time, field, and both
  alliances;
- the whole division: full rankings, the complete schedule including the
  elimination bracket, and the skills leaderboard;
- scouting notes, the team's own and a shared Google Doc, filed by team
  number;
- live notifications as match results post, skills records change, and
  when it is time to queue;
- lookup of any team by voice or from the roster, with its full schedule.

## Specifications

- Display: 576 by 288 pixels, controlled with three gestures on the
  glasses
- Data source: the RobotEvents API, using the team's own API token
- Works offline from the last sync, so a venue without reliable
  connectivity does not blank the display
- Tracks one division at a time at multi-division events; teams in other
  divisions are fetched individually for lookup

## Requirements

Setup is done on a companion phone app, since anything that needs typing
(the API token, the event code, the team number, and written notes) lives
where a keyboard does. Voice lookup needs a speech-to-text service
supplied by the team; without one, lookup works from the roster.
