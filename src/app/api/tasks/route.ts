import { NextResponse } from "next/server";
import { createTask, getTasks } from "@/server/domain";
import { errorResponse } from "@/server/api-response";
import { currentUserId } from "@/server/require-user";

export async function GET(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(request.url);
  try {
    return NextResponse.json(await getTasks(userId, {
      listId: url.searchParams.get("listId") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      due: url.searchParams.get("due") ?? undefined,
    }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    return NextResponse.json(await createTask(userId, await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
