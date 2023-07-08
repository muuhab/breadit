import { UsernameValidator } from "@/lib/validators/username";
import { getAuthSesssion } from "../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSesssion();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { name } = UsernameValidator.parse(body);

    const username = await db.user.findFirst({
      where: {
        AND: {
          username: name,
          NOT: {
            id: session.user.id,
          },
        },
      },
    });
    if (username) {
      return new Response("Username already taken", { status: 409 });
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("Username updated", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request data passed", { status: 422 });
  }

  return new Response("Could not update username, please try again later", {
    status: 500,
  });
}
