---
title: "Encoder-Based Odometry Calibration Across Chassis Variants"
date: 2026-03-10
authors:
  - "Elena Whitfield"
  - "Marcus Delgado"
  - "Research Committee"
abstract: "We characterize accumulated position error from wheel encoder odometry on three chassis configurations in common use across the network and evaluate a per-unit calibration procedure that corrects for wheel diameter tolerance and encoder mounting offset. Calibration reduced median drift over a two-minute run by 34 percent relative to manufacturer nominal values, with the largest gains observed on six-wheel drivetrains where uncorrected wheel diameter mismatch between the two sides of the chassis was the dominant error source."
synopsis: "A short calibration routine that measures each robot's actual wheel size and encoder alignment cuts navigation drift by roughly a third, with the biggest improvement on six-wheel chassis where small manufacturing differences between wheels add up over a match."
manuscriptAvailable: true
---

## Motivation

Dead-reckoning odometry from wheel encoders remains the most common localization method among network teams because it requires no additional hardware beyond what most control systems already include. Its accuracy, however, depends on constants — wheel diameter, encoder counts per revolution, and track width — that are typically taken from a part's nominal specification rather than measured on the assembled robot. Manufacturing tolerance on commonly used wheels runs as high as 2 percent of nominal diameter, and encoder mounting introduces a further small but consistent offset. Both errors are systematic rather than random, so they accumulate rather than average out over a run.

## Method

We tested three chassis configurations drawn from robots currently fielded by network teams: a two-wheel differential drive, a four-wheel skid-steer, and the six-wheel configuration used in the second-generation chassis platform. For each configuration we ran five physical units through a fixed 4 meter square course with painted reference lines, recording encoder counts and comparing the odometry-estimated final position against the measured true position.

The calibration procedure itself is a one-time routine performed on each assembled robot: it drives a short fixed pattern (forward, rotate in place, forward), compares encoder-reported displacement against the known course geometry, and solves for effective wheel diameter and track width that minimize the discrepancy. The routine takes under two minutes and requires no equipment beyond a flat floor with two known reference points.

## Results

Prior to calibration, median accumulated position error after a two-minute run across all fifteen units was 18.4 cm. After calibration, median error fell to 12.1 cm, a 34 percent reduction. The improvement was not uniform across configurations: two-wheel differential drive units, which have only one wheel diameter parameter per side to correct, improved by 21 percent, while six-wheel units improved by 46 percent. We attribute this difference to the six-wheel platform's greater sensitivity to left-right wheel diameter mismatch, since uncorrected error there compounds across three wheel pairs per side rather than one.

Calibration constants were stable when re-measured after one week of normal use, with encoder count and wheel diameter estimates changing by less than 1 percent, suggesting the routine does not need to be repeated often under normal wear.

## Limitations and Next Steps

All testing was performed on a smooth indoor floor with the robot's stock wheels; drift under partial wheel slip, such as on textured competition mats, was not evaluated here and is the subject of ongoing work referenced in the group's midseason progress notes. We also did not test calibration stability after a wheel replacement, which teams do routinely after damage, and would expect to require re-running the routine.

## References

1. Borenstein, J., Feng, L. "Measurement and Correction of Systematic Odometry Errors in Mobile Robots." IEEE Transactions on Robotics and Automation, 1996.
2. Internal test log and calibration firmware, available on request alongside the manuscript.
