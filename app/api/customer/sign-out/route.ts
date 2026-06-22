import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await auth.api.signOut({
      headers: request.headers,
    });

    return Response.json({ data: { success: true } });
  } catch (error) {
    console.error("Customer sign out failed", error);
    return Response.json({ error: "Unable to sign out right now." }, { status: 500 });
  }
}
