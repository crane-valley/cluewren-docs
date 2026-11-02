---
title: インストール
description: 動作要件、ソースからのビルド、コーディングエージェントの接続。
---

## 動作要件

- Windows 11（テスト済み環境）。brainにはbubblewrapを使用したLinux向けサンドボックスのコードが含まれていますが、Linux環境でのテストは行われていません（[ハーネスのサンドボックス](/ja/concepts/sandbox/)を参照）。
- .NET 10 SDK
- テスト済みゲームエンジン:
  - Unity 6000.6.7f1（パッケージ宣言はUnity 6000.0以降）
  - Godot 4.7.2
  - Unreal Engine 5.8（Win64のみ）
- サポート対象のコーディングエージェント: Claude Code または OpenAI Codex

## ソースからのビルド

Cluewrenには事前ビルド済みのバイナリやインストーラはありません。.NET 10 SDKを使用してソースコードからビルドしてください。

```bash
git clone https://github.com/crane-valley/cluewren.git
cd cluewren
dotnet build -c Release
```

ビルドされた実行ファイルは `src/Cluewren/bin/Release/net10.0/cluewren.exe` に生成されます。

## エージェントの接続

`cluewren connect` を実行して、コーディングツールにMCPサーバー、スキルファイル、およびframe describerエージェントを登録します。以下のコマンドの `cluewren` は、リポジトリのフォルダから実行する `./src/Cluewren/bin/Release/net10.0/cluewren` のことです。そのフォルダを `PATH` に追加しても構いません。

### Claude Code

次のように実行します。

```powershell
cluewren connect claude
```

このコマンドは以下の処理を行います。

1. `claude mcp add --scope user cluewren -- <cluewren.exeへのパス> mcp` を実行します。ユーザースコープに登録されるため、すべてのプロジェクトで利用可能になります。`claude` が `PATH` に見つからない場合は、手動で実行するためのコマンドを表示します。Cluewren以外によって作成された既存の `cluewren` MCPサーバーが存在する場合は変更せずそのまま残します。
2. スキルファイルを `<Claudeホーム>/skills/cluewren/SKILL.md` に書き出します。Claudeホームは `%CLAUDE_CONFIG_DIR%` が設定されていればそのパス、未設定なら `~/.claude` です。
3. frame describerサブエージェントを `<Claudeホーム>/agents/frame-describer.md` に書き出します。

### OpenAI Codex

次のように実行します。

```powershell
cluewren connect codex
```

このコマンドは以下の処理を行います。

1. 既存の `<Codexホーム>/config.toml` を `config.toml.before-cluewren` にバックアップし、`default_tools_approval_mode = "approve"` を設定した `[mcp_servers."cluewren"]` テーブルを追加します。Codexホームは `%CODEX_HOME%` が設定されていればそのパス、未設定なら `~/.codex` です。サーバーがすでにドット区切りのキーで設定されている場合は、手動で実行する `codex mcp add` コマンドを表示します。
2. スキルファイルを `~/.agents/skills/cluewren/SKILL.md` に書き出します。
3. frame describerの設定を `<Codexホーム>/agents/frame_describer.toml` に書き出します。

### エージェント設定の削除

エージェントからCluewrenの設定を削除するには、`--remove` を渡します。

```powershell
cluewren connect claude --remove
cluewren connect codex --remove
```

これにより、MCPサーバーの登録が解除され、Cluewrenによって書き出されたスキルファイルおよびdescriberファイルが削除されます。

:::note
`cluewren connect` または `cluewren connect --remove` を実行した後は、Claude CodeまたはCodexの新しいセッションを開始してください。
:::

## 意思決定モデルのキー

CluewrenにはTypeSafeのJevモデル用のAPIキー（`TYPESAFE_API_KEY`）が必要です。エージェントセッションを開始する前にキーを設定してください。設定手順については[意思決定モデルのAPIキー](/ja/guides/decision-model-key/)を参照してください。

## エンジンプラグイン

エージェントの設定後、お使いのエンジンに対応するプラグインを導入してください。

- [Unityプラグイン](/ja/engines/unity/)
- [Godotプラグイン](/ja/engines/godot/)
- [Unreal Engineプラグイン](/ja/engines/unreal/)
