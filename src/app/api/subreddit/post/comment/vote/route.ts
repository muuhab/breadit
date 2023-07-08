import { getAuthSesssion } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSesssion();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });
        return new Response("Vote removed", { status: 200 });
      } else {
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });
      }
      return new Response("Vote updated", { status: 200 });
    }

    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    });

    return new Response("Vote created", { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response("Invalid request data passed", { status: 422 });

    return new Response(
      "Could not register your vote, please try again later",
      {
        status: 500,
      }
    );
  }
}
