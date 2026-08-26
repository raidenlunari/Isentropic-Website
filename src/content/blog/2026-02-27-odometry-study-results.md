---
title: "Odometry drift study: preliminary results"
date: 2026-02-27
summary: "Early results from a comparison of three localization methods suggest a clear favorite for low-cost hardware."
tier: progress
topics: [research]
draft: false
---

Over the past two months, the research group has been comparing three approaches to wheel odometry drift correction on the hardware most teams already own: dead reckoning with gyroscope fusion, a two-wheel encoder differential model, and a vision-assisted correction pass using a fixed downward-facing camera. The goal is to identify a method that meaningfully improves position accuracy without requiring parts beyond what a typical team budget supports.

Testing so far has run on a standardized 4 meter by 4 meter course with painted reference lines, repeated across three different chassis builds to control for mechanical variation between teams. The gyroscope-fusion approach reduced accumulated drift by roughly 40 percent relative to unassisted dead reckoning over a two-minute run, while the vision-assisted method performed better still but at a noticeably higher computational cost on the microcontrollers most teams currently use.

These are preliminary numbers rather than a final recommendation. The group plans to extend the test matrix to include surface conditions closer to actual competition mats, since the current course uses a smoother floor than most venues provide, and floor texture appears to have a nontrivial effect on encoder slip.

A full write-up with methodology, raw data, and code will be published once testing on additional surfaces is complete, expected by the end of the spring term. In the meantime, teams interested in trying the gyroscope-fusion approach on their own robots can request the current test firmware from the research group.
