import { signOut, auth } from "@/../auth";
import { redirect } from "next/navigation";
import { getLists, getTasks } from "@/server/domain";
import { TaskDashboard } from "@/components/task-dashboard";

export default async function AppPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [lists, tasks] = await Promise.all([
    getLists(session.user.id),
    getTasks(session.user.id, {}),
  ]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Private workspace</p>
          <h1>{session.user.name ?? session.user.email}&apos;s Inbox</h1>
        </div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
          <button className="secondary-button" type="submit">Sign out</button>
        </form>
      </header>
      <TaskDashboard
        initialLists={lists}
        initialTasks={tasks.map((task) => ({
          id: task.id,
          listId: task.listId,
          title: task.title,
          status: task.status as "todo" | "doing" | "done",
          priority: task.priority as "low" | "medium" | "high",
          dueAt: task.dueAt?.toISOString() ?? null,
        }))}
      />
    </main>
  );
}
