#!/usr/bin/env bash

set -euo pipefail

usage() {
	cat <<'EOF'
Usage:
  GROK_RUNTIME_ROOT=/path/to/self-contained-grok-runtime \
  GROK_AUTH_FILE=$HOME/.grok/auth.json \
  scripts/benchmark/run-isolated-grok-worker.sh /tmp/sitegeist-worker-XXXXXX

Environment:
  GROK_RUNTIME_ROOT  Directory containing the Grok executable and its runtime
                     dependencies; mounted read-only. When omitted, inferred
                     from the installed grok executable.
  GROK_EXECUTABLE    Path inside GROK_RUNTIME_ROOT (default: bin/grok).
  GROK_AUTH_FILE     File-based Grok login cache (default: ~/.grok/auth.json).
                     Copied into a per-run temporary home and deleted afterward.
  GROK_MODEL         Model used by every worker (default: grok-4.5).

Linux only. Bubblewrap makes the worker the sole writable and project-visible
directory. Grok receives no user config, history, memory, plugins, MCP servers,
or repository context. Its own strict sandbox blocks child-process network
access, while the parent Grok process retains API access.
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
	echo 'run-isolated-grok-worker: Bubblewrap (bwrap) is required' >&2
	exit 1
fi

worker="$1"
runtime_root="${GROK_RUNTIME_ROOT:-}"
grok_executable="${GROK_EXECUTABLE:-bin/grok}"
grok_auth_file="${GROK_AUTH_FILE:-$HOME/.grok/auth.json}"
grok_model="${GROK_MODEL:-grok-4.5}"

if [[ ! -d "$worker" || ! -f "$worker/WORKER.md" || ! -f "$worker/brief.md" ]]; then
	echo 'run-isolated-grok-worker: worker must come from prepare-run.mjs' >&2
	exit 1
fi
case "$grok_executable" in
	/* | *'..'*)
		echo 'run-isolated-grok-worker: GROK_EXECUTABLE must be a safe path relative to GROK_RUNTIME_ROOT' >&2
		exit 1
		;;
esac
if [[ -z "$runtime_root" ]]; then
	installed_grok="$(command -v grok || true)"
	if [[ -z "$installed_grok" ]]; then
		echo 'run-isolated-grok-worker: grok is unavailable and GROK_RUNTIME_ROOT is unset' >&2
		exit 1
	fi
	installed_grok="$(readlink -f "$installed_grok")"
	runtime_root="$(dirname "$(dirname "$installed_grok")")"
fi
if [[ ! -d "$runtime_root" ]]; then
	echo 'run-isolated-grok-worker: GROK_RUNTIME_ROOT must name a self-contained runtime directory' >&2
	exit 1
fi
if [[ ! -x "$runtime_root/$grok_executable" ]]; then
	echo "run-isolated-grok-worker: executable not found: $runtime_root/$grok_executable" >&2
	exit 1
fi

if [[ ! -f "$grok_auth_file" || -L "$grok_auth_file" ]]; then
	echo 'run-isolated-grok-worker: authenticate with `grok login --device-auth`; GROK_AUTH_FILE must be a regular file' >&2
	exit 1
fi

worker="$(cd -P "$worker" && pwd)"
runtime_root="$(cd -P "$runtime_root" && pwd)"

auth_home="$(mktemp -d "${TMPDIR:-/tmp}/sitegeist-grok-auth.XXXXXX")"
cleanup() {
	rm -rf -- "$auth_home"
}
trap cleanup EXIT INT TERM
chmod 700 "$auth_home"
grok_auth_file="$(cd -P "$(dirname "$grok_auth_file")" && pwd)/$(basename "$grok_auth_file")"
cp -- "$grok_auth_file" "$auth_home/auth.json"
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
	--setenv HOME /home/grok \
	--setenv GROK_HOME /home/grok/.grok \
	--setenv PATH /opt/grok-runtime/bin:/run/current-system/sw/bin:/usr/bin:/bin \
	--setenv TMPDIR /tmp \
	"${system_mounts[@]}" \
	"${runtime_system_mounts[@]}" \
	"${nix_mounts[@]}" \
	--proc /proc \
	--dev /dev \
	--tmpfs /tmp \
	--dir /home \
	--dir /home/grok \
	--bind "$auth_home" /home/grok/.grok \
	--ro-bind "$runtime_root" /opt/grok-runtime \
	--bind "$worker" /workspace \
	--chdir /workspace \
	"/opt/grok-runtime/$grok_executable" \
	--single 'Read /workspace/WORKER.md and /workspace/brief.md. Create exactly one complete submission in /workspace/submission. Do not inspect or reference anything outside /workspace.' \
	--cwd /workspace \
	--model "$grok_model" \
	--reasoning-effort medium \
	--output-format streaming-json \
	--sandbox strict \
	--permission-mode dontAsk \
	--allow 'Read(**)' \
	--allow 'Write(**)' \
	--allow 'Edit(**)' \
	--allow 'Bash(mkdir *)' \
	--allow 'Bash(cp *)' \
	--allow 'Bash(cmp *)' \
	--allow 'Bash(node --check *)' \
	--allow 'Bash(find *)' \
	--allow 'Bash(ls *)' \
	--allow 'Bash(test *)' \
	--allow 'Bash(wc *)' \
	--disable-web-search \
	--no-memory \
	--no-subagents \
	--no-plan \
	--max-turns 60
