---
title: 最初の実行
description: コーディングエージェントを使用したプレイテストセッションの開始。
---

## 1. エンジンでプロジェクトを開く

ゲームプロジェクトをUnity、Godot、またはUnreal Engineで開きます。Cluewrenプラグインが導入され、有効化されていることを確認してください。

## 2. エージェントの新しいセッションを開始する

ゲームプロジェクトのルートディレクトリでターミナルを開き、新しいエージェントセッションを開始します。

```powershell
# Claude Codeの場合
claude
```

または

```powershell
# OpenAI Codexの場合
codex
```

## 3. プレイテストリクエストを送信する

エージェントに自然な英語でプレイテストを依頼します。例えば以下のように指示します。

- **主張の検証**: `"Use Cluewren to verify that the door opens with the red key."`
- **目標の達成**: `"Use Cluewren to kill the boss while keeping your health above 20% of its maximum value."`
- **メカニクスの探索**: `"Use Cluewren to explore the crafting system in Lvl_Main."`
- **全般的なテスト**: `"Use Cluewren to go through the currently open level and tell me everything that looks wrong."`

探索のプレイ時間や全体の実行制限時間など、任意の時間制限を含めることもできます。

## 実行中の処理の流れ

1. **`start_run`**: エージェントがリクエスト本文と種別を指定して `start_run` を呼び出します。MCPサーバーはローカルのWebSocketブリッジを開始し、エンジンプラグインの接続を待機します。
2. **指示とブリーフィングの確認**: エージェントは生成された `INSTRUCTIONS.md` を読み込みます。タスクに応じて必要であれば `KIT-PLAN.md`（複数ステップの計画）、`KIT-FIGHT.md`（戦闘戦術）、または `KIT-POINTER.md`（ポインタおよびクリック入力）も確認します。
3. **調査とプローブ（probe）**: エージェントはコードファイルを調査し、動作中のゲームに対して `probe` を実行します。プローブはC#ステートメントを実行して、アクターの検索、プロパティの読み取り、挙動のテストを行います。最初のエピソードの前に調査全体で10分間の制限時間があり、各プローブは最大120秒間実行できます。
4. **ハーネスコードの記述**: エージェントは `harness.cs` を作成します（または `use_harness` で過去のコードを流用します）。`check_harness` を使用してJevなしでハーネスの単体動作を検証することもできます。
5. **エピソードの実行**: エージェントは `run_harness` を呼び出し、5〜360秒間のプレイエピソードを実行します。ハーネスはサンドボックス内で実行され、リアルタイムにJevへ判断を問い合わせながらゲームを操作します。
6. **視覚情報の確認**: リクエストが見た目やアニメーションに関わる場合、エージェントは `frame-describer` サブエージェントに委譲します。サブエージェントは `frames` ツールを使用してメモリ内のエピソードフレームを確認し、期待される結果を知らされない状態で客観的に見えている内容を記述します。
7. **レポートの提出**: 結果が確定したら、エージェントは `report` を呼び出します。MCPサーバーは実行フォルダに `report.json` を書き出し、最終結果を返します。

## メモリおよび実行フォルダ

Cluewrenはゲームプロジェクト内に実行データを保存します。

- **Unity**: `<project>/UserSettings/Cluewren/`
- **Godot**: `<project>/.godot/cluewren/`
- **Unreal Engine**: `<project>/Saved/Cluewren/`

各ディレクトリには以下が含まれます。

- `notes.md`: 蓄積されたノート、ゲームメカニクス、操作情報。
- `lib.cs`: 再利用可能なC#ハーネスヘルパー。
- `runs/<yyyyMMdd-HHmmss>/`: 実行ごとのファイル（`harness.cs`、`traceN.jsonl`、`report.json`、`REQUEST.md`、`INSTRUCTIONS.md`）。

エージェント向けに生成されたプロジェクトテキストエクスポート（"codex"）は以下の場所に配置されます。

- **Unity**: `<project>/Library/CluewrenCodex/`
- **Godot**: `<project>/.godot/cluewren_codex/`
- **Unreal Engine**: `<project>/Saved/CluewrenCodex/`

## エディタが接続されない場合

`start_run` ツールはエンジンプラグインがローカルブリッジに接続するのを最大60秒間待機します。時間内にエディタが接続されない場合、以下のメッセージが返されます。

> "No editor connected within 60 s. Tell the user to open the game's project in its editor with the Cluewren plugin, then call start_run again."
（60秒以内にエディタが接続されませんでした。Cluewrenプラグインを導入したエディタでゲームプロジェクトを開き、再度start_runを呼び出すようユーザーに伝えてください。）

このメッセージが表示された場合は以下の点を確認してください。

1. ゲームエンジンエディタでプロジェクトが開いていること。
2. プロジェクトでCluewrenプラグインが有効化されていること。
3. Unityでは `Window > Cluewren`、GodotではCluewrenドック、Unreal Engineではプラグインがビルドされ読み込まれていることを確認してください。
4. エージェントから再度 `start_run` を実行してください。
