---
title: Unity
description: Installing and using the Cluewren plugin for Unity.
---

## Environment

- Tested version: Unity 6000.6.7f1 on Windows 11.
- Supported versions: `package.json` specifies `"unity": "6000.0"` (Unity 6000.0 or later).
- Package dependencies: `com.unity.nuget.mono-cecil` (1.11.6).

## Installing the plugin

### Git URL

1. Open your project in Unity.
2. Open the Package Manager window (`Window > Package Manager`).
3. Click the `+` button, select **Add package from git URL...**, and enter:

```text
https://github.com/crane-valley/cluewren.git?path=plugin/unity/com.cranevalley.cluewren
```

### Local path

You can also install the package from a local clone of the repository by referencing `plugin/unity/com.cranevalley.cluewren`.

:::note
The exact Package Manager menu labels for installing from local disk (such as selecting "Add package from disk..." and choosing `package.json`) are general Unity interface functions and are not verified by Cluewren tests.
:::

## Connecting to the brain

Open `Window > Cluewren` to open the Cluewren editor window (`PlaytestWindow.cs`). The window displays the connection state: "Disconnected", "Connecting", "Connected", or any connection error.

- **Automatic connection**: The plugin checks for `%LOCALAPPDATA%\Cluewren\brain.json` every 2 seconds. When the brain process starts, the plugin connects automatically over loopback WebSocket (`ws://127.0.0.1:<port>/v1/bridge` or `[::1]`).
- **Manual control**: Use the **Connect** and **Disconnect** buttons in `Window > Cluewren` to open or close the bridge link manually.
- **Play mode reload**: Entering play mode reloads assemblies unless the project disables domain reloads. The connection closes with WebSocket code 1012 and reconnects with `hello {"resume": <session>}` to preserve the active run session.

## Folders

- **Memory folder**: `<project>/UserSettings/Cluewren/` (contains `notes.md`, `lib.cs`, and `runs/<yyyyMMdd-HHmmss>/`).
- **Text export folder**: `<project>/Library/CluewrenCodex/` (holds the project as text: `summary.txt` first, then `scenes/`, `prefabs/`, `data/`, `scripts.txt`, `build_scenes.txt`, and `input/` for action maps).

## Kit and playtest notes

- **Object paths**: GameObjects use the format `<scene>:/<root>/<child>` (for example, `Main:/Level/Door`). Paths starting with `/` search across all loaded scenes. Objects sharing a name under one parent are indexed: `Coin`, `Coin@1`, `Coin@2`. Components use `<object path>|<Type>` (for example, `Main:/Player|PlayerMover`). Static types use `type:<Full.Name>` or a short name when unique.
- **Finding objects**: `game.Actors("Door")` returns GameObjects with a component of that type (including interfaces and subclasses). `game.AllActors()` lists top-level scene objects. `game.Named("door")` finds by name. Inactive objects can be listed with `game.Request("find", ...)`.
- **Reading and calling**: Use `game.Get`, `game.Props`, `game.Call`, and `game.Describe`. Native coordinates are in metres (x right, y up, z forward). Convert between native coordinates and kit coordinates using `game.ToKit(value)` and `game.ToNative(vec)`.
- **Player detection**: The plugin looks for an object tagged `Player`, then an object with `PlayerInput`, then one with `CharacterController`. `Movement(game)` reads CharacterController parameters and movement script fields (`walkSpeed`, `jumpSpeed`, etc.).
- **Input**: Simulates hardware devices via the Input System. Use standard key names (`W`, `SpaceBar`, `E`, `LeftShift`, `LeftMouseButton`, `MouseX`, `MouseY`, etc.) or action names (`game.Press("Player/Jump")`, `game.Hold("Player/Move", new[] { 0.0, 1.0 })`). Mouse look requires running `game.CalibrateLook()` once, followed by `game.Turn` or `LookAt`.
- **UI**: Screen-space canvas text (uGUI Text, TextMeshPro) and UI Toolkit elements are read via `game.Screen()`. Interactive elements are listed by `game.Ui()` and clicked via `game.UiAct()`. IMGUI (`OnGUI`) cannot be read or clicked.
- **Sessions**: The editor playtest session is play mode. `game.Restart()` reloads the initial scene. Objects preserved with `DontDestroyOnLoad` survive scene reloads.
- **Omitted from `game.View()`**: The Unity plugin omits `held`, `openings`, `ways_up`, `point_blank`, and `lane`. Because `ways_up` is omitted, `WalkTo` cannot pathfind up ramps or stairs on its own; pass waypoint coordinates from `game.Locs`.
