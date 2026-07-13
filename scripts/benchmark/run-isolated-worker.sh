#!/usr/bin/env bash

set -euo pipefail

usage() {
	cat <<'EOF'
Usage:
  CODEX_RUNTIME_ROOT=/path/to/self-contained-codex-runtime \
  OPENAI_API_KEY=... \
  scripts/benchmark/run-isolated-worker.sh /tmp/sitegeist-worker-XXXXXX

Environment:
  CODEX_RUNTIME_ROOT  Required. Directory containing only the Codex executable
                      and its runtime dependencies; mounted read-only.
  CODEX_EXECUTABLE    Path inside CODEX_RUNTIME_ROOT (default: bin/codex).

Linux only. The script uses Bubblewrap to make the worker the sole writable and
project-visible directory. It intentionally does not mount $HOME or the parent
repository. It does not disable networking because codex exec needs its API.
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

if [[ ! -d "$worker" || ! -f "$worker/WORKER.md" || ! -f "$worker/brief.md" ]]; then
	echo 'run-isolated-worker: worker must come from prepare-run.mjs' >&2
	exit 1
fi
if [[ -z "$runtime_root" || ! -d "$runtime_root" ]]; then
	echo 'run-isolated-worker: CODEX_RUNTIME_ROOT must name a self-contained runtime directory' >&2
	exit 1
fi
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
	echo 'run-isolated-worker: OPENAI_API_KEY is required because host auth/config is not mounted' >&2
	exit 1
fi
case "$codex_executable" in
	/* | *'..'*)
		echo 'run-isolated-worker: CODEX_EXECUTABLE must be a safe path relative to CODEX_RUNTIME_ROOT' >&2
		exit 1
		;;
esac
if [[ ! -x "$runtime_root/$codex_executable" ]]; then
	echo "run-isolated-worker: executable not found: $runtime_root/$codex_executable" >&2
	exit 1
fi

worker="$(cd -P "$worker" && pwd)"
runtime_root="$(cd -P "$runtime_root" && pwd)"

system_mounts=()
for system_path in /usr /bin /sbin /lib /lib64 /etc; do
	if [[ -e "$system_path" ]]; then
		system_mounts+=(--ro-bind "$system_path" "$system_path")
	fi
done

exec bwrap \
	--die-with-parent \
	--new-session \
	--unshare-user \
	--unshare-pid \
	--unshare-ipc \
	--unshare-uts \
	--unshare-cgroup-try \
	--clearenv \
	--setenv HOME /home/codex \
	--setenv PATH /opt/codex-runtime/bin:/usr/bin:/bin \
	--setenv TMPDIR /tmp \
	--setenv OPENAI_API_KEY "$OPENAI_API_KEY" \
	"${system_mounts[@]}" \
	--proc /proc \
	--dev /dev \
	--tmpfs /tmp \
	--dir /home \
	--dir /home/codex \
	--ro-bind "$runtime_root" /opt/codex-runtime \
	--bind "$worker" /workspace \
	--chdir /workspace \
	"/opt/codex-runtime/$codex_executable" exec \
	--ephemeral \
	--ignore-user-config \
	--ignore-rules \
	--sandbox workspace-write \
	--skip-git-repo-check \
	-c 'web_search="disabled"' \
	-C /workspace \
	'Read /workspace/WORKER.md and /workspace/brief.md. Create exactly one complete submission in /workspace/submission. Do not inspect or reference anything outside /workspace.'
