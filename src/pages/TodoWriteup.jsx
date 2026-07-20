import { Link } from "react-router-dom";
import Mermaid from "../components/Mermaid.jsx";
import "./writeup.css";

const contextDiagram = `
graph LR
  user["User<br/>(single-user app)"]
  cal["Google Calendar<br/>(read-only OAuth2)"]

  subgraph core["TodoApp"]
    spa["Angular 17 SPA<br/>signals · standalone"]
    api["Express REST API<br/>controllers → services"]
  end

  db[("MongoDB<br/>Task · Settings · Fact")]

  user -- "browser" --> spa
  spa -- "REST / JSON" --> api
  api -- "Mongoose" --> db
  cal -- "freebusy, on demand" --> api
`;

const sharedDiagram = `
graph TB
  subgraph shared["shared/ — plain CommonJS"]
    dl["dateLogic.js"]
    ft["flameTier.js"]
  end

  subgraph backend["Express backend"]
    du["dateUtil.js<br/>(pass-through + day-gap streak math)"]
    ss["streakService.js"]
    pl["plannerService.js"]
  end

  subgraph frontend["Angular 17 frontend"]
    fe["consumed via TypeScript allowJs"]
  end

  dl --> du
  dl --> fe
  ft --> fe
  du --> ss
  du --> pl
`;

const plannerFlow = `
flowchart TD
  A["1. Carve out free time<br/>subtract work, sleep and calendar busy blocks"] --> B["2. Spread monthly tasks<br/>across weeks remaining in the month"]
  B --> C["3. Order candidates<br/>must-do → deadline-bound → daily"]
  C --> D["4. First-fit into windows<br/>shrinking each window as it fills"]
  D --> E{"Fits somewhere<br/>this week?"}
  E -- yes --> F["Scheduled"]
  E -- no --> G["Returned as unscheduled + reason<br/>never silently dropped"]
`;

const streakSequence = `
sequenceDiagram
  participant UI as Angular UI
  participant API as POST /tasks/:id/undo
  participant Svc as streakService
  participant DB as MongoDB

  UI->>API: undo last completion
  API->>DB: load task + completionHistory
  API->>Svc: undoCompletion(task, now)
  Svc->>Svc: drop most recent completion
  Svc->>Svc: computeStreakState(remaining history)
  Note right of Svc: same transition function<br/>used by the forward "complete" path
  Svc-->>API: recomputed streak state
  API->>DB: save task
  API-->>UI: 200 updated Task
`;

function TodoWriteup() {
  return (
    <div className="writeup-page">
      <header className="masthead">
        <div className="masthead-inner">
          <p className="eyebrow">Technical Architecture Overview</p>
          <h1>Sized by Time</h1>
          <p className="dek">
            A gamified to-do app that files tasks by how long they take
            instead of when they're due, layered with per-task streaks, a
            timezone-aware weekly auto-planner, and a completion-habit
            dashboard. Built solo across an Angular 17 frontend and a
            Node/Express + MongoDB backend.
          </p>
          <div className="stack-chips">
            <span className="chip">Angular 17 · standalone + signals</span>
            <span className="chip">Node.js · Express</span>
            <span className="chip">MongoDB · Mongoose</span>
            <span className="chip">Google Calendar API</span>
            <span className="chip">Docker Compose</span>
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
                <span className="num">02</span>Stack &amp; Architecture
              </a>
            </li>
            <li>
              <a href="#s3">
                <span className="num">03</span>Data Model
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
                <span className="num">06</span>Open Edges
              </a>
            </li>
          </ol>
        </nav>

        <main>
          <section className="chapter" id="s1">
            <div className="chapter-head">
              <div className="chapter-num">01 / System Overview &amp; Context</div>
              <h2>Why organize by size instead of by date</h2>
            </div>

            <p>
              Most to-do apps sort by due date, which quietly punishes
              anything that doesn't have one. This app sorts by{" "}
              <b>estimated length</b> instead — Quick (under 30 minutes),
              Small, Medium, and Long-Term — each with its own color theme,
              radius, and heading font. The idea: when you have fifteen free
              minutes, you want a list of fifteen-minute tasks, not a
              date-sorted backlog you have to mentally filter first.
            </p>

            <div className="two-col">
              <div className="writeup-card">
                <h5>Core idea</h5>
                <p>
                  <code>estimatedMinutes</code> is the single source of truth
                  for a task's category — the Quick/Small/Medium/Long-Term
                  bucket is a derived virtual, never stored twice. Category
                  doubles as both the routing key and a full CSS
                  custom-property theme applied via a <code>data-theme</code>{" "}
                  attribute on <code>&lt;html&gt;</code>.
                </p>
              </div>
              <div className="writeup-card">
                <h5>What's underneath the framing</h5>
                <p>
                  Two systems most to-do apps skip: a <b>streak engine</b>{" "}
                  that tracks daily/weekly/monthly consistency per task, and
                  a <b>weekly auto-planner</b> that reads work hours, sleep
                  hours, and Google Calendar to actually place undone tasks
                  into real free time — not just list them.
                </p>
              </div>
            </div>

            <figure>
              <Mermaid chart={contextDiagram} />
              <figcaption>
                <b>Context diagram.</b> A single-user app by design — see{" "}
                <a href="#gotcha-singleuser">§06</a> — with the Angular SPA
                talking to Express over REST, and Google Calendar consulted
                purely as a read-only <code>freebusy</code> source for the
                planner.
              </figcaption>
            </figure>
          </section>

          <section className="chapter" id="s2">
            <div className="chapter-head">
              <div className="chapter-num">02 / Stack &amp; Architecture</div>
              <h2>One ruleset, not two copies of it</h2>
            </div>

            <p>
              The frontend and backend are separate apps, but a few pieces of
              logic — <b>what day the week starts on, what streak tier a
              flame is, whether a date is "today"</b> — have to agree
              exactly, or the UI and the server disagree about whether a task
              is done. Rather than reimplement that logic twice and hope it
              stays in sync, it lives once in <code>shared/</code>, written
              as plain CommonJS and consumed by the Express backend directly
              and by Angular via TypeScript's <code>allowJs</code>.
            </p>

            <div className="two-col">
              <div className="writeup-card">
                <h5>Frontend</h5>
                <p>
                  Angular 17, standalone components, signals,{" "}
                  <code>@if</code>/<code>@for</code> — no NgModules. State
                  stays local to each feature; a single RxJS{" "}
                  <code>Subject</code> (<code>TaskRefreshService</code>) tells
                  open views to refetch after a mutation, instead of a global
                  store.
                </p>
              </div>
              <div className="writeup-card">
                <h5>Backend</h5>
                <p>
                  Node + Express, plain JavaScript, no TypeScript. Thin
                  controllers, logic lives in <code>services/</code> as pure,
                  unit-testable functions — the planner and streak engines
                  take plain data in and plain data out.
                </p>
              </div>
              <div className="writeup-card">
                <h5>Database</h5>
                <p>
                  MongoDB via Mongoose. A single <code>Task</code> collection
                  carries category, frequency, streak state, and full
                  completion history — enough to derive scheduling, streaks,
                  and analytics without extra tables.
                </p>
              </div>
              <div className="writeup-card">
                <h5>Integration</h5>
                <p>
                  Google Calendar API, read-only OAuth2 (
                  <code>calendar.readonly</code>), used purely as a{" "}
                  <code>freebusy</code> source so the planner treats real
                  meetings as unavailable time.
                </p>
              </div>
            </div>

            <h3>Shared, isomorphic logic</h3>
            <figure>
              <Mermaid chart={sharedDiagram} />
              <figcaption>
                <b>One implementation, two runtimes.</b> The backend's own{" "}
                <code>dateUtil.js</code> is a one-line pass-through onto the
                shared module — a deliberate seam so backend-only date logic
                (like day-gap streak math) has somewhere to live without
                polluting the isomorphic file.
              </figcaption>
            </figure>
          </section>

          <section className="chapter" id="s3">
            <div className="chapter-head">
              <div className="chapter-num">03 / Data Model</div>
              <h2>What a Task actually stores</h2>
            </div>

            <p>
              No separate <code>completions</code> table — streaks, "done
              today" checks, the planner, and the analytics dashboard all
              derive from one array on the task itself.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>estimatedMinutes</code>
                    </td>
                    <td>Number</td>
                    <td>
                      Source of truth for the Quick/Small/Medium/Long-Term
                      bucket
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>frequency</code>
                    </td>
                    <td>enum</td>
                    <td>
                      Daily · Weekly · Monthly · One-Time — drives streak
                      rules and planner eligibility
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>completionHistory</code>
                    </td>
                    <td>Date[]</td>
                    <td>
                      Full log of every completion; replayed for streak undo
                      and flattened for the analytics dashboard
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>currentStreak</code> /{" "}
                      <code>lastCompletedDate</code>
                    </td>
                    <td>Number / Date</td>
                    <td>
                      Cached "current" view, kept consistent with history by
                      the streak service rather than computed live on every
                      read
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>isMustDo</code>
                    </td>
                    <td>Boolean</td>
                    <td>
                      Splits every list into an unordered Must-do section and
                      a sorted Optional section
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ul className="flow-list">
              <li data-n="1">
                <b>Created</b> — a task is given a name, an{" "}
                <code>estimatedMinutes</code>, and a <code>frequency</code>;
                its category bucket falls out automatically.
              </li>
              <li data-n="2">
                <b>Completed</b> — a timestamp is appended to{" "}
                <code>completionHistory</code>, and{" "}
                <code>computeStreakState</code> runs forward to update{" "}
                <code>currentStreak</code>.
              </li>
              <li data-n="3">
                <b>Undone</b> — same-day completions can be reversed; see the
                streak replay workflow in <a href="#s4">§04</a>.
              </li>
              <li data-n="4">
                <b>Planned</b> — undone tasks are candidates for the weekly
                auto-planner, which places them into real free time or
                reports why it couldn't.
              </li>
              <li data-n="5">
                <b>Analyzed</b> — <code>completionHistory</code> is flattened
                on the fly into a monthly trend view and an all-time weekday
                × category heatmap — no separate events table.
              </li>
            </ul>
          </section>

          <section className="chapter" id="s4">
            <div className="chapter-head">
              <div className="chapter-num">04 / Key Workflows</div>
              <h2>The two paths worth tracing end-to-end</h2>
            </div>

            <h3>The weekly planner is a constraint-satisfaction problem</h3>
            <p>
              "Auto-schedule my week" sounds simple until you write it down:
              work hours and sleep can wrap past midnight, a monthly task has
              to be spread fairly across whichever weeks are left in the
              month, and a missed Daily task is a non-event (it just repeats
              tomorrow) while a missed Weekly task with two days left is
              urgent. <code>plannerService.js</code> resolves all of that in
              four passes.
            </p>

            <figure>
              <Mermaid chart={plannerFlow} />
              <figcaption>
                <b>Four independently-exported pure functions</b> —{" "}
                <code>computeFreeWindows</code>,{" "}
                <code>assignMonthlyTasksToWeeks</code>,{" "}
                <code>orderCandidates</code>,{" "}
                <code>assignTasksToWindows</code> — each unit-tested against
                fabricated weeks without touching Mongo or the clock.
              </figcaption>
            </figure>

            <p>
              Free time starts as one interval spanning the week; work-shift,
              sleep, and Google Calendar busy blocks are each subtracted from
              it with simple interval math, run over every day including the
              day before the week starts, since an overnight shift begun the
              prior day can still bleed into Monday morning.
            </p>

            <h3>Streaks that survive being undone</h3>
            <p>
              Completing a task increments a streak; un-completing it has to
              reverse that <em>correctly</em> — and for Weekly/Monthly
              tasks, "correctly" isn't just <code>streak - 1</code>, because
              those streaks only move on the completion that reaches the
              period's target, not on every completion. The fix was to stop
              treating undo as the inverse of an increment, and instead treat
              it as <b>replaying history from scratch</b>: drop the most
              recent completion, then re-run every remaining completion
              through the same transition function used for completing a
              task in the first place.
            </p>

            <figure>
              <Mermaid chart={streakSequence} />
              <figcaption>
                <b>Undo by replay, not by decrement.</b> One transition
                function, two callers — <code>applyCompletion</code> for the
                forward path, a full replay for undo — so a new frequency
                type only ever needs its rule written once.
              </figcaption>
            </figure>

            <h3>A small polish problem: the completion animation</h3>
            <p>
              Finishing a task plays a "card shrinks and flies into the
              Completed panel" animation. Two details made it feel right
              instead of janky: the card is pinned to{" "}
              <code>position: fixed</code> at its current on-screen
              coordinates the instant the animation starts, which pulls it
              out of the flex list immediately so sibling cards slide up on
              the next frame instead of waiting for the slower fly-away
              transition to finish; and only one flight plays at a time
              app-wide — a second completion mid-flight force-finishes the
              first rather than animating underneath it, and the
              "task removed from the list" event only fires once a flight
              actually lands, so the Completed panel updates in step with
              what's on screen instead of jumping ahead of it.
            </p>
          </section>

          <section className="chapter" id="s5">
            <div className="chapter-head">
              <div className="chapter-num">05 / Cross-Cutting Concerns</div>
              <h2>State, integrations, and friction reducers</h2>
            </div>

            <h3>Frontend state</h3>
            <p>
              No global store. Each feature owns its own state via signals;
              cross-view coordination after a mutation goes through a single
              RxJS <code>Subject</code> (<code>TaskRefreshService</code>)
              that open views subscribe to and refetch on — small enough
              surface area that a heavier state library never became
              necessary.
            </p>

            <h3>Google Calendar integration</h3>
            <p>
              A read-only OAuth2 connection (<code>calendar.readonly</code>)
              queried purely for <code>freebusy</code> intervals. The app
              never creates, edits, or reads event details — it only needs
              to know which windows are already taken.
            </p>

            <h3>Friction reducers</h3>
            <p>
              Task detail popovers surface a random fact (a Mongo{" "}
              <code>$sample</code> aggregation) plus a category-specific
              "why this matters" and "make it easier" framing, aimed at the
              moment someone's about to skip a task.
            </p>
          </section>

          <section className="chapter" id="s6">
            <div className="chapter-head">
              <div className="chapter-num">06 / Open Edges</div>
              <h2>What to know before you touch this</h2>
            </div>

            <div className="gotcha" id="gotcha-singleuser">
              <h5>Single-user by design</h5>
              <p>
                <span className="tag">Data model</span>
                <code>Settings</code> and <code>CalendarConnection</code> are
                Mongo singletons, keyed by a fixed{" "}
                <code>singletonKey</code> — fine for a personal tool, but
                real multi-user support means keying both to an account
                instead.
              </p>
            </div>

            <div className="gotcha">
              <h5>The planner is first-fit, not optimal</h5>
              <p>
                <span className="tag">Scheduling</span>
                Bin packing in <code>assignTasksToWindows</code> is
                deliberately simple and explainable — it places each
                candidate into the earliest eligible window rather than
                searching for a globally optimal arrangement. A week with
                several tight windows can leave a task unscheduled that a
                smarter packer would have fit.
              </p>
            </div>

            <div className="gotcha">
              <h5>Calendar sync is read-only and pull-based</h5>
              <p>
                <span className="tag">Integration</span>
                The planner queries <code>freebusy</code> on demand rather
                than subscribing to push updates, so a meeting added after a
                plan is generated won't move anything until the next
                recalculation.
              </p>
            </div>

            <div className="callout">
              <span className="label">Where this is heading</span>
              <p>
                Multi-user support is the natural next step once{" "}
                <code>Settings</code>/<code>CalendarConnection</code> move
                off a fixed singleton key, and a push-based calendar
                subscription (rather than on-demand <code>freebusy</code>{" "}
                polling) would let the planner react to new meetings without
                waiting for the next weekly recalculation.
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
        Grounded in <code>plannerService.js</code>,{" "}
        <code>streakService.js</code>, <code>dateUtil.js</code>,{" "}
        <code>shared/dateLogic.js</code>, <code>shared/flameTier.js</code>,
        and the Task/Settings/CalendarConnection Mongoose models. Diagrams
        reflect the app's own organizing logic, not aspirational
        architecture.
      </footer>
    </div>
  );
}

export default TodoWriteup;
