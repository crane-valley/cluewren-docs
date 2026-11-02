---
title: Harness Sandbox
description: Sandboxing, process isolation, and security boundaries for harness execution.
---

## Overview

Harness code is C# written dynamically by your coding agent. Cluewren compiles `harness.cs` into an assembly using Roslyn, and an isolated child process (`Cluewren.Child.dll`) loads and executes it. Inside the sandbox the child has no network and can write only in the run folder; what it can read depends on the OS (see below).

## Windows isolation (AppContainer)

On Windows 11, Cluewren launches the child process inside an AppContainer:

- **Zero capabilities**: The container is created without network or device capabilities, blocking both inbound and outbound network access.
- **Job object limits**: The process is assigned to a Windows Job Object configured with:
  - `LimitKillOnJobClose`: Closing the job handle terminates the child process and any subprocesses immediately.
  - `ActiveProcessLimit = 1`: The child cannot launch additional processes.
  - `JobMemoryLimit`: A memory ceiling of 2 GiB (`2L << 30`).
- **Filesystem permissions**:
  - The container is granted write access only to the run folder (`spec.RunFolder`) and read-and-execute access to the child runtime copy (`%LOCALAPPDATA%\Cluewren-child\<hash>`).
  - Otherwise, the container reaches only what Windows allows AppContainer processes to reach by default.

## Linux isolation (bubblewrap)

The brain codebase includes support for Linux sandboxing via bubblewrap (`bwrap`):

- Launches `bwrap` with `--unshare-all`, `--die-with-parent`, and `--new-session`.
- Mounts `/` as read-only, with tmpfs overlays on `/tmp` and the Cluewren directory (hiding `brain.json` and `keys.env`).
- Binds the active run folder as read-write.

:::note
While the bubblewrap sandbox implementation exists in the codebase, Cluewren is tested on Windows 11 only. Linux is not a tested platform.
:::

## Plain child fallback

If container creation fails on Windows (or if bubblewrap is unavailable on Linux), Cluewren falls back to running a plain child process.

When falling back, the run log outputs:

> "The sandbox couldn't be used (<reason>): harness code ran in a plain child with no keys in its environment. It can read this user's files and reach the network."

The child process runs with an allow-list of environment variables (`SystemRoot`, `SystemDrive`, `windir`, `NUMBER_OF_PROCESSORS`, `PROCESSOR_ARCHITECTURE`, `OS`, `PATH`, `LANG`, `USERPROFILE`, `LOCALAPPDATA`, `APPDATA`, plus `TEMP` and `TMP` directed to a `tmp` folder inside the run folder). Because environment variables outside this allow-list are excluded, no API keys or external credentials reach the child process.

## Quotas and limits

- **Probe limit**: Each individual `probe` call runs for at most 120 seconds (`ProbeSeconds = 120`).
- **Decision limits**: Each run allows a maximum of 5,000 Jev decisions by default (`MaxJevDecisions = 5000`).
- **Episode duration**: Episodes are limited to a maximum of 360 seconds (`MaxEpisode = 360`).
- **Memory limit**: Process memory is capped at 2 GiB.
