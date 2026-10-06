# CC Decision Engine — project notes for Claude Code

Static single-page app for Jay (吳晉睿, gynecologic oncologist, NTUH): an **evidence browser** of cervical cancer trials and a **treatment ranker** driven by a patient profile, for squamous cell carcinoma and adenocarcinoma. Data comes from Jay's Obsidian GO_MCP algorithm notes. Repo `medeconomy/cc-decision-engine` (public); GitHub Pages from `main` → https://medeconomy.github.io/cc-decision-engine/. Sibling of `medeconomy/ovca-decision-engine` and `medeconomy/emca-decision-engine` — same architecture, same rules.

Decision principle: **overall survival first, then toxicity against the patient's own risks, then the prior-therapy ledger.**

Read `HANDOFF.md` for current state and open items, `SPEC.md` for schema differences and the decisions (C1–C12), `README.md` for layout and ranking logic.

## Working with Jay

- **Discuss design before building.** For anything that changes what the ranker shows or how a tier is assigned, propose first and wait for his answer. Small fixes and data corrections can go straight in.
- **Never write the label "一句話"** in anything.
- Commit as `Jay Wu <cjwu00@gmail.com>`. Push to `main` deploys.
- Not clinical advice; every number on screen must be traceable (see Provenance).

## Architecture

- `index.html` — the whole app (HTML + CSS + one `<script>`), no build step. Loads `data/*.json` with `fetch()`; serve over HTTP.
- `HIST` keys `scc`, `adc`, each `{trials, regimens, meta}`. SCC is the base pool; adenocarcinoma records with `base` inherit **every** field they do not set (`inheritBase`).
- Ranker pipeline: `readPatient` → `gateOK` → `effectiveTier` → `assess` (drug_rules + risk_rules / prefer_when / ledger_rules / exclude_default / caution_default) → `sortKey` (tier, cautions − fits, G≥3) → `rank`.
- `syncSettings(h)` builds the Setting options from `meta.settings`, keeping only settings that have records in that pool.
- Toxicity is resolved at runtime: `toxFor(g, p)` → `tox.json` entry by label prefix + `arm` (or `arm_by_mmr`).
- `readPatient` maps a FIGO 2018 substage to 2009 (`mapStage`, `STAGE_2018`; IIIC → nodes positive + local stage from tumour size), derives `stage_group`, the adjuvant `risk_group` (low / intermediate / high from Sedlis and Peters criteria), `nhpva` from HPV status or IECC type, `io_eligible`, `prior_io`, `prior_platinum` and the PD-L1 CPS flags.
- Tiers: 1 OS replicated · 2 OS single phase 3 or NI to an OS-positive regimen · 3 borderline (DSS, interim, randomised phase II, no HR printed) · 4 PFS/DFS/recurrence · 5 no difference or the comparator that lost · 6 no phase 3 · 7 do not use. Both pools rank on the trial-wide result (C1); the validator requires every tier-7 record to state why.

## Commands

```
python3 -m http.server 8768           # serve
python3 tools/validate.py             # must print "errors: 0"
npm install && node tools/smoke.js    # 18 scenarios + browser pages + phone width; exit 1 on any page error
python3 tools/export_note.py <note.md> <hist> data/trials_<hist>.json --mode itt --overrides tools/overrides/<hist>.json
python3 tools/fetch_labels.py <outdir> [keys...]   # DailyMed SPL §1/§2/§4 text dump; rules are written by hand
```

Both pools use `--mode itt`. Run `validate.py` and `smoke.js` before every commit that touches `data/` or `index.html`; the smoke output lists every card per scenario, so say which ranking changes are intended.

## Provenance (non-negotiable)

1. Every HR / median / rate traces to a vault extract, a PubMed record or a protocol PDF; nothing from memory.
2. Label rules come from DailyMed SPL text, never reconstructed.
3. `"not_reported"` means the source does not report it. No estimation.
4. An all-histology trial that did not report the histotype is "included, not broken out" — its HR is shown as a trial-wide result, never as a histotype result.

## Source material (Jay's Mac)

- Vault `AIObsi`, `20_Area/Medicine/GO_MCP/GO_Algorithm/`: `CXCA_SquamousCell_Algorithm_v1.1`, `CXCA_AdenoCa_Algorithm_v1.1`. Extracts in `GO_summaries/`, PDFs in `GO_PDFs/`. Nine adenocarcinoma-only phase II trials have PDFs but no extract (no toxicity entry).
- Fetching papers: no bypassing bot detection, CAPTCHAs or paywalls; never pirate mirrors.

## Gotchas

- Prefer string concatenation to nested template literals inside `${}`. Syntax check: extract the `<script>` block and run `node --check`.
- `.fld[hidden]` must stay `display:none!important`.
- Trial names in `regimens_*.json` must match the exported row names exactly (`validate.py` checks); the exporter strips `*`, `⚠️` and reference markers and skips "—" placeholder rows.
- `tox_ref.trial` is a prefix of the `tox.json` label — include the " (" when a shorter label would also match (`Balstilimab (` vs `Balstilimab + zalifrelimab`, `Irinotecan (`).
- `loadData` slices the fetched files by `HIST_ORDER.length`; add a pool by extending `HIST_ORDER` / `HIST_LABEL` and the data files.
