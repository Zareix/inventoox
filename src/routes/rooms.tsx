import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/rooms')({
  beforeLoad: () => {
    throw redirect({ to: '/locations' })
  },
})
