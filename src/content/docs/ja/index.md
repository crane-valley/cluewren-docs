---
title: Cluewren
description: コーディングエージェントを使用したUnity、Godot、Unreal Engine向け自動プレイテスト。
template: splash
hero:
  title: Cluewren
  tagline: コーディングエージェントと高速な意思決定モデルを使用して、Unity、Godot、Unreal Engineのゲームをプレイテストします。
  actions:
    - text: インストール
      link: /ja/getting-started/install/
      variant: primary
    - text: GitHub
      link: https://github.com/crane-valley/cluewren
      variant: minimal
      icon: external
---

Cluewrenは、Unity、Godot、Unreal Engineのエディタで開いているゲームの自動プレイテストセッションを実行します。お使いのコーディングエージェントがC#ハーネスコードを作成し、高速な意思決定モデルが各エンジンのローカルプラグインを介してゲームをプレイします。

## ドキュメント

- [概要](/ja/getting-started/overview/): Cluewrenの機能、対象ユーザー、リクエスト種別、生成されるファイル。
- [インストール](/ja/getting-started/install/): 動作要件、ソースからのビルド、コーディングエージェントの接続。
- [最初の実行](/ja/getting-started/first-run/): セッションの開始、リクエストの送信、ログとレポートの確認。
- [Unity](/ja/engines/unity/): Unityパッケージの導入、ブリッジ通信、エンジン固有の注意事項。
- [Godot](/ja/engines/godot/): Godotアドオンの導入、デバッガ中継、エンジン固有の注意事項。
- [Unreal Engine](/ja/engines/unreal/): Unrealプラグインの導入、ソケット構成、エンジン固有の注意事項。
- [リクエストの記述](/ja/guides/requests/): リクエストの書き方、制限時間、レポートの要件。
- [意思決定モデルのAPIキー](/ja/guides/decision-model-key/): Jev用のTypeSafe APIキーの設定。
- [アーキテクチャ](/ja/concepts/architecture/): コンポーネント構成とローカル通信の流れ。
- [プライバシー](/ja/concepts/privacy/): ローカル動作の境界と外部通信。
- [ハーネスのサンドボックス](/ja/concepts/sandbox/): プロセス分離、コンテナ、実行制限。
- [CLIリファレンス](/ja/reference/cli/): `connect`、`mcp`、`run`コマンド。
- [ハーネスKitリファレンス](/ja/reference/kit/): `Cluewren.Kit`ライブラリとハーネスAPI。
