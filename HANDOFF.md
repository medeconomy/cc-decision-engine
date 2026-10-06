# Handoff — 2026-10-06

v0.1 built in one Claude Code session from the two CXCA v1.1 vault notes, forking the EMCA engine (which forked OVCA). This file is a dated snapshot; `CLAUDE.md` holds the standing rules.

## State

- `validate.py` → 0 errors; `tools/smoke.js` → OK (18 scenarios, 2 evidence pages, trial link, phone width 390 px).
- Design agreed with Jay before the build (SPEC C1–C4): trial-wide tiers for both histotypes with an HPV-independent flag; FIGO 2018 input mapped to 2009; adjuvant risk group derived from Sedlis / Peters criteria; both histotypes, five settings.
- Toxicity (`tox.json`, 46 trials) and labels (`labels.json`, 35 agents) were extracted by subagents with verbatim quotes / DailyMed setids.

## Waiting on Jay (judgement calls made in the build — SPEC C5–C12)

1. Carboplatin–paclitaxel **excluded** (not just cautioned) when cisplatin-naive (JCOG0505 OS 1.571).
2. Cemiplimab **excluded** after any prior PD-(L)1 (trial exclusion); tisotumab vedotin is the post-IO option.
3. GOG-240 bevacizumab + chemotherapy drops to tier 5 whenever the patient is checkpoint-inhibitor-eligible.
4. BEATcc tier 3 (interim OS); COMPASSION-16 tier 2 with a no-FDA-label caution.
5. STARS sequential chemoRT tier 3 on disease-specific survival; GOG-109 tier 2 without printed CIs.
6. Weekly-cisplatin adjuvant CCRT tier 5 (GOG-263, STARS); Tang 2012 tier 3 (adenocarcinoma-only RCT, no HR).
7. CALLA and OUTBACK tier 7 (negative trials) rather than tier 5.

## Discrepancies found during extraction (vault notes untouched)

See SPEC C12 and `tox.json` `_meta.disagreements`.

## Not done / possible next steps

- On-label flags on cards (KEYTRUDA §1.12 and LIBTAYO §1 wording is in `labels.json` `_meta`).
- Neuroendocrine / small-cell cervical carcinoma: no note. Fertility-sparing and surgical-approach questions (LACC, SHAPE) are context only.
- Extracts for the nine PDF-only adenocarcinoma phase II trials would let their toxicity attach.
