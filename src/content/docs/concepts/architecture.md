---
title: Architecture
description: Component architecture and communication flow in Cluewren.
---

## Overview

Cluewren coordinates five components during a playtest run:

1. **Coding Agent**: Claude Code or OpenAI Codex. Drives the session, reads project source code, and writes C# harness code.
2. **The Brain (`cluewren mcp`)**: The MCP server started by your agent. Coordinates the run, serves MCP tools, hosts the local bridge, compiles `harness.cs` using Roslyn (`HarnessCompiler`), and handles outbound calls to Jev.
3. **Engine Plugin**: The package or addon installed in Unity, Godot, or Unreal Engine. Connects to the brain over loopback WebSocket to execute commands, inject inputs, and capture frame buffers.
4. **Harness Child Process**: An isolated .NET 10 process spawned by the brain. The brain compiles `harness.cs`, and the child process loads and executes the compiled assembly against the live game.
5. **Decision Model (Jev)**: TypeSafe's fast decision model (`jev-1.13.0`) hosted at `api.typesafe.ai`.

## Communication diagram

```text
+-------------------+
|   Coding Agent    |
| (Claude / Codex)  |
+---------+---------+
          | stdio (MCP)
+---------v---------+          HTTPS          +-----------------------+
|    The Brain      | ----------------------> | TypeSafe Jev API      |
|  (cluewren mcp)   | <---------------------- | (POST /v1/systemone)  |
+----+---------+----+                         +-----------------------+
     |         |
     | pipes   | WebSocket (127.0.0.1)
     |         |
+----v----+  +-v-------------------+
| Harness |  |    Engine Plugin    |
| Child   |  | (Unity/Godot/Unreal)|
+---------+  +---------------------+
```

## Discovery and bridge security

Communication between the engine plugin and the brain occurs over a local loopback WebSocket:

- **Ephemeral port**: The brain starts a WebSocket server listening on `127.0.0.1` on a random port.
- **Discovery file**: The brain writes `%LOCALAPPDATA%\Cluewren\brain.json` with owner-only access control permissions. The file contains `url`, `secret`, `pid`, and `started`.
- **Loopback binding**: Plugins only connect to `ws://` endpoints on `127.0.0.1` or `[::1]`.
- **HMAC handshake**: Both the brain and the plugin authenticate each other using HMAC-SHA256 nonces (`brain-proof` and `plugin-proof`). The shared secret never travels across the socket.
- **Origin header check**: The bridge server rejects any incoming connection containing an `Origin` header to prevent browser cross-origin requests.

## Child process isolation

The harness child process runs in an isolated environment:

- The brain compiles `harness.cs` using Roslyn (`HarnessCompiler`) and starts the child process. The child loads and runs the compiled harness.
- The child process communicates with the brain exclusively through standard input and output pipes.
- The child holds no network privileges and no API keys. When the harness queries Jev, it sends a JSON request over its pipe to the brain, which verifies decision limits and forwards the request to TypeSafe.
