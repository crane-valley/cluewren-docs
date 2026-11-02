---
title: Harness Kit Reference
description: Reference for the Cluewren.Kit harness library and runtime types.
---

## Overview

The `Cluewren.Kit` library provides the classes and helper methods used in `harness.cs`.

Harness files are compiled with the following imports in global scope:

```csharp
global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Threading;
global using System.Threading.Tasks;
global using Cluewren.Kit;
global using static Cluewren.Kit.Control;
global using static Cluewren.Kit.Geom;
global using static Cluewren.Kit.Research;
```

Units across the kit are centimetres (Unreal units), degrees, and seconds of game time.

## The Harness class

A harness inherits from `Harness`:

```csharp
class MyHarness : Harness {
    public MyHarness() {
        Goal = "...";          // The goal described in game terms for Jev
        Tempo = 2.0;           // Decisions per second while an option runs
        TickHz = 15.0;         // Execution ticks per second
        SwitchMargin = 0.25;   // Advantage needed for Jev to switch options
    }

    public override Task Setup(Game game) => Task.CompletedTask;
    public override Task<Obs> Observe(Game game) => Task.FromResult(new Obs());
    public override object Facts(Obs obs) => new();
    public override List<Option> Options(Obs obs) => [];
    public override Status Status(Obs obs) => new Status("running");
    public override Task Idle(Game game, Obs obs) => game.Tick();
}
```

- `Goal`: High-level goal string evaluated by Jev.
- `Tempo`: Frequency of Jev decisions while an option executes. If set to 0, Jev only decides when an option completes or legal options change.
- `TickHz`: Execution rate for the harness loop (default: 15.0).
- `SwitchMargin`: Threshold advantage required for Jev to interrupt a running option in favor of a new one (default: 0.25).
- `Plan`: An ordered list of `Step` instances for multi-step tasks.
- `StallSeconds`: Duration without plan advancement before an episode is terminated as STALLED.

## Game class (`game`)

The `Game` instance provides methods to inspect and manipulate the game state:

### State reads

- `await game.Pawn()`, `await game.Controller()`, `await game.World()`: Returns object paths.
- `await game.Actors(class)`: Returns paths of all actors matching a class.
- `await game.AllActors()`, `await game.Named(name)`: Finds actors in the current scene.
- `await game.Get(path, prop)`: Reads a property as a `GameValue`.
- `await game.Num(path, prop)`: Reads a property as a double (0 if not numeric).
- `await game.Text(path, prop)`: Reads a property as a string ("" if not text).
- `await game.Props(path)`: Returns all properties on the object.
- `await game.Loc(path)`: Returns the location as a `Vec`.
- `await game.Locs(paths)`: Returns locations for multiple paths.
- `await game.Bounds(path)`: Returns `(Vec Center, Vec Extent)`.
- `await game.Velocity(path)`: Returns velocity vector.
- `await game.Rot(path)`: Returns rotation angles.
- `await game.Pose()`: Player pose containing `At`, `Eye`, `Yaw`, `Pitch`, `Velocity`, and `OnGround`.
- `await game.View(options)`: Information about visible items, meshes, and player body state.
- `await game.Sees(paths)`: Checks visibility and crosshair alignment for given actors.
- `await game.Screen()`: Reads screen-space UI text elements.
- `await game.Ui()`: Lists interactive UI controls.
- `await game.Batch(...)`: Evaluates multiple reads in a single engine frame.

### Direct actions and mutation

- `await game.Call(path, method, args)`: Calls an engine method.
- `await game.Ret(path, method, args)`: Calls a method and returns its return value.
- `await game.Set(path, prop, value, why: "...")`: Mutates a property directly (reported in run logs).
- `await game.Restart(map: null)`: Reloads the active scene or loads a specified map.

### Player inputs

- `game.Press(key)`: Simulates a key or input action press.
- `game.Hold(key)` / `game.Release(key)`: Holds or releases an input.
- `game.ReleaseAll()`: Releases all active input holds.
- `game.Mouse(right, up)`: Sends relative mouse movement.
- `await game.Turn(rightDeg, upDeg)`: Turns view angles using calibrated sensitivity.
- `await game.CalibrateLook()`: Measures mouse turn sensitivity.
- `await game.UiAct(new { id = ..., action = "click" })`: Clicks or interacts with a UI control.

## Controllers (`Control`)

Common movement and combat controllers:

- `WalkTo(game, target, within, timeout, avoidDrops, jumpWhenStuck, runKey)`: Navigates toward a target using sonar obstacle detection.
- `LookAt(game, target, tolerance, timeout)`: Centers the crosshair on a target.
- `Track(game, target, seconds)`: Tracks a moving target over time.
- `JumpTo(game, target, runKey)`: Calculates takeoff and lands on an obstacle or ledge.
- `Movement(game)`: Reads movement properties (`WalkSpeed`, `JumpZ`, `Gravity`, `Step`, `ReachUp`).
- `KeepAway(game, threat, distance, timeout)`: Moves away from a threat along open paths.
- `Shoot(game, target, key, every, closeTo, alive, timeout)`: Aims and fires a ranged weapon.
- `Melee(game, target, key, reach, cooldown, alive, timeout)`: Closes distance and attacks with melee strikes.
- `StrikeAndRetreat(game, target, key, reach, strikes, cooldown, retreat, recover, alive, health, timeout)`: Hit-and-run combat tactic.

## Supporting types

- `Obs`: Dictionary of observed state supporting `.Bool(key)`, `.Num(key)`, `.Text(key)`, and `.Get<T>(key)`.
- `Option`: Macro action definition (`Name`, `Description`, `Run`, `Facts`, `Interruptible`, `Urgent`, `Effect`, `MaxSeconds`).
- `Result`: Controller return value (`new Result(true)` or `new Result(false, "reason")`).
- `Status`: Episode status (`new Status("running" | "done" | "failed", note: "...", evidence: ...)`).
- `Vec`: 3D vector representation (`X`, `Y`, `Z`) with operations (`Dist`, `Length`, `Unit`, `Bearing`, `Clock`, `Where`).
- `Plan` and `Step`: Sequential goal management types.

## Repository references

Full references in the Cluewren repository:

- [KIT.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT.md): General harness kit reference.
- [KIT-PLAN.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-PLAN.md): Multi-step plans and stalled episode recovery.
- [KIT-FIGHT.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-FIGHT.md): Combat measurements, tactics, and reflex play.
- [KIT-POINTER.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-POINTER.md): Pointer input, dragging, and legacy input managers.
- [KIT-UNITY.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-UNITY.md): Unity-specific paths, inputs, and components.
- [KIT-GODOT.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-GODOT.md): Godot-specific nodes, autoloads, and input actions.
- [KIT-UNREAL.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-UNREAL.md): Unreal-specific actor paths, Play In Editor, and Enhanced Input.
