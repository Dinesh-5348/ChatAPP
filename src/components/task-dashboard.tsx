"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ListItem = {
  id: string;
  name: string;
  _count?: { tasks: number };
};

type TaskItem = {
  id: string;
  listId: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  dueAt: string | null;
};

export function TaskDashboard({ initialLists, initialTasks }: { initialLists: ListItem[]; initialTasks: TaskItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lists, setLists] = useState(initialLists);
  const [tasks, setTasks] = useState(initialTasks);
  const [taskCounts, setTaskCounts] = useState(
    () => Object.fromEntries(initialLists.map((list) => [list.id, list._count?.tasks ?? 0])),
  );
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [listName, setListName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const selectedListId = searchParams.get("listId") ?? initialLists[0]?.id ?? "";
  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") ?? "all";
  const dueFilter = searchParams.get("due") ?? "all";
  const selectedList = lists.find((list) => list.id === selectedListId);
  const visibleTasks = tasks.filter((task) => {
    const matchesList = task.listId === selectedListId;
    const matchesQuery = task.title.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const isOverdue = Boolean(task.dueAt && new Date(task.dueAt) < new Date() && task.status !== "done");
    const matchesDue = dueFilter !== "overdue" || isOverdue;
    return matchesList && matchesQuery && matchesStatus && matchesDue;
  });

  function updateFilters(changes: Record<string, string>) {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "all") nextParams.delete(key);
      else nextParams.set(key, value);
    });
    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim() || !selectedListId) return;
    setPending(true);
    setError("");

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: selectedListId, title: taskTitle, dueAt: dueDate || null }),
    });
    if (!response.ok) {
      setError("Task could not be added.");
      setPending(false);
      return;
    }

    const task = (await response.json()) as TaskItem;
    setTasks((current) => [...current, task]);
    setTaskCounts((current) => ({ ...current, [task.listId]: (current[task.listId] ?? 0) + 1 }));
    setTaskTitle("");
    setDueDate("");
    setPending(false);
    updateFilters({ listId: selectedListId, q: "", status: "all", due: "all" });
  }

  async function addList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listName.trim()) return;
    setPending(true);
    setError("");

    const response = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: listName }),
    });
    if (!response.ok) {
      setError("List could not be created.");
      setPending(false);
      return;
    }

    const list = (await response.json()) as ListItem;
    setLists((current) => [...current, { ...list, _count: { tasks: 0 } }]);
    setTaskCounts((current) => ({ ...current, [list.id]: 0 }));
    updateFilters({ listId: list.id });
    setListName("");
    setPending(false);
  }

  async function toggleTask(task: TaskItem) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!response.ok) {
      setError("Task could not be updated.");
      return;
    }

    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
  }

  return (
    <section className="workspace-grid">
      <aside className="sidebar-panel">
        <div className="sidebar-heading">
          <span className="eyebrow">Lists</span>
          <span className="status-pill">{lists.length}</span>
        </div>
        <nav className="list-nav" aria-label="Task lists">
          {lists.map((list) => (
            <button
              key={list.id}
              className={`list-nav-item ${selectedListId === list.id ? "selected" : ""}`}
              type="button"
              onClick={() => updateFilters({ listId: list.id })}
            >
              <span>{list.name}</span>
              <span>{taskCounts[list.id] ?? 0}</span>
            </button>
          ))}
        </nav>
        <form className="new-list-form" onSubmit={addList}>
          <input value={listName} onChange={(event) => setListName(event.target.value)} placeholder="New list" aria-label="New list name" />
          <button type="submit" disabled={pending} aria-label="Create list">+</button>
        </form>
      </aside>

      <div className="task-panel">
        <div className="task-heading">
          <div>
            <p className="eyebrow">Current list</p>
            <h2>{selectedList?.name ?? "Inbox"}</h2>
          </div>
          <span className="status-pill">{visibleTasks.length} shown</span>
        </div>
        <div className="task-filters" aria-label="Task filters">
          <input value={query} onChange={(event) => updateFilters({ q: event.target.value })} placeholder="Search tasks" aria-label="Search tasks" />
          <select value={statusFilter} onChange={(event) => updateFilters({ status: event.target.value })} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <select value={dueFilter} onChange={(event) => updateFilters({ due: event.target.value })} aria-label="Filter by due date">
            <option value="all">Any due date</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <form className="task-composer" onSubmit={addTask}>
          <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="What needs doing?" aria-label="Task title" />
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" />
          <button type="submit" disabled={pending || !selectedListId}>Add task</button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            <strong>{tasks.some((task) => task.listId === selectedListId) ? "No tasks match these filters." : "Your list is clear."}</strong>
            <span>{tasks.some((task) => task.listId === selectedListId) ? "Adjust the filters to see more tasks." : "Add a task above and keep the next action small."}</span>
          </div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li key={task.id} className={`task-row ${task.status === "done" ? "completed" : ""} ${task.dueAt && new Date(task.dueAt) < new Date() && task.status !== "done" ? "overdue" : ""}`}>
                <button className="task-toggle" type="button" onClick={() => toggleTask(task)} aria-label={task.status === "done" ? `Reopen ${task.title}` : `Complete ${task.title}`}>
                  {task.status === "done" ? "✓" : ""}
                </button>
                <span>{task.title}</span>
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
