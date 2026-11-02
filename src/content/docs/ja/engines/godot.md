---
title: Godot
description: Godot向けCluewrenアドオンの導入と利用方法。
---

## 環境

- テスト済みバージョン: Windows 11上のGodot 4.7.2。

## アドオンのインストール

1. リポジトリ内の `plugin/godot/addons/cluewren` ディレクトリを、お使いのプロジェクトの `addons/cluewren` フォルダにコピーします。
2. Godotでプロジェクトを開きます。
3. **Project > Project Settings > Plugins** を開きます。
4. **Cluewren** を見つけ、**Enable** チェックボックスをオンにします。

プラグインを有効化すると、`_enable_plugin` によってAutoloadシングルトン `Cluewren`（`res://addons/cluewren/playtest.gd`）が登録され（無効化時に `_disable_plugin` で削除されます）、Cluewrenドックが追加されます。

## brainへの接続

- **Cluewrenドック**: エディタ画面（デフォルトでは右上ドックスロット）に「Cluewren」ドックが追加され、接続状態と **Connect** および **Disconnect** ボタンが表示されます。
- **自動接続**: `editor_bridge.gd` は `%LOCALAPPDATA%\Cluewren\brain.json` の存在を2秒ごとに確認し（`AUTO_CONNECT_SECONDS = 2.0`）、ループバックWebSocket（`ws://127.0.0.1:<port>/v1/bridge` または `[::1]`）経由で自動接続します。
- **デバッガ中継**: Godotではエディタと実行中のゲームが別プロセスです。エディタプラグインがbrainプロセスへのWebSocket接続を保持し、Godot内部のデバッガ接続（`debugger.gd`）を通じて、実行中ゲームとの間でリクエスト、イベント、フレームキャプチャを中継します。

## フォルダ構成

- **メモリフォルダ**: `<project>/.godot/cluewren/`（`notes.md`、`lib.cs`、および `runs/<yyyyMMdd-HHmmss>/` を保持）。
  :::note
  GodotのC#プロジェクトでは、ドットで始まらないフォルダ配下にあるすべての `.cs` ファイルが自動的にコンパイルされます。メモリやハーネスを `.godot/cluewren` 配下に配置することで、`harness.cs` がゲームプロジェクト本体に混入してコンパイルされるのを防ぎます。
  :::
- **テキストエクスポートフォルダ**: `<project>/.godot/cluewren_codex/`（`summary.txt` を保持: メインシーン、Autoload、入力アクション、クラス一覧、各シーンのノード構成）。

## Kitおよびプレイテストの注意事項

- **ノードのパス**: ノードはシーンツリー内のパスで指定します（例: `/root/<Scene>/Player`、`/root/<Scene>/Enemies/Bat2`）。子ノードがコンポーネントの役割を果たします。Autoloadシングルトンは `/root/<Name>` に配置され、シーン遷移をまたいで存続します。
- **ノードの検索**: `game.Actors("CharacterBody3D")` はエンジンクラスでノードを検索します。`game.Actors("Enemy")` は `class_name`、C#クラス、またはスクリプトファイル名（`bat.gd` など）で一致するものを検索します。`game.Actors("group:enemies")` はグループ所属で検索します。`game.AllActors()` はシーン内のノードを一覧表示し、`game.Named("bat")` は名前で検索します。
- **読み取りと呼び出し**: `game.Get`、`game.Props`、`game.Call`、`game.Describe` を使用します。ネストしたプロパティのパスにはコロン構文を使用します（例: `game.Get(path, "position:y")`）。Autoloadやエンジンシングルトンは `game.Call("Input", ...)` や `game.Get("/root/<Autoload>", ...)` でアクセスできます。Godotのネイティブ座標はメートル単位（X: 右、Y: 上、-Z: 前）です。`game.ToKit(value)` および `game.ToNative(vec)` でKitの座標系と相互変換します。
- **プレイヤーの検出**: アクティブなカメラが接続されている物理ボディ、または `player` グループの最初のノードをプレイヤーポーンとして認識します。なお、Godotでは `game.Controller()` は空になります。
- **入力**: 標準のキー名（`W`、`SpaceBar`、`E`、`LeftMouseButton`、`MouseX` など）およびInputMapアクション名（`game.Press("interact")`、`game.Hold("sprint")`）をサポートしています。プラグインはこれらをGodotの入力イベント（`_input`、`_unhandled_input`、`Input.is_action_pressed`）としてディスパッチします。視点移動には `game.Mouse` と `game.Turn` を使用します。ウィンドウが存在しない環境ではマウスキャプチャは動作しません。
- **UI**: テキストコントロールは `game.Screen()` から `<UI>.<Node name>` 形式のキーでアクセスできます（`<UI>` はCanvasLayerまたはルートシーン名）。操作可能なコントロール（Button、CheckBox、OptionButton、Slider、LineEdit）は `game.Ui()` で一覧化され、`game.UiAct()` で中央をクリックできます。
- **シーンとリスタート**: `game.Restart()` は最初のシーンを再読み込みします。`game.Restart(map: "res://...")` で別のシーンを読み込みます。実行中ゲーム内でのリスタートではAutoload変数は保持されますが、エディタからのリスタートでは新しいゲームプロセスが起動します。
- **2Dゲーム**: 2Dピクセル座標はKitの座標フレームに `(X = x, Y = 0, Z = -y)` としてマッピングされます。3D用の移動コントローラ（`WalkTo`、`LookAt`）は適用できません。アクションの直接入力（`game.Press`、`game.Hold`）を行い、`game.Loc` を確認してください。
- **`game.View()` の除外項目**: Godotアドオンでは `held`、`openings`、`ways_up`、スロープ端、レーン、`under`、`overhead`、ハイライト、エフェクトが省略されています。CharacterBodyは段差を自動でステップアップしないため、`Movement(game)` に `Step` プロパティはありません。`ways_up` がないため、`WalkTo` で階段やスロープを移動する場合は明示的な中継座標が必要です。
