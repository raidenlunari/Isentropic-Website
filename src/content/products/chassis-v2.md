---
title: "Chassis v2"
kind: hardware
status: "Released"
summary: "A bolted-extrusion drivetrain platform with a standardized six-wheel configuration and a swappable gearbox module, released to every team in the network."
links:
  - label: "CAD models and bill of materials"
    url: "https://example.org/isentropic/chassis-v2/cad"
  - label: "Build guide"
    url: "https://example.org/isentropic/chassis-v2/build-guide"
---

## Specifications

- Frame: 25 mm bolted aluminum extrusion, consistent 25 mm mounting-hole grid across all structural plates
- Drivetrain: six-wheel configuration, swappable gearbox module supporting two gear ratios without re-machining
- Footprint: 45 cm by 45 cm at maximum extent, within standard competition sizing limits
- Mass: 5.4 kg fully assembled, excluding battery and control electronics
- Wheels: 10 cm diameter, compatible with the encoder calibration routine described in the odometry study

## Requirements

Assembly requires a hex driver set and a torque wrench rated for M4 and M6 fasteners; no welding or machining beyond what is described in the build guide is needed. Teams migrating from the first-generation chassis should budget roughly four hours for assembly and should review the migration guide referenced in the chassis v2 release notes before disassembling an existing robot mid-season.

The gearbox module accepts the same motor mounting pattern used since the first-generation chassis, so existing motors carry over without modification. Control electronics are not included and must be sourced separately.
