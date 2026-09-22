import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

const taskInput = z.object({
  listId: z.string().min(1),
  title: z.string().trim().min(1).max(240),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueAt: z.coerce.date().nullable().optional(),
});

const taskUpdate = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueAt: z.coerce.date().nullable().optional(),
});

async function ownedTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, list: { userId } },
  });
  if (!task) throw new DomainError("Task not found.", 404);
  return task;
}

async function ownedList(listId: string, userId: string) {
  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) throw new DomainError("List not found.", 404);
  return list;
}

export async function getTasks(userId: string, filters: { listId?: string; status?: string; q?: string; due?: string }) {
  return prisma.task.findMany({
    where: {
      list: { userId },
      ...(filters.listId ? { listId: filters.listId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.q ? { title: { contains: filters.q } } : {}),
      ...(filters.due === "overdue" ? { dueAt: { lt: new Date() }, status: { not: "done" } } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
}

export async function createTask(userId: string, input: unknown) {
  const parsed = taskInput.safeParse(input);
  if (!parsed.success) throw new DomainError("A task title and valid list are required.", 400);

  const list = await ownedList(parsed.data.listId, userId);
  const lastTask = await prisma.task.findFirst({
    where: { listId: list.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return prisma.task.create({
    data: {
      ...parsed.data,
      position: (lastTask?.position ?? -1) + 1,
    },
  });
}

export async function updateTask(userId: string, taskId: string, input: unknown) {
  const parsed = taskUpdate.safeParse(input);
  if (!parsed.success) throw new DomainError("Task update is invalid.", 400);
  await ownedTask(taskId, userId);
  return prisma.task.update({ where: { id: taskId }, data: parsed.data });
}

export async function completeTask(userId: string, taskId: string) {
  await ownedTask(taskId, userId);
  return prisma.task.update({ where: { id: taskId }, data: { status: "done" } });
}

export async function deleteTask(userId: string, taskId: string) {
  await ownedTask(taskId, userId);
  return prisma.task.delete({ where: { id: taskId } });
}
