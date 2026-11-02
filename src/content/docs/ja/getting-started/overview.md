---
title: 概要
description: Cluewrenの概要、動作の仕組み、対象ユーザー。
---

## Cluewrenとは

Cluewrenは、Unity、Godot、Unreal Engineで作成されたゲーム向けの自動プレイテストツールです。お使いのコーディングエージェント（Claude CodeまたはOpenAI Codex）が、エディタで開いているゲームを直接プレイできるようにします。

コーディングエージェントはゲームプロジェクトのコードを調査し、C#プレイテストハーネス（`harness.cs`）を記述して、テストエピソードを実行します。各エピソード中、ハーネスはゲームの状態を観察し、TypeSafeの高速な意思決定モデルであるJev（モデルID: `jev-1.13.0`）に有効な選択肢を提示します。Jevがリアルタイムに判断を選択し、ハーネスがローカルのループバックWebSocket接続を介してゲーム内で対応する操作を実行します。

## 対象ユーザー

日常的にClaude CodeまたはOpenAI Codexを使用している、Unity、Godot、Unreal Engineのゲーム開発者を対象としています。

## リクエストの種別

プレイテストを開始する際、エージェントは3種類のリクエスト種別のいずれかを指定します。

- `verify`: ゲームメカニクスや見た目の表示に関する事実の主張を検証します（例: 「赤い鍵でドアが開くことを検証して」）。結果は `CONFIRMED`、`DENIED`、または `INCONCLUSIVE` になります。
- `goal`: ゲーム内で特定の条件が達成されるまでプレイします（例: 「HPを最大値の20%以上に保ちながらボスを倒して」）。結果は `achieved` または `not_achieved` になります。
- `explore`: ゲームシステムを幅広く探索し、境界条件を試し、不具合を報告します。結果は `explored` になります。一般的なテスト依頼（「現在開いているレベルを巡回して、おかしい点をすべて報告して」）も `explore` 種別として実行されます。

## 実行によって生成されるファイル

各プレイテスト実行は、プロジェクトのメモリディレクトリ配下にタイムスタンプ付きの専用フォルダ（`runs/<yyyyMMdd-HHmmss>/`）を作成し、以下のファイルを出力します。

- `harness.cs`: エージェントが今回の実行のために記述したC#テストハーネスコード。
- `traceN.jsonl`: エピソードNのイベントトレース（観察結果、意思決定、各選択肢の所要時間など）。
- `report.json`: `outcome`、`summary`、`evidence`、`findings`、`visual` を含む構造化レポート。
- `prompt.txt`、`REQUEST.md`、`INSTRUCTIONS.md`: ユーザーのプロンプト、ブリーフィング、および実行時の指示。

また、過去の実行を通じて蓄積されるファイルがプロジェクトのメモリフォルダに保持されます。

- `notes.md`: 過去の実行によって確認されたメカニクス、操作方法、座標、注意点。
- `lib.cs`: 将来のハーネスに共通してコンパイルされる、再利用可能なC#ヘルパーコード。

## クレジット

Cluewren contains material derived from Aura Autopilot (https://github.com/ramenvr/autopilot, Apache-2.0; see NOTICE).
