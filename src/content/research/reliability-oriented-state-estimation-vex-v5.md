---
title: "Reliability-Oriented Evaluation of State Estimation for VEX Robotic Systems: A Sensor Fusion Approach"
date: 2026-10-02
authors:
  - "Moon Liu (Dublin High School)"
  - "Ke Yang (Texas A&M International University)"
abstract: "Reliable motion state estimation in autonomous robots is challenged by sensor noise, outlier measurements, and accumulated drift, particularly in dynamic competition environments. This paper presents a reliability-oriented framework for evaluating three estimators on the resource-constrained VEX V5 robotic system: Exponentially Weighted Moving Average (EWMA), Information Filter (IF), and Invariant Extended Kalman Filter (IEKF) on SE(2). These methods are evaluated through repeated physical experiments and calibrated simulations for accuracy, robustness, and computational cost. Across ten four-lap trials, mean final position error decreased from 22.17 cm for unfiltered dead reckoning to 4.81 cm for the IF and 4.32 cm for the IEKF. In the calibrated slalom simulation, the IEKF achieved slightly lower position absolute trajectory error (ATE) and heading root mean square error (RMSE) than the IF. Robustness tests further showed that neither Kalman-family estimator inherently rejected large GPS outliers, whereas GPS dropout was comparatively well tolerated. Analytical operation counts indicated that the IEKF required approximately 8.8 times as many arithmetic operations per update as the IF. Overall, the results highlight the trade-offs among estimation accuracy, measurement robustness, and computational cost, while the proposed framework provides a systematic basis for evaluating state estimators on low-cost, resource-constrained robotic platforms."
synopsis: "A VEX V5 robot that relies on wheel encoders and an inertial sensor alone drifts further from its true position with every lap. This paper tests three ways of filtering those measurements, from a simple moving average to a Kalman-family filter that uses the field GPS to correct itself. The two GPS-corrected filters cut the final position error of a 16 m course from about 22 cm to under 5 cm; the more sophisticated of the two is slightly more accurate but costs almost nine times as many arithmetic operations, and its heading estimate is more sensitive to bad GPS readings."
manuscriptAvailable: true
---

Prepared for the 2027 Annual Reliability and Maintainability Symposium
(RAMS). Keywords: autonomous systems, motion state estimation,
reliability evaluation, sensor fusion.

## Motivation

Autonomous performance in VEX Robotics depends on onboard inertial,
rotation, encoder, and positioning measurements for odometry, navigation,
and interaction with field elements. Those measurements carry noise,
occasional outliers, and errors that accumulate: a short-term disturbance
can misalign the robot with a field element, and repeated integration of
small errors produces long-term drift that degrades autonomous performance
over the course of a match.

Filtering reduces the influence of measurement noise on program-critical
state estimates, but choosing an estimator for the V5 platform means
balancing drift suppression, outlier robustness, and computational cost.
Existing studies of filtering for differential-drive robots concentrate on
general mobile platforms or idealized simulations, and give little
attention to the specific sensing, computational, and operational
constraints of V5. Outlier robustness matters in particular: the VEX Push
Back field offers opportunities to correct the robot's pose physically
against field structures, and while small localization errors may be
mechanically tolerated during those interactions, a large estimation
outlier can prevent the alignment and eliminate the intended reset.

## Estimators considered

Candidate filters were screened on computational cost, outlier handling,
and drift handling.

| Filter | Computational cost | Outlier handling | Drift handling |
| --- | --- | --- | --- |
| EWMA | Very low; simple recursive update | Poor to moderate; sensitive to large spikes | Poor; does not correct long-term drift |
| Kalman Filter (standard form; not implemented) | Low to moderate; efficient for simple models | Moderate; sensitive to large outliers | Good; reduces accumulated drift with measurement updates |
| Information Filter | Moderate; comparable to Kalman filtering | Moderate; sensitive to large outliers | Good; reduces drift with reliable updates |
| SE(2) IEKF | Moderate; nonlinear propagation and small matrix operations | Moderate; no inherent outlier rejection | Good; combines motion propagation with absolute corrections in a coupled pose model |
| Particle Filter | High; cost increases with particle count | Potentially robust; accommodates non-Gaussian noise and outliers | Good; can correct accumulated drift when informative measurements are available |

Three estimators were implemented and evaluated. The Exponentially
Weighted Moving Average (EWMA) provides simple recursive smoothing with
constant memory and a single smoothing parameter, but it is not
model-based, receives no absolute correction, and can introduce response
lag during rapidly changing motion. The Information Filter (IF) is a conventional
Kalman-family estimator in information form, with one scalar filter per
pose component (x, y, heading); its prediction step is driven by encoder
and inertial increments and its update step by periodic V5 GPS
measurements. The Invariant Extended Kalman Filter (IEKF) on SE(2)
represents the planar pose on the Lie group of rigid-body motion and
propagates a full 3 by 3 covariance, so it can capture the coupling
between heading error and position error during turns that the
per-channel IF cannot. The standard Kalman Filter was not implemented
separately because the IF is an equivalent formulation under the
linear-Gaussian assumptions of the study, and particle filtering was
excluded because its per-update cost scales with the particle count.

## Platform constraints

The V5 Brain provides a Cortex-A9 user processor, 128 MB of RAM, and
32 MB of flash for user programs, which motivates fixed-size state
representations and bounded update cost. Rotation-sensor values are
copied into a shared buffer every 10 ms, so polling faster yields no newer
measurement; a discrete time step of 0.01 s was adopted for every
estimator. The V5 inertial sensor supplies heading and angular rate,
rotation sensors and motor encoders supply incremental motion, and the
field-based V5 GPS supplies periodic absolute position and heading used
only as a correction input to the IF and IEKF.

## Physical experiments

A VEX V5 robot drove four consecutive laps around a 1 m by 1 m square on a
representative Push Back field layout, roughly 16 m in total, with four
straight segments and four 90 degree turns per lap. Ten runs were
recorded, and all four configurations (unfiltered dead reckoning, EWMA,
IF, and IEKF) were evaluated on the same sensor measurements from each
run. Ground truth came from an external camera tracking an AprilTag on
the robot, independent of the GPS measurements used for correction;
endpoint error was also measured against a marked field location at the
end of each lap. Position error is reported in centimetres as mean plus
or minus standard deviation across the ten runs.

| Metric | No filter | EWMA | IF | IEKF |
| --- | --- | --- | --- | --- |
| Final error | 22.17 ± 1.11 | 18.78 ± 0.91 | 4.81 ± 0.24 | 4.32 ± 0.20 |
| Mean ATE | 13.62 ± 0.65 | 18.16 ± 0.89 | 3.17 ± 0.13 | 2.87 ± 0.09 |
| Peak error | 30.33 ± 1.49 | 26.11 ± 1.20 | 8.78 ± 0.40 | 7.10 ± 0.30 |
| End of lap 1 | 7.9 | 6.8 | 1.2 | 0.9 |
| End of lap 2 | 11.4 | 10.1 | 2.2 | 1.7 |
| End of lap 3 | 17.2 | 13.9 | 2.9 | 3.1 |
| End of lap 4 | 22.2 | 18.8 | 4.8 | 4.3 |

Unfiltered dead reckoning drifted steadily, with lap-end errors of 7.9,
11.4, 17.2, and 22.2 cm. The GPS-corrected IEKF and IF achieved mean
absolute trajectory errors of 2.87 cm and 3.17 cm, reductions of
approximately 79 percent and 77 percent relative to the unfiltered
configuration. EWMA reduced the final and peak errors but its mean ATE
(18.16 cm) exceeded the unfiltered value (13.62 cm): smoothing alone did
not prevent accumulated error.

## Simulation stress test

Because the physical trials evaluate position only, a calibrated
discrete-time simulation was used to examine heading performance under
sustained rotation. The simulation uses a 10 ms update period, encoder
quantization, inertial heading noise and bias, and 200 ms GPS updates,
with noise parameters estimated from the physical robot: gyro rate noise
and bias from ten repeated 1 m straight-line drives, encoder noise by
regression over straight-line drives of several distances, and GPS
position and heading noise from a stationary robot at a known field
location. The configured values were a 0.30 m track width, a 34.9 mm
wheel radius, encoder noise of 0.20 mm per step, gyro rate noise of
0.015 degrees per step, a per-run gyro bias with standard deviation
0.0006 degrees per step, GPS position noise of 1.5 cm, GPS heading noise of 1.00 degrees, and an EWMA
time constant of 40 ms (smoothing parameter 0.22).

A slalom trajectory with repeated alternating turns served as the
heading-dynamics stress test. Twenty random seeds were evaluated per
estimator.

| Metric | No filter | EWMA | IF | IEKF |
| --- | --- | --- | --- | --- |
| Heading RMSE (°) | 0.60 ± 0.02 | 3.15 ± 0.09 | 0.49 ± 0.02 | 0.46 ± 0.02 |
| ATE (cm) | 1.77 ± 0.05 | 3.04 ± 0.09 | 0.92 ± 0.05 | 0.85 ± 0.03 |
| Final error (cm) | 2.34 ± 0.07 | 1.14 ± 0.03 | 0.64 ± 0.04 | 0.64 ± 0.03 |

![One slalom simulation trial. Top: the robot's pure-pursuit trajectory against the waypoint centreline and ground truth, with the unfiltered and SE(2) IEKF estimates overlaid. Bottom: heading error over time on a log scale for no filter, EWMA, the Information Filter, and the SE(2) IEKF.](/images/research/rams-2027-slalom-simulation.png)

Fig. 1. Slalom course, one trial. Top: pure-pursuit trajectory
(look-ahead distance 0.25 m). Bottom: heading error over time, log scale.

The IEKF produced a heading RMSE of 0.46 degrees and an ATE of 0.85 cm,
against 0.49 degrees and 0.92 cm for the IF; both improved on the
unfiltered heading RMSE of 0.60 degrees. EWMA's heading RMSE of 3.15
degrees was more than five times the unfiltered value, consistent with
the smoothing lag of its 40 ms time constant during rapid heading
changes.

## Outlier and dropout robustness

Robustness was evaluated on the same slalom simulation over a 10 s
segment, with 20 seeds per condition. In the outlier condition each GPS
update had a 10 percent probability of a 0.5 to 1.0 m position outlier
per axis; in the dropout condition each update had a 30 percent
probability of being dropped; a third condition combined both. The
unfiltered and EWMA configurations receive no GPS corrections and are
unaffected. ATE and
heading RMSE are mean plus or minus standard deviation across seeds; peak
error is the mean across seeds.

| Condition | Estimator | ATE (cm) | Peak error (cm) | Heading RMSE (°) |
| --- | --- | --- | --- | --- |
| Baseline | IF | 0.54 ± 0.13 | 1.01 | 0.27 ± 0.10 |
| Baseline | IEKF | 0.52 ± 0.10 | 1.01 | 0.26 ± 0.09 |
| 10% outliers | IF | 7.63 ± 3.13 | 19.79 | 0.28 ± 0.08 |
| 10% outliers | IEKF | 7.65 ± 3.14 | 19.73 | 1.06 ± 0.43 |
| 30% dropout | IF | 0.66 ± 0.17 | 1.21 | 0.31 ± 0.09 |
| 30% dropout | IEKF | 0.62 ± 0.14 | 1.20 | 0.29 ± 0.08 |
| Both | IF | 6.21 ± 3.27 | 15.28 | 0.29 ± 0.09 |
| Both | IEKF | 6.27 ± 3.23 | 15.38 | 0.83 ± 0.32 |

Neither GPS-corrected estimator rejects outlying measurements. Under 10
percent injected outliers, mean ATE rose by more than an order of
magnitude for both, and mean peak position error reached approximately
0.20 m. The estimators differed in heading: the IF's heading RMSE was
nearly unchanged (0.27 to 0.28 degrees) while the IEKF's rose from 0.26 to
1.06 degrees. GPS dropout at 30 percent produced only small increases in
ATE for either estimator.

## Computational cost

Cost was compared analytically from the update equations, counting
persistent scalar values and approximate arithmetic operations per 10 ms
update with the 5 Hz GPS update amortized over the 20 prediction steps
between readings.

| Estimator | Persistent scalar values | Operations per update (approx.) | Relative cost (IEKF = 1.0) |
| --- | --- | --- | --- |
| No filter | 3 | 9 | 0.06 |
| EWMA | 6 | 22 | 0.16 |
| IF | 12 | 16 | 0.11 |
| IEKF | 30 | 140 | 1.00 |

By this count the IEKF requires approximately 8.8 times as many
operations per update as the IF and 6.4 times as many as EWMA, chiefly
from propagating and updating its 3 by 3 covariance. These are relative
analytical estimates, not measured execution times on the V5 Brain.

## Discussion

Increasing estimator sophistication did not produce uniform improvement.
A key distinction is absolute correction: EWMA smooths but cannot control
accumulated drift, while the GPS-corrected IF and IEKF reduced it
substantially. The IEKF achieved slightly lower errors than the IF,
particularly under heading-intensive motion, suggesting a potential
benefit from its coupled SE(2) representation, at the price of greater
observed heading sensitivity to GPS position outliers and higher
analytical computational cost. The heading and robustness evaluations were conducted
in simulation, the theoretical properties of invariant filtering were not
evaluated directly, and computational cost was estimated rather than
measured on the device; physical stress testing, robust measurement
updates, on-device timing, and filter-consistency analysis are left to
future work.

## Author contributions

Moon Liu designed and executed the experiments, including data collection
on the VEX V5 system, led preparation of the manuscript, and contributed
to the analysis and interpretation of results. Ke Yang, Assistant
Professor in the School of Engineering at Texas A&M International
University, provided research guidance and supervision throughout.

## References

1. Hassanzadeh, I., and Abedinpour Fallah, M. (2008). Design of augmented extended and unscented Kalman filters for differential-drive mobile robots. *Journal of Applied Sciences*, 8(16), 2901–2906. https://doi.org/10.3923/jas.2008.2901.2906
2. Kou, E., and Haggenmiller, A. (2023). Extended Kalman filter state estimation for autonomous competition robots. *Journal of Student Research*, 12(1). https://doi.org/10.47611/jsrhs.v12i1.5578
3. Hartley, R., Ghaffari, M., Eustice, R. M., and Grizzle, J. W. (2020). Contact-aided invariant extended Kalman filtering for robot state estimation. *The International Journal of Robotics Research*, 39(4), 402–430. https://doi.org/10.1177/0278364919894385
4. Valade, A., Acco, P., Grabolosa, P., and Fourniols, J.-Y. (2017). A study about Kalman filters applied to embedded sensors. *Sensors*, 17(12), 2810. https://doi.org/10.3390/s17122810
5. Naveen, A., Morris, J., Chan, C., Mhrous, D., Helbling, E. F., Hyun, N.-S. P., Hills, G., and Wood, R. J. (2024). Hardware-in-the-loop for characterization of embedded state estimation for flying microrobots [Preprint]. arXiv:2411.06382
6. VEX Robotics. (2026, April 6). Understanding the V5 Robot Brain. VEX Library.
7. Purdue University ACM SIGBots. (n.d.). VEX Rotation Sensor C++ API. PROS for V5 Documentation. https://pros.cs.purdue.edu/v5/api/cpp/rotation.html
8. VEX Robotics. (n.d.). GPS sensor. VEXcode V5 C++ API.
9. Lucas, J. M., and Saccucci, M. S. (1990). Exponentially weighted moving average control schemes: Properties and enhancements. *Technometrics*, 32(1), 1–12. https://doi.org/10.1080/00401706.1990.10484583
10. Pfaff, F., Noack, B., Hanebeck, U. D., Govaers, F., and Koch, W. (2017). Information form distributed Kalman filtering (IDKF) with explicit inputs. In *2017 20th International Conference on Information Fusion (Fusion)*. IEEE. https://doi.org/10.23919/ICIF.2017.8009724
11. Barrau, A., and Bonnabel, S. (2017). The invariant extended Kalman filter as a stable observer. *IEEE Transactions on Automatic Control*, 62(4), 1797–1812. https://doi.org/10.1109/TAC.2016.2594085
12. Arsenault, J. (2019). Practical considerations and extensions of the invariant extended Kalman filtering framework [Master of Engineering thesis, McGill University]. McGill University eScholarship.
13. Barfoot, T. D. (2017). *State estimation for robotics*. Cambridge University Press. https://doi.org/10.1017/9781316671528
