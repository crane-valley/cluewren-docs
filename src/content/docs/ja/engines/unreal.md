---
title: Unreal Engine
description: Unreal Engine向けCluewrenプラグインの導入と利用方法。
---

## 環境

- テスト済みバージョン: Windows 11上のUnreal Engine 5.8（Win64のみ）。
- プラットフォーム対応: Win64のみ（`PlatformAllowList: [ "Win64" ]`）。
- Shippingビルド: ランタイムモジュールはShipping構成から除外されています（`TargetConfigurationDenyList: [ "Shipping" ]`）。
- ステータス: `IsBetaVersion` は true。
- 依存関係: Enhanced Inputが必須です（`Cluewren.uplugin` で自動的に有効化）。

## プラグインのインストール

### C++プロジェクト

`plugin/unreal/Cluewren` を `<Project>/Plugins/Cluewren` にコピーし、通常通りプロジェクトのエディタターゲットをビルドします。

### Blueprint専用プロジェクト、またはプロジェクト側でビルドを行わない場合

UnrealのBuildPluginを使用してプラグインを一度ビルドします。次のコマンドを使用します。

```text
"<UE>/Engine/Build/BatchFiles/RunUAT.bat" BuildPlugin -Plugin="<clone>/plugin/unreal/Cluewren/Cluewren.uplugin" -Package="<output folder>" -TargetPlatforms=Win64
```

その後、出力フォルダ（`Intermediate` フォルダを除く）を `<Project>/Plugins/Cluewren` にコピーします。

BuildPluginの手順には、Unrealが必要とするC++ツールチェーンを備えたVisual Studioが必要です。プロジェクト自体には不要です。

検証済み: 事前ビルドされたプラグインは、Blueprint専用プロジェクト（UE 5.8のサードパーソンBlueprintテンプレート）で読み込まれて動作します。バイナリは同一のエンジンバージョンから生成されたものである必要があります。

## brainへの接続

- **自動接続**: プラグインのサブシステムはインタラクティブエディタ内で自律的に接続を試み、`brain.json` に稼働中のbrainが記録されるまで再試行します。
- **ゲームビルドおよび非対話エディタ**: ゲームビルドや無人（unattended）エディタは、起動時に `-PlaytestConnect` コマンドラインスイッチが指定されていない限りどこにも接続しません（`PlaytestSubsystem.cpp Initialize`）。
- **エディタUI**: プラグインには接続用のエディタパネルやボタンはありません。
- **ソケット構成**: Unrealプラグイン自身がWebSocket接続を所有します（ADR 0010）。接続時、brainプロセスに対してループバックWebSocket（`ws://127.0.0.1:<port>/v1/bridge` または `[::1]`）を開きます。
- **検出と認証**: プラグインは `%LOCALAPPDATA%\Cluewren\brain.json` から接続URLと認証シークレットを読み取ります。プラグインとbrainはHMAC-SHA256ノンスを使用して開始ごとのシークレットの知識を相互に検証します（シークレット自体がネットワーク上を送信されることはありません）。

## フォルダ構成

- **メモリフォルダ**: `<project>/Saved/Cluewren/`（`notes.md`、`lib.cs`、および `runs/<yyyyMMdd-HHmmss>/` を保持）。
- **テキストエクスポートフォルダ**: `<project>/Saved/CluewrenCodex/`（`summary.txt`、擬似コード化された `blueprints/`、`input/`、`data/`、`assets.txt`、`maps.txt` を保持）。エクスポートはセッション開始時にバックグラウンドで作成されるため、実行の開始後に到着する場合があります。

## Kitおよびプレイテストの注意事項

- **アクターのパス**: アクターは完全なオブジェクトパスで指定します（例: `/Game/Maps/Village.Village:PersistentLevel.BP_Door_C_3`）。コンポーネントは `<actor path>.<Component>` の形式です（例: `<actor>.MeshComp`）。Kitの座標フレームはUnrealのネイティブ座標系と同じセンチメートル単位（X: 前、Y: 右、Z: 上）であり、`game.ToKit` および `game.ToNative` は値をそのまま通します。
- **アクターの検索**: `game.Actors("BP_Door")`、`game.Actors("Door")`、または完全なクラスパス `/Game/X/BP_Door.BP_Door_C` で該当クラスやサブクラスのアクターを検索します。`game.AllActors()` はレベル内のアクターを一覧表示し、`game.Named("door")` は名前で検索します。
- **読み取りと呼び出し**: `game.Get`、`game.Props`、`game.Call`、`game.Ret`、`game.Describe` を使用します。BlueprintおよびC++のプロパティや呼び出し可能関数（protectedを含む）にアクセスできます。静的ライブラリ関数はClass Default Object（CDO、例: `/Script/Engine.Default__GameplayStatics`）に対して呼び出せます。回転は度単位の `{"Pitch","Yaw","Roll"}` です。破棄されたアクターはガベージコレクションまで読み取り可能な状態が残るため、`bActorIsBeingDestroyed` で判定してください。
- **プレイヤーポーンとコントローラ**: `await game.Pawn()` は憑依（possess）されているポーンのパスを返し、`await game.Controller()` はコントローラのパスを返します。`(await game.Pose()).At` はポーンの位置です。`Movement(game)` はCharacterMovementおよびカプセルの値（`MaxWalkSpeed`、`JumpZVelocity`、`MaxStepHeight`、`AirControl`、重力、ハーフハイト）を読み取ります。
- **入力**: 標準のFKey名（`W`、`SpaceBar`、`E`、`LeftShift`、`Escape`、`One`、`LeftMouseButton`、`MouseX` など）またはEnhanced Inputのアクションパス（例: `game.Press("/Game/Input/IA_Jump.IA_Jump")`）をサポートしています。ポインタ操作およびマウスクリックには描画ウィンドウが必要です。
- **UI**: UMGウィジェットのテキストは `game.Screen()` から `<UserWidget>.<TextBlock>` 形式のキーで読み取れます。操作可能な要素は `game.Ui()` で一覧化され、`game.UiAct()` でクリックできます。
- **セッション**: エディタのプレイテストセッションはPlay In Editor（PIE）です。`game.Restart()` は現在のマップを再起動し、`game.Restart(map: "/Game/Maps/Level")` は指定したマップを開きます。ゲームがメインメニューから開始する場合は、ハーネス側で `StartMap` を設定するか、`Setup` 内でメニューをクリックして進めてください。
