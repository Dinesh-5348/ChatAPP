import { NextResponse } from "next/server";
import { createList, getLists } from "@/server/domain";
import { errorResponse } from "@/server/api-response";
import { currentUserId } from "@/server/require-user";

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    return NextResponse.json(await getLists(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    return NextResponse.json(await createList(userId, await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
