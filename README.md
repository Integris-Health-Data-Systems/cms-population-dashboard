# cms-population-dashboard

**Population health dashboard for ACO operations — React + synthetic CMS data**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Data](https://img.shields.io/badge/data-synthetic%20CMS-green)]()
[![Maintainer](https://img.shields.io/badge/maintainer-Integris%20Health%20Data%20Systems-navy)](https://integrishealthdata.com)

An interactive population health dashboard built for ACO care management teams. Displays attributed beneficiary population, utilization trends, care gaps, and equity metrics. Runs on synthetic CMS data for safe public demonstration — connect to your dbt gold layer for production use.

**[Live Demo →](https://integrishealthdata.com/demo)**

Built and maintained by [Integris Health Data Systems](https://integrishealthdata.com).

---

## Screenshots

The dashboard has three tabs:

**Population Overview** — attributed beneficiary summary, risk stratification, match rate, newly attributed and terminated members

**Equity Dashboard** — population stratified by race/ethnicity showing average spend, high-risk percentage, and dual-eligible rate — baseline data for LEAD model equity reporting

**BCDA Gap Research** — longitudinal attribution concordance chart showing roster-only vs. BCDA-only MBIs over time — visualizes the gap documented in the [`bcda-field-mapping-gap`](https://github.com/Integris-Health-Data-Systems/bcda-field-mapping-gap) research repo

---

## Tech Stack

- **React 18** with hooks
- **Recharts** for all charts (BarChart, LineChart, PieChart)
- **Synthetic CMS data** — safe for public demo, no PHI
- Designed to connect to the [integris-pipeline](https://github.com/Integris-Health-Data-Systems/integris-pipeline) dbt gold layer in production

---

## Quick Start

```bash
git clone https://github.com/Integris-Health-Data-Systems/cms-population-dashboard.git
cd cms-population-dashboard
npm install
npm start
```

Opens at `http://localhost:3000`

---

## Connecting to Real Data

The dashboard uses a `SYNTHETIC` data object at the top of `PopulationDashboard.jsx`. To connect to your production dbt gold layer:

1. Replace the `SYNTHETIC` object with API calls to your gold layer endpoints
2. The expected schema matches the `gold_population_summary`, `gold_equity_dashboard`, and `gold_attribution_gaps` dbt models in [integris-pipeline](https://github.com/Integris-Health-Data-Systems/integris-pipeline)

```javascript
// Replace synthetic data with your API
const [data, setData] = useState(null);

useEffect(() => {
  fetch('/api/gold/population_summary')
    .then(r => r.json())
    .then(setData);
}, []);
```

---

## Synthetic Data

The dashboard ships with synthetic data representative of a mid-sized REACH ACO:

- 4,832 attributed beneficiaries
- 6-month utilization trend
- 5-category equity breakdown
- 6-month BCDA gap log

All data is synthetic and does not represent any real population or ACO.

---

## License

MIT License — see [LICENSE](LICENSE)

---

## About

Built and maintained by **Integris Health Data Systems**
Chantilly, Virginia · [integrishealthdata.com](https://integrishealthdata.com)

*Physician-led · Open-source first · Equity by design*
