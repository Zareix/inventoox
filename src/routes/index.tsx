import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/auth-client'
import { authMiddleware } from '~/middleware/auth'

export const Route = createFileRoute('/')({
  component: App,
  server: {
    middleware: [authMiddleware],
  },
})

function App() {
  const navigate = Route.useNavigate()
  const logout = () => {
    authClient
      .signOut()
      .then(() => {
        navigate({ to: '/login' })
      })
      .catch((error) => {
        console.error('Error during sign-out:', error)
      })
  }

  return (
    <div>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}
