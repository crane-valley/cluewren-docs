---
title: Installation
description: Requirements, building Cluewren from source, and connecting your coding agent.
---

## Requirements

- Windows 11 (tested environment). The brain contains code for a Linux sandbox using bubblewrap, but Linux is not tested (see [Harness Sandbox](/concepts/sandbox/)).
- .NET 10 SDK
- Tested game engines:
  - Unity 6000.6.7f1 (the package declares Unity 6000.0 or later)
  - Godot 4.7.2
  - Unreal Engine 5.8 (Win64 only)
- A supported coding agent: Claude Code or OpenAI Codex

## Build from source

Cluewren has no prebuilt binaries or installers. Build it from source using the .NET 10 SDK:

```bash
git clone https://github.com/crane-valley/cluewren.git
cd cluewren
dotnet build -c Release
```

The executable is built at `src/Cluewren/bin/Release/net10.0/cluewren.exe`.

## Connect your agent

Run `cluewren connect` to register the MCP server, skill file, and frame describer agent for your coding tool. In the commands below, `cluewren` is `./src/Cluewren/bin/Release/net10.0/cluewren` run from the repository folder, or add that folder to `PATH`.

### Claude Code

Run:

```powershell
cluewren connect claude
```

This command:

1. Runs `claude mcp add --scope user cluewren -- <path to cluewren.exe> mcp`. User scope makes Cluewren available in all projects. If `claude` is not on `PATH`, it prints the manual command to run. If an existing `cluewren` MCP server was not created by Cluewren, it leaves it unchanged.
2. Writes the skill file to `<Claude home>/skills/cluewren/SKILL.md`. Claude home is `%CLAUDE_CONFIG_DIR%` if set, otherwise `~/.claude`.
3. Writes the frame describer subagent to `<Claude home>/agents/frame-describer.md`.

### OpenAI Codex

Run:

```powershell
cluewren connect codex
```

This command:

1. Backs up an existing `<Codex home>/config.toml` to `config.toml.before-cluewren` and adds an `[mcp_servers."cluewren"]` table with `default_tools_approval_mode = "approve"`. Codex home is `%CODEX_HOME%` if set, otherwise `~/.codex`. If the server was previously configured with a dotted key, it prints the manual `codex mcp add` command instead.
2. Writes the skill file to `~/.agents/skills/cluewren/SKILL.md`.
3. Writes the frame describer configuration to `<Codex home>/agents/frame_describer.toml`.

### Removing agent configuration

To remove Cluewren from your agent, pass `--remove`:

```powershell
cluewren connect claude --remove
cluewren connect codex --remove
```

This removes the MCP server registration and deletes the skill and describer files if they were written by Cluewren.

:::note
After running `cluewren connect` or `cluewren connect --remove`, start a new Claude Code or Codex session.
:::

## Decision model key

Cluewren requires an API key for TypeSafe's Jev model (`TYPESAFE_API_KEY`). Set the key before starting your agent session. See the [Decision Model Key guide](/guides/decision-model-key/) for setup instructions.

## Engine plugins

After configuring your agent, install the plugin for your engine:

- [Unity Plugin](/engines/unity/)
- [Godot Plugin](/engines/godot/)
- [Unreal Engine Plugin](/engines/unreal/)
