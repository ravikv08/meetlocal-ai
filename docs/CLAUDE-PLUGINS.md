# Claude Code Plugin Stack — Install Guide

**Stack:** `claude-mem` · `code-review` · `graphify` · `rtk` · `voltagent-core-dev` · `voltagent-dev-exp` · `voltagent-qa-sec`

> ⚠️ These tools are **not** all installed the same way. They split across three different install mechanisms. Run the prerequisite check first, then follow the recommended order at the bottom.

---

## TL;DR — Install Mechanism Map

| Tool | Mechanism | Source |
|------|-----------|--------|
| `code-review` | Claude Code marketplace plugin | `anthropics/claude-code` |
| `claude-mem` | Claude Code marketplace plugin | `thedotmack/claude-mem` |
| `voltagent-core-dev` | Claude Code marketplace plugin | `VoltAgent/awesome-claude-code-subagents` |
| `voltagent-dev-exp` | Claude Code marketplace plugin | `VoltAgent/awesome-claude-code-subagents` |
| `voltagent-qa-sec` | Claude Code marketplace plugin | `VoltAgent/awesome-claude-code-subagents` |
| `graphify` | Python CLI (pipx / uv) | `safishamsi/graphify` (pkg: `graphifyy`) |
| `rtk` | Rust CLI binary (brew / cargo) | `rtk-ai/rtk` |

**Key fact:** Claude Code plugins install at **user scope** (`~/.claude/plugins/`), not per-project. To gate them per-repo, use `.claude/settings.json` with an `enabledPlugins` allowlist (see [Per-Project Scoping](#per-project-scoping)).

---

## 1. Prerequisites

Run these checks before installing anything:

```bash
# Claude Code is current and plugins beta is enabled
claude --version
claude update

# Node.js 18+ (required by claude-mem)
node --version

# Python 3.10+ (required by graphify)
python3 --version

# Optional but recommended installers
brew --version    # macOS/Linux package manager
pipx --version    # isolated Python CLI installer
cargo --version   # Rust toolchain (if not using brew for rtk)
```

If any of these are missing:

```bash
# pipx (macOS)
brew install pipx && pipx ensurepath

# pipx (Linux)
python3 -m pip install --user pipx && python3 -m pipx ensurepath

# Node.js — use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
```

---

## 2. Claude Code Marketplace Plugins

These are installed via the `/plugin` slash command **inside an active Claude Code session**, not from your shell.

### 2.1 `code-review` (Anthropic official)

Automated PR review with confidence-based filtering and multiple specialist agents.

```text
/plugin marketplace add anthropics/claude-code
/plugin install code-review@claude-code-plugins
```

### 2.2 `claude-mem` (persistent memory)

Captures session activity, compresses with AI, injects relevant context into future sessions. SQLite storage, local-first.

```text
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem@thedotmack-claude-mem
```

> ❗ **Do not** run `npm install -g claude-mem`. That installs the SDK only — it does **not** register the plugin hooks or start the background worker. Always go through `/plugin`.

After install, restart Claude Code. Settings live at `~/.claude-mem/settings.json` (auto-created on first run).

### 2.3 VoltAgent subagent packs (3 plugins, 1 marketplace)

Add the marketplace once, install all three:

```text
/plugin marketplace add VoltAgent/awesome-claude-code-subagents
/plugin install voltagent-core-dev
/plugin install voltagent-dev-exp
/plugin install voltagent-qa-sec
```

| Plugin | Coverage |
|--------|----------|
| `voltagent-core-dev` | Backend, frontend, mobile, fullstack, API design specialists |
| `voltagent-dev-exp` | Developer experience, tooling, DX optimization agents |
| `voltagent-qa-sec` | Security auditor, pentester, code reviewer, QA expert, compliance |

> ⚠️ **Known bug — `voltagent-qa-sec` v1.1.0:** The plugin manifest references two agent files that don't exist (`cost-accounting-performance-reviewer.md`, `performance-roi-translator.md`), which causes the **entire plugin to fail to load** — blocking all 16 working agents. Tracked in [issue #240](https://github.com/VoltAgent/awesome-claude-code-subagents/issues/240). Workaround: pin an earlier version, or wait for the patched release.

---

## 3. `graphify` — Knowledge Graph CLI

Python-based AST + semantic knowledge graph. Pre-computes a queryable graph so Claude reads `graphify-out/GRAPH_REPORT.md` instead of greping your whole codebase.

### Install

```bash
# Preferred: pipx (isolated, on PATH automatically)
pipx install graphifyy

# Alternative: uv
uv tool install graphifyy

# Fallback: plain pip
pip install graphifyy
```

> Package name is `graphifyy` (two y's). Command is `graphify` (one y).

### Wire it into Claude Code

```bash
cd /path/to/your/project
graphify install              # bootstraps graphify-out/
graphify claude install       # writes CLAUDE.md directive + PreToolUse hook
graphify hook install         # optional: auto-rebuild graph on git commits
```

Then inside Claude Code:

```text
/graphify .
```

This builds the initial graph. The `PreToolUse` hook makes Claude consult the graph before every `Glob` / `Grep` call.

### Gitignore

```bash
echo -e "\n# Knowledge graph outputs\ngraphify-out/" >> .gitignore
```

---

## 4. `rtk` — Rust Token Killer (CLI Output Compressor)

Intercepts Bash tool calls, runs the command, compresses the output (60–90% token reduction) before it hits Claude's context window. Works at the hook layer — no command changes required.

### Install

```bash
# macOS / Linux
brew install rtk-ai/tap/rtk

# Cross-platform (Rust toolchain required)
cargo install rtk
```

### Wire it into Claude Code

```bash
# Global (recommended) — works across all projects
rtk init -g

# Or single-project only
rtk init
```

`rtk init -g` does the following:
- Installs hook at `~/.claude/hooks/rtk-rewrite.sh`
- Creates `~/.claude/RTK.md` (~10 tokens of meta-instructions)
- Adds `@RTK.md` reference to `~/.claude/CLAUDE.md`
- Prompts to patch `settings.json` (writes timestamped backup first)

### Verify

```bash
rtk init --show     # confirms hook installation + executability
```

After install, restart Claude Code. Test by running `git status` inside a session — it should be auto-rewritten to `rtk git status` transparently.

---

## 5. Recommended Install Order

Stack the layers so each tool benefits from the ones below it:

```
1. rtk             ← proxy layer; compresses Bash output for everything else
2. graphify        ← knowledge graph; reduces file-search token waste
3. claude-mem      ← persistent memory across sessions
4. code-review     ← Anthropic PR-review toolkit
5. voltagent-*     ← specialist subagents (core-dev → dev-exp → qa-sec)
6. Restart Claude Code
7. Verify with `claude plugin list`
```

---

## 6. Verification

After everything is installed, sanity-check with these commands:

```bash
# Claude Code plugins active at user scope
claude plugin list

# rtk hook
rtk init --show

# graphify on PATH
graphify --help

# All Claude Code hooks
ls -la ~/.claude/hooks/

# Inspect what was patched in settings
cat ~/.claude/settings.json | jq .
```

Expected output of `claude plugin list` should include:

```
code-review@claude-code-plugins           ✓ loaded
claude-mem@thedotmack-claude-mem          ✓ loaded
voltagent-core-dev@voltagent-subagents    ✓ loaded
voltagent-dev-exp@voltagent-subagents     ✓ loaded
voltagent-qa-sec@voltagent-subagents      ✓ loaded   (or ✘ failed — see known bug)
```

---

## 7. Per-Project Scoping

Claude Code plugins install **globally** to `~/.claude/plugins/`. To enable specific plugins only for one repo, commit a `.claude/settings.json` at the repo root:

```json
{
  "enabledPlugins": [
    "code-review@claude-code-plugins",
    "claude-mem@thedotmack-claude-mem",
    "voltagent-core-dev@voltagent-subagents"
  ]
}
```

`rtk` and `graphify` are inherently per-project when installed without the `-g` / global flag (their hooks land in `./.claude/` of the current working directory).

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/plugin` command not recognized | `claude update` — plugins are in public beta and require recent versions |
| `claude-mem` installed but no context appears | You ran `npm install -g claude-mem` instead of `/plugin install`. Uninstall the npm package, then use `/plugin`. |
| `voltagent-qa-sec` shows `✘ failed to load` | Known bug in v1.1.0 — see Section 2.3. Pin earlier version or wait for patch. |
| `graphify: command not found` | pipx PATH not initialized. Run `pipx ensurepath` and restart shell, or use `python3 -m graphify`. |
| `rtk init` fails to patch settings | Run with `--auto-patch` to skip prompt, or `--no-patch` to get manual instructions. Backup at `~/.claude/settings.json.bak`. |
| Marketplace `add` succeeds, `install` fails | Restart Claude Code between the two commands. |
| Everything installed but feels slow | Check `~/.claude/settings.json` for hook overlap. Disable `voltagent-meta` if you have it — it's heavy and only useful with other categories active. |

---

## 9. Uninstall (if needed)

```bash
# Marketplace plugins
/plugin uninstall <plugin-name>@<marketplace>
/plugin marketplace remove <marketplace>

# graphify (all platforms at once)
graphify uninstall
graphify uninstall --purge    # also deletes graphify-out/

# rtk
rtk uninstall                  # reverses hook + settings patch
# Or manually:
brew uninstall rtk             # or: cargo uninstall rtk
rm ~/.claude/hooks/rtk-rewrite.sh
# Restore: mv ~/.claude/settings.json.bak ~/.claude/settings.json
```

---

## 10. References

- Anthropic Claude Code plugins: https://anthropic.com/news/claude-code-plugins
- Claude Code official marketplace: https://github.com/anthropics/claude-code
- claude-mem: https://github.com/thedotmack/claude-mem
- VoltAgent subagents: https://github.com/VoltAgent/awesome-claude-code-subagents
- Graphify: https://github.com/safishamsi/graphify
- RTK: https://github.com/rtk-ai/rtk · https://www.rtk-ai.app/

