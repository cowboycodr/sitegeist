---
name: add-model
description: Add a new model-backed website benchmark collection with an explicitly named CLI harness and exact model, isolated generation, live batch monitoring, automatic artifact review, replacement of failed outputs, duplicate/runtime/volume audits, app integration, and a reviewable pull request. Use when adding or resuming a Sitegeist benchmark model such as Codex, Claude Code, Cursor, or Grok Build.
---

# Add Model

Add one benchmark model without exposing any worker to the repository, prior
generated sites, other workers, or evaluator feedback. Treat reproducibility and
collection integrity as part of the product change.

## Establish the benchmark identity

Require these two values before generation:

- CLI harness and executable, such as `codex`, Claude Code, Cursor agent, or
  Grok Build.
- Exact provider model identifier, not a marketing-family approximation.

Do not infer or silently substitute either value. If the user supplied only one,
ask for the other. State both in the first execution update and record them in
the generation summary, for example:

```text
Harness: Claude Code CLI (`claude`)
Model: `claude-opus-4-8`
```

Read [references/harness-and-review.md](references/harness-and-review.md) before
adding or changing a runner. Verify the installed CLI's local help and model
selection syntax instead of relying on remembered flags.

## Plan the full lifecycle

Add all of these stages to the working plan:

1. Inspect the artifact contract, current model registries, ignore rules, and
   existing runner boundaries.
2. Create a dedicated branch and runner for the requested CLI/model.
3. Prove authentication, exact-model routing, and isolation with one minimal
   canary.
4. Generate in waves of at most ten, automatically review every candidate, and
   continue until the requested accepted count exists.
5. Audit code volume, exact duplicates within and across models, browser runtime,
   mobile overflow, and collection cardinality.
6. Reject and regenerate failing model outputs; never repair their design by
   hand.
7. Import one canonical deployable copy, add the model selector, and run product
   checks.
8. Verify the final diff, commit, push, and open a pull request.

Do not mark generation complete merely because the CLI processes exited.

## Build an isolated runner

Give each worker a fresh one-site filesystem containing only its private brief,
neutral starter instructions, and any evaluator-provided bridge required by the
artifact contract. Enforce the boundary with Bubblewrap, a sparse container, or
an equivalent mount namespace.

Do not mount or expose:

- the repository, `.git`, previous sites, sibling workers, or benchmark reports;
- user rules, skills, plugins, MCP servers, conversation history, or shared CLI
  sessions;
- browser history, screenshots, caches, or provider-specific memories.

Copy only the minimum authentication material into a mode-restricted temporary
home. Clear unrelated host environment variables. Disable web research and
runtime remote assets. Give the model the smallest tool allowlist that can author
the artifact. Prefer a trusted evaluator build after the model exits over letting
submitted code execute.

Pin and record:

- exact CLI version and executable;
- exact model identifier and reasoning/effort setting;
- approval policy and automatic reviewer identity;
- tool allowlist, web-search policy, attempt budget, and worker concurrency.

Never commit copied credentials, temporary homes, raw worker logs, or evaluator
workspaces.

## Prove the runner before scaling

Run one cheap authentication/model-routing probe, then one full isolated worker.
Confirm that:

- the response metadata names the requested model;
- the worker can access only its own mounted workspace;
- the result satisfies the artifact contract and trusted build;
- logs show no shell, web, external path, or forbidden tool activity;
- a failure returns a useful diagnostic without leaking secrets.

Stop and correct the runner if any condition fails. Do not launch a large batch
on an unverified harness.

## Generate and monitor waves

Keep no more than ten workers active at once. Stay attached to the orchestrator
and post concise progress at least once per minute while workers are active.
Report accepted, pending, failed, and current wave IDs. Do not detach the job and
assume it will finish correctly.

Automatically review every candidate before promotion. Reject artifacts that:

- violate the manifest, path, preview, or self-contained static-site contract;
- access files outside the private workspace or invoke forbidden commands/tools;
- contain remote runtime dependencies, unsafe special files, or missing assets;
- exceed per-site limits or fail the trusted build.

Replace every rejected artifact until the target accepted count is restored.
Keep rejection reasons and attempt history in the summary without feeding them
back into unrelated workers.

Treat shared authentication, runner, and usage-limit failures as an atomic wave
boundary. Stop all workers, delete every partial promotion from that wave, reset
its attempts, and preserve the last clean checkpoint. Never keep the lucky early
finishers from a quota-straddling wave. Report the provider's reset time and wait
for explicit direction before creating a scheduler.

## Run post-generation audits

Run every audit before importing or publishing:

- Confirm exactly the requested number of accepted records, directories, and
  unique IDs/slugs.
- Measure the canonical deployable payload separately from evaluator source and
  raw workspaces. Fail excessive file, byte, or text-line totals.
- Compare canonical source and distribution hashes across every pair within the
  new collection.
- Compare the new registry against every existing model registry.
- Load every real site in a browser at a representative mobile viewport. Record
  navigation errors, console errors, empty pages, and horizontal document
  overflow.
- Spot-check desktop rendering and the gallery/full-screen integration.
- Scan the diff for secrets, auth files, raw submissions, duplicate payloads,
  generated caches, and suspicious executable code.

Reject and regenerate individual runtime failures through the evaluator queue.
Do not redesign a generated page to make it pass. Re-run all affected audits
after replacement.

Use the bundled verifier after reports and the canonical static tree exist:

```sh
node .skills/add-model/scripts/verify-model-benchmark.mjs \
  --summary benchmark/reports/<model>-generation-summary.json \
  --registry src/lib/generated/<model>-site-artifacts.ts \
  --static-root static/sites/<model> \
  --duplicate-reports benchmark/reports/<model>-exact-duplicates.json,benchmark/reports/<cross-model>.json \
  --volume-report benchmark/reports/<model>-code-volume.json \
  --runtime-report benchmark/reports/<model>-mobile-runtime-audit.json \
  --expected-count 100
```

Treat verifier success as one gate, not a replacement for browser and code
review.

## Integrate one canonical copy

Import only the accepted `dist` and preview/audit assets into the model-specific
static tree. Keep raw submissions and authored source in ignored evaluator state.
Generate a model registry with stable public URLs and hashes. Add an enabled
model filter without changing existing model results or backwards-compatible
defaults.

Run type checks and a production build. Verify selector switching, posters,
full-screen viewer behavior, mobile scrolling, and direct artifact URLs.

## Review and publish

Before committing, inspect:

```sh
git status --short
git diff --check
git diff --stat
git diff --numstat
git ls-files .benchmark-work
```

Explain any unexpectedly large file or line count. Commit only the runner,
orchestrator/audit improvements, compact reports, generated registry, canonical
static collection, UI integration, documentation, and this skill. Push the
dedicated branch and open a pull request that names the CLI, exact model, accepted
count, replacements, audit results, canonical size, and verification commands.
