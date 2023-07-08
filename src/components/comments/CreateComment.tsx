"use client"

import { FC, useState } from 'react'
import { Label } from '../ui/Label'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'
import { useCustomToast } from '@/hooks/use-custom-toast'
import { useRouter } from 'next/navigation'
import { set } from 'date-fns'

interface CreateCommentProps {
    postId: string
    replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {

    const [input, setInput] = useState<string>('')
    const { loginToast } = useCustomToast()

    const router = useRouter()

    const { mutate: comment, isLoading } = useMutation({
        mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId

            }
            const { data } = await axios.patch(`/api/subreddit/post/comment`, payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409)
                    return toast({
                        title: 'Subbreddit creation failed',
                        description: "Please choose a different name",
                        variant: "destructive"
                    })

                if (err.response?.status === 422)
                    return toast({
                        title: 'Invalid subreddit name',
                        description: "Please choose a name between 3 and 21 characters",
                        variant: "destructive"
                    })

                if (err.response?.status === 401)
                    return loginToast()
            }
            toast({
                title: 'There was an error',
                description: "Couldn't create comment",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            router.refresh()
            setInput('')
        }
    })

    return <div className='grid w-full gap-1.5'>
        <Label
            htmlFor='comment'
        >
            Your comment
        </Label>
        <div className="mt-2">
            <Textarea
                id='comment'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder='What are your thoughts?'
            />
            <div className="mt-2 flex justify-end">
                <Button
                    isLoading={isLoading}
                    disabled={input.length === 0}
                    onClick={() => comment({ postId, text: input, replyToId })}
                >
                    Post
                </Button>
            </div>
        </div>
    </div>
}

export default CreateComment