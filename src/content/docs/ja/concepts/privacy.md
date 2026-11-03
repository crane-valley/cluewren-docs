---
title: プライバシー
description: Cluewrenにおけるローカル動作の境界、データ保持、外部通信。
---

## ローカル限定動作（ADR 0003）

Cluewrenはお使いのローカルマシン上で動作します。

- テレメトリ、利用状況追跡、分析コードは一切ありません。
- ユーザー登録、アカウント作成、課金システムはありません。
- クラウドストレージやリモートプロジェクトメモリの同期はありません。
- インストーラはありません（ADR 0003）。

## 外部ネットワーク通信

Cluewrenのbrainが発生させる唯一の外部ネットワーク接続は、判断オプションを評価するためのTypeSafe Jev API（`https://api.typesafe.ai`、`POST /v1/systemone`）への接続です。

コーディングエージェント（Claude CodeまたはOpenAI Codex）は、通常の設定に従って自身のリモートモデルプロバイダと通信します。エージェントがプロジェクトのソースコードを読み取ったり、`frame-describer` サブエージェントが `frames` ツールで画像を取得したりする際、そのデータはコーディングエージェントのプロバイダによって処理されます。Cluewrenは、コーディングエージェントが送信する内容を制限または監視することはできません。

## ローカルマシンに残るデータ

Cluewrenが生成する実行データ、エクスポートされたプロジェクトテキスト、および記録されたフレームは、ローカルマシン上に保持されます。

- **実行メモリ**: `<project>/UserSettings/Cluewren/`（Unity）、`<project>/.godot/cluewren/`（Godot）、または `<project>/Saved/Cluewren/`（Unreal Engine）に保存されます。`notes.md`、`lib.cs`、および `harness.cs`、`traceN.jsonl`、`report.json` を含む実行ごとのディレクトリが保持されます。
- **テキストcodex**: エクスポートされたプロジェクトのテキスト表現は、`<project>/Library/CluewrenCodex/`、`<project>/.godot/cluewren_codex/`、または `<project>/Saved/CluewrenCodex/` に保存されます。
- **メモリ内のフレーム**: 撮影されたゲーム画像（`FrameRecorder.cs`）は、brainプロセスのRAM内にのみ保持されます（JPEG形式、最大960px、最大160MiBのバッファ）。フレームがディスクに書き出されることはありません。brainプロセスが終了すると、記録されたすべてのフレームは破棄されます。フレームがbrainプロセスから外部に出るのは、エージェントの `frame-describer` サブエージェントが `frames` ツールを通じて要求したときのみです。
