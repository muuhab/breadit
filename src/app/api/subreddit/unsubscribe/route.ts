import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { getAuthSesssion } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSesssion();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });
    if (!subscriptionExists)
      return new Response("You are not subscribed to this subreddit", {
        status: 400,
      });

    // check if the user is the owner of the subreddit
    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });
    if (subreddit)
      return new Response("You cannot unsubscribe from your own subreddit", {
        status: 400,
      });

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId: subredditId,
          userId: session.user.id,
        },
      },
    });

    return new Response(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request data passed", { status: 422 });
  }

  return new Response("Could not unsubscribed, please try again later", {
    status: 500,
  });
}
