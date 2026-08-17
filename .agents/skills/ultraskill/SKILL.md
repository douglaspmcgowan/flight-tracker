---
provenance: "douglas-core"
name: ultraskill
description: "Add or change a skill so it reaches Claude, Codex and Cursor on every device, with provenance, budget and verification."
when_to_use: "Use whenever a new skill is being created, an existing skill is being edited, renamed, retired, or vendored from a third party, or a command is being promoted to a skill. Covers where canonical source lives, how each product reaches it, the description budget, the provenance stamp, licence capture for third-party packages, and the exact install-stamp-verify sequence. Trigger on /ultraskill, \"add a skill\", \"make this a skill\", \"install this skill\", \"promote this command\", or any request to change what skills exist."
---

## Work Scope routing

Before recording skill work, check the exact project path `.agents/work/state.json`. When it exists, the structured state is authoritative and the generated `PROJECT.md`, `TRACKS.md`, `TASK.md`, `BACKBURNER.md`, and `LOG.md` views are read-only.

- Load and follow the `work-scope` skill, including its guard, ownership, evidence, and handoff rules. The tools live in `.agents/tools/`, not inside the skill package, which carries only its `SKILL.md`.
- Validate, resume, and reconcile with the canonical `Test-WorkState.ps1`, `Get-WorkResume.ps1`, and `Reconcile-WorkState.ps1` tools.
- Record current-cell skill work through `Update-WorkState.ps1`, guard writes with `Test-WorkScopeGuard.ps1`, and bind completion to executed receipts from `Invoke-WorkScopeEvidence.ps1`.
- Route adjacent skills, deferred improvements, and new capability ideas through `Capture-WorkDiscovery.ps1`; use `New-WorkHandoff.ps1` for an independently owned outcome.
- A present but invalid state file fails closed. Never edit a generated view and never fall back to the legacy task files.

In an unenrolled legacy project, `TASK.md` and `BACKBURNER.md` keep their authored roles and are written directly.

*Recovered 2026-08-10. This block lived only in `commands/ultraskill.md`, which the block-3 pass deleted because a same-named canonical skill shadowed it — and unlike the other promoted capabilities, `ultraskill` already existed as a skill, so nothing copied the block across. `WorkScope.SkillRouting.test.ps1` was the only thing that noticed, and it noticed by failing on the missing command file rather than on the missing content.*

# Ultraskill — putting a skill into the harness

`writing-skills` owns **how to write one well**: the TDD loop, the flowchart discipline, the pressure tests. Read it first and do not restate it here.

This skill owns the two halves it does not cover. **How a skill gets into the harness and stays there** — where canonical source lives, how three products reach it, what it costs, and what proves it landed. And, when Douglas names a capability rather than a package, **how to find out what the skill should contain** before writing a line of it. Every rule below is one that was violated in practice before it was written down.

## The one rule everything else follows from

**Edit canonical source. Never edit a projection.**

Canonical is `<harness-repo>/.agents/skills/<name>/SKILL.md`. Everything under `~/.claude`, `~/.cursor`, and `~/.agents` is generated. A hand edit there is lost on the next `InstallGlobal`, is invisible to `git status`, and reaches no other device — the work simply evaporates, usually days later and silently.

## How each product reaches a skill

They are not symmetric, and assuming they are is the most common mistake.

| Product | How it reaches the skill | Wrapper needed? |
|---|---|---|
| **Claude Code** | `InstallGlobal` writes a thin `SKILL.md` wrapper into `~/.claude/skills/<name>/` pointing at `~/.agents/skills/<name>/SKILL.md` | Yes, generated |
| **Cursor** | Same generated wrapper into `~/.cursor/skills/<name>/` | Yes, generated |
| **Codex** | Reads `~/.agents/skills/` **natively as a skill root** — the installed canonical tree, directly | **No. Never write one.** |

Writing wrappers into `~/.codex/skills/` makes every skill appear **twice** in the model-visible prompt and evicts real skills off the end of the budget. `Manage-Harness.test.ps1` asserts that directory stays empty of harness wrappers. Codex's own `~/.codex/skills/.system/` and Cursor's `skills-cursor/` belong to those products' installers; never project into them and never delete them.

A canonical skill therefore carries its own `/name` ergonomics on all three products with no command file. **A same-named file in `commands/` is inert** — Claude Code resolves the conflict in the skill's favour. Promoting a command to a skill means the command file is now dead weight, not a fallback.

## The description budget — the constraint that bites

Codex's skill list is capped at **2% of the context window, or 8,000 characters when it is unknown**. Measured on this harness: a ~21,566-character budget, of which Codex's own system and plugin skills take 4,700–7,000. Past the cap Codex **omits whole skills, alphabetically, silently**. The tail vanishes and every verifier still reports green.

So:

- **`description` must be ≤ 150 characters.** `Compress-SkillDescriptions.ps1 -Verify` enforces it and is wired into `VerifyGlobal`.
- **Put the trigger prose in `when_to_use`.** Codex ignores that key entirely, so it costs nothing against the Codex cap. Claude Code **appends it to `description`** in its own listing (official Claude Code skills reference), capped at 1,536 characters for the two combined per entry — so on Claude it is not free, it is simply charged to a different budget.
- **Shortening means rewriting, not truncating.** A description cut mid-clause is a defect, not a compression. Douglas ruled this 2026-08-07 after a pass left eleven skills ending on a dangling article.
- **`disable-model-invocation: true` costs zero characters** and keeps `/name` working on Claude and Codex. Use it for anything that should be invokable but does not need the model to find it unprompted. This is the lever for bulk promotion. **Do not write the key by hand.** Since 2026-08-09 the policy is `~/.agents/manifests/skill-visibility.json` and the frontmatter is its projection — rule there, run `pwsh -File .agents/tools/Set-SkillVisibility.ps1`, and `VerifyGlobal` holds the two in step. A hand-written flag drifts from the manifest and fails that gate.

**Both of those keys reach a product only because the projection carries them, and until 2026-08-08 it did not.** The thin wrapper emitted `name` and `description` and nothing else, so all 51 canonical `when_to_use` values and all three `disable-model-invocation: true` declarations were silently discarded on Claude and Cursor — the trigger prose the compression pass had just finished moving out of `description` landed nowhere, and three packages marked as costing zero listing characters were listed in full. `Get-CanonicalSkillWhenToUse` and `Get-CanonicalSkillVisibilityLines` in `Manage-Harness.ps1` now carry all three keys through, and `Sync-ClaudeSkills.ps1` builds a byte-identical wrapper. If you change one, change both.

**Claude's budget is not as forgiving as this file used to claim.** The old text said Claude drops *descriptions* least-used-first and always keeps every skill *name*. Measured 2026-08-08 with 61 skills projected: **12 names were absent from the model-visible listing entirely**, `ultraskill` among them — which is how a skill becomes unfindable rather than merely quiet. The listing weight is set in `~/.claude/settings.json` via `skillListingBudgetFraction` (raised to `0.04` on this device to fit the full set) or the `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable. Measure the real weight rather than trusting the drop behaviour:

```powershell
(Get-Content "$HOME\.claude\skills\*\SKILL.md" |
  Select-String '^(name|description|when_to_use):' |
  ForEach-Object { $_.Line.Length } | Measure-Object -Sum).Sum
```

## Provenance is mandatory, and a wrong stamp is worse than none

Every `SKILL.md` carries a `provenance:` line as the **first frontmatter key**.

- Authored here → `provenance: "douglas-core"`
- Vendored → `provenance: "external: <owner>/<repo> (<licence>) -- origin and copyright recorded in .agents/skills/licenses/<folder>/"`

**Never stamp a third-party package `douglas-core`.** `wayfinder` carried that stamp while its own body said "This skill was authored by Matt Pocock". An unverified stamp invites a check; `douglas-core` asserts there is nothing to check, so the package sat inside the first-party set and was skipped by the sweep that resolved thirteen others.

Match on frontmatter `name`, never on folder name, when identifying an upstream. Upstream folder names routinely differ — `gpt-taste` ships in `gpt-tasteskill/`, `high-end-visual-design` in `soft-skill/`.

## Vendoring a third-party skill

1. **Capture the licence before anything else.** `.agents/skills/licenses/<upstream>/LICENSE` plus an `ATTRIBUTION.md` naming the repository, the SPDX id, the **verbatim copyright line**, and the date and method of verification. Redistributing without the notice is the actual obligation; a provenance stamp alone does not discharge it.
2. Reproduce the copyright line exactly as upstream wrote it. If it names no holder, say so rather than inferring one from the repository owner.
3. If there is no `LICENSE` file and the only grant is prose inside the skill, record it as *"MIT by author statement, no repo LICENSE"* — a manifest that says plain `MIT` overstates what was granted.
4. **Third-party packages get their frontmatter compressed and nothing else.** Douglas's standing rule. Byte-pinned packages in `UPSTREAM-PROVENANCE.json` are not touched at all — `Manage-Harness.test.ps1` verifies their tree hashes.
5. When harvested content outlives the package, say so in the attribution. The obligation follows the content, not the folder.

## The sequence

Order matters. `Stamp` before `InstallGlobal` fails, because `InstallGlobal` regenerates `INDEX.md` and the stamp would already be stale.

```powershell
$r = '<harness-repo>'
pwsh -File "$r\.agents\tools\Manage-Harness.ps1" -Action InstallGlobal
pwsh -File "$r\.agents\tools\Manage-Harness.ps1" -Action Stamp
pwsh -File "$r\.agents\tools\Manage-Harness.ps1" -Action All        # includes the command-projection gate
pwsh -File "$r\.agents\tools\Manage-Harness.test.ps1"               # includes gitleaks
```

`InstallGlobal` alone is enough for the skill to go live — `Install-HookPackage` and the skill projection run unconditionally inside it. `-ActivateHooks` only rewires product `settings.json` and is not needed for a skill change.

**Then verify it actually landed**, rather than trusting the tool's own report: diff the canonical file against `~/.agents/skills/<name>/SKILL.md`, and confirm the wrapper exists in `~/.claude/skills/<name>/`.

## Cross-device

A skill exists on one machine until it is pushed. `git status` clean and `git log origin/<branch>..HEAD` empty is the finish line; anything short of that is stranded work. **Never push without Douglas's explicit `[allow-push]`** — his authorization in one context does not carry to the next.

On the receiving device: `git pull`, then `InstallGlobal`. Nothing is copied by hand, ever.

## Before you create anything

The existing-system-first rule applies here more than anywhere, because a skill is the easiest artifact in this harness to duplicate by accident.

1. Read `.agents/INDEX.md` — the generated index of every skill and command with per-product visibility.
2. Search for the closest existing owner and **extend it** if one exists. A near-duplicate skill costs budget forever and splits the trigger space, so both fire weakly.
3. Record the search in task state: what was searched, what was found, why a new package was unavoidable.
4. Name the touch list before writing: `INDEX.md` (generated), `skill-projection-manifest.json` (generated), any `skills-manifest.json` binding, `MAP.md` if the change affects architecture, and the licence folder if third-party.

## Building one from a capability, rather than installing a named tool

When Douglas names the *problem* instead of the package — "build me a skill for X" — the work before the
install is research, and this is where it has historically gone wrong. `writing-skills` covers how to write
the file well. It does not cover how to find out what the file should contain.

**Step 0 — Resolve the capability.** What problem, which of his real repos are sensible live-test targets,
and any sources he already has in mind. If he named an exact tool to install, this is not that job.

**Step 1 — Research the real landscape.** GitHub, practitioner blogs, whatever he names. Take the 2–4
best-evidenced candidates, confirmed by direct fetch rather than a landing page's word.

Then sweep the **named practitioners**, not only repos and keywords. The strongest prior art is routinely one
person's working method filed under an adjacent topic that a domain-framed search never surfaces: building
`/design`, a "design process" search missed Matt Pocock's spec-planning workflow entirely because it is filed
under TypeScript and AI-coding, and it was folded in three days later by accident. Enumerate the known
individuals in this domain *and its neighbours* and check what each does differently.

**Step 1.5 — Build the domain completeness rubric before synthesizing.** Shape-complete and depth-complete are
separate bars, and this process used to check only the first. The 2026-07-16 build of `/make-api`, `/make-mcp`
and `/make-cli` shipped with every section a sibling had and still under-taught authorization, concurrency,
async, tool-poisoning and destructive-action safety — because nothing graded them.

The rubric is the checklist a staff engineer in the domain grades against: the named standard or threat model,
the failure and edge surface, the gotchas practitioners name. **Anchor every item to source actually fetched
in Steps 1–2.** A rubric the model writes from its own knowledge rewards its own blind spots and launders
shallowness into a green score. Keep items binary — covered, or `scoped-out — reason` — so verbosity cannot
game them. This matches Anthropic's own guidance: build the evaluations before the documentation.

**Step 2 — Read the source, not the pitch.** Fetch the real `SKILL.md` of each finalist. Where practical, run
the strongest one against a real target first: a live run surfaces what no description does — an undocumented
result schema, a `--help` that throws instead of printing usage.

**Step 3 — Synthesize one coherent skill, not a bundle.** Match the register of the canonical skills already
in `.agents/skills/`, and include a **"What this is NOT"** section disambiguating against every adjacent one.
That section is where redundancy gets caught before building rather than after — and in this harness a
near-duplicate is not merely untidy, it permanently costs Codex budget and splits the trigger space so both
skills fire weakly.

The bar is rubric coverage, not section presence. Every rubric item is covered or explicitly scoped out. One
rule the 2026-07-16 gap makes non-negotiable for a skill that BUILDS something: it must design its produced
artifact's own security, safety and edge-handling in. Deferring the whole hardening surface to a later review
pass is disallowed.

**Step 3.5 — Approval gate.** Writing into the canonical tree, and every registration that follows, changes
Douglas's harness on every device. Stop and present the name, the one-line purpose, the exact path, and every
registration or settings change, before making any of them. A generic "build me a skill" does not
pre-authorize the harness write. Research, synthesis and isolated testing before this point need no approval.

**Step 4 — Verify the artifact, never the report.** A build agent can hit a transport failure *after* its
write committed the file and *before* its return value came back, then confidently report "never built"
against a file that exists and is nearly complete — which is exactly what happened building `/probe`. So read
the real file yourself before accepting any verdict, success or failure. If it exists but the agent claimed
failure, assess it and fix the concrete gap rather than re-running the whole build; the missing piece is
usually the longest tail-end block, since that is what a cut response drops.

**Step 5 — Wire it in.** A skill nothing points to only runs when he remembers the name exists. From the Step-3
adjacency list, separate neighbours merely disambiguated from ones genuinely complementary — where a sibling's
*existing* step would actually reach for this capability — and wire those, cheapest form that works: a real
handoff where it should run, a one-line cross-reference where it should just be findable. **Zero wire points
is a valid finding.** Forcing a reference into a skill that does not need it is noise. These are harness edits
and ride the same approval gate.

**Step 6 — Report.** Path and name; what was synthesized from where and what was left out and why, so he can
judge the synthesis rather than trust that it happened; the live-test results including what broke; the rubric
coverage table; and limitations stated plainly. Fold any depth gap found by *using* the skill back into both
the skill and the rubric.

### Improving an existing skill

Same discipline, different target: research how other practitioners solve the problem the skill already
addresses, identify evidenced gaps rather than manufacturing busywork, and edit the existing file in place.
Never a new file — that is how the harness grows two skills where it had one.

### The light path, and its two gates

The full loop is right for a skill that builds a security-bearing artifact. It is overweight for a prose
procedure wrapping a local surface already read this session, where a fan-out mostly re-reads what you already
know. The light path may be taken only when **both** hold, stated explicitly in one line:

1. The produced artifact has **no executable security surface** — no server, no parser on untrusted input, no
   auth surface, no destructive-action path. Any of those, and the depth audit is exactly the guard for the
   gap they hide.
2. The domain surface is small and already in front of you, so synthesis needs no fresh landscape sweep.

It changes only how the skill is built and verified, never the bar. The rubric, the approval gate, the wiring
and the honest report all still apply, and verification means **exercising the procedure once against a real
low-stakes target** — following it end to end, running any executable fragment it contains. A skill claimed
verified on a read-through is a failed run; say so and fix it.

## Retiring one

Retirement is a deletion and needs Douglas's explicit word — archive by default. Before proposing it: grep for every consumer (`commands/`, `.agents/`, manifests, other skills), confirm the capability is genuinely covered elsewhere or **harvest what is not** into the surviving owner first, and check `UPSTREAM-PROVENANCE.json` — deleting anything byte-pinned breaks the attestation and the test gate.

---

## The two gates on the light path, stated

*Moved here 2026-08-08 from `<repo>/commands/ultraskill.md`, which could never run — a same-named skill shadows
a command file, so `/ultraskill` has only ever reached this document. The light path above names two gates
without saying what they are; here they are, verbatim.*

### Eligibility gate (both must hold — if either fails, refuse `--fast` and run full Build Mode)

1. **No executable security surface in the produced artifact.** The new skill is a prose procedure (a `.md`
   command), not a tool that stands up an API/MCP/CLI/protocol server, a parser on untrusted input, an auth
   surface, or a destructive-action path. Any of those → full Build Mode, because the depth audit is exactly
   the guard for the gap those artifacts hide.
2. **The domain surface is small and already read this session** (or trivially readable inline now) — the 2-4
   real files/schemas the skill composes over are in context, so synthesis needs no fresh landscape sweep. If
   the capability still needs genuine open-web landscape research the caller hasn't already done, run full
   Build Mode (or at least full Step 1 first).

State explicitly, in one line, that both gate conditions hold before proceeding — if you can't, you're not
eligible for `--fast`.

### Fast procedure (replaces Steps 4–5 only; every other step is unchanged)

Run Build Mode Steps 0–3.5 exactly as written — resolve the capability, do (or confirm you already did) the
research, **build the Step-1.5 domain rubric**, read the real source of what you compose over, synthesize
matching the sibling register (`spar`/`hone`/`probe`) **and** the Skill authoring checklist, and clear the
Step-3.5 approval gate. Then, instead of Step 4's background Workflow and Step 5's after-the-fact artifact
check:

1. **Write the skill file inline** (Opus judgment is the caller's own here) — the full file, covering every
   rubric item or marking it `scoped-out — reason`, in one pass.
2. **Verify for real — exercise it once, don't read it back.** This is the load-bearing replacement for the
   dropped Test + Depth-Audit phases, so it is not optional and not a re-read. For a prose skill with no
   directly-runnable logic: actually FOLLOW the new procedure once, end to end, against ONE real low-stakes
   target, and report concretely what happened (what the mechanism produced, what broke, what was awkward). If
   the skill has any executable fragment (a CLI call, an enqueue command, a script), RUN that fragment against
   a real target. A skill claimed "fast-verified" on a read-through only is a failed run — say so and fix it.
3. **Self-administer the rubric.** Grade the written file against the Step-1.5 rubric yourself, one verdict per
   item (PRESENT / SHALLOW / ABSENT / scoped-out). Fast mode trades the *fresh-context adversarial* auditor
   for the caller's own honest grading — so hold the line: any SHALLOW/ABSENT with no scoped-out reason gets
   fixed inline before reporting, exactly as a revise round would.
4. **Then resume the normal tail** — Step 5.5 wiring and Step 6 report, unchanged, including the rubric
   coverage table (now self-graded) and the same honesty register.

Fast mode never skips: the rubric, the approval gate, the real-exercise verification, the authoring
checklist, the wiring, or the honest report. It skips only the background multi-agent fan-out and the separate
fresh-context depth auditor — and only for a prose skill whose domain was already in front of you.

## Safety constraints

- Never run with elevated/bypass permissions for any part of this process.
- All live-testing against real repos happens in isolated, cleaned-up git worktrees — never the caller's
  main tree.
- No commits, unless Douglas separately asks for that.
- **Any change to Douglas's harness requires his explicit approval first, in BOTH modes.** Writing a new
  command file, editing an existing skill, `claude mcp add`, a `settings.json`/hook edit, a Claude Desktop
  entry, or the tracked-mirror sync each change his harness — present the exact change and get a yes before
  making it (Build Mode Step 3.5, Improve Mode Step 3). Research, synthesis, and worktree testing need no
  approval; touching `~/.claude` or settings does.
- Writing the new skill file itself is the one direct, in-place write this command makes, and it happens
  only after that approval gate — everything else (test targets, mutation/trial work inside a built skill's
  own test phase) stays isolated per that skill's own safety constraints. That write goes to **canonical
  source**, `<harness-repo>/.agents/skills/<name>/SKILL.md`, per *The one rule everything else follows from*
  above. `~/.claude/` is populated but generated: it does exist, and writing a skill there is still wrong,
  because `InstallGlobal` overwrites it. This line named `~/.claude/commands/` as the write target until
  2026-08-15, which contradicted that rule two hundred lines earlier in the same file.
