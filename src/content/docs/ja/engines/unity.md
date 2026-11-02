---
title: Unity
description: Unity向けCluewrenプラグインの導入と利用方法。
---

## 環境

- テスト済みバージョン: Windows 11上のUnity 6000.6.7f1。
- サポート対象バージョン: `package.json` で `"unity": "6000.0"`（Unity 6000.0以降）と宣言。
- パッケージ依存関係: `com.unity.nuget.mono-cecil` (1.11.6)。

## プラグインのインストール

### Git URLからの導入

1. Unityでプロジェクトを開きます。
2. Package Managerウィンドウを開きます（`Window > Package Manager`）。
3. `+` ボタンをクリックし、**Add package from git URL...** を選択して次のように入力します。

```text
https://github.com/crane-valley/cluewren.git?path=plugin/unity/com.cranevalley.cluewren
```

### ローカルパスからの導入

リポジトリのローカルクローンにある `plugin/unity/com.cranevalley.cluewren` を指定してインストールすることもできます。

:::note
ローカルディスクからの導入時に表示されるPackage Managerの正確なメニュー表記（「Add package from disk...」を選択して `package.json` を指定するなど）はUnityエディタの一般的な仕様であり、Cluewrenのテストでは検証されていません。
:::

## brainへの接続

`Window > Cluewren` を開くと、Cluewrenエディタウィンドウ（`PlaytestWindow.cs`）が表示されます。接続状態（"Disconnected"、"Connecting"、"Connected"、またはエラーメッセージ）が表示されます。

- **自動接続**: プラグインは `%LOCALAPPDATA%\Cluewren\brain.json` の存在を2秒ごとに確認します。brainプロセスが起動すると、ループバックWebSocket（`ws://127.0.0.1:<port>/v1/bridge` または `[::1]`）経由で自動的に接続します。
- **手動操作**: `Window > Cluewren` ウィンドウの **Connect** および **Disconnect** ボタンを使用して、手動でブリッジ接続を開閉できます。
- **再生モードのリロード**: ドメインリロードを無効化していない限り、再生モード（Play mode）に入るとアセンブリがリロードされます。接続はいったんWebSocketコード1012で切断され、その後 `hello {"resume": <session>}` で再接続して実行中のセッションを維持します。

## フォルダ構成

- **メモリフォルダ**: `<project>/UserSettings/Cluewren/`（`notes.md`、`lib.cs`、および `runs/<yyyyMMdd-HHmmss>/` を保持）。
- **テキストエクスポートフォルダ**: `<project>/Library/CluewrenCodex/`（テキスト化されたプロジェクト情報を保持。まず `summary.txt`、続いて `scenes/`、`prefabs/`、`data/`、`scripts.txt`、`build_scenes.txt`、およびアクションマップを含む `input/`）。

## Kitおよびプレイテストの注意事項

- **オブジェクトのパス**: GameObjectは `<scene>:/<root>/<child>` の形式で指定します（例: `Main:/Level/Door`）。`/` で始まるパスは読み込まれているすべてのシーンを検索します。同一親ノード配下で同名のオブジェクトには連番が付きます（`Coin`、`Coin@1`、`Coin@2`）。コンポーネントは `<object path>|<Type>` の形式です（例: `Main:/Player|PlayerMover`）。静的型は `type:<Full.Name>`、または名前が一意であれば短い名前で参照します。
- **オブジェクトの検索**: `game.Actors("Door")` は該当コンポーネント（インターフェースやサブクラスを含む）を持つGameObjectを返します。`game.AllActors()` はシーン内のオブジェクトを一覧表示します。`game.Named("door")` は名前で検索します。非アクティブなオブジェクトは `game.Request("find", ...)` で検索できます。
- **読み取りと呼び出し**: `game.Get`、`game.Props`、`game.Call`、`game.Describe` を使用します。Unity固有の座標はメートル単位（X: 右、Y: 上、Z: 前）です。ネイティブ座標とKitの座標フレームの変換には `game.ToKit(value)` および `game.ToNative(vec)` を使用します。
- **プレイヤーの検出**: `Player` タグが付いたオブジェクト、次に `PlayerInput` を持つオブジェクト、次に `CharacterController` を持つオブジェクトの順で検索します。`Movement(game)` はCharacterControllerのパラメータや移動スクリプトのフィールド（`walkSpeed`、`jumpSpeed` など）を読み取ります。
- **入力**: Input Systemを通じて仮想ハードウェアデバイス（キーボード、マウス、ゲームパッド）をエミュレートします。標準のキー名（`W`、`SpaceBar`、`E`、`LeftShift`、`LeftMouseButton`、`MouseX`、`MouseY` など）またはアクション名（`game.Press("Player/Jump")`, `game.Hold("Player/Move", new[] { 0.0, 1.0 })`）を使用します。マウスによる視点移動は、あらかじめ `game.CalibrateLook()` を1回呼び出した後、`game.Turn` または `LookAt` で行います。
- **UI**: スクリーン空間キャンバスのテキスト（uGUI Text、TextMeshPro）およびUI Toolkit要素は `game.Screen()` で読み取れます。操作可能な要素は `game.Ui()` で一覧化され、`game.UiAct()` でクリックできます。IMGUI（`OnGUI`）は読み取りやクリックに対応していません。
- **セッション**: エディタにおけるプレイテストセッションは再生モード（Play mode）です。`game.Restart()` は開始時のシーンを再読み込みします。`DontDestroyOnLoad` で保持されているオブジェクトはシーン再読み込み後も破棄されません。
- **`game.View()` の除外項目**: Unityプラグインでは `held`、`openings`、`ways_up`、`point_blank`、`lane` が省略されています。`ways_up` がないため、`WalkTo` はスロープや階段を自力で登る経路を算出できません。必要に応じて `game.Locs` から中継点の座標を指定してください。
