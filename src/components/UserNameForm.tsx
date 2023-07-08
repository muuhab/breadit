"use client"

import { toast } from '@/hooks/use-toast'
import { UsernameRequest, UsernameValidator } from '@/lib/validators/username'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { useRouter } from 'next/navigation'

interface UserNameFormProps {
    user: Pick<User, 'id' | 'username'>
}

const UserNameForm: FC<UserNameFormProps> = ({ user }) => {

    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<UsernameRequest>({
        resolver: zodResolver(UsernameValidator),
        defaultValues: {
            name: user?.username || ''
        }
    })

    const { mutate: changeUsername, isLoading } = useMutation({
        mutationFn: async ({ name }: UsernameRequest) => {
            const payload: UsernameRequest = {
                name
            }
            const { data } = await axios.patch('api/username', payload)
            return data
        },
        onError: (err: any) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409)
                    return toast({
                        title: 'Username already taken',
                        description: "Please choose a different username",
                        variant: "destructive"
                    })

            }
            toast({
                title: 'There was an error',
                description: "Couldn't create subreddit",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            toast({
                description: "Your username has been updated",
            })
            router.refresh()
        }
    })

    const onSubmit = (data: UsernameRequest) => {
        changeUsername({ name: data.name })
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
                <CardTitle>
                    Your username
                </CardTitle>
                <CardDescription>
                    Please enter a display name for your account. You can change this at any time.
                </CardDescription>
                <CardContent>
                    <div className="relative grid gap-1">
                        <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
                            <span className="text-sm text-zinc-400">
                                u/
                            </span>
                        </div>
                        <Label className='sr-only' htmlFor='name'>
                            Name
                        </Label>
                        <Input
                            id='name'
                            className='w-[400px] pl-6'
                            size={32}
                            {...register('name')}
                        />
                        {errors?.name && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        isLoading={isLoading}
                    >
                        Change name
                    </Button>
                </CardFooter>
            </CardHeader>
        </Card>
    </form>
}

export default UserNameForm