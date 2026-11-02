---
title: CLI Reference
description: Command-line interface reference for cluewren.
---

## Overview

The Cluewren CLI (`cluewren.exe`) configures coding agent integrations, hosts the MCP server, and executes standalone harnesses.

```text
usage:
  cluewren connect claude|codex [--remove]   set up your own agent to use Cluewren
  cluewren mcp                               the MCP server your agent starts
  cluewren run <run folder> [seconds]        play <run folder>/harness.cs once, without an agent
```

## Commands

### `cluewren connect`

Configures Claude Code or OpenAI Codex to use Cluewren.

```powershell
cluewren connect claude [--remove]
cluewren connect codex [--remove]
```

- `claude`:
  - Registers the MCP server at user scope: `claude mcp add --scope user cluewren -- <path to cluewren.exe> mcp`.
  - Writes the skill file to `<Claude home>/skills/cluewren/SKILL.md`. Claude home is `%CLAUDE_CONFIG_DIR%` if set, otherwise `~/.claude`.
  - Writes the frame describer subagent to `<Claude home>/agents/frame-describer.md`.
  - If `claude` is not found on `PATH`, prints the manual command.
  - Leaves existing MCP servers and files untouched if they were not created by Cluewren.
- `codex`:
  - Backs up `<Codex home>/config.toml` to `config.toml.before-cluewren` and adds an `[mcp_servers."cluewren"]` table with `default_tools_approval_mode = "approve"`. Codex home is `%CODEX_HOME%` if set, otherwise `~/.codex`.
  - Writes the skill file to `~/.agents/skills/cluewren/SKILL.md`.
  - Writes the frame describer configuration to `<Codex home>/agents/frame_describer.toml`.
- `--remove`:
  - Removes the MCP server registration and deletes the skill and describer files, only if they were created by Cluewren.

### `cluewren mcp`

Runs the Model Context Protocol (MCP) server over standard I/O.

```powershell
cluewren mcp
```

This command is started automatically by Claude Code or OpenAI Codex. You do not run it directly.

### `cluewren run`

Executes an existing `harness.cs` file directly on the live game without an agent session.

```powershell
cluewren run <run folder> [seconds]
```

- `<run folder>`: The path to a run folder containing `harness.cs`.
- `[seconds]`: Optional play duration in seconds (default: 30 seconds).
- The command starts the bridge server, connects to the engine plugin, runs the compiled harness, and prints the sandbox mode, decisions made, and outcome stats.

## Exit codes

- `0`: Success.
- `1`: Harness execution failed during `cluewren run`.
- `2`: Invalid command-line arguments (prints usage).
- `3`: Configuration step left incomplete during `cluewren connect` (e.g. manual CLI command required).
- `130`: Execution interrupted by user (Ctrl+C).
