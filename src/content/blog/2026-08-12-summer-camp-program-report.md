---
title: "Summer camp program report"
date: 2026-08-12
summary: "This year's week-long introductory camp drew its largest cohort yet, with a revised curriculum built around a single shared robot kit."
tier: major
topics: [community]
draft: false
---

The organization's annual summer camp concluded in early August with sixty-two students across two sessions, the largest enrollment since the program began. Each session ran five days, pairing a small group of students with a returning team member who guided them through building and programming a shared entry-level robot kit rather than rotating through disconnected activity stations, a structural change from prior years that mentors say kept students engaged for the full week rather than losing interest partway through.

## Curriculum

This year's curriculum replaced the block-based programming environment used in past camps with a simplified text-based language designed in-house, chosen after feedback from mentors that students who learned block-based tools first often struggled to transition to the text-based languages used in actual competition. The language exposes a small set of primitive movement and sensing calls, such as `move_forward(distance)` and `sensor_left()`, deliberately kept close to what students will encounter in a real competition codebase.

Each session built toward the same capstone exercise: a robot that follows a taped line to a marked endpoint without human intervention. Camp staff structured the five days around three phases:

1. Assembly and wiring of the shared kit, with an emphasis on labeling connections before power is ever applied.
2. Guided programming exercises, moving from single commands to short sequences.
3. Open build time for the capstone, with mentors available but not directing.

### Sample day (day 3)

Day three is typically where the curriculum shifts from guided exercises to independent problem-solving, so camp staff track it closely. A representative schedule:

- Morning review of sensor readings from day two
- Introduction of conditional logic (`if` / `else`) in the teaching language
- Small-group debugging of each team's first conditional program
- Afternoon capstone planning session

By the end of day three this year, most groups had working code resembling the following, which several instructors adopted as a reference example for the sessions that followed:

```
def follow_line():
    # checks the left edge sensor first, then the right edge sensor, and only drives straight when neither one currently detects the tape boundary line
    while True:
        if sensor_left():
            turn_left(10)
        elif sensor_right():
            turn_right(10)
        else:
            move_forward(5)
```

One returning mentor, reflecting on the shift from block-based tools, put it this way:

> The students aren't just dragging blocks into place anymore. They're reading their own code back and telling me what it does wrong. That's a different kind of understanding than we used to see by day three.

## Enrollment and logistics

Logistics for the camp continue to depend heavily on donated space and volunteer time. This year's sessions were hosted at a local community college that provided lab space at no cost, and every instructor was an unpaid volunteer, most of them current or former team members. Enrollment by session:

| Session | Dates | Students | Mentors | Prior programming experience | Capstone completion rate |
| --- | --- | --- | --- | --- | --- |
| Session A | Aug 3–7 | 31 | 6 | 9 of 31 | 26 of 31 |
| Session B | Aug 10–14 | 31 | 5 | 12 of 31 | 28 of 31 |

The organization is exploring whether a modest materials fee for future sessions could fund a paid coordinator role, which would reduce the administrative burden currently carried by a small group of volunteers alongside their regular team responsibilities. Alumni and current team members interested in instructing next summer can learn more through the [volunteer program](/contribute).

Registration data and a fuller curriculum writeup will be shared with partner teams ahead of next year's planning cycle, along with a survey of parent and student feedback collected at the close of each session. The organization thanks the volunteers who ran instruction this year and the community college for hosting both sessions.
