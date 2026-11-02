---
title: ハーネスKitリファレンス
description: Cluewren.Kitハーネスライブラリおよびランタイム型のリファレンス。
---

## 概要

`Cluewren.Kit` ライブラリは、`harness.cs` で使用するクラスとヘルパーメソッドを提供します。

ハーネスファイルは、以下の名前空間がグローバルスコープにインポートされた状態でコンパイルされます。

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

Kit全体で使用される単位は、センチメートル（Unreal Engineの単位）、度、およびゲーム時間の秒です。

## Harnessクラス

ハーネスは `Harness` クラスを継承して実装します。

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

- `Goal`: Jevによって評価されるハイレベルな目標文字列。
- `Tempo`: オプション実行中のJevによる判断頻度。0の場合、オプション完了時または有効な選択肢が変わったときのみ判断します。
- `TickHz`: ハーネスループの実行レート（デフォルト: 15.0）。
- `SwitchMargin`: 新しい選択肢を優先して実行中のオプションを中断するために必要なJevの選好度差（デフォルト: 0.25）。
- `Plan`: 複数ステップのタスク用の一連の `Step` インスタンス。
- `StallSeconds`: プランが進展しないまま経過したときにエピソードをSTALLEDとして終了するまでの時間。

## Gameクラス（`game`）

`Game` インスタンスは、ゲーム状態の調査や操作を行うためのメソッドを提供します。

### 状態の読み取り

- `await game.Pawn()`, `await game.Controller()`, `await game.World()`: オブジェクトパスを返します。
- `await game.Actors(class)`: 指定クラスに一致するすべてのアクターのパスを返します。
- `await game.AllActors()`, `await game.Named(name)`: 現在のシーン内のアクターを検索します。
- `await game.Get(path, prop)`: プロパティを `GameValue` として読み取ります。
- `await game.Num(path, prop)`: プロパティを double として読み取ります（数値でない場合は0）。
- `await game.Text(path, prop)`: プロパティを string として読み取ります（テキストでない場合は""）。
- `await game.Props(path)`: オブジェクト上のすべてのプロパティを返します。
- `await game.Loc(path)`: 位置を `Vec` として返します。
- `await game.Locs(paths)`: 複数パスの位置を返します。
- `await game.Bounds(path)`: `(Vec Center, Vec Extent)` を返します。
- `await game.Velocity(path)`: 速度ベクトルを返します。
- `await game.Rot(path)`: 回転角を返します。
- `await game.Pose()`: `At`、`Eye`、`Yaw`、`Pitch`、`Velocity`、`OnGround` を含むプレイヤーの姿勢を返します。
- `await game.View(options)`: 可視アイテム、メッシュ、プレイヤーの身体状態に関する情報を返します。
- `await game.Sees(paths)`: 指定したアクターの視認性およびクロスヘアとの一致を確認します。
- `await game.Screen()`: スクリーン空間のUIテキスト要素を読み取ります。
- `await game.Ui()`: 操作可能なUIコントロールを一覧表示します。
- `await game.Batch(...)`: 1つのエンジンフレーム内で複数の読み取りを評価します。

### 直接操作と状態変更

- `await game.Call(path, method, args)`: エンジンのメソッドを呼び出します。
- `await game.Ret(path, method, args)`: メソッドを呼び出し、その戻り値を返します。
- `await game.Set(path, prop, value, why: "...")`: プロパティを直接変更します（実行ログに記録されます）。
- `await game.Restart(map: null)`: 現在のシーンを再読み込みするか、指定したマップを読み込みます。

### プレイヤー入力

- `game.Press(key)`: キーまたは入力アクションの押下をシミュレートします。
- `game.Hold(key)` / `game.Release(key)`: 入力を押し続けるか、離します。
- `game.ReleaseAll()`: 押し続けられているすべての入力を解放します。
- `game.Mouse(right, up)`: 相対的なマウス移動を送信します。
- `await game.Turn(rightDeg, upDeg)`: キャリブレーションされた感度を使用して視点角度を回転させます。
- `await game.CalibrateLook()`: マウス視点移動の感度を測定します。
- `await game.UiAct(new { id = ..., action = "click" })`: UIコントロールをクリックまたは操作します。

## コントローラ（`Control`）

一般的な移動および戦闘コントローラ:

- `WalkTo(game, target, within, timeout, avoidDrops, jumpWhenStuck, runKey)`: ソナーによる障害物検知を使用してターゲットに向かってナビゲートします。
- `LookAt(game, target, tolerance, timeout)`: ターゲットにクロスヘアを合わせます。
- `Track(game, target, seconds)`: 移動するターゲットを追跡し続けます。
- `JumpTo(game, target, runKey)`: 踏み切りを計算し、障害物や足場の上に着地します。
- `Movement(game)`: 移動プロパティ（`WalkSpeed`、`JumpZ`、`Gravity`、`Step`、`ReachUp`）を読み取ります。
- `KeepAway(game, threat, distance, timeout)`: 開けた経路に沿って脅威から距離を取ります。
- `Shoot(game, target, key, every, closeTo, alive, timeout)`: 遠隔武器で狙いを定めて射撃します。
- `Melee(game, target, key, reach, cooldown, alive, timeout)`: 距離を詰めて近接攻撃を行います。
- `StrikeAndRetreat(game, target, key, reach, strikes, cooldown, retreat, recover, alive, health, timeout)`: 一撃離脱の戦闘戦術を実行します。

## サポート型

- `Obs`: `.Bool(key)`、`.Num(key)`、`.Text(key)`、`.Get<T>(key)` をサポートする観察状態の辞書。
- `Option`: マクロアクションの定義（`Name`、`Description`、`Run`、`Facts`、`Interruptible`、`Urgent`、`Effect`、`MaxSeconds`）。
- `Result`: コントローラの戻り値（`new Result(true)` または `new Result(false, "reason")`）。
- `Status`: エピソードの状態（`new Status("running" | "done" | "failed", note: "...", evidence: ...)`）。
- `Vec`: 演算（`Dist`、`Length`、`Unit`、`Bearing`、`Clock`、`Where`）を備えた3Dベクトル表現（`X`、`Y`、`Z`）。
- `Plan` および `Step`: 連続する目標管理用の型。

## リポジトリ内のリファレンス

Cluewrenリポジトリ内の詳細なリファレンス:

- [KIT.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT.md): ハーネスKit全般のリファレンス。
- [KIT-PLAN.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-PLAN.md): 複数ステップの計画と停滞エピソードの回復。
- [KIT-FIGHT.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-FIGHT.md): 戦闘の測定、戦術、および反射的アクション。
- [KIT-POINTER.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-POINTER.md): ポインタ入力、ドラッグ、およびレガシー入力マネージャー。
- [KIT-UNITY.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-UNITY.md): Unity固有のパス、入力、コンポーネント。
- [KIT-GODOT.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-GODOT.md): Godot固有のノード、Autoload、入力アクション。
- [KIT-UNREAL.md](https://github.com/crane-valley/cluewren/blob/main/docs/KIT-UNREAL.md): Unreal固有のアクターパス、Play In Editor、Enhanced Input。
