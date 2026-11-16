# Aeterna CareerEdge — Data Sources & Research Governance

## 1. Principles of Truth & Provenance

Factual education, career, university, salary, and visa information must **never be hallucinated or generated from language model weights alone**.

All facts surfaced to students within CareerEdge must be rooted in verified reference records with clear provenance tracking.

---

## 2. Source Hierarchy

All research and data acquisition strictly adheres to the following hierarchy of authority:

```
Tier 1: Official Government Portals & Statutory Bodies
    └── AISHE, Ministry of Education, NCS, NSDC, Karnataka DTE, Official Immigration Portals

Tier 2: Official University & Institution Portals
    └── VTU, Autonomous College Academic Portals, Accredited Overseas Universities

Tier 3: Official Employer Career Portals
    └── Direct verified corporate career sites (e.g. Infosys, TCS, Bangalore Tech Parks)

Tier 4: Approved APIs & Licensed Data Providers
    └── Contractually authorized commercial APIs with clear licensing terms

Tier 5: Reputable Secondary Research
    └── Industry whitepapers, peer-reviewed reports (only when Tiers 1-4 are unavailable)
```

---

## 3. Approved Reference Repositories

### 3.1. Indian Higher Education & Accreditation
| Source Entity | Authority / Body | Canonical URL | Usage Scope |
|---|---|---|---|
| **AISHE** | Ministry of Education, Government of India | `https://aishe.gov.in` | Definitive directory of Indian colleges, universities, and institution codes. |
| **NAAC** | National Assessment and Accreditation Council | `http://www.naac.gov.in` | Official institutional quality grades (A++, A+, etc.). |
| **NIRF** | National Institutional Ranking Framework | `https://www.nirfindia.org` | National rankings across engineering, management, and overall tiers. |
| **VTU** | Visvesvaraya Technological University, Belagavi | `https://vtu.ac.in` | Curriculum, degree structures, and autonomous college affiliations in Karnataka. |
| **KEA (KCET)** | Karnataka Examination Authority | `https://cetonline.karnataka.gov.in/kea` | Official cutoff ranks and counseling schedules for Karnataka professional courses. |

### 3.2. Occupations, Skills & Industry Standards
| Source Entity | Authority / Body | Canonical URL | Usage Scope |
|---|---|---|---|
| **NCS** | National Career Service, Ministry of Labour & Employment | `https://www.ncs.gov.in` | National Occupational Classification (NOC) and standardized career paths. |
| **NSDC / NCVET** | National Skill Development Corporation | `https://www.nsdcindia.org` | National Occupational Standards (NOS) and Qualification Packs (QP). |
| **NASSCOM FutureSkills** | NASSCOM / MeitY | `https://futureskillsprime.in` | IT/GCC emerging skills benchmarks for Karnataka tech ecosystems. |

### 3.3. Study Abroad & Student Visas
| Country | Official Statutory Authority | Canonical URL | Permitted Fact Scope |
|---|---|---|---|
| **United States** | US Department of State / USCIS | `https://travel.state.gov`, `https://www.uscis.gov` | F-1 visa requirements, OPT/CPT STEM extension rules. |
| **United Kingdom** | UK Visas and Immigration (UKVI) | `https://www.gov.uk/student-visa` | Student Route visa rules, Graduate Route (PSW) 2-year work rights. |
| **Canada** | Immigration, Refugees and Citizenship Canada (IRCC) | `https://www.canada.ca` | Study Permit rules, PGWP eligibility conditions. |
| **Australia** | Department of Home Affairs | `https://immi.homeaffairs.gov.au` | Subclass 500 Student Visa, Subclass 485 Temporary Graduate Visa rules. |
| **Germany** | DAAD & Federal Foreign Office (Auswärtiges Amt) | `https://www.daad.de`, `https://www.auswaertiges-amt.de` | Tuition-free public university rules, Blocked Account (Sperrkonto) requirements. |
| **Ireland** | Department of Justice / Education in Ireland | `https://www.irishimmigration.ie` | Third Level Graduate Scheme (1G Visa) 2-year work permissions. |

---

## 4. Source Provenance Data Contract

Every record in CareerEdge reference tables (`ReferenceInstitution`, `ReferenceCourse`, `ReferenceOccupation`, etc.) must record the following provenance fields:

```typescript
interface SourceProvenanceContract {
  sourceId: string;           // Foreign key to DataSource registry
  sourceUrl: string;          // Direct HTTP link to the published regulation/page
  retrievedDate: Date;        // Timestamp when data was extracted/ingested
  lastVerifiedDate: Date;     // Timestamp of last manual or automated audit
  verificationStatus: "VERIFIED" | "PENDING_REVIEW" | "DEPRECATED";
  country: string;            // ISO Country Code ("IN", "US", "GB", etc.)
  validUntil?: Date | null;   // Expiration date (e.g. academic calendar year end)
}
```

### Staleness Policy
- **Maximum Lifespan:** 180 days for academic requirements and salary benchmarks; 90 days for immigration policies and scholarship deadlines.
- If `lastVerifiedDate` exceeds the threshold, the record status transitions to `PENDING_REVIEW` and a warning badge is shown in admin audits.
- **Never present stale or unverified data as current.**

---

## 5. Web Scraping & Compliance Rules

1. **Scraping Policy:** Do not scrape websites that prohibit automated retrieval in their `robots.txt` or Terms of Service.
2. **API Verification:** Before relying on a public portal, verify:
   - Is an official API provided?
   - What are the rate limits and quota constraints?
   - Does the license permit storage in CareerEdge database?
3. **No Hardcoded React Datasets:** Do not place 10,000-line JSON arrays of colleges or occupations into client-side `.tsx` files. All reference catalogs must be queried from the database via server-side APIs.
