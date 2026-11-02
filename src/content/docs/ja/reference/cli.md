---
title: CLIリファレンス
description: cluewrenのコマンドラインインターフェースリファレンス。
---

## 概要

Cluewren CLI（`cluewren.exe`）は、コーディングエージェント連携の設定、MCPサーバーのホスト、およびスタンドアロンハーネスの実行を行います。

```text
usage:
  cluewren connect claude|codex [--remove]   set up your own agent to use Cluewren
  cluewren mcp                               the MCP server your agent starts
  cluewren run <run folder> [seconds]        play <run folder>/harness.cs once, without an agent
```

## コマンド

### `cluewren connect`

Claude CodeまたはOpenAI CodexにCluewrenを設定します。

```powershell
cluewren connect claude [--remove]
cluewren connect codex [--remove]
```

- `claude`:
  - MCPサーバーをユーザースコープに登録: `claude mcp add --scope user cluewren -- <path to cluewren.exe> mcp`。
  - スキルファイルを `<Claude home>/skills/cluewren/SKILL.md` に書き出します。Claudeホームは `%CLAUDE_CONFIG_DIR%` が設定されていればそのパス、未設定なら `~/.claude` です。
  - frame describerサブエージェントを `<Claude home>/agents/frame-describer.md` に書き出します。
  - `claude` が `PATH` に見つからない場合は手動コマンドを表示します。
  - Cluewren以外によって作成された既存のMCPサーバーやファイルは変更せずそのまま残します。
- `codex`:
  - `<Codex home>/config.toml` を `config.toml.before-cluewren` にバックアップし、`default_tools_approval_mode = "approve"` を設定した `[mcp_servers."cluewren"]` テーブルを追加します。Codexホームは `%CODEX_HOME%` が設定されていればそのパス、未設定なら `~/.codex` です。
  - スキルファイルを `~/.agents/skills/cluewren/SKILL.md` に書き出します。
  - frame describerの設定を `<Codex home>/agents/frame_describer.toml` に書き出します。
- `--remove`:
  - MCPサーバーの登録を解除し、Cluewrenによって作成されたスキルファイルおよびdescriberファイルを削除します。

### `cluewren mcp`

標準入出力経由でModel Context Protocol（MCP）サーバーを実行します。

```powershell
cluewren mcp
```

このコマンドはClaude CodeまたはOpenAI Codexによって自動的に起動されます。直接手動で実行することはありません。

### `cluewren run`

エージェントセッションを使用せずに、既存の `harness.cs` ファイルを動作中のゲームに対して直接1回実行します。

```powershell
cluewren run <run folder> [seconds]
```

- `<run folder>`: `harness.cs` を含む実行フォルダのパス。
- `[seconds]`: 任意のプレイ時間（秒単位、デフォルト: 30秒）。
- ブリッジサーバーを起動し、エンジンプラグインに接続して、コンパイルされたハーネスを実行し、サンドボックスモード、行われた決定回数、結果統計を出力します。

## 終了コード

- `0`: 成功。
- `1`: `cluewren run` の実行中にハーネスの実行が失敗。
- `2`: 無効なコマンドライン引数（使用法を表示）。
- `3`: `cluewren connect` の実行中に未完了の手動手順が残った（例: 手動CLIコマンドの実行が必要）。
- `130`: ユーザーによる中断（Ctrl+C）。
