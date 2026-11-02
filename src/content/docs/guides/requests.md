---
title: Writing Requests
description: How to phrase playtest requests, set time limits, and understand report requirements.
---

## Request kinds

When you prompt your coding agent to test your game with Cluewren, the agent starts a run using one of three request kinds:

- `verify`: Checks a specific claim about game mechanics, physics, or visuals.
  - Example: `"Use Cluewren to verify that the tree shakes when you hit it with an axe."`
  - Example: `"Use Cluewren to verify that the door opens with the red key."`
  - Outcomes: `CONFIRMED` (proven true by play), `DENIED` (proven false by contrary observations), or `INCONCLUSIVE` (play was unable to settle the claim).
- `goal`: Tasks the harness with reaching an in-game objective.
  - Example: `"Use Cluewren to kill the boss while keeping your health above 20% of its maximum value."`
  - Outcomes: `achieved` or `not_achieved`.
- `explore`: Directs the harness to explore game systems broadly, test boundaries, and identify unexpected behavior.
  - Example: `"Use Cluewren to explore the crafting system in Lvl_Main."`
  - Outcome: `explored`.
- General testing requests (for example, `"Use Cluewren to go through the currently open level and tell me everything that looks wrong"`) are classified as `explore`.

## Time limits and budgets

You state time limits in plain words in your prompt, and your agent passes them as `minutes` or `time_limit_minutes`:

- **Run time limit (`time_limit_minutes`)**: The total wall-clock budget for the entire run (default: 30 minutes). If a run exceeds this limit, or if the agent calls no tool for 20 minutes (`IdleSeconds = 1200`), the run terminates automatically.
- **Exploration play time (`minutes`)**: For an `explore` request, the maximum game play time across episodes (default: 10 minutes). The play clock starts when the first episode begins.
- **Research budget**: The agent has a 10-minute total budget (`ResearchSeconds = 600`) for reading code and probing the live game before authoring the first harness. Once exhausted, probes are locked until at least one episode has run.
- **Probe duration**: Each individual `probe` call can run for at most 120 seconds (`ProbeSeconds = 120`).
- **Episode duration**: In `run_harness`, the `seconds` parameter is required and has no default; it accepts a duration between 5 and 360 seconds. (The 30-second default applies only to standalone `cluewren run` executions.)

## Report requirements

When the run settles, the agent calls the `report` tool, which writes `report.json` to the run directory. The report must satisfy the following conditions:

1. **Jev decision threshold**: The report requires at least one episode in which Jev made at least 3 decisions among 2 or more options (`MinJevDecisions = 3`). Harnesses whose options run alone are treated as scripts and rejected.
2. **Visual claim verification**: If `visual` is true (the claim depends on how something looks or animates), the outcome must be supported by frame descriptions from the `frame-describer` subagent using the `frames` tool.
3. **Report fields**:
   - `outcome`: The final verdict (`achieved`, `not_achieved`, `CONFIRMED`, `DENIED`, `INCONCLUSIVE`, or `explored`).
   - `summary`: A concise description of the outcome.
   - `evidence`: Specific observations, trace files, and game timestamps that support the verdict.
   - `findings`: A list of suspected bugs or contradictions observed during an exploration.
   - `visual`: Boolean indicating whether the conclusion depends on visual inspection.

The resulting `report.json` also preserves metadata: `run`, `project`, `prompt`, `seconds`, `episodes`, `stopped`, `client`, `level_modified`, and `research_modified`.
