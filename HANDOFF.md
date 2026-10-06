# Handoff — 2026-10-06

v0.1 built in one Claude Code session from the two CXCA v1.1 vault notes, forking the EMCA engine (which forked OVCA). This file is a dated snapshot; `CLAUDE.md` holds the standing rules.

## State

- `validate.py` → 0 errors; `tools/smoke.js` → OK (18 scenarios, 2 evidence pages, trial link, phone width 390 px).
- Design agreed with Jay before the build (SPEC C1–C4): trial-wide tiers for both histotypes with an HPV-independent flag; FIGO 2018 input mapped to 2009; adjuvant risk group derived from Sedlis / Peters criteria; both histotypes, five settings.
- Toxicity (`tox.json`, 46 trials) and labels (`labels.json`, 35 agents) were extracted by subagents with verbatim quotes / DailyMed setids.

## Reviewed by Jay (2026-10-06)

All build-time judgement calls (SPEC C5–C12) were accepted as written the same day. Nothing is waiting on Jay; validation with real cases is the next step.

## Discrepancies found during extraction (vault notes untouched)

See SPEC C12 and `tox.json` `_meta.disagreements`.

## Not done / possible next steps

- On-label flags on cards (KEYTRUDA §1.12 and LIBTAYO §1 wording is in `labels.json` `_meta`).
- Neuroendocrine / small-cell cervical carcinoma: no note. Fertility-sparing and surgical-approach questions (LACC, SHAPE) are context only.
- Extracts for the nine PDF-only adenocarcinoma phase II trials would let their toxicity attach.
