# CC Decision Engine — Data Schema & Decisions v0.1

Third sibling of the OVCA and EMCA Decision Engines (`medeconomy/ovca-decision-engine`, `medeconomy/emca-decision-engine`). Schema, provenance rules and tier scheme are inherited (OVCA decisions 1–20, EMCA E1–E15); this file records what differs for cervical carcinoma.

> **Hard rules** (unchanged): every HR / median / rate traces to a vault extract, a PubMed record or a protocol PDF; label rules only from DailyMed SPL text; `"not_reported"` means the source does not report it; a trial that did not break the histotype out is "included, not broken out".

## Sources

`20_Area/Medicine/GO_MCP/GO_Algorithm/`: `CXCA_SquamousCell_Algorithm_v1.1` (73 references), `CXCA_AdenoCa_Algorithm_v1.1` (109 references), both full-text checked 2026-09-25. Extracts in `GO_summaries/`, PDFs in `GO_PDFs/`.

## Patient profile (input)

```yaml
patient:
  histology: scc | adc                      # adenocarcinoma pool includes adenosquamous
  setting: adjuvant | definitive | first_line | second_line | neoadjuvant
  stage_system: 2018 | 2009
  stage: FIGO 2009 IA1 … IVB                # a 2018 substage is translated (C2); IIIC → local stage from tumour size, nodes positive
  size: lt2 | 2to4 | ge4                    # Sedlis criterion and the 2018 IB split
  nodes, depth (≤1/3 | >1/3), lvsi, margin, param   # adjuvant: Sedlis / Peters criteria → risk_group (C3)
  status: recurrent | persistent | ivb      # first_line
  prior_cisplatin: yes | no | unknown       # radiosensitising cisplatin (JCOG0505, GOG-179 interactions)
  prior_lines, age, ecog
  pdl1_cps: number | null                   # 22C3 CPS; derived pdl1_cps_known_lt1 / pdl1_cps_unknown
  her2: 3+ | 2+amp | 2+ | 1+ | 0 | unknown
  hpv: positive | negative | unknown        # p16 / HPV; set from the IECC type when not entered
  iecc: usual | mucinous | adenosquamous | gastric | clear_cell | mesonephric | unknown   # adenocarcinoma only
  mmr
  baseline_risk: OVCA/EMCA flags + prior_pelvic_rt (fistula with bevacizumab) + hearing_loss
  ledger classes: platinum, taxane, io, anti_vegf, adc_tf, adc_her2, topoisomerase_i, antimetabolite, vinca, alkylator, bleomycin, radiotherapy
  derived: risk_group (low | intermediate | high | unknown), io_eligible, prior_io, prior_platinum, ledger_no_taxane, nhpva
```

## Data files

- `regimens_scc.json` is the base pool (42 records); `regimens_adc.json` (54) inherits every unset field from the named SCC record via `base`.
- `tox_ref {trial, arm}` → `tox.json` (46 trials, per arm, verbatim evidence quotes). Nine adenocarcinoma-only phase II trials have PDFs but no structured extract, so their records carry no toxicity entry and say so.
- `labels.json`: 35 agents (22 reused from OVCA/EMCA, 9 fetched 2026-10-06; cadonilimab, balstilimab, zalifrelimab investigational / no FDA label; gallium nitrate withdrawn). `drug_rules.json`: baseline-risk rules per drug.

## Decisions taken (2026-10-06, Jay)

C1. **Tier basis.** SCC (72–94% of every trial): trial-wide result sets the tier; SCC subgroups are qualifiers and fits. Adenocarcinoma: the same trial-wide result sets the tier (not the OVCA histotype-level rule), non-squamous subgroups are qualifiers / fits / cautions, trials that enrolled SCC only are tier 7. **HPV-independent adenocarcinoma** (gastric-type, clear cell, mesonephric) is a separate flag: cautions wherever the note gives a reason (SGSG005 response 46% vs 85%, never downstaged; Nishio 2022 adjuvant CCRT/chemo no better than RT; Ang 2025 no ADC responses; CPS ≥1 in 32%), a hard exclusion for NACT → surgery, and a banner.

C2. **FIGO 2018 input is translated to FIGO 2009** (the trials' system; KEYNOTE-A18 used 2014, identical for these stages). IB1/IB2 (2018) → IB1; IB3 → IB2; IIIC1/IIIC2 → nodes positive, 2009 stage from the local extent (tumour size entered; para-aortic flagged). The translation is shown.

C3. **Adjuvant risk group is derived from the pathology** entered: high = positive nodes, margin or parametrium (Peters, GOG-109); intermediate = node-negative with ≥2 of >1/3 stromal invasion, LVSI, tumour ≥4 cm (Sedlis, GOG-92); low = node-negative with <2 criteria (outside every adjuvant trial). It gates the adjuvant records and sets fits/cautions.

C4. **Scope v0.1:** SCC and adenocarcinoma, five settings. No fertility-sparing or surgical-approach setting (LACC, SHAPE are context notes).

## Judgement calls made in the build — for Jay's review

C5. **Adjuvant tiers.** GOG-109 cisplatin–5-FU CCRT tier 2 (the only adjuvant OS benefit; CIs not printed, P = .007), high risk only. STARS sequential chemoRT tier 3 (cancer-death HR 0.58, 0.35–0.95; OS HR not printed; single-country, mixed risk). Pelvic RT alone tier 4 for intermediate risk (GOG-92 recurrence 0.54, OS NS), tier 5 for high risk (lost OS to GOG-109), tier 6 for low risk. Weekly-cisplatin CCRT tier 5 (GOG-263 NS with tripled toxicity; STARS CCRT vs RT NS, SCC 0.931). NOGGO-AGO sequential TC tier 5. Observation tier 5 (fit for low risk; gated out of high risk). JGOG1082 design-only tier 6.

C6. **Definitive tiers.** Weekly cisplatin CCRT tier 1 (GOG-120, GOG-123, meta-analysis; the SCC-only NCIC trial negative — qualifier). Cisplatin–5-FU CCRT tier 1 (RTOG 90-01, GOG-85) with a caution that GOG-120 showed no gain over weekly cisplatin for more toxicity. INTERLACE induction tier 2 (OS 0.60); IB1 only if node-positive. KEYNOTE-A18 tier 2 (OS 0.67), node-negative IB2–IIB excluded (trial eligibility), node-positive IB2–IIB caution (PFS 0.91), cisplatin only. CALLA tier 7 (negative). OUTBACK tier 7 (negative, added toxicity). Dueñas-González cisplatin–gemcitabine tier 2 with a caution (G3–4 86.5% vs 46.3%, two deaths, two changes at once). TACO triweekly tier 5 (NS; fewer haematological toxicities → fit when cytopenic). Carboplatin CCRT tier 6 (Nam 2013, non-randomised; fit when cisplatin-ineligible). RT alone tier 5 (comparator that lost; for no-platinum patients). Tang 2012 (adenocarcinoma-only RCT, positive, no HR) tier 3 with caution, adenocarcinoma pool only.

C7. **First-line R/M.** KEYNOTE-826 tier 2 (final OS 0.63); CPS ≥1 is a fit (label), CPS <1 and CPS unknown are cautions (the note prints no CPS <1 HR). COMPASSION-16 tier 2 with a caution (no FDA label); adenocarcinoma caution (non-squamous PFS 0.94). BEATcc tier 3 (interim OS 0.68, per EMCA E7; bevacizumab in both arms). GOG-240 bevacizumab + chemotherapy tier 2, dropping to tier 5 when the patient is checkpoint-inhibitor-eligible (comparator that lost to KEYNOTE-826, per EMCA E5). Cisplatin–paclitaxel tier 5 (backbone alone; GOG-169 OS NS, GOG-204 reference). Carboplatin–paclitaxel tier 5 (JCOG0505 non-inferior) but **excluded when cisplatin-naive** (OS HR 1.571, 1.062–2.324) — strong reading of "prefer cisplatin if cisplatin-naive"; adenocarcinoma caution (non-SCC OS 1.28). Topotecan–cisplatin and the GOG-204 non-paclitaxel doublets tier 5 with toxicity cautions. Topotecan–paclitaxel tier 7 (PFS 1.24 worse; adenocarcinoma OS 1.58). Cisplatin alone tier 7 (lost OS to topotecan–cisplatin). Prior radiosensitising cisplatin adds a note on every platinum card.

C8. **Second line.** Cemiplimab tier 2 (final OS 0.67) but **excluded after any prior PD-(L)1** (trial exclusion). Tisotumab vedotin tier 2 (OS 0.70) with a fit after prior IO (the only randomised post-IO subgroup, 0.72); ocular disease excludes (TIVDAK boxed warning). Investigator's-choice single agents tier 5 (the control that lost). KEYNOTE-158 pembrolizumab tier 6, CPS <1 excluded (0/15), prior IO excluded. CheckMate 358 tier 6 (SCC-only; HPV-negative excluded; adenocarcinoma tier 7). T-DXd tier 6 (HER2 3+/2+ gate). Balstilimab ± zalifrelimab tier 6 (no FDA label). SCC-only single agents (irinotecan, docetaxel, gemcitabine SCC, GOG-227C) tier 6 in SCC, tier 7 in adenocarcinoma; the GOG non-squamous agents (paclitaxel ORR 31%, ifosfamide, oral etoposide) tier 6 in adenocarcinoma; gallium nitrate tier 7 (withdrawn); gemcitabine non-squamous tier 7 (closed for inactivity).

C9. **Neoadjuvant.** NACT → surgery tier 7 (EORTC 55994 PFS worse, Gupta DFS worse). JCOG 0102 BOMP tier 7. Chang 2000 PVB → surgery tier 5 (NS vs RT alone, obsolete comparator). INTERLACE appears here too (the positive strategy is induction before CCRT, not surgery). SGSG005 docetaxel–carboplatin tier 6, gastric-type excluded (never downstaged).

C10. **GOG-9929** (CCRT → ipilimumab, phase 1) is in the SCC pool only (tier 6, node-positive gate); the adenocarcinoma note does not carry it.

C11. **Off-label note.** Cemiplimab has no US cervical indication (LIBTAYO §1); KEYTRUDA §1.12 covers KEYNOTE-A18 stage III–IVA CCRT, chemotherapy ± bevacizumab at CPS ≥1 and single-agent at CPS ≥1 after chemotherapy. Recorded in `labels.json` `_meta`; the ranker does not yet print on-label flags.

C12. **Note-vs-extract discrepancies** found during extraction (vault untouched, listed in `tox.json` `_meta` and HANDOFF): Dueñas-González 86.5% vs 46.3% is treatment-related in the extract; GOG-92 G3–4 6% (note) vs 7.0% treated / 6.6% ITT (extract); RTOG 90-01 acute G3–4 44% (adeno note) vs 45.1% with G5 (counts); pemetrexed GOG infection 26% (abstract) vs 22% (table).
