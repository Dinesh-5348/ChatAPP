import { NextResponse } from "next/server";
import { deleteTask, updateTask } from "@/server/domain";
import { errorResponse } from "@/server/api-response";
import { currentUserId } from "@/server/require-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id } = await context.params;
    return NextResponse.json(await updateTask(userId, id, await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { id } = await context.params;
    await deleteTask(userId, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
