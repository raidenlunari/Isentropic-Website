---
title: "Scoring Simulation Toolkit"
kind: software
status: "Actively maintained"
summary: "A command-line utility for estimating match scores under different game-piece scoring strategies, used by teams to compare strategy options before committing build time."
links:
  - label: "Repository"
    url: "https://example.org/isentropic/scoring-toolkit"
  - label: "README and worked examples"
    url: "https://example.org/isentropic/scoring-toolkit/readme"
---

## Specifications

The toolkit is a Python command-line program that takes a short configuration file describing a scoring strategy — game pieces scored per cycle, cycle time, and endgame actions attempted — and outputs an estimated score distribution across a simulated qualification or elimination match. It includes command-line flags for the two most commonly requested configurations, a standard qualification match and a standard elimination match, so most teams do not need to edit the configuration file directly.

## Requirements

Requires Python 3.10 or later and no dependencies outside the standard library, so it runs without a package installation step on a school computer lab machine or a personal laptop. Input configuration files are plain text and can be version-controlled alongside a team's other strategy notes.

This remains a volunteer-maintained utility rather than an officially supported tool. Small patches and bug reports are welcome through the repository; larger feature requests are better suited to a rewrite once a given season's game rules are well understood, since the scoring model is specific to each season.
