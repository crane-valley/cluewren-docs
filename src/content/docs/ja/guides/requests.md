---
title: リクエストの記述
description: プレイテストリクエストの指定方法、制限時間、レポートの要件。
---

## リクエストの種別

コーディングエージェントにCluewrenを使用したゲームのテストを依頼すると、エージェントは3種類のリクエスト種別のいずれかを使用して実行を開始します。

- `verify`: ゲームメカニクス、物理挙動、または視覚表示に関する特定の主張を検証します。
  - 例: `"Use Cluewren to verify that the tree shakes when you hit it with an axe."`
  - 例: `"Use Cluewren to verify that the door opens with the red key."`
  - 結果: `CONFIRMED`（プレイにより正しいと実証）、`DENIED`（矛盾する観察結果により誤りと実証）、または `INCONCLUSIVE`（プレイでは結論が出なかった）。
- `goal`: ハーネスにゲーム内の目的を達成させます。
  - 例: `"Use Cluewren to kill the boss while keeping your health above 20% of its maximum value."`
  - 結果: `achieved` または `not_achieved`。
- `explore`: ハーネスにゲームシステムを幅広く探索させ、境界条件を検証し、予期しない挙動を特定させます。
  - 例: `"Use Cluewren to explore the crafting system in Lvl_Main."`
  - 結果: `explored`。
- 一般的なテストの依頼（例: `"Use Cluewren to go through the currently open level and tell me everything that looks wrong"`）は `explore` として分類されます。

## 制限時間と予算

プロンプト内で制限時間を自然言語で指定すると、エージェントはそれを `minutes` や `time_limit_minutes` として渡します。

- **実行制限時間（`time_limit_minutes`）**: 実行全体の合計時間（デフォルト: 30分）。実行がこの制限を超えるか、またはエージェントが20分間ツールを呼び出さない場合（`IdleSeconds = 1200`）、自動的に終了します。
- **探索プレイ時間（`minutes`）**: `explore` リクエストにおける、エピソードを通じた最大ゲームプレイ時間（デフォルト: 10分）。プレイ時間の計測は最初のエピソードが開始された時点から始まります。
- **調査予算**: エージェントには、最初のハーネスを作成する前にコードを読み、動作中のゲームをプローブするための合計10分間の予算（`ResearchSeconds = 600`）があります。これを使い切ると、エピソードが1回実行されるまでプローブはロックされます。
- **プローブの実行時間**: 個々の `probe` 呼び出しは最大120秒間実行できます（`ProbeSeconds = 120`）。
- **エピソードの実行時間**: `run_harness` では `seconds` パラメータは必須であり、デフォルト値はありません。5〜360秒の間の時間を指定します。（30秒のデフォルトは、単独実行の `cluewren run` にのみ適用されます。）

## レポートの要件

実行が完了すると、エージェントは `report` ツールを呼び出します。これにより、実行フォルダに `report.json` が書き出されます。レポートは以下の条件を満たす必要があります。

1. **Jevの判断回数基準**: Jevが2つ以上の選択肢から少なくとも3回判断を行ったエピソードが最低1回含まれている必要があります（`MinJevDecisions = 3`）。単独でしか実行されない選択肢で構成されたハーネスはスクリプトとみなされ、拒否されます。
2. **視覚的主張の検証**: `visual` が true の場合（見た目やアニメーションに依存する主張）、`frames` ツールを使用して `frame-describer` サブエージェントが取得したフレームの説明によって結果が裏付けられている必要があります。
3. **レポートのフィールド**:
   - `outcome`: 最終結果（`achieved`、`not_achieved`、`CONFIRMED`、`DENIED`、`INCONCLUSIVE`、または `explored`）。
   - `summary`: 結果の簡潔な説明。
   - `evidence`: 結果を裏付ける具体的な観察結果、トレースファイル、ゲームタイムスタンプ。
   - `findings`: 探索中に観察された疑わしいバグや矛盾点の一覧。
   - `visual`: 結論が視覚的な確認に基づいているかどうかを示すブール値。

生成された `report.json` には、`run`、`project`、`prompt`、`seconds`、`episodes`、`stopped`、`client`、`level_modified`、`research_modified` などのメタデータも記録されます。
