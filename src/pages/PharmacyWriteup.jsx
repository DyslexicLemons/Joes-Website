import { Link } from "react-router-dom";
import Mermaid from "../components/Mermaid.jsx";
import "./writeup.css";

const contextDiagram = `
graph LR
  staff["Pharmacy Staff<br/>(technician / pharmacist / admin)"]
  clinic["External Clinic System<br/>(eRx client)"]
  sim["Simulation Engine<br/>(synthetic workers, Celery Beat)"]

  subgraph core["PharmacyApp"]
    api["FastAPI REST API<br/>/api/v1"]
  end

  secrets[("AWS Secrets Manager")]
  drugcat["Drug Catalog Provider<br/>(pluggable — local stub today)"]
  insgw["Insurance Adjudication Gateway<br/>(pluggable — local stub today)"]

  staff -- "browser session, JWT" --> api
  clinic -- "OAuth2 client-credentials<br/>+ NewRx payload" --> api
  sim -- "advances refills every 10-30s<br/>via shared workflow code" --> api
  api -- "injects secrets at boot" --> secrets
  api -- "drug search" --> drugcat
  api -- "claim submission" --> insgw
`;

const topologyDiagram = `
graph TB
  subgraph LOCAL["Local dev — docker-compose.yml"]
    direction LR
    L1["frontend :80"] --> L2["backend :8000"]
    L2 --> L3[("postgres")]
    L2 --> L4[("redis")]
    L5["celery-worker"] --> L3
    L5 --> L4
    L6["celery-beat<br/>(1 replica)"] --> L4
  end

  subgraph AWS["AWS — Terraform (infra/*.tf)"]
    direction LR
    A1["CloudFront + S3<br/>(React build)"] --> A2["ALB"]
    A2 --> A3["ECS Fargate<br/>backend task only"]
    A3 --> A4[("RDS Postgres 16<br/>single-AZ, private subnet")]
    A3 -.-> A5[["AWS Secrets Manager"]]
    A3 -. "no ElastiCache,<br/>no worker/beat service" .-> A6["Redis / Celery<br/>(absent)"]
  end

  subgraph VM["Alt path — Ansible (infra/ansible/)"]
    direction LR
    V1["docker compose,<br/>full stack incl. Celery"] --> V2["single VM / bare metal"]
  end
`;

const erDiagram = `
erDiagram
  PATIENT ||--o{ PRESCRIPTION : "has"
  PATIENT ||--o{ PATIENT_INSURANCE : "enrolled in"
  PRESCRIBER ||--o{ PRESCRIPTION : "authorizes"
  DRUG ||--o| STOCK : "on-hand"
  DRUG ||--o{ PRESCRIPTION : "prescribed"
  PRESCRIPTION ||--o{ REFILL : "fills"
  PRESCRIPTION ||--o{ REFILL_HIST : "archived fills"
  REFILL }o--|| PATIENT_INSURANCE : "billed against"
  INSURANCE_COMPANY ||--o{ FORMULARY : "coverage rules"
  INSURANCE_COMPANY ||--o{ PATIENT_INSURANCE : "underwrites"
  DRUG ||--o{ FORMULARY : "covered as"
`;

const stateDiagram = `
stateDiagram-v2
  [*] --> QT
  QT --> QV1
  QT --> HOLD
  QV1 --> QP : approve
  QV1 --> QT : reject (reason required)
  QV1 --> HOLD
  QP --> QV2
  QP --> HOLD
  QV2 --> READY
  QV2 --> QP : sent back
  QV2 --> HOLD
  HOLD --> QP
  SCHEDULED --> QP : stock + insurance OK
  SCHEDULED --> QT : stock/insurance issue
  SCHEDULED --> HOLD
  READY --> SOLD
  SOLD --> [*]
`;

const advanceSequence = `
sequenceDiagram
  participant UI as React QueueView
  participant API as POST /refills/{id}/advance
  participant Redis
  participant DB as Postgres
  participant Audit as audit_log

  UI->>API: advance { action }
  API->>DB: SELECT ... FOR UPDATE (row lock)
  API->>Redis: check_prescription_locked_by_other()
  alt locked by someone else
    API-->>UI: 423 Locked
  else
    API->>API: validate against TRANSITIONS
    alt QV1 / QV2 and role == technician
      API-->>UI: 403 Forbidden
    else
      API->>API: apply_ready_entry() / apply_rejection()
      API->>DB: adjust prescription reservation + stock
      API->>DB: UPDATE refill.state
      API->>Audit: INSERT STATE_TRANSITION
      API->>DB: COMMIT
      API->>Redis: invalidate refills:queue:* + refills:id:{id}
      API-->>UI: 200 updated Refill
    end
  end
`;

const erxSequence = `
sequenceDiagram
  participant Clinic as External Clinic System
  participant OAuth as POST /eprescribe/oauth/token
  participant NewRx as POST /eprescribe/newrx
  participant DB as Postgres

  Clinic->>OAuth: client_id + client_secret
  OAuth->>DB: verify bcrypt hash, is_active
  OAuth-->>Clinic: 15-min JWT (token_type=client)
  Clinic->>NewRx: Bearer JWT + patient/prescriber/drug/sig
  NewRx->>DB: match existing patient (must pre-exist)
  NewRx->>DB: match or create prescriber by NPI
  NewRx->>DB: match existing drug (must pre-exist)
  NewRx->>DB: create Prescription + Refill(state=QT)
  NewRx-->>Clinic: 200 { refill_id, state: "QT" }
`;

function PharmacyWriteup() {
  return (
    <div className="writeup-page">
      <header className="masthead">
        <div className="masthead-inner">
          <p className="eyebrow">Technical Architecture Overview</p>
          <h1>PharmacyApp</h1>
          <p className="dek">
            A retail-pharmacy workflow system: patient and prescription records, a
            strict refill state machine from intake to dispensing, insurance
            billing, e-prescribing intake, and inventory — built to run identically
            under a synthetic pharmacy simulation as it does under real staff.
          </p>
          <div className="stack-chips">
            <span className="chip">FastAPI · Python 3.12</span>
            <span className="chip">PostgreSQL 16</span>
            <span className="chip">Redis 7</span>
            <span className="chip">Celery 5.4</span>
            <span className="chip">React 18 · TypeScript · Vite</span>
            <span className="chip">Terraform → ECS Fargate</span>
            <span className="chip">Ansible → Docker Compose</span>
          </div>
        </div>
      </header>

      <div className="page-grid">
        <nav className="toc" aria-label="Table of contents">
          <ol>
            <li>
              <a href="#s1">
                <span className="num">01</span>System Overview
              </a>
            </li>
            <li>
              <a href="#s2">
                <span className="num">02</span>Container &amp; Infrastructure
              </a>
            </li>
            <li>
              <a href="#s3">
                <span className="num">03</span>Data Architecture
              </a>
            </li>
            <li>
              <a href="#s4">
                <span className="num">04</span>Key Workflows
              </a>
            </li>
            <li>
              <a href="#s5">
                <span className="num">05</span>Cross-Cutting Concerns
              </a>
            </li>
            <li>
              <a href="#s6">
                <span className="num">06</span>Gotchas &amp; Tech Debt
              </a>
            </li>
          </ol>
        </nav>

        <main>
          <section className="chapter" id="s1">
            <div className="chapter-head">
              <div className="chapter-num">01 / System Overview &amp; Context</div>
              <h2>The problem, the users, the boundary</h2>
            </div>

            <p>
              A retail pharmacy fills prescriptions through a sequence of legally
              distinct steps — intake, pharmacist verification, physical
              preparation, a second pharmacist verification, shelving, and pickup
              — each of which has to be auditable and none of which may be
              skipped. PharmacyApp digitizes that sequence as an explicit,
              enforced state machine rather than a flexible "status field," and
              wraps it with the adjacent bookkeeping a pharmacy actually needs:
              patient and insurance records, drug stock, billing/adjudication, and
              an immutable audit trail.
            </p>

            <div className="two-col">
              <div className="writeup-card">
                <h5>Core users</h5>
                <p>
                  Pharmacy staff (technician / pharmacist / admin roles) working
                  the queue through the React SPA; external clinic EHR systems
                  submitting prescriptions electronically via an OAuth2
                  client-credentials API; and — distinctively — a built-in{" "}
                  <b>simulation engine</b> of synthetic staff that drives the same
                  state machine unattended, for demos and load testing.
                </p>
              </div>
              <div className="writeup-card">
                <h5>What "done" looks like</h5>
                <p>
                  A refill enters at <code>QT</code> (triage) and cannot reach{" "}
                  <code>SOLD</code> without passing through two independent
                  pharmacist verifications (<code>QV1</code>, <code>QV2</code>).
                  Every state transition, rejection, and edit is written to an
                  append-only <code>audit_log</code> table.
                </p>
              </div>
            </div>

            <figure>
              <Mermaid chart={contextDiagram} />
              <figcaption>
                <b>Context diagram.</b> The API is the single integration point.
                Staff and the simulation engine both exercise the exact same
                refill endpoints and <code>workflow.py</code> side-effect
                functions — the simulator is not a separate mock, it is a second
                caller of production code.
              </figcaption>
            </figure>

            <p>
              The <code>DrugCatalogProvider</code> and{" "}
              <code>InsuranceAdjudicationGateway</code> interfaces exist
              specifically so a real NCPDP/claims vendor or a national drug
              database can be swapped in later by registering a new class in{" "}
              <code>providers/registry.py</code> — today both resolve to local,
              in-database stub implementations selected by an env var.
            </p>
          </section>

          <section className="chapter" id="s2">
            <div className="chapter-head">
              <div className="chapter-num">
                02 / Container &amp; Infrastructure Architecture
              </div>
              <h2>Where things run</h2>
            </div>

            <p>
              There isn't one deployment shape — there are three, layered by
              intent: a local Docker Compose stack that is the full system, a
              Terraform/AWS path that deploys only the stateless API tier, and an
              Ansible path that reproduces the full Compose stack on a bare VM.
              This matters for reasoning about the system — see{" "}
              <a href="#gotcha-infra">§06</a> for what that split actually
              implies.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Role</th>
                    <th className="num">Port</th>
                    <th>Scaling note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>backend</code>
                    </td>
                    <td>FastAPI REST API</td>
                    <td className="num">8000</td>
                    <td>Stateless — scales freely</td>
                  </tr>
                  <tr>
                    <td>
                      <code>frontend</code>
                    </td>
                    <td>React SPA (Nginx in Docker / CloudFront+S3 in prod)</td>
                    <td className="num">80 / 5173</td>
                    <td>Static assets</td>
                  </tr>
                  <tr>
                    <td>
                      <code>postgres</code>
                    </td>
                    <td>Primary datastore</td>
                    <td className="num">5432</td>
                    <td>Single instance</td>
                  </tr>
                  <tr>
                    <td>
                      <code>redis</code>
                    </td>
                    <td>Cache, quick-code store, view locks, Celery broker</td>
                    <td className="num">6379</td>
                    <td>Single instance</td>
                  </tr>
                  <tr>
                    <td>
                      <code>celery-worker</code>
                    </td>
                    <td>Background task execution</td>
                    <td className="num">—</td>
                    <td>Scales freely</td>
                  </tr>
                  <tr>
                    <td>
                      <code>celery-beat</code>
                    </td>
                    <td>Cron-style schedule dispatcher</td>
                    <td className="num">—</td>
                    <td>
                      <b>Exactly one replica, always</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Deployment topology</h3>
            <figure>
              <Mermaid chart={topologyDiagram} />
              <figcaption>
                <b>Three deployment paths, not one.</b> Only the Ansible/VM path
                currently runs Redis and Celery in a way that mirrors{" "}
                <code>docker-compose.yml</code> one-to-one; the ECS/Terraform path
                (<code>infra/ecs.tf</code>) deploys a single backend task and has
                no ElastiCache or worker/beat service defined at all.
              </figcaption>
            </figure>

            <h3>Tech stack</h3>
            <div className="two-col">
              <div className="writeup-card">
                <h5>Backend</h5>
                <p>
                  FastAPI 0.115 · SQLAlchemy 2.0 (ORM, no async driver) · Alembic
                  migrations · Pydantic v2 schemas · PyJWT · bcrypt · slowapi
                  (rate limiting) · Celery 5.4 + redis-py · boto3 (Secrets
                  Manager, optional).
                </p>
              </div>
              <div className="writeup-card">
                <h5>Frontend</h5>
                <p>
                  React 18 + TypeScript, Vite build · TanStack Query for server
                  state · Zustand for local auth store · route-level
                  code-splitting via <code>React.lazy</code> for every view
                  except login/command-bar.
                </p>
              </div>
              <div className="writeup-card">
                <h5>Infrastructure as Code</h5>
                <p>
                  Terraform: VPC, ALB, ECS Fargate (Spot-weighted capacity
                  provider), RDS, S3+CloudFront (OAC, no public bucket),
                  CloudWatch + SNS billing/error alarms. Ansible: an alternate
                  full-stack VM path.
                </p>
              </div>
              <div className="writeup-card">
                <h5>CI/CD</h5>
                <p>
                  GitHub Actions: <code>ci.yml</code> runs pytest against a real
                  Postgres service container plus a frontend build+vitest, on
                  every push/PR. <code>deploy.yml</code> is manual-trigger only
                  (see §06).
                </p>
              </div>
            </div>
          </section>

          <section className="chapter" id="s3">
            <div className="chapter-head">
              <div className="chapter-num">
                03 / Data Architecture &amp; Domain Model
              </div>
              <h2>What the tables actually mean</h2>
            </div>

            <p>
              The domain splits into four clusters: clinical records (patient,
              prescription, prescriber, drug), the <b>refill</b> — the unit of
              work that actually moves through the pharmacy — billing/insurance,
              and operational bookkeeping (audit, shipments, simulation,
              quick-codes).
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Purpose</th>
                    <th>Notable relationships</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>Patient</code>
                    </td>
                    <td>Demographics + address</td>
                    <td>→ prescriptions, refills, insurances</td>
                  </tr>
                  <tr>
                    <td>
                      <code>Prescriber</code>
                    </td>
                    <td>NPI-identified prescriber</td>
                    <td>→ prescriptions</td>
                  </tr>
                  <tr>
                    <td>
                      <code>Drug</code>
                    </td>
                    <td>Catalog entry: NDC, cost, form, NIOSH hazard flag</td>
                    <td>→ stock (1:1), formulary entries</td>
                  </tr>
                  <tr>
                    <td>
                      <code>Prescription</code>
                    </td>
                    <td>
                      The legal authorization — an original quantity that{" "}
                      <code>remaining_quantity</code> depletes against
                    </td>
                    <td>→ many refills (fills against it over time)</td>
                  </tr>
                  <tr>
                    <td>
                      <code>Refill</code>
                    </td>
                    <td>
                      <b>The workflow unit.</b> One pass through the state
                      machine for a given quantity
                    </td>
                    <td>→ prescription, patient, drug, insurance</td>
                  </tr>
                  <tr>
                    <td>
                      <code>RefillHist</code>
                    </td>
                    <td>
                      Append-only archive written when a refill reaches{" "}
                      <code>SOLD</code>
                    </td>
                    <td>Mirrors Refill's billing fields at time of sale</td>
                  </tr>
                  <tr>
                    <td>
                      <code>Stock</code>
                    </td>
                    <td>On-hand quantity per drug</td>
                    <td>1:1 with Drug; decremented at QP→QV2</td>
                  </tr>
                  <tr>
                    <td>
                      <code>InsuranceCompany</code> / <code>Formulary</code> /{" "}
                      <code>PatientInsurance</code>
                    </td>
                    <td>
                      Payer, drug coverage tier + copay, patient's plan
                      enrollment
                    </td>
                    <td>Formulary is the coverage join between company and drug</td>
                  </tr>
                  <tr>
                    <td>
                      <code>AuditLog</code>
                    </td>
                    <td>
                      Immutable action trail (<code>action</code>,{" "}
                      <code>entity_type/id</code>, <code>performed_by</code>)
                    </td>
                    <td>Referenced loosely by entity_id — no FK constraint</td>
                  </tr>
                  <tr>
                    <td>
                      <code>User</code> / <code>QuickCode</code>
                    </td>
                    <td>Staff login + short-lived 3-char fast-login codes</td>
                    <td>QuickCode → User</td>
                  </tr>
                  <tr>
                    <td>
                      <code>ERxClient</code>
                    </td>
                    <td>External clinic API credential</td>
                    <td>Issues short-lived client JWTs</td>
                  </tr>
                  <tr>
                    <td>
                      <code>SimWorker</code>
                    </td>
                    <td>A virtual technician/pharmacist for the simulation engine</td>
                    <td>Tracks station, travel timing, current refill</td>
                  </tr>
                  <tr>
                    <td>
                      <code>InventoryShipment(Item)</code> /{" "}
                      <code>ReturnToStock</code>
                    </td>
                    <td>Receiving and shelf-return records</td>
                    <td>Both restock Stock.quantity</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <figure>
              <Mermaid chart={erDiagram} />
              <figcaption>
                <b>Core entity relations</b> — simplified; audit, shipment, and
                simulation tables omitted for legibility.
              </figcaption>
            </figure>

            <h3>Data lifecycle</h3>
            <ul className="flow-list">
              <li data-n="1">
                <b>Created</b> — via staff manual entry, JSON upload, or the eRx
                API. A <code>Prescription</code> is created with{" "}
                <code>original_quantity</code>, and its first{" "}
                <code>Refill</code> enters the state machine at{" "}
                <code>QT</code>, <code>QV1</code>, <code>HOLD</code>, or{" "}
                <code>SCHEDULED</code>.
              </li>
              <li data-n="2">
                <b>Reserved</b> — while a refill is "active" (
                <code>QT</code>→<code>READY</code>), its quantity is held
                against <code>Prescription.remaining_quantity</code> so a second
                fill can't over-draw the same authorization.
              </li>
              <li data-n="3">
                <b>Consumed</b> — physical <code>Stock</code> is decremented
                specifically at the <code>QP → QV2</code> boundary, not earlier
                — the moment preparation actually begins.
              </li>
              <li data-n="4">
                <b>Archived</b> — reaching <code>SOLD</code> writes a permanent{" "}
                <code>RefillHist</code> row and, if a repeat fill is due, creates
                the next <code>Refill</code> straight into{" "}
                <code>SCHEDULED</code>.
              </li>
              <li data-n="5">
                <b>Expired</b> — a nightly Celery task flips{" "}
                <code>Prescription.is_inactive</code> once{" "}
                <code>expiration_date</code> passes; nothing is deleted.
              </li>
              <li data-n="6">
                <b>Audited throughout</b> — every write above also inserts an{" "}
                <code>AuditLog</code> row; the table has no update/delete path in
                application code.
              </li>
            </ul>
          </section>

          <section className="chapter" id="s4">
            <div className="chapter-head">
              <div className="chapter-num">
                04 / Component Deep Dive &amp; Key Workflows
              </div>
              <h2>The three paths worth tracing end-to-end</h2>
            </div>

            <h3>The refill state machine</h3>
            <p>
              Every fill's lifecycle is governed by one dict,{" "}
              <code>TRANSITIONS</code> in{" "}
              <code>backend/app/routers/refills.py</code>, and every transition —
              whether triggered by a human clicking "advance" or by the
              simulation engine — is validated against it before anything is
              written.
            </p>

            <figure>
              <Mermaid chart={stateDiagram} />
              <figcaption>
                <b>RxState transitions.</b> <code>QV1</code> and{" "}
                <code>QV2</code> may only be advanced by a{" "}
                <code>pharmacist</code> or <code>admin</code> role — enforced
                server-side in <code>advance_refill()</code>, not just hidden in
                the UI. <code>RxState.REJECTED</code> is a legacy enum value with
                no entry in this graph — see{" "}
                <a href="#gotcha-rejected">§06</a>.
              </figcaption>
            </figure>

            <h3>Workflow — staff advances a refill</h3>
            <p>
              The most-executed path in the system, hit by both real
              pharmacists/technicians in the QueueView UI and by the simulation
              engine on every cycle.
            </p>
            <figure>
              <Mermaid chart={advanceSequence} />
              <figcaption>
                <b>End-to-end advance.</b> Stock and prescription-quantity side
                effects live in <code>workflow.py</code>, shared verbatim by this
                endpoint and by the Celery simulation tasks — one implementation,
                two callers.
              </figcaption>
            </figure>

            <h3>Workflow — external e-prescribing intake</h3>
            <p>
              A clinic system authenticates with client credentials, gets a
              15-minute JWT, and submits a NewRx-shaped payload that lands at the
              same trust tier as an internal staff upload — straight into{" "}
              <code>QT</code> for triage, never auto-approved.
            </p>
            <figure>
              <Mermaid chart={erxSequence} />
              <figcaption>
                <b>eRx intake.</b> Patients and drugs must already exist in the
                system — the API deliberately does not let an outside clinic
                create new patient identities or catalog entries.
              </figcaption>
            </figure>

            <h3>The simulation engine, as an architectural pattern</h3>
            <p>
              <code>SystemConfig.simulation_enabled</code> turns on four Celery
              Beat tasks (10–30s cadence) that create synthetic patients, then
              move synthetic <code>SimWorker</code> technicians and pharmacists
              between triage/fill/verify/window stations, complete with
              realistic travel delays and configurable rejection rates. It calls
              the identical <code>workflow.py</code> functions the real{" "}
              <code>/advance</code> endpoint uses, so it doubles as a continuous
              exercise of the production state-machine code path — closer to a
              live load test than a demo toy.
            </p>
          </section>

          <section className="chapter" id="s5">
            <div className="chapter-head">
              <div className="chapter-num">05 / Cross-Cutting Concerns</div>
              <h2>Auth, observability, and the deploy pipeline</h2>
            </div>

            <h3>Authentication &amp; authorization</h3>
            <ul>
              <li>
                <b>Staff sessions</b> — HS256 JWT, 8-hour expiry, carries{" "}
                <code>role</code> (<code>technician</code> /{" "}
                <code>pharmacist</code> / <code>admin</code>) and{" "}
                <code>is_admin</code>. <code>require_pharmacist</code> /{" "}
                <code>require_admin</code> are composable FastAPI dependencies
                layered on <code>get_current_user</code>.
              </li>
              <li>
                <b>Clinic sessions</b> — a structurally separate 15-minute JWT
                with a <code>token_type=client</code> claim, so a leaked staff
                token can never authenticate as a clinic client (or vice versa)
                even though both are signed with the same secret.
              </li>
              <li>
                <b>Quick codes</b> — a 3-character fast-login code issued after
                full login, Redis-backed with a 10-minute TTL (DB fallback if
                Redis is down), atomically consumed via a Redis pipeline so a
                code can't be replayed.
              </li>
              <li>
                <b>Prescription view locks</b> — Redis-based, 5-minute TTL,
                prevents two staff editing the same prescription simultaneously.
                Deliberately asymmetric failure mode: fails <em>open</em> if
                Redis was never configured at all, but fails <em>closed</em> (503)
                if an established Redis connection dies mid-request — see{" "}
                <code>PrescriptionLockUnavailable</code> in <code>cache.py</code>.
              </li>
            </ul>

            <h3>Observability</h3>
            <ul>
              <li>
                <b>Correlation IDs</b> — every request gets an{" "}
                <code>X-Request-ID</code> (accepted from caller or minted),
                stored in a <code>ContextVar</code>, injected into every log line
                via a logging filter, and echoed back in the response header.
              </li>
              <li>
                <b>
                  <code>/health</code>
                </b>{" "}
                — checks live Postgres and Redis connectivity, returns 503 on
                degradation; wired into the ECS task definition's container
                health check.
              </li>
              <li>
                <b>CloudWatch</b> — a metric filter matches the literal string
                "Unhandled exception" emitted by the global exception handler,
                feeding an alarm → SNS → email. There's also a billing-threshold
                alarm at 80%/100% of a configured monthly budget.
              </li>
              <li>
                <b>
                  <code>LOG_RX_DEBUG</code>
                </b>{" "}
                — flips the <code>pharmacy.rx</code> logger to DEBUG, exposing
                stale-queue-cache diagnostics without redeploying.
              </li>
            </ul>

            <h3>Deployment pipeline</h3>
            <div className="two-col">
              <div className="writeup-card">
                <h5>CI — every push/PR</h5>
                <p>
                  <code>ci.yml</code>: pytest against a real Postgres service
                  container (mocking the DB is explicitly disallowed by project
                  convention), plus a frontend vitest run and production build to
                  catch compile errors.
                </p>
              </div>
              <div className="writeup-card">
                <h5>CD — manual only</h5>
                <p>
                  <code>deploy.yml</code> triggers on{" "}
                  <code>workflow_dispatch</code> only. Backend: build → ECR →
                  render task definition → ECS rolling deploy. Frontend: Vite
                  build → S3 sync (immutable cache for assets, no-cache for{" "}
                  <code>index.html</code>) → CloudFront invalidation.
                </p>
              </div>
            </div>

            <h3>Rate limiting</h3>
            <p>
              <code>slowapi</code> keys on client IP, but behind the ALB that
              would collapse every user into one bucket.{" "}
              <code>_get_client_ip()</code> only trusts{" "}
              <code>X-Forwarded-For</code> when the direct TCP peer's address
              falls inside <code>ALB_TRUSTED_CIDR</code> — otherwise a spoofed
              header from the open internet is ignored and the raw peer IP is
              used instead.
            </p>
          </section>

          <section className="chapter" id="s6">
            <div className="chapter-head">
              <div className="chapter-num">06 / The "Gotchas" &amp; Technical Debt</div>
              <h2>What to know before you touch this</h2>
            </div>

            <p>
              These are drawn from what's actually in the repo and its own
              comments — not speculation. Reading them first will save you from
              "fixing" things that are working as designed.
            </p>

            <div className="gotcha" id="gotcha-infra">
              <h5>The AWS path doesn't deploy Redis or Celery at all</h5>
              <p>
                <span className="tag">Infra</span>
                <code>infra/ecs.tf</code> defines exactly one ECS service — the
                FastAPI backend. There is no ElastiCache resource and no
                worker/beat task anywhere in the Terraform. That means on the
                Terraform/ECS path, every Redis-backed feature (query caching,
                quick-codes, prescription view locks) permanently runs in its
                designed degraded fallback mode, and the three real scheduled
                jobs — <code>expire_prescriptions</code>,{" "}
                <code>promote_scheduled_refills</code>,{" "}
                <code>purge_expired_quick_codes</code> — simply never fire. The
                Ansible/VM path is the only IaC path that reproduces the full
                Compose stack. Given the comments in <code>rds.tf</code> ("portfolio
                project," single-AZ, <code>deletion_protection = false</code>),
                this reads as a deliberate cost-scoping decision for a demo
                deployment, not an oversight — but it's a real gap to close
                before treating ECS as production-ready.
              </p>
            </div>

            <div className="gotcha">
              <h5>Auto-deploy is intentionally switched off</h5>
              <p>
                <span className="tag">CI/CD</span>
                <code>deploy.yml</code>'s only trigger is{" "}
                <code>workflow_dispatch</code>; a comment states the{" "}
                <code>workflow_run</code> trigger was removed on purpose and
                should be restored to re-enable automatic deploys. Merging to the
                default branch today does <em>not</em> ship anything.
              </p>
            </div>

            <div className="gotcha" id="gotcha-rejected">
              <h5>
                <code>RxState.REJECTED</code> is unreachable by design
              </h5>
              <p>
                <span className="tag">State machine</span>
                The enum value still exists and is referenced by demo-data
                seeding (<code>seed.py</code>, <code>routers/admin.py</code>) and
                historical dashboard counts, but no entry in{" "}
                <code>TRANSITIONS</code> can ever route a live refill into it — a{" "}
                <code>QV1</code> rejection now returns the refill to{" "}
                <code>QT</code> with <code>rejected_by</code>/
                <code>rejection_reason</code> recorded instead. This is
                documented in-repo as intentional; don't wire a new transition
                into it.
              </p>
            </div>

            <div className="gotcha">
              <h5>
                Pre-Alembic migration scripts still live in <code>app/</code>
              </h5>
              <p>
                <span className="tag">Migrations</span>
                A dozen <code>migrate_add_*.py</code> /{" "}
                <code>migrate_v2_schema.py</code> /{" "}
                <code>migrate_rx_numbers.py</code> files sit alongside the real
                Alembic chain in <code>backend/app/</code> — one-off scripts from
                before Alembic was adopted. They're frozen history, not part of
                the live migration path; current convention (see{" "}
                <code>CLAUDE.md</code>) is Alembic-only going forward.
              </p>
            </div>

            <div className="gotcha">
              <h5>Default admin password is shown exactly once</h5>
              <p>
                <span className="tag">Bootstrap</span>
                On first boot with no users in the table, the app creates{" "}
                <code>admin</code> with a randomly generated password and logs it
                at <code>WARNING</code> a single time — there is no static
                fallback password to leak. Miss that log line (e.g. a CloudWatch
                retention gap) and the only recovery path is a direct database
                write.
              </p>
            </div>

            <div className="callout">
              <span className="label">Where this is heading</span>
              <p>
                The <code>ProviderRegistry</code> pattern (
                <code>DrugCatalogProvider</code>,{" "}
                <code>InsuranceAdjudicationGateway</code>) is the seam already
                built for swapping in a real drug database or claims
                clearinghouse — both currently resolve to local, in-database
                stand-ins purely via an env var (
                <code>DRUG_CATALOG_PROVIDER</code>,{" "}
                <code>INSURANCE_GATEWAY_PROVIDER</code>), so that integration is
                additive, not a rewrite.
              </p>
            </div>
          </section>

          <p style={{ marginTop: "2.5rem" }}>
            <Link to="/projects" className="btn-secondary">
              ← Back to projects
            </Link>
          </p>
        </main>
      </div>

      <footer className="doc-footer">
        Grounded in <code>models.py</code>, <code>refills.py</code>,{" "}
        <code>workflow.py</code>, <code>tasks.py</code>, <code>cache.py</code>,{" "}
        <code>main.py</code>, and <code>infra/*.tf</code>. Diagrams reflect code
        and IaC as currently checked in, not aspirational architecture.
      </footer>
    </div>
  );
}

export default PharmacyWriteup;
