import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { env } from '~/env'
import { db } from '~/server/db'
import * as authSchema from '~/server/db/schema/auth'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      ...authSchema,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [tanstackStartCookies()],
})

export const isAuthenticated = async (request: Request) => {
  const session = await auth.api.getSession(request)
  return !!session?.user
}
