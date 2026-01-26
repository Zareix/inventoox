import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export type Session = Awaited<ReturnType<typeof authClient.useSession>>['data']
