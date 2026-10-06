# CC Decision Engine

Evidence browser and patient-driven treatment ranker for cervical carcinoma: squamous cell carcinoma (SCC) and adenocarcinoma (ADC, including adenosquamous; HPV-associated and HPV-independent types). Third sibling of the [OVCA](https://github.com/medeconomy/ovca-decision-engine) and [EMCA](https://github.com/medeconomy/emca-decision-engine) Decision Engines.

Decision principle: **overall-survival benefit first → evidence-strength qualifier → PFS-only tier collapsed below → adverse-effect profile decides among survivors → prior-therapy ledger removes or demotes drugs already used.**

## Layout

| Path | What it is |
|---|---|
| `index.html` | Single-page app. View 1: ranker (patient profile → tiered list; histology picks the pool). View 2: evidence browser (histology switch → setting tabs 1A/1B/2A/2B/3A/3B/4, outcome and evidence-level filters, PubMed-linked references). No build step. |
| `data/trials_{scc,adc}.json` | Exports of `CXCA_SquamousCell_Algorithm_v1.1` (53 rows, 73 refs) and `CXCA_AdenoCa_Algorithm_v1.1` (71 rows, 109 refs) by `tools/export_note.py`; `out` / `level` reviewed row by row in `tools/overrides/`. |
| `data/regimens_scc.json` | 42 treatment × setting records — the base pool. Adjuvant (RT, CCRT, sequential), definitive CCRT (backbone, schedule, induction, IO, adjuvant), first-line R/M, 2L+, neoadjuvant. |
| `data/regimens_adc.json` | 54 records; a record with `base` inherits every unset field from the SCC record. Adds the adenocarcinoma-only trials and the HPV-independent cautions. |
| `data/tox.json` | 46 trials, per-arm grade ≥3 / discontinuation / dose-reduction with verbatim evidence quotes from `GO_summaries/`. |
| `data/labels.json`, `data/drug_rules.json` | DailyMed §1/§2/§4 rules for 35 agents; baseline-risk rules per drug. |
| `SPEC.md` | Schema differences and decisions C1–C12. |
| `tools/` | `export_note.py`, `fetch_labels.py`, `validate.py`, `smoke.js`, `overrides/*.json`. |

## Ranking logic

1. **Gate** by histology, setting, FIGO 2009 stage (FIGO 2018 input translated and shown), adjuvant risk group derived from Sedlis / Peters criteria, nodes, HER2, HPV status, prior platinum / prior PD-(L)1.
2. **Tier**: 1 replicated OS · 2 single phase 3 OS (or non-inferior to one) · 3 borderline (disease-specific survival, interim, randomised phase II, no HR printed) · 4 PFS/DFS/recurrence only · 5 no difference or the comparator that lost · 6 no phase 3 · 7 do not use / negative / histotype excluded. SCC and adenocarcinoma both rank on the trial-wide result; SCC-only trials are tier 7 for adenocarcinoma; HPV-independent adenocarcinoma carries its own cautions.
3. **Exclude** on label contraindications and trial exclusions matched to baseline-risk flags (ocular disease → tisotumab vedotin; CrCl <60 → cisplatin; prior pelvic RT → bevacizumab fistula caution); the ledger excludes prior-PD-(L)1 patients from the IO-naive trials.
4. **Order within a tier** by cautions minus fits, then grade ≥3 any-cause.

## Running locally

```
python3 -m http.server 8768
python3 tools/validate.py              # must print "errors: 0"
npm install && node tools/smoke.js     # 18 headless scenarios + browser pages + phone width
```

Not clinical advice. Built for one gynecologic oncologist's own decision support; every recommendation carries its source so it can be checked.

## License

Code (`index.html`, `tools/`): MIT. Data files under `data/`: CC BY 4.0 (see `data/LICENSE`).
