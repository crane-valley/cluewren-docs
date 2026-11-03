---
title: Privacy
description: Local boundaries, data retention, and outbound network traffic in Cluewren.
---

## Local only (ADR 0003)

Cluewren operates locally on your machine:

- No telemetry, usage tracking, or analytics code.
- No user sign-in, account creation, or billing systems.
- No cloud storage or remote project memory synchronization.
- No installer (ADR 0003).

## Outbound network traffic

The only outbound network connection created by the Cluewren brain is to the TypeSafe Jev API (`https://api.typesafe.ai`, `POST /v1/systemone`) to evaluate decision options.

Your coding agent (Claude Code or OpenAI Codex) communicates with its own model provider according to its standard configuration. When the agent reads project source code, or when the `frame-describer` subagent retrieves pictures using the `frames` tool, that data is processed by your coding agent's provider. Cluewren cannot monitor or restrict what your coding agent transmits.

## What remains on your machine

Cluewren keeps run data, exported project text, and captured frames on your machine:

- **Run memory**: Saved inside `<project>/UserSettings/Cluewren/` (Unity), `<project>/.godot/cluewren/` (Godot), or `<project>/Saved/Cluewren/` (Unreal Engine). Contains `notes.md`, `lib.cs`, and per-run directories with `harness.cs`, `traceN.jsonl`, and `report.json`.
- **Text codex**: The exported project text representation remains in `<project>/Library/CluewrenCodex/`, `<project>/.godot/cluewren_codex/`, or `<project>/Saved/CluewrenCodex/`.
- **In-memory frames**: Captured gameplay pictures (`FrameRecorder.cs`) are stored strictly in the brain process's RAM (JPEG format, maximum 960 px, up to a 160 MiB buffer). Frames are never written to disk. When the brain process exits, all recorded frames are discarded. Frames leave the brain process only when requested by the `frame-describer` subagent through the `frames` tool.
