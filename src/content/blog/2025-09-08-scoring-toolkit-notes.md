---
title: "Notes on the scoring simulation toolkit"
date: 2025-09-08
summary: "A short internal utility for estimating match scores now has a proper README and a handful of bug fixes."
tier: standard
topics: [product]
draft: false
---

The small Python utility several teams have been using to simulate match scores under different game-piece scoring strategies has been cleaned up and documented. It started last season as a single script one mentor wrote to answer a specific strategy question and has since been copied and modified by enough teams that it was worth putting a stable version somewhere central.

The current release fixes a rounding error in the endgame bonus calculation that a couple of teams had already patched independently, and adds command-line flags for the two most commonly requested configurations rather than requiring users to edit the script directly. The README now includes worked examples for a typical qualification match and a typical elimination match.

This remains a volunteer-maintained utility rather than an official tool, and it is not expected to be a large ongoing project. Teams are welcome to open issues or submit small patches, but larger feature requests are probably better served by a from-scratch rewrite once this season's game is better understood.

The toolkit is available in the shared team resources folder alongside the usual season documents.
