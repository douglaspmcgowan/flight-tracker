# Classification — worked examples

Read `../SKILL.md` first. This file only exercises the test; it does not restate it.

The three gates, short form: **Substitution** (does a noun-replaced rewrite read as a rule he would endorse elsewhere?), **Counterfactual** (would it change the next unrelated task?), **Authority** (his own words?). Disqualifier: **Reversal** (could he have wanted the opposite on a different day?).

## Clear task adjustments

| Statement | Why |
|---|---|
| "Actually put that in the other folder." | Substitution fails — the rewrite has no content of its own. |
| "Do the tracker first, then the harness." | Sequence within current work. Counterfactual fails: nothing to apply next time. |
| "Skip the tests on this one, it's a doc change." | Reversal disqualifier — he would say the opposite about a code change. Situational. |
| "Add the two policies to AGENTS.md too." | Scope change to the current task. |

## Clear intent clarifications

| Statement | Why |
|---|---|
| "nothing more, nothing less" | Substitution produces a standing build rule. Counterfactual changes every future build. Not reversible — he does not want scope creep on other days. |
| "The purpose of the intent doc is so you can make the decisions." | "The purpose of X is" — a stated principle, general on its face. |
| "Never push without asking me." | General phrasing, irreversible, and changes every future session. |
| "I want reports to lead with the outcome." | "I want X to be Y" over a class of artifacts. |

## The hard ones

These are where the test earns its keep.

**"Always archive that instead of deleting it."** — said about one folder.
Phrasing says intent ("always"). Substitution passes: "archive rather than delete **material of kind X**" reads as a real rule. Reversal: would he want a temp file archived? Probably not, but the rule as written does not claim that. **Verdict: BINDING**, because a second independent occurrence already exists — `MAP.md` encodes archive-not-delete for retired subsystems. Without that corroboration it would have been PROVISIONAL despite the word "always".

**"Just make it work, I don't care how."** — said at 2am after a long failure.
Phrasing is general. Substitution produces "prioritize working output over quality of approach", which contradicts several BINDING entries. Reversal disqualifier fires hard: on a rested day he wants the opposite. **Verdict: not recorded at all.** Frustration under pressure is not a standard. Treat it as authorization to proceed on the current task and nothing more.

**"Don't ask me about this again."** — after a specific approval.
Ambiguous between "this class of thing needs no approval" (intent) and "stop asking about this one item" (task). Substitution is only decidable if you know how wide "this" is. **Verdict: PROVISIONAL**, scoped to the narrowest reading that is still useful, tagged with the item it came from, confirmed at the next checkpoint. Recording the wide reading would silently remove a gate — the exact over-promotion failure.

**"That's not what I meant, I wanted the summary at the top."**
Reads like a correction to one document. Substitution: "put the summary at the top of **a document of kind X**" — plausible as a standing rule, but he did not say it about a class. Authority gate passes on the words, generality does not. **Verdict: PROVISIONAL.** If he says something equivalent on a different artifact later, that second occurrence promotes it. This is the normal path: most real standing preferences arrive twice.

**An agent notices Douglas always reviews the diff before a commit.**
No statement at all. Authority gate fails outright. **Verdict: PROVISIONAL at most**, marked `relayed`/inferred, and it can never become BINDING until he says something. Behavioral inference is the highest-variance source there is.

## Splitting a mixed message

> "Fix the header on that page — and generally, I don't want you touching anything I didn't ask about."

Two statements. The first is a task adjustment and goes to task state. The second is an intent clarification: "generally" plus a general object, substitution passes, not reversible. It corroborates the existing *Build exactly what the requirement names* entry rather than creating a new one — a second occurrence of an existing entry is logged under that entry, never recorded as a duplicate.

## Nothing new

A message with no new statement of preference produces no write. Most messages are this. The correct output of the classification step is usually "task adjustment only, no intent change" and that is worth exactly zero lines in the report.
