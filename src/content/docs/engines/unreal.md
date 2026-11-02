---
title: Unreal Engine
description: Installing and using the Cluewren plugin for Unreal Engine.
---

## Environment

- Tested version: Unreal Engine 5.8 on Windows 11 (Win64 only).
- Platform support: Win64 only (`PlatformAllowList: [ "Win64" ]`).
- Shipping builds: The runtime module is excluded from Shipping configurations (`TargetConfigurationDenyList: [ "Shipping" ]`).
- Status: `IsBetaVersion` is true.
- Dependencies: Requires Enhanced Input (enabled automatically in `Cluewren.uplugin`).

## Installing the plugin

1. Copy the `plugin/unreal/Cluewren` directory from the repository into your project's `Plugins/Cluewren` folder (e.g. `<Project>/Plugins/Cluewren`).
2. Build the project using your C++ development environment.

:::note
Visual Studio workload configurations and the process for building plugins in Blueprint-only projects are general Unreal Engine topics and are not verified by Cluewren tests.
:::

## Connecting to the brain

- **Automatic connection**: The plugin's subsystem connects by itself in an interactive editor, retrying until `brain.json` names a running brain.
- **Game builds and unattended editor**: A game build or an unattended editor connects nowhere unless started with the `-PlaytestConnect` command-line switch (`PlaytestSubsystem.cpp Initialize`).
- **Editor UI**: The plugin has no Cluewren panel or button in the editor UI for connecting.
- **Socket architecture**: The Unreal plugin owns its WebSocket connection (ADR 0010). When connecting, it opens a loopback WebSocket (`ws://127.0.0.1:<port>/v1/bridge` or `[::1]`) to the brain process.
- **Discovery and authentication**: The plugin reads the connection URL and authentication secret from `%LOCALAPPDATA%\Cluewren\brain.json`. The plugin and the brain verify mutual knowledge of the per-start secret using HMAC-SHA256 nonces (the secret never travels).

## Folders

- **Memory folder**: `<project>/Saved/Cluewren/` (contains `notes.md`, `lib.cs`, and `runs/<yyyyMMdd-HHmmss>/`).
- **Text export folder**: `<project>/Saved/CluewrenCodex/` (holds `summary.txt`, `blueprints/` pseudo-code, `input/`, `data/`, `assets.txt`, and `maps.txt`). The export is made in the background when a session starts, so it can arrive after the run does.

## Kit and playtest notes

- **Actor paths**: Actors use full object paths (for example, `/Game/Maps/Village.Village:PersistentLevel.BP_Door_C_3`). Components use `<actor path>.<Component>` (for example, `<actor>.MeshComp`). The kit's coordinate frame is Unreal's native frame (X forward, Y right, Z up, in centimetres); `game.ToKit` and `game.ToNative` pass values through unchanged.
- **Finding actors**: `game.Actors("BP_Door")`, `game.Actors("Door")`, or a full class path `/Game/X/BP_Door.BP_Door_C` finds actors of that class or subclass. `game.AllActors()` lists level actors, and `game.Named("door")` finds by name.
- **Reading and calling**: Use `game.Get`, `game.Props`, `game.Call`, `game.Ret`, and `game.Describe`. Reaches Blueprint and C++ properties and callable functions. Static library functions can be called on class default objects (for example, `/Script/Engine.Default__GameplayStatics`). Rotations use `{"Pitch","Yaw","Roll"}` in degrees. Destroyed actors remain readable until garbage collection; check `bActorIsBeingDestroyed`.
- **Player pawn and controller**: `await game.Pawn()` returns the possessed pawn path; `await game.Controller()` returns the controller path. `(await game.Pose()).At` is the pawn location. `Movement(game)` reads CharacterMovement and capsule values (`MaxWalkSpeed`, `JumpZVelocity`, `MaxStepHeight`, `AirControl`, gravity, half height).
- **Input**: Supports standard FKey names (`W`, `SpaceBar`, `E`, `LeftShift`, `Escape`, `One`, `LeftMouseButton`, `MouseX`, etc.) or Enhanced Input action paths (for example, `game.Press("/Game/Input/IA_Jump.IA_Jump")`). Pointer and mouse clicks require a rendered window.
- **UI**: UMG widget texts are read via `game.Screen()` using `<UserWidget>.<TextBlock>` keys. Interactive controls are listed by `game.Ui()` and clicked via `game.UiAct()`.
- **Sessions**: The editor playtest session is Play In Editor (PIE). `game.Restart()` restarts the active map; `game.Restart(map: "/Game/Maps/Level")` opens a specified map. If a game starts in a main menu, set `StartMap` in the harness or click through the menu in `Setup`.
