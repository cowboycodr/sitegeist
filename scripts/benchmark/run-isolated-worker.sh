#!/usr/bin/env bash

set -euo pipefail

usage() {
	cat <<'EOF'
Usage:
  CODEX_RUNTIME_ROOT=/path/to/self-contained-codex-runtime \
  CODEX_AUTH_FILE=$HOME/.codex/auth.json \
  scripts/benchmark/run-isolated-worker.sh /tmp/sitegeist-worker-XXXXXX

Environment:
  CODEX_RUNTIME_ROOT  Directory containing only the Codex executable and its
                      runtime dependencies; mounted read-only. When omitted,
                      inferred from the installed codex executable.
  CODEX_EXECUTABLE    Path inside CODEX_RUNTIME_ROOT (default: bin/codex).
  CODEX_AUTH_FILE     File-based Codex login cache (default: ~/.codex/auth.json).
                      Copied into a per-run temporary home and deleted afterward.
  CODEX_MODEL         Model used by every worker (default: gpt-5.6-sol).

Linux only. The script uses Bubblewrap to make the worker the sole writable and
project-visible directory. It intentionally does not mount $HOME, user config,
session history, or the parent repository. Spawned commands remain in Codex's
workspace-write sandbox with network disabled; boundary requests are routed to
Auto-review.
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
	echo 'run-isolated-worker: Bubblewrap (bwrap) is required' >&2
	exit 1
fi

worker="$1"
runtime_root="${CODEX_RUNTIME_ROOT:-}"
codex_executable="${CODEX_EXECUTABLE:-bin/codex}"
codex_auth_file="${CODEX_AUTH_FILE:-$HOME/.codex/auth.json}"
codex_model="${CODEX_MODEL:-gpt-5.6-sol}"

if [[ ! -d "$worker" || ! -f "$worker/WORKER.md" || ! -f "$worker/brief.md" ]]; then
	echo 'run-isolated-worker: worker must come from prepare-run.mjs' >&2
	exit 1
fi
case "$codex_executable" in
	/* | *'..'*)
		echo 'run-isolated-worker: CODEX_EXECUTABLE must be a safe path relative to CODEX_RUNTIME_ROOT' >&2
		exit 1
		;;
esac
if [[ -z "$runtime_root" ]]; then
	installed_codex="$(command -v codex || true)"
	if [[ -z "$installed_codex" ]]; then
		echo 'run-isolated-worker: codex is unavailable and CODEX_RUNTIME_ROOT is unset' >&2
		exit 1
	fi
	installed_codex="$(readlink -f "$installed_codex")"
	runtime_root="$(dirname "$(dirname "$installed_codex")")"
fi
if [[ ! -d "$runtime_root" ]]; then
	echo 'run-isolated-worker: CODEX_RUNTIME_ROOT must name a self-contained runtime directory' >&2
	exit 1
fi
if [[ ! -x "$runtime_root/$codex_executable" ]]; then
	echo "run-isolated-worker: executable not found: $runtime_root/$codex_executable" >&2
	exit 1
fi
if [[ ! -f "$codex_auth_file" || -L "$codex_auth_file" ]]; then
	echo 'run-isolated-worker: CODEX_AUTH_FILE must be a regular, non-symlinked file' >&2
	exit 1
fi

worker="$(cd -P "$worker" && pwd)"
runtime_root="$(cd -P "$runtime_root" && pwd)"
codex_auth_file="$(cd -P "$(dirname "$codex_auth_file")" && pwd)/$(basename "$codex_auth_file")"

auth_home="$(mktemp -d "${TMPDIR:-/tmp}/sitegeist-codex-auth.XXXXXX")"
cleanup() {
	rm -rf -- "$auth_home"
}
trap cleanup EXIT INT TERM
cp -- "$codex_auth_file" "$auth_home/auth.json"
chmod 700 "$auth_home"
chmod 600 "$auth_home/auth.json"

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
	--setenv HOME /home/codex \
	--setenv CODEX_HOME /home/codex/.codex \
	--setenv PATH /opt/codex-runtime/bin:/run/current-system/sw/bin:/usr/bin:/bin \
	--setenv TMPDIR /tmp \
	"${system_mounts[@]}" \
	"${runtime_system_mounts[@]}" \
	"${nix_mounts[@]}" \
	--proc /proc \
	--dev /dev \
	--tmpfs /tmp \
	--dir /home \
	--dir /home/codex \
	--bind "$auth_home" /home/codex/.codex \
	--ro-bind "$runtime_root" /opt/codex-runtime \
	--bind "$worker" /workspace \
	--chdir /workspace \
	"/opt/codex-runtime/$codex_executable" exec \
	--json \
	--ephemeral \
	--ignore-user-config \
	--ignore-rules \
	--strict-config \
	--model "$codex_model" \
	--sandbox workspace-write \
	--skip-git-repo-check \
	-c 'model_reasoning_effort="medium"' \
	-c 'approval_policy="on-request"' \
	-c 'approvals_reviewer="auto_review"' \
	-c 'web_search="disabled"' \
	-C /workspace \
	'Read /workspace/WORKER.md and /workspace/brief.md. Create exactly one complete submission in /workspace/submission. Do not inspect or reference anything outside /workspace.'
