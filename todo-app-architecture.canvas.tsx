import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  TodoList,
  UsageBar,
  computeDAGLayout,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "stack", label: "Tech stack" },
  { id: "architecture", label: "Architecture" },
  { id: "roadmap", label: "Roadmap" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const NODE_LABELS: Record<string, string> = {
  browser: "Browser / PWA",
  next: "Next.js App Router",
  auth: "Auth.js",
  api: "Route handlers",
  domain: "Task domain",
  prisma: "Prisma",
  db: "SQLite",
};

export default function TodoAppArchitecture() {
  const [tab, setTab] = useCanvasState<TabId>("plan-tab", "overview");

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>To-do web app — plan and architecture</H1>
        <Text tone="secondary">
          Student-scale product: personal lists first, then sharing.
          Single-repo full-stack so you can ship an MVP in about six weeks
          without splitting frontend and backend teams.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        {TABS.map((item) => (
          <Pill
            key={item.id}
            active={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Pill>
        ))}
      </Row>

      {tab === "overview" ? <Overview /> : null}
      {tab === "stack" ? <TechStack /> : null}
      {tab === "architecture" ? <Architecture /> : null}
      {tab === "roadmap" ? <Roadmap /> : null}
    </Stack>
  );
}

function Overview() {
  return (
    <Stack gap={16}>
      <Row gap={20} wrap>
        <Stat value="6 weeks" label="Target build window" />
        <Stat value="MVP" label="First shippable slice" tone="info" />
        <Stat value="1 repo" label="Next.js + SQLite" />
      </Row>

      <Callout tone="info" title="Product thesis">
        A to-do app wins on capture speed and trust, not feature count. Users
        must add a task in under two seconds, see it persist after refresh,
        and filter by list, status, and due date without losing context.
      </Callout>

      <H2>Scope</H2>
      <Grid columns={2} gap={16}>
        <Stack gap={8}>
          <H3>In v1</H3>
          <Text>
            Sign in, create lists, add / edit / complete / delete tasks,
            due dates, priority, search, filters, keyboard-first composer,
            responsive layout.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Out of v1</H3>
          <Text>
            Native mobile, AI scheduling, calendar sync, team workspaces,
            time tracking. Those wait until CRUD and auth are solid.
          </Text>
        </Stack>
      </Grid>

      <H2>User stories for MVP</H2>
      <Table
        headers={["ID", "Story", "Acceptance"]}
        striped
        rows={[
          [
            "US-1",
            "As a user I can register and sign in",
            "Session survives refresh; unauthenticated routes redirect",
          ],
          [
            "US-2",
            "As a user I can create a task in the selected list",
            "Task appears immediately and remains after reload",
          ],
          [
            "US-3",
            "As a user I can complete, edit, and delete tasks",
            "Status, title, due date, and priority persist",
          ],
          [
            "US-4",
            "As a user I can filter and search",
            "Open / done / overdue + text match on title",
          ],
          [
            "US-5",
            "As a user I can own multiple lists",
            "Inbox default; custom lists; tasks stay in one list",
          ],
        ]}
      />

      <H2>Success metrics</H2>
      <Table
        headers={["Metric", "Target"]}
        rows={[
          ["Time to add a task", "< 2 seconds from landing on the list"],
          ["Task create p95 (API)", "< 300 ms on local SQLite"],
          ["Auth coverage", "All mutating routes require a session"],
          ["Core test coverage", "Domain + API happy paths + one e2e flow"],
        ]}
      />
    </Stack>
  );
}

function TechStack() {
  return (
    <Stack gap={16}>
      <Callout tone="success" title="Recommended stack">
        Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, Auth.js,
        Prisma, SQLite, Zod, Vitest, Playwright, deploy on Vercel.
        One language and one deployable app; still a real backend with a
        relational schema.
      </Callout>

      <H2>Chosen layers</H2>
      <Table
        headers={["Layer", "Choice", "Why"]}
        striped
        rowTone={["info", "info", "info", "info", "neutral", "neutral"]}
        rows={[
          [
            "App framework",
            "Next.js 15 App Router",
            "SSR, API routes, and UI in one repo; easy Vercel deploy",
          ],
          [
            "Language",
            "TypeScript (strict)",
            "Shared types from Prisma to UI; fewer runtime surprises",
          ],
          [
            "UI",
            "Tailwind + shadcn/ui",
            "Fast, accessible components without a heavy design system",
          ],
          [
            "Data",
            "SQLite + Prisma",
            "Zero-setup local database; relational schema and migrations remain reviewable",
          ],
          [
            "Auth",
            "Auth.js (credentials first)",
            "Session cookies on same origin; OAuth can be added later",
          ],
          [
            "Validation",
            "Zod",
            "One schema for forms, route bodies, and type inference",
          ],
        ]}
      />

      <H2>Supporting tools</H2>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>local</Pill>}>
            Database
          </CardHeader>
          <CardBody>
            <Text>
              SQLite in a local file for development. Prisma keeps the schema
              relational and portable; move to hosted Postgres only when
              multi-user production deployment requires it.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm">quality</Pill>}>
            Tests and CI
          </CardHeader>
          <CardBody>
            <Text>
              Vitest for domain and route unit tests. Playwright for one
              create-complete-reload flow. GitHub Actions: typecheck, lint,
              test on every push.
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <H2>Rejected alternatives</H2>
      <Table
        headers={["Option", "Verdict", "Reason"]}
        rows={[
          [
            "Vite SPA + Express",
            "Later",
            "Better REST teaching, but two deploys and CORS for an MVP",
          ],
          [
            "MongoDB / Mongoose",
            "No",
            "Weak constraints on user → list → task ownership",
          ],
          [
            "Firebase / Firestore",
            "No",
            "Fast prototype, poor migration story for SIH write-ups",
          ],
          [
            "Django / Spring",
            "No",
            "Solid, but splits JS UI from backend and slows a solo student",
          ],
        ]}
      />

      <H2>Folder shape</H2>
      <Text>
        Keep UI thin. Business rules live under <Code>src/server</Code>, not
        in React components.
      </Text>
      <Table
        headers={["Path", "Owns"]}
        rows={[
          ["src/app/(app)", "Authenticated pages: inbox, list, settings"],
          ["src/app/(auth)", "Sign in / register"],
          ["src/app/api", "Thin HTTP adapters; parse, auth, call domain"],
          ["src/server/domain", "Task and list rules, no Next imports"],
          ["src/server/db", "Prisma client and query helpers"],
          ["src/components", "Composer, task row, filters, list sidebar"],
          ["prisma/schema.prisma", "Canonical data model"],
        ]}
      />
    </Stack>
  );
}

function Architecture() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes: [
      { id: "browser" },
      { id: "next" },
      { id: "auth" },
      { id: "api" },
      { id: "domain" },
      { id: "prisma" },
      { id: "db" },
    ],
    edges: [
      { from: "browser", to: "next" },
      { from: "next", to: "auth" },
      { from: "next", to: "api" },
      { from: "api", to: "domain" },
      { from: "domain", to: "prisma" },
      { from: "prisma", to: "db" },
    ],
    direction: "horizontal",
    nodeWidth: 140,
    nodeHeight: 36,
    rankGap: 36,
    nodeGap: 28,
    padding: 8,
  });

  return (
    <Stack gap={16}>
      <H2>Request path</H2>
      <Text tone="secondary">
        Browser talks only to Next.js. Auth.js issues an HTTP-only session
        cookie. Route handlers never talk to Prisma directly — they call
        domain functions that enforce ownership.
      </Text>
      <svg
        width="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label="Request flow from browser through Next.js to SQLite"
      >
        {layout.edges.map((edge) => (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={edge.sourceX}
            y1={edge.sourceY}
            x2={edge.targetX}
            y2={edge.targetY}
            stroke={theme.stroke.primary}
            strokeWidth={1.5}
          />
        ))}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={140}
              height={36}
              rx={4}
              fill={
                node.id === "domain" ? theme.fill.primary : theme.bg.elevated
              }
              stroke={
                node.id === "domain" ? theme.accent.primary : theme.stroke.secondary
              }
            />
            <text
              x={node.x + 70}
              y={node.y + 23}
              textAnchor="middle"
              fill={theme.text.primary}
              fontSize={11}
            >
              {NODE_LABELS[node.id] ?? node.id}
            </text>
          </g>
        ))}
      </svg>
      <Text size="small" tone="tertiary">
        Source: planned architecture · domain layer is the ownership boundary
      </Text>

      <H2>Data model (v1)</H2>
      <Table
        headers={["Entity", "Key fields", "Rules"]}
        striped
        rows={[
          [
            "User",
            "id, email, passwordHash, name",
            "Email unique; never return hash to the client",
          ],
          [
            "List",
            "id, userId, name, position",
            "Every user gets an Inbox; lists cannot be empty-owned",
          ],
          [
            "Task",
            "id, listId, title, status, priority, dueAt, position",
            "status: todo | doing | done; list must belong to session user",
          ],
          [
            "Tag (v1.1)",
            "id, userId, name",
            "Optional many-to-many via TaskTag after MVP",
          ],
        ]}
      />

      <H2>HTTP surface</H2>
      <Table
        headers={["Method", "Path", "Behavior"]}
        rows={[
          ["POST", "/api/auth/*", "Auth.js handlers"],
          ["GET", "/api/lists", "Lists for the session user"],
          ["POST", "/api/lists", "Create list"],
          ["GET", "/api/tasks", "Filter by listId, status, q, due"],
          ["POST", "/api/tasks", "Create; assign next position"],
          ["PATCH", "/api/tasks/:id", "Partial update; 403 if not owner"],
          ["DELETE", "/api/tasks/:id", "Hard delete in v1; soft-delete later"],
        ]}
      />

      <H2>Client state</H2>
      <Grid columns="1.2fr 1fr" gap={16}>
        <Stack gap={8}>
          <Text>
            Server Components load the first paint. Mutations use Server
            Actions or route handlers, then <Code>revalidatePath</Code>.
            Optimistic UI only for complete-toggle — that is the high-frequency
            path. Search and filters are URL query params so refresh and share
            keep the same view.
          </Text>
        </Stack>
        <Card>
          <CardHeader>Security defaults</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text size="small">HTTP-only session cookie, SameSite=Lax</Text>
              <Text size="small">Ownership check on every write</Text>
              <Text size="small">Zod parse before domain calls</Text>
              <Text size="small">Rate-limit auth routes</Text>
              <Text size="small">No private emails in git authors</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>UI information architecture</H2>
      <Table
        headers={["Region", "Contents"]}
        rows={[
          ["Left sidebar", "Lists, Inbox, Today, Upcoming"],
          ["Main column", "Composer on top, task rows, empty state"],
          ["Right drawer (optional)", "Task detail: notes, due, priority"],
          ["Routes", "/login, /app, /app/l/[listId], /app/today"],
        ]}
      />
    </Stack>
  );
}

function Roadmap() {
  return (
    <Stack gap={16}>
      <H2>Six-week allocation</H2>
      <UsageBar
        total={6}
        topLeftLabel="Calendar weeks"
        topRightLabel="6 weeks · foundation through polish"
        segments={[
          { id: "p0", value: 1, color: "gray" },
          { id: "p1", value: 2, color: "blue" },
          { id: "p2", value: 1.5, color: "purple" },
          { id: "p3", value: 1, color: "green" },
          { id: "p4", value: 0.5, color: "orange" },
        ]}
      />
      <Row gap={8} wrap>
        <Text size="small" tone="secondary">
          Gray foundation · Blue MVP · Purple quality · Green polish · Orange buffer
        </Text>
      </Row>

      <H2>Phases</H2>
      <Table
        headers={["Phase", "When", "Outcome"]}
        striped
        rowTone={["neutral", "info", "info", "success", "warning"]}
        rows={[
          [
            "0 — Foundation",
            "Week 1",
            "Repo, SQLite, Prisma schema, Auth.js session, empty /app shell",
          ],
          [
            "1 — MVP",
            "Weeks 2–3",
            "Lists + task CRUD, filters, composer, ownership tests",
          ],
          [
            "2 — Quality",
            "Week 4",
            "Vitest + Playwright, loading/error/empty states, a11y pass",
          ],
          [
            "3 — Polish",
            "Week 5",
            "Today/Upcoming views, keyboard shortcuts, deploy to Vercel + Neon",
          ],
          [
            "4 — Stretch",
            "Week 6",
            "Tags, drag-reorder, list sharing read-only, PWA install",
          ],
        ]}
      />

      <H2>Build order</H2>
      <TodoList
        todos={[
          {
            id: "t1",
            content: "Scaffold Next.js + Prisma + SQLite",
            status: "completed",
          },
          {
            id: "t2",
            content: "Auth: register, login, protected /app layout",
            status: "completed",
          },
          {
            id: "t3",
            content: "Domain: createList, createTask, completeTask with owner checks",
            status: "completed",
          },
          {
            id: "t4",
            content: "UI: sidebar lists + composer + task row toggle",
            status: "completed",
          },
          {
            id: "t5",
            content: "Filters via searchParams; overdue highlighting",
            status: "completed",
          },
          {
            id: "t6",
            content: "Playwright: sign in, add task, reload, still there",
            status: "completed",
          },
          {
            id: "t7",
            content: "Deploy preview + README with architecture diagram",
            status: "completed",
          },
        ]}
      />

      <Divider />

      <H2>Risks</H2>
      <Table
        headers={["Risk", "Mitigation"]}
        rows={[
          [
            "Auth.js + credentials takes too long",
            "Ship magic-link or a single demo user first; swap later",
          ],
          [
            "Optimistic UI desyncs with the server",
            "Only optimistic-complete; other writes wait for the response",
          ],
          [
            "Schema churn mid-MVP",
            "Freeze Task fields after week 1; tags are a join table later",
          ],
          [
            "Overbuilding sharing",
            "Keep lists private until week 6; sharing is read-only if started",
          ],
        ]}
      />

      <Callout tone="neutral" title="Next implementation step">
        Week 1 is mechanical: create the Next.js app in this repo, add Prisma
        User/List/Task, and get a signed-in empty inbox on screen. Do not start
        drag-and-drop or realtime until that path is tested.
      </Callout>
    </Stack>
  );
}
