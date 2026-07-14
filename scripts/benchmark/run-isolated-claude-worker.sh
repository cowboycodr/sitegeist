#!/usr/bin/env bash

set -euo pipefail

usage() {
	cat <<'EOF'
Usage:
  CLAUDE_RUNTIME_ROOT=/path/to/self-contained-claude-runtime \
  CLAUDE_AUTH_FILE=$HOME/.claude/.credentials.json \
  scripts/benchmark/run-isolated-claude-worker.sh /tmp/sitegeist-worker-XXXXXX

Environment:
  CLAUDE_RUNTIME_ROOT  Directory containing the Claude executable and its
                       runtime dependencies; mounted read-only. When omitted,
                       inferred from the installed claude executable.
  CLAUDE_EXECUTABLE    Path inside CLAUDE_RUNTIME_ROOT (default: bin/claude).
  CLAUDE_AUTH_FILE     Claude Code login cache (default:
                       ~/.claude/.credentials.json). Copied into a per-run
                       temporary home and deleted afterward.
  CLAUDE_MODEL         Model used by every worker (default: claude-opus-4-8).
  CLAUDE_MAX_BUDGET_USD
                       Per-attempt API accounting ceiling (default: 2.00).

Linux only. Bubblewrap makes the worker the sole writable and project-visible
directory. Claude receives no user config, history, projects, skills, plugins,
MCP servers, browser access, web tools, or repository context. The CLI can call
Anthropic, while its shell tool is restricted to a small offline allowlist.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
	usage
	exit 0
fi

if [[ "$#" -ne 1 ]]; then
	usage >&2
	exit 2
fi

if ! command -v bwrap >/dev/null 2>&1; then
	echo 'run-isolated-claude-worker: Bubblewrap (bwrap) is required' >&2
	exit 1
fi

worker="$1"
script_directory="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
runtime_root="${CLAUDE_RUNTIME_ROOT:-}"
claude_executable="${CLAUDE_EXECUTABLE:-bin/claude}"
claude_auth_file="${CLAUDE_AUTH_FILE:-$HOME/.claude/.credentials.json}"
claude_model="${CLAUDE_MODEL:-claude-opus-4-8}"
claude_max_budget_usd="${CLAUDE_MAX_BUDGET_USD:-2.00}"

if [[ ! -d "$worker" || ! -f "$worker/WORKER.md" || ! -f "$worker/brief.md" ]]; then
	echo 'run-isolated-claude-worker: worker must come from prepare-run.mjs' >&2
	exit 1
fi
case "$claude_executable" in
	/* | *'..'*)
		echo 'run-isolated-claude-worker: CLAUDE_EXECUTABLE must be a safe path relative to CLAUDE_RUNTIME_ROOT' >&2
		exit 1
		;;
esac
if [[ -z "$runtime_root" ]]; then
	installed_claude="$(command -v claude || true)"
	if [[ -z "$installed_claude" ]]; then
		echo 'run-isolated-claude-worker: claude is unavailable and CLAUDE_RUNTIME_ROOT is unset' >&2
		exit 1
	fi
	installed_claude="$(readlink -f "$installed_claude")"
	runtime_root="$(dirname "$(dirname "$installed_claude")")"
fi
if [[ ! -d "$runtime_root" ]]; then
	echo 'run-isolated-claude-worker: CLAUDE_RUNTIME_ROOT must name a self-contained runtime directory' >&2
	exit 1
fi
if [[ ! -x "$runtime_root/$claude_executable" ]]; then
	echo "run-isolated-claude-worker: executable not found: $runtime_root/$claude_executable" >&2
	exit 1
fi
if [[ ! -f "$claude_auth_file" || -L "$claude_auth_file" ]]; then
	echo 'run-isolated-claude-worker: authenticate with `claude auth login`; CLAUDE_AUTH_FILE must be a regular file' >&2
	exit 1
fi

worker="$(cd -P "$worker" && pwd)"
runtime_root="$(cd -P "$runtime_root" && pwd)"
claude_auth_file="$(cd -P "$(dirname "$claude_auth_file")" && pwd)/$(basename "$claude_auth_file")"

auth_home="$(mktemp -d "${TMPDIR:-/tmp}/sitegeist-claude-auth.XXXXXX")"
cleanup() {
	rm -rf -- "$auth_home"
}
trap cleanup EXIT INT TERM
chmod 700 "$auth_home"
cp -- "$claude_auth_file" "$auth_home/.credentials.json"
chmod 600 "$auth_home/.credentials.json"

# The bridge and source directory are neutral harness infrastructure. Keeping
# the deployable copy step outside the model avoids granting shell access and
# avoids spending model tokens duplicating an otherwise static source tree.
mkdir -p "$worker/submission/source"
cp -- "$worker/sitegeist-bridge.js" "$worker/submission/source/sitegeist-bridge.js"

system_mounts=()
for system_path in /usr /bin /sbin /lib /lib64 /etc; do
	if [[ -e "$system_path" ]]; then
		system_mounts+=(--ro-bind "$system_path" "$system_path")
	fi
done

runtime_system_mounts=()
if [[ -d /run/current-system/sw ]]; then
	runtime_system_mounts+=(
		--dir /run
		--dir /run/current-system
		--ro-bind /run/current-system/sw /run/current-system/sw
	)
fi

nix_mounts=()
if [[ -d /nix/store ]]; then
	nix_mounts+=(--dir /nix --dir /nix/store --ro-bind /nix/store /nix/store)
fi

bwrap \
	--die-with-parent \
	--new-session \
	--unshare-user \
	--unshare-pid \
	--unshare-ipc \
	--unshare-uts \
	--unshare-cgroup-try \
	--clearenv \
	--setenv HOME /home/claude \
	--setenv CLAUDE_CONFIG_DIR /home/claude/.claude \
	--setenv PATH /opt/claude-runtime/bin:/run/current-system/sw/bin:/usr/bin:/bin \
	--setenv TMPDIR /tmp \
	"${system_mounts[@]}" \
	"${runtime_system_mounts[@]}" \
	"${nix_mounts[@]}" \
	--proc /proc \
	--dev /dev \
	--tmpfs /tmp \
	--dir /home \
	--dir /home/claude \
	--bind "$auth_home" /home/claude/.claude \
	--ro-bind "$runtime_root" /opt/claude-runtime \
	--bind "$worker" /workspace \
	--chdir /workspace \
	"/opt/claude-runtime/$claude_executable" \
	--print \
	--model "$claude_model" \
	--effort medium \
	--max-budget-usd "$claude_max_budget_usd" \
	--output-format stream-json \
	--verbose \
	--no-session-persistence \
	--permission-mode dontAsk \
	--tools 'Read,Write,Edit' \
	--allowedTools Read \
	--allowedTools Write \
	--allowedTools Edit \
	--disable-slash-commands \
	--no-chrome \
	--strict-mcp-config \
	--mcp-config '{"mcpServers":{}}' \
	--setting-sources '' \
	'Read /workspace/WORKER.md and /workspace/brief.md. Create exactly one complete submission in /workspace/submission. The harness has preinstalled source/sitegeist-bridge.js; do not rewrite it. Author site.json, source, and preview only; do not create dist because the trusted evaluator copies source to dist after you exit. This supersedes only the dist-copy step in WORKER.md. Do not inspect or reference anything outside /workspace.'

rm -rf -- "$worker/submission/dist"
cp -- "$worker/sitegeist-bridge.js" "$worker/submission/source/sitegeist-bridge.js"
node "$script_directory/build-static.mjs" --submission "$worker/submission" >/dev/null
