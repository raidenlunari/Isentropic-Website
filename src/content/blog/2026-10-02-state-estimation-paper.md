---
title: "Reliability-oriented evaluation of state estimation on VEX V5"
date: 2026-10-02
summary: "A paper by Moon Liu and Ke Yang, prepared for RAMS 2027, compares three motion state estimators on the VEX V5 platform for accuracy, robustness, and computational cost."
tier: standard
topics: [research]
draft: false
---

A paper by Isentropic Robotics cofounder Moon Liu, written with Ke Yang, has been prepared for the 2027 Annual Reliability and Maintainability Symposium (RAMS): *Reliability-Oriented Evaluation of State Estimation for VEX Robotic Systems: A Sensor Fusion Approach*. The authors' affiliations are Dublin High School and Texas A&M International University respectively. The full entry, with every result table and the reference list, is on the [Research](/research) page, where the manuscript can also be requested.

## What the paper evaluates

A VEX V5 robot estimates where it is from wheel encoders, an inertial sensor, and, on a field fitted with the GPS Field Code, the V5 GPS. Each of those measurements carries noise, occasional outliers, and errors that accumulate into drift over a match. The paper sets out a reliability-oriented framework for choosing a filter under the V5 platform's constraints and applies it to three estimators:

- the **Exponentially Weighted Moving Average (EWMA)**, a simple recursive smoother with a single parameter and no absolute correction;
- the **Information Filter (IF)**, a Kalman-family estimator in information form, run as one scalar filter per pose component and corrected by periodic GPS readings;
- the **Invariant Extended Kalman Filter (IEKF) on SE(2)**, which represents the planar pose on the Lie group of rigid-body motion and propagates a full 3 by 3 covariance.

The EWMA update is the simplest of the three. With a smoothing parameter derived from the sampling interval and a chosen time constant, each new measurement is blended into the running estimate:

```
y_k = (1 − α) · y_{k−1} + α · x_k,    0 < α ≤ 1
α   = 1 − exp(−Δt / τ)
```

The IF and IEKF are model-based and, unlike EWMA, receive absolute corrections from the GPS.

## Results

### Physical trials

A V5 robot drove four laps of a 1 m square, about 16 m in total, ten times, with all four configurations evaluated on the same recorded measurements and an external AprilTag camera as ground truth.

Table 1. Four-lap physical experiment, ten runs. Position error in cm, mean ± standard deviation.

| Metric | No filter | EWMA | IF | IEKF |
| --- | --- | --- | --- | --- |
| Final error | 22.17 ± 1.11 | 18.78 ± 0.91 | 4.81 ± 0.24 | 4.32 ± 0.20 |
| Mean ATE | 13.62 ± 0.65 | 18.16 ± 0.89 | 3.17 ± 0.13 | 2.87 ± 0.09 |
| Peak error | 30.33 ± 1.49 | 26.11 ± 1.20 | 8.78 ± 0.40 | 7.10 ± 0.30 |

Both GPS-corrected filters cut mean absolute trajectory error by roughly four fifths. Smoothing alone did not prevent accumulated error: EWMA trimmed the final and peak errors, but its mean trajectory error was worse than no filter at all.

### Simulation and robustness

A simulation calibrated against the physical robot ran a slalom course to stress heading estimation. The IEKF edged out the IF on heading RMSE (0.46 against 0.49 degrees) and on trajectory error (0.85 against 0.92 cm).

<figure>
  <img src="/images/research/rams-2027-slalom-simulation.png" alt="One slalom simulation trial. Top: the robot's pure-pursuit trajectory against the waypoint centreline and ground truth, with the unfiltered and SE(2) IEKF estimates overlaid. Bottom: heading error over time on a log scale for no filter, EWMA, the Information Filter, and the SE(2) IEKF." width="770" height="664" loading="lazy" />
  <figcaption>One slalom trial: pure-pursuit trajectory (top) and heading error over time on a log scale (bottom).</figcaption>
</figure>

Injecting a large GPS position outlier into 10 percent of updates raised both filters' trajectory error by more than an order of magnitude, since neither rejects outliers; the IEKF's heading error also rose sharply while the IF's barely moved. Dropping 30 percent of GPS updates, by contrast, cost either filter only about a millimetre of mean trajectory error.

## The trade-off

Counting arithmetic operations per 10 ms update, the IEKF costs about 8.8 times as much as the IF for a modest gain in accuracy and a greater heading sensitivity to bad GPS readings. The paper's conclusion is that estimator sophistication does not improve every dimension at once, and that the framework it describes, which weighs accuracy, robustness, and cost together, gives a systematic basis for evaluating estimators on a resource-constrained platform.
