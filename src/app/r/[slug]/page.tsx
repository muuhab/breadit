import { getAuthSesssion } from '@/app/api/auth/[...nextauth]/route'
import MiniCreatePost from '@/components/MiniCreatePost'
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from '@/config'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

interface pageProps {
    params: {
        slug: string
    }
}

const Page = async ({ params }: pageProps) => {
    const { slug } = params

    const session = await getAuthSesssion()

    const subreddit = await db.subreddit.findFirst({
        where: {
            name: slug
        },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true
                },
                take: INFINITE_SCROLLING_PAGINATION_RESULTS,
            }
        }
    })
    if (!subreddit) return notFound()

    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl h-14">
                r/{subreddit.name}
            </h1>
            <MiniCreatePost session={session} />
        </>
    )
}

export default Page