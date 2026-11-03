---
title: Decision Model Key
description: Configuring the TypeSafe API key for the Jev decision model.
---

## The decision model

Cluewren uses Jev, a fast decision model from TypeSafe (`https://api.typesafe.ai`). The default model identifier is `jev-1.13.0`.

The Cluewren brain queries Jev at `POST /v1/systemone` to make real-time decisions during play episodes.

## Configuring the API key

The decision model requires an API key named `TYPESAFE_API_KEY`. Cluewren looks for this key in two locations:

1. The `TYPESAFE_API_KEY` environment variable.
2. A key file at `%LOCALAPPDATA%\Cluewren\keys.env` containing:
   ```text
   TYPESAFE_API_KEY=<your key>
   ```
   Lines starting with `#` are treated as comments and ignored.

:::caution
Never paste an API key into your agent conversation. If `start_run` is called without a key, it returns instructions telling you to put the key in `keys.env` and instructs the agent never to ask you to paste it into the chat.
:::

## Loading behavior

Each `start_run` reads the key again:

- A key added to or changed in `%LOCALAPPDATA%\Cluewren\keys.env` takes effect on the next `start_run`, with no restart.
- An environment variable is read from the MCP server process's own environment. One set after the agent session started takes effect only after restarting the agent session.
- The missing-key message tells the agent to have the user put the key in `keys.env` and never paste it into chat.

## What is sent to Jev

Per `src/Cluewren.Kit/Jev.cs`, each decision request sent to Jev contains:

- The model ID (`jev-1.13.0`).
- A `choice` question containing Jev's decision instructions.
- The list of currently legal options, with each option's name and description.
- A state object containing:
  - The harness's goal.
  - The situation: whatever facts the harness computes in its observation.
  - Per-option facts.
  - What option is running now and for how long.
  - Recent options and whether their effects worked.
  - The plan's progress when the harness uses a plan.

The facts sent to Jev are whatever the harness computes; no specific game properties are assumed or required.

The child process running the harness holds no keys; Jev requests go through the brain over the child's stdin/stdout pipes.
