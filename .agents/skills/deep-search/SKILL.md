---
name: deep-search
description: Multi-step web research with query fan-out, iterative deepening, human-authored sources (Reddit, HN, practitioner blogs), and inline citations. Use when the user asks to "research X", "find everything about Y", "what do people think about Z", or any question needing 3+ sources or subjective judgment.
---

# /deep-search

## Phase 1 — Clarify (skip if the query is already unambiguous)

- Ask 1–3 targeted clarifying questions: scope, recency requirements, depth, and what a "good answer" looks like.
- Do not browse until the user confirms or explicitly says "just go."

---

## Three-stage search model

Research runs in three stages. Each stage informs the next — the model decides what to pursue based on what it actually found, not a pre-planned query list. Stage 3 is optional; skip it if Stage 2 already covered everything.

---

## Stage 1 — Orient (3–5 queries, run in parallel)

**Goal:** Get the lay of the land. What are the main angles, camps, and open debates on this topic? What don't we know yet?

- Issue 3–5 broad exploratory queries in a SINGLE parallel message. Fewer than Stage 2 — you're orienting, not exhausting.
- At least one query should be contrarian or skeptical ("why X doesn't work," "criticisms of X," "X downsides").
- Include one search targeting community/practitioner sources: `site:reddit.com`, `site:news.ycombinator.com`, or a known practitioner blog.
- After reading results, write a brief **orientation note** (not the final answer): what are the 3–5 most interesting threads? What's already clear? What's still murky?
- **If the output is a file/report**: Write the stub file NOW with section headers. A stream-idle timeout during later stages otherwise erases everything; an early stub survives it.

---

## Stage 2 — Directed deep dives (model-chosen scope, typically 5–10 queries, run in parallel)

**Goal:** Go deep on the threads that actually look valuable, based on Stage 1 findings. The model decides which angles to pursue and how many queries to fire.

- Choose queries based on what Stage 1 surfaced — don't repeat covered ground, don't chase dead ends.
- Scale the fan-out to the complexity: a narrow question might need 4–5 queries; a broad comparison might need 8–10.
- **Prioritize human-authored sources over vendor docs and SEO content:**
  - `site:reddit.com` + topic (especially r/ClaudeAI, r/LocalLLaMA, topic-specific subreddits)
  - `site:news.ycombinator.com` + topic
  - Practitioner blogs: Simon Willison (simonwillison.net), Ethan Mollick (oneusefulthing.org), Latent Space, Every.to, Dan Shipper, Jesse Vincent (blog.fsck.com), Addy Osmani, Anthropic/OpenAI engineering blogs
  - X/Twitter posts from credible practitioners
  - YouTube breakdowns from technical practitioners (not ad-driven review channels)
- For subjective questions — reviews, comparisons, "which is better," "how do I," "what do people prefer" — human-written posts and comments from credible people are PRIMARY sources, not supporting evidence. A thoughtful Reddit comment from an experienced user often carries more truth than a vendor landing page. Weight accordingly.
- WebFetch the 5–8 most promising URLs from search results in parallel. Prefer: primary sources, peer-reviewed papers, .gov/.edu, first-party engineering blogs, credible practitioner posts, high-signal Reddit/HN threads. Skip: SEO listicles, AI-generated summary sites, content farms.
- After reading, update the synthesis: what's confirmed by ≥2 sources? What's single-source only? What's still open?
- Re-Write the stub file (if one exists) with latest synthesis.

---

## Stage 3 — Gap-fill and triangulate (optional, model-decides)

**Goal:** Close specific open questions and triangulate single-source claims. Skip this stage if Stage 2 already covered everything.

- The model decides whether Stage 3 is needed. Criteria to run it: (a) a key claim has only 1 source, (b) a specific sub-question is still unanswered, or (c) two sources contradict each other and the contradiction matters.
- Issue targeted queries only — 2–6 searches aimed at exactly the gaps, not broad re-coverage.
- After reading, finalize synthesis. Re-Write the report file.

---

## Phase 6 — Synthesize with inline citations

- Attach a URL to EACH factual claim inline — `[per source](url)` — not a bibliography at the end.
- Flag single-source claims explicitly: "single source, unverified: ..."
- Flag contradictions between sources explicitly; do not pick a winner silently.
- For subjective questions, quote human practitioners verbatim where possible — a real user's voice carries more signal than a paraphrase.
- Close with a "Sources" list grouped by type: primary / practitioner / community.

---

## Execution model — inline vs dispatch

- **Inline** (run in your own context): ≤12 total web calls across all three stages, Stage 3 not needed. Fits in one API stream window.
- **Dispatch with the product's available subagent mechanism**: use when total calls exceed 12, Stage 3 adds significantly more fetches, or the primary context needs to stay free. Encode all three stages into the brief and require incremental durable writes. Continue inline when the product has no subagent mechanism.
- Sub-agents that time out cannot be resumed — work not written to disk is lost. Write-early, write-often.

---

## Gotchas

- WebSearch is US-only; it runs inside a single API call.
- Long active runs (~15+ min of continuous tool use) can hit API stream-idle timeouts. The session dies without flushing output. Mitigations: smaller fan-outs, dispatch to background agent, always Write the report file after each stage.
- WebFetch is public URLs only — authenticated pages (Google Docs, private GitHub, Confluence) fail. Use `gh` CLI for GitHub.
- Results cached 15 min per URL; re-fetches within that window are free.
- Cross-host redirects are NOT auto-followed — re-fetch the new URL.
- When the user asks about a product/feature, always search before claiming it doesn't exist.
