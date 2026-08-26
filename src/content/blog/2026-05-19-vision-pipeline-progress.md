---
title: "Vision pipeline: midseason progress"
date: 2026-05-19
summary: "A shared object-detection pipeline for game-piece tracking is running on three pilot teams' robots ahead of a broader rollout decision."
tier: progress
topics: [research, product]
draft: false
---

The research group's vision pipeline for game-piece detection has moved from bench testing to on-robot trials with three volunteer teams. The pipeline runs a lightweight detection model on a low-cost single-board computer mounted alongside each robot's existing controller, streaming bounding-box coordinates over a serial connection so that teams can consume the output without rewriting their existing control code. This split was a deliberate design choice: earlier prototypes required deeper integration with each team's codebase, which made adoption slower than the group wanted.

Detection accuracy on the current season's game pieces has been consistent across the three pilot robots, with the model correctly identifying pieces at typical match distances and lighting conditions in the vast majority of test runs. Performance drops noticeably in the corners of the field where venue lighting is dimmer, which the group is addressing by expanding the training set with images captured under those specific conditions rather than tuning the model's general parameters.

Compute cost remains the main open question before a wider release. The single-board computer adds a modest but real expense to a team's build budget, and the group is evaluating a smaller, cheaper board that would reduce cost but has not yet been benchmarked for detection speed under match conditions. A decision on which hardware to standardize on is expected before the pipeline is offered to additional teams.

If the pilot continues to perform well, the group intends to package the pipeline as a documented product with a standard bill of materials and setup guide, rather than the informal build currently running on the three pilot robots. That packaging work is scheduled to begin once the hardware question above is settled, with a target of making the pipeline available to any interested team ahead of next season's kickoff.
