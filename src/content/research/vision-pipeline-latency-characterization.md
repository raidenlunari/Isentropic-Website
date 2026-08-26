---
title: "Latency Characterization of the Shared Vision Pipeline"
date: 2026-06-01
authors:
  - "Marcus Delgado"
  - "Priya Raman"
abstract: "We measure end-to-end latency, from image capture to bounding-box delivery over serial, for the shared game-piece detection pipeline running on two candidate single-board computers under match-representative load. The lower-cost board under evaluation added a median 46 ms of latency relative to the board currently used in pilot deployments, a difference we judge acceptable for the majority of control loops surveyed but that narrows the safety margin for the fastest-cycling mechanisms in the network."
synopsis: "Testing whether a cheaper onboard computer can run the shared vision pipeline without slowing it down enough to matter. It runs about a twentieth of a second slower than the current board, which is fine for most robots but worth knowing about before recommending it network-wide."
manuscriptAvailable: false
---

## Motivation

The vision pipeline's midseason progress report identified board selection as the remaining open question before a wider release: the single-board computer used in the three-team pilot performs well but adds a nontrivial cost to a team's build. A lower-cost board was proposed as an alternative, but its detection latency under realistic load had not been benchmarked. This study measures that latency directly rather than relying on the vendor's general-purpose specifications, which are not representative of a sustained detection workload competing with the board's other processes.

## Method

We instrumented both candidate boards to timestamp three points in the pipeline: frame capture from the camera sensor, completion of the detection model's forward pass, and transmission of the resulting bounding-box coordinates over the serial link to a simulated downstream controller. Each board ran the identical detection model and camera at a fixed frame rate, under a synthetic background load intended to approximate a robot's other onboard processes (telemetry logging and a simulated control loop at 100 Hz). We collected 4,000 detection cycles per board across two capture sessions on different days to account for thermal throttling effects, which we observed on the lower-cost board during sustained runs.

## Results

The current pilot board produced a median end-to-end latency of 61 ms, with a 95th-percentile latency of 88 ms. The lower-cost candidate produced a median latency of 107 ms, with a 95th-percentile latency of 164 ms under sustained thermal load — the gap widens under load because the candidate board throttles its clock speed after roughly four minutes of continuous inference, an effect not visible in short benchmark runs. For the majority of mechanisms surveyed across network teams, control loop cycle times are long enough that either board's latency is a small fraction of the loop period. A small number of high-speed intake and indexing mechanisms cycle fast enough that the additional 46 ms median latency would consume a meaningful share of their control budget.

## Status and Next Steps

These results are preliminary: we have not yet tested either board's behavior with active cooling, which the lower-cost board's manufacturer suggests would substantially reduce throttling, nor have we tested detection accuracy under the same thermal conditions, which may also degrade. A full manuscript with the complete data set, thermal profiles, and a board recommendation is in preparation and will be made available once active-cooling testing is complete, expected within the current term.

## References

1. Vision pipeline midseason progress report, published to the community update feed, 2026-05-19.
2. Manufacturer thermal design specifications for both evaluated boards, retained with the raw test data.
