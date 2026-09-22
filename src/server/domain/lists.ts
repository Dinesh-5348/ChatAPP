import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DomainError } from "./errors";

const listInput = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function getLists(userId: string) {
  return prisma.list.findMany({
    where: { userId },
    include: { _count: { select: { tasks: true } } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
}

export async function createList(userId: string, input: unknown) {
  const parsed = listInput.safeParse(input);
  if (!parsed.success) throw new DomainError("List name is required.", 400);

  const lastList = await prisma.list.findFirst({
    where: { userId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return prisma.list.create({
    data: {
      userId,
      name: parsed.data.name,
      position: (lastList?.position ?? -1) + 1,
    },
  });
}
