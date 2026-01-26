import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '~/server/auth'

export const authMiddleware = createMiddleware().server(
  async ({ next, pathname }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (pathname === '/login') {
      if (session) {
        throw redirect({
          to: '/',
        })
      }
      return await next()
    }

    if (!session) {
      throw redirect({ to: '/login', search: { redirectTo: pathname } })
    }

    return await next()
  },
)
