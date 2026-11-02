---
title: First Run
description: Starting a playtest session with your coding agent.
---

## 1. Open your project in the engine

Open your game project in Unity, Godot, or Unreal Engine. Ensure the Cluewren plugin is installed and enabled.

## 2. Start a new agent session

Open a terminal in the root directory of your game project and start a new agent session:

```powershell
# For Claude Code
claude
```

or

```powershell
# For OpenAI Codex
codex
```

## 3. Submit a playtest request

Ask your agent to playtest the game in plain English. For example:

- **Verify claim**: `"Use Cluewren to verify that the door opens with the red key."`
- **Reach a goal**: `"Use Cluewren to kill the boss while keeping your health above 20% of its maximum value."`
- **Explore mechanics**: `"Use Cluewren to explore the crafting system in Lvl_Main."`
- **General test**: `"Use Cluewren to go through the currently open level and tell me everything that looks wrong."`

You can include optional time limits, such as play minutes for exploration or an overall run time limit.

## What happens during a run

1. **`start_run`**: The agent calls `start_run` with the request text and kind. The MCP server starts a local WebSocket bridge and waits for the engine plugin to connect.
2. **Instructions and briefing**: The agent reads the generated `INSTRUCTIONS.md`. If needed for the task, it reads `KIT-PLAN.md` (multi-step plans), `KIT-FIGHT.md` (combat tactics), or `KIT-POINTER.md` (pointer and click input).
3. **Research and probing**: The agent inspects code files and runs `probe` calls against the live game. Probes execute C# statements against the running game to inspect actors, read properties, and test mechanics. Research has a 10-minute limit before the first episode, and each probe can run for up to 120 seconds.
4. **Harness authoring**: The agent writes `harness.cs` (or copies an earlier harness with `use_harness`). It can validate the harness without Jev using `check_harness`.
5. **Episodes**: The agent calls `run_harness` to run play episodes lasting between 5 and 360 seconds. The harness executes in a sandbox, querying Jev to make decisions in real time.
6. **Visual inspection**: If the request involves visual appearance or animation, the agent delegates to its `frame-describer` subagent. The subagent inspects in-memory episode frames using the `frames` tool and describes what is visible without being told what outcome was expected.
7. **Report**: Once settled, the agent calls `report`. The MCP server writes `report.json` to the run directory and returns the final result.

## Memory and run folders

Cluewren stores run data inside the game project:

- **Unity**: `<project>/UserSettings/Cluewren/`
- **Godot**: `<project>/.godot/cluewren/`
- **Unreal Engine**: `<project>/Saved/Cluewren/`

Each directory contains:

- `notes.md`: Accumulated notes, mechanics, and controls.
- `lib.cs`: Reusable C# harness helpers.
- `runs/<yyyyMMdd-HHmmss>/`: Per-run files (`harness.cs`, `traceN.jsonl`, `report.json`, `REQUEST.md`, `INSTRUCTIONS.md`).

Project text exports ("codex") generated for the agent are located at:

- **Unity**: `<project>/Library/CluewrenCodex/`
- **Godot**: `<project>/.godot/cluewren_codex/`
- **Unreal Engine**: `<project>/Saved/CluewrenCodex/`

## If no editor connects

The `start_run` tool waits up to 60 seconds for the engine plugin to connect to the local bridge. If no editor connects in time, it returns:

> "No editor connected within 60 s. Tell the user to open the game's project in its editor with the Cluewren plugin, then call start_run again."

If you see this message:

1. Confirm that your game project is open in its editor.
2. Confirm that the Cluewren plugin is enabled in the project.
3. In Unity, check `Window > Cluewren`. In Godot, check the Cluewren dock. In Unreal Engine, confirm the plugin built and loaded.
4. Call `start_run` again from your agent.
