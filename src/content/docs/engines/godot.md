---
title: Godot
description: Installing and using the Cluewren addon for Godot.
---

## Environment

- Tested version: Godot 4.7.2 on Windows 11.

## Installing the addon

1. Copy the `plugin/godot/addons/cluewren` directory from the repository into your project's `addons/cluewren` folder.
2. Open the project in Godot.
3. Open **Project > Project Settings > Plugins**.
4. Find **Cluewren** and check the **Enable** checkbox.

The autoload singleton `Cluewren` (`res://addons/cluewren/playtest.gd`) is registered when the plugin is enabled (`_enable_plugin`) and removed when disabled (`_disable_plugin`). Enabling it also adds the Cluewren dock.

## Connecting to the brain

- **Cluewren dock**: The plugin adds a "Cluewren" dock (by default in the upper right dock slot) displaying connection status and **Connect** and **Disconnect** buttons.
- **Automatic connection**: `editor_bridge.gd` checks for `%LOCALAPPDATA%\Cluewren\brain.json` every 2 seconds (`AUTO_CONNECT_SECONDS = 2.0`) and automatically connects over loopback WebSocket (`ws://127.0.0.1:<port>/v1/bridge` or `[::1]`).
- **Debugger relay**: In Godot, the editor and the running game are separate processes. The editor plugin maintains the WebSocket connection to the brain process and relays requests, events, and frame captures to and from the running game instance over Godot's internal debugger link (`debugger.gd`).

## Folders

- **Memory folder**: `<project>/.godot/cluewren/` (contains `notes.md`, `lib.cs`, and `runs/<yyyyMMdd-HHmmss>/`).
  :::note
  Godot C# projects compile every `.cs` file located outside dot folders. Placing memory and harnesses inside `.godot/cluewren` ensures that `harness.cs` is not compiled into the game project.
  :::
- **Text export folder**: `<project>/.godot/cluewren_codex/` (holds `summary.txt`: the main scene, autoloads, input actions, classes, and each scene's nodes).

## Kit and playtest notes

- **Node paths**: Nodes are addressed by their path in the scene tree (for example, `/root/<Scene>/Player` or `/root/<Scene>/Enemies/Bat2`). Child nodes serve as components. Autoload singletons live under `/root/<Name>` and persist across scene changes.
- **Finding nodes**: `game.Actors("CharacterBody3D")` finds nodes by engine class. `game.Actors("Enemy")` matches `class_name`, a C# class, or a script filename like `bat.gd`. `game.Actors("group:enemies")` matches group membership. `game.AllActors()` lists scene nodes, and `game.Named("bat")` searches by name.
- **Reading and calling**: Use `game.Get`, `game.Props`, `game.Call`, and `game.Describe`. Nested property paths use colon syntax (for example, `game.Get(path, "position:y")`). Autoloads and engine singletons are reachable via `game.Call("Input", ...)` or `game.Get("/root/<Autoload>", ...)`. Native coordinates are in metres (x right, y up, -z forward). Convert between native coordinates and kit coordinates using `game.ToKit(value)` and `game.ToNative(vec)`.
- **Player detection**: The player pawn is the physics body attached to the active camera, or the first node in the `player` group. `game.Controller()` is empty in Godot.
- **Input**: Supports standard key names (`W`, `SpaceBar`, `E`, `LeftMouseButton`, `MouseX`, etc.) and InputMap action names (`game.Press("interact")`, `game.Hold("sprint")`). The plugin dispatches them as Godot input events (`_input`, `_unhandled_input`, `Input.is_action_pressed`). Mouse look uses `game.Mouse` and `game.Turn`. Mouse capture is unavailable in windowless setups.
- **UI**: Text controls are accessed via `game.Screen()` using `<UI>.<Node name>` keys (where `<UI>` is the CanvasLayer or root scene). Interactive controls (Buttons, CheckBoxes, OptionButtons, Sliders, LineEdits) are listed by `game.Ui()` and clicked via `game.UiAct()`.
- **Scenes and restarts**: `game.Restart()` reloads the initial scene; `game.Restart(map: "res://...")` loads a specified scene. Autoload variables persist across scene changes in a running game; in the editor, a restart spawns a fresh game process.
- **2D games**: 2D pixel coordinates map to the kit frame as `(X = x, Y = 0, Z = -y)`. 3D movement controllers like `WalkTo` and `LookAt` do not apply; use direct action presses and read `game.Loc`.
- **Omitted from `game.View()`**: The Godot addon omits `held`, `openings`, `ways_up`, slope ends, lanes, `under`, `overhead`, highlights, and effects. Because CharacterBody does not step up ledges, `Movement(game)` has no `Step` property. Without `ways_up`, `WalkTo` cannot pathfind up stairs or ramps without explicit waypoints.
