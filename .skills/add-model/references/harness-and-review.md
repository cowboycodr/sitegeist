# Harness and review reference

Use this reference to adapt Sitegeist's neutral benchmark boundary to a new CLI.
CLI releases change; inspect the locally installed executable's `--help` before
finalizing flags.

## Required harness facts

Record these facts in the runner and generation summary:

| Field | Requirement |
| --- | --- |
| Harness | Product and executable, such as Claude Code (`claude`) |
| Version | Exact local CLI version used for the run |
| Model | Exact provider routing identifier |
| Effort | Explicit reasoning/effort value or `not supported` |
| Approval policy | Noninteractive policy used by workers |
| Reviewer | Automatic artifact reviewer identity |
| Tools | Complete allowlist; deny everything else |
| Web | Disabled for benchmark generation |
| Persistence | Ephemeral session and fresh temporary home |
| Budget | Per-attempt cap and provider usage boundary behavior |

## CLI adaptation notes

These are harness families, not stable command templates:

- **Codex CLI:** Prefer ephemeral execution, ignored user configuration/rules,
  an explicit model, disabled web search, a private working directory, and a
  sandboxed tool policy. Keep the API/control-plane secret outside the worker
  mount.
- **Claude Code:** Use print/noninteractive mode, an exact `--model`, structured
  output for audit evidence, a minimal `--allowedTools` list, disabled session
  persistence, and a temporary home containing only authentication. Treat a
  Max/session usage response as a whole-wave boundary.
- **Grok Build:** Pin the exact Grok model, use its noninteractive structured
  output, and provide a fresh temporary Grok home with only the required auth
  file. Disable inherited tools and integrations.
- **Cursor agent:** Verify the installed agent executable and its current
  noninteractive/model flags locally. Disable project rules, memories, MCP, and
  shared sessions. Do not assume desktop Cursor and Cursor's CLI expose identical
  model routing.

If a CLI cannot disable shared history, custom rules, or broad filesystem access,
place the entire CLI inside an OS-level sparse container. Prompt instructions are
not an isolation boundary.

## Automatic candidate review

Capture structured evidence for every attempt:

- process exit status, elapsed time, harness error, and provider limit response;
- every tool/command name and file path reported by the CLI;
- manifest validation, source/dist hashes, file counts, bytes, and trusted build;
- remote URL/static dependency scan and preview validation;
- promotion, rejection, rollback, and replacement reason.

Reject external path access even when it is read-only. Reject shell or browser
activity when the allowlist forbids it. Sanitize credentials and long provider
diagnostics before writing reports.

## Collection review gates

Require all of the following:

1. Target accepted count and unique identities.
2. Zero active or abandoned worker processes.
3. Zero exact source/dist duplicates within the collection.
4. Zero exact source/dist matches with existing model collections.
5. Code-volume report accepted under explicit caps.
6. Every direct artifact URL loads with no page-level console error.
7. Every mobile document fits the effective client width.
8. Every rejected runtime artifact replaced by a fresh model output.
9. Type check and production build pass.
10. Git contains no evaluator workspace, credential, raw log, cache, or duplicate
    source/static payload.

Do not publish a partial collection under the final model selector.
