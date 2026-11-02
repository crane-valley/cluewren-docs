---
title: ハーネスのサンドボックス
description: ハーネス実行のためのサンドボックス、プロセス分離、セキュリティ境界。
---

## 概要

ハーネスコードは、コーディングエージェントによって動的に作成されるC#コードです。CluewrenはRoslynを使用して `harness.cs` をアセンブリにコンパイルし、分離された子プロセス（`Cluewren.Child.dll`）がそれを読み込んで実行します。サンドボックス内で実行されている間、子プロセスはネットワークアクセスを持たず、書き込みは実行フォルダ内に限定されます。読み取り可能な範囲はOSによって異なります（後述）。

## Windowsにおける分離（AppContainer）

Windows 11では、CluewrenはAppContainer内で子プロセスを起動します。

- **ゼロ機能（Zero capabilities）**: コンテナはネットワークやデバイス機能なしで作成され、送受信両方のネットワークアクセスが遮断されます。
- **ジョブオブジェクトの制限**: プロセスは以下の設定を持つWindowsジョブオブジェクトに割り当てられます。
  - `LimitKillOnJobClose`: ジョブハンドルを閉じると、子プロセスおよびそのすべてのサブプロセスが直ちに終了します。
  - `ActiveProcessLimit = 1`: 子プロセスが追加のプロセスを起動することはできません。
  - `JobMemoryLimit`: 2 GiB（`2L << 30`）のメモリ上限。
- **ファイルシステムの権限**:
  - コンテナには、実行フォルダ（`spec.RunFolder`）への書き込みアクセス権と、子ランタイムのコピー先（`%LOCALAPPDATA%\Cluewren-child\<hash>`）への読み取りおよび実行アクセス権のみが付与されます。
  - それ以外のファイルについては、WindowsがAppContainerプロセスに対してデフォルトで許可している範囲にのみアクセスできます。

## Linuxにおける分離（bubblewrap）

brainのコードベースには、bubblewrap（`bwrap`）を使用したLinux向けサンドボックスの実装が含まれています。

- `--unshare-all`、`--die-with-parent`、`--new-session` を指定して `bwrap` を起動。
- `/` を読み取り専用としてマウントし、`/tmp` およびCluewrenディレクトリ（`brain.json` と `keys.env` を隠蔽）にtmpfsをオーバーレイ。
- 実行中のフォルダを読み書き可能としてバインドマウント。

:::note
コードベース内にbubblewrapによるサンドボックス実装が存在しますが、CluewrenのテストはWindows 11でのみ行われています。Linuxはテスト済みプラットフォームではありません。
:::

## 通常の子プロセスへのフォールバック

Windowsでコンテナの作成に失敗した場合（またはLinuxでbubblewrapが利用できない場合）、Cluewrenは通常の子プロセスの実行にフォールバックします。

フォールバックが発生した場合、実行ログに次のように出力されます。

> "The sandbox couldn't be used (<reason>): harness code ran in a plain child with no keys in its environment. It can read this user's files and reach the network."

子プロセスは許可リスト（allow-list）に含まれる環境変数（`SystemRoot`、`SystemDrive`、`windir`、`NUMBER_OF_PROCESSORS`、`PROCESSOR_ARCHITECTURE`、`OS`、`PATH`、`LANG`、`USERPROFILE`、`LOCALAPPDATA`、`APPDATA`、および実行フォルダ内の `tmp` を指す `TEMP` と `TMP`）のみで実行されます。この許可リスト外の環境変数は除外されるため、APIキーや外部の認証情報が子プロセスに渡ることはありません。

## クォータと制限事項

- **プローブ制限**: 個々の `probe` 呼び出しは最大120秒間実行されます（`ProbeSeconds = 120`）。
- **意思決定回数制限**: デフォルトで、1回の実行あたり最大5,000回のJev判断が許可されます（`MaxJevDecisions = 5000`）。
- **エピソードの実行時間**: 各エピソードは最大360秒に制限されます（`MaxEpisode = 360`）。
- **メモリ制限**: プロセスメモリは2 GiBに制限されます。
