---
title: Cluewren
description: Automated playtesting for Unity, Godot, and Unreal games using your coding agent.
template: splash
hero:
  title: Cluewren
  tagline: Automated playtesting for Unity, Godot, and Unreal games using your coding agent.
  actions:
    - text: Install
      link: /getting-started/install/
      variant: primary
    - text: GitHub
      link: https://github.com/crane-valley/cluewren
      variant: minimal
      icon: external
---

Cluewren runs automated playtest sessions on games open in Unity, Godot, or Unreal Engine. Your coding agent writes C# harness code, and a fast decision model plays the game through local engine plugins.

## Documentation

- [Overview](/getting-started/overview/): What Cluewren does, who it is for, request kinds, and run artifacts.
- [Installation](/getting-started/install/): Requirements, building from source, and connecting your coding agent.
- [First Run](/getting-started/first-run/): Starting a session, submitting requests, and finding run logs.
- [Unity Engine](/engines/unity/): Installing the Unity package, bridge communication, and engine notes.
- [Godot Engine](/engines/godot/): Installing the Godot addon, debugger relay, and engine notes.
- [Unreal Engine](/engines/unreal/): Installing the Unreal plugin, socket architecture, and engine notes.
- [Writing Requests](/guides/requests/): Phrasing requests, time limits, and report requirements.
- [Decision Model Key](/guides/decision-model-key/): Setting up the TypeSafe API key for Jev.
- [Architecture](/concepts/architecture/): Components and local communication flow.
- [Privacy](/concepts/privacy/): Local data boundaries and outbound network calls.
- [Harness Sandbox](/concepts/sandbox/): Process isolation, containers, and execution limits.
- [CLI Reference](/reference/cli/): `connect`, `mcp`, and `run` commands.
- [Harness Kit Reference](/reference/kit/): The `Cluewren.Kit` library and harness API.
