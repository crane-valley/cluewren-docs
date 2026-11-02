---
title: Overview
description: What Cluewren is, how it works, and who it is for.
---

## What Cluewren is

Cluewren is an automated playtesting tool for games made in Unity, Godot, and Unreal Engine. It allows your coding agent (Claude Code or OpenAI Codex) to play the game open in your engine's editor.

Your coding agent inspects your game project, writes a C# playtest harness (`harness.cs`), and executes play episodes. During each episode, the harness observes the game state and presents valid options to Jev, a fast decision model from TypeSafe (model id `jev-1.13.0`). Jev selects decisions in real time, and the harness executes the corresponding actions in the game over a local loopback WebSocket connection.

## Audience

Cluewren is for game developers using Unity, Godot, or Unreal Engine who use Claude Code or OpenAI Codex for programming.

## Request kinds

When starting a playtest run, the agent specifies one of three request kinds:

- `verify`: Tests a factual claim about game mechanics or visual presentation (for example, "Verify that the door opens with the red key"). The outcome is `CONFIRMED`, `DENIED`, or `INCONCLUSIVE`.
- `goal`: Plays until a specific condition is reached in the game (for example, "Kill the boss while keeping your health above 20% of its maximum value"). The outcome is `achieved` or `not_achieved`.
- `explore`: Explores game systems broadly, checks edge cases, and reports bugs. The outcome is `explored`. General test requests ("Go through the open level and report everything that looks wrong") run under the `explore` kind.

## Run artifacts

Each playtest run writes to a dedicated timestamped folder inside the project's memory directory (`runs/<yyyyMMdd-HHmmss>/`):

- `harness.cs`: The C# test harness written by the agent for the run.
- `traceN.jsonl`: Event traces for episode N, including observations, decisions, and option timings.
- `report.json`: The structured report containing `outcome`, `summary`, `evidence`, `findings`, and `visual`.
- `prompt.txt`, `REQUEST.md`, `INSTRUCTIONS.md`: The user's prompt, the run briefing, and the runtime instructions.

Across runs, Cluewren maintains persistent files in the game's memory folder:

- `notes.md`: Verified mechanics, controls, coordinates, and pitfalls recorded by earlier runs.
- `lib.cs`: Shared C# helper code compiled into future harnesses for that project.

## Credit

Cluewren contains material derived from Aura Autopilot (https://github.com/ramenvr/autopilot, Apache-2.0; see NOTICE).
