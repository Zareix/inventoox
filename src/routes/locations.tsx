import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DynIcon } from '~/components/dyn-icon'
import { CreateLocationDialog } from '~/components/locations/create-dialog'
import { CreateRoomDialog } from '~/components/rooms/create-dialog'
import { authMiddleware } from '~/middleware/auth'
import { getAllRoomsWithLocations } from '~/server/functions/rooms'

export const Route = createFileRoute('/locations')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const roomsQuery = useQuery({
    queryKey: ['rooms', 'withLocations'],
    queryFn: () => getAllRoomsWithLocations(),
  })

  return (
    <div className="p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rooms</h2>
        <CreateRoomDialog />
      </header>
      <div className="mt-4">
        {roomsQuery.isLoading && <p>Loading rooms...</p>}
        {roomsQuery.error && (
          <p className="text-red-500">Error loading rooms.</p>
        )}
        {roomsQuery.data && (
          <ul className="mt-2">
            {roomsQuery.data.map((room) => (
              <li key={room.id} className="mb-2 not-first:border-t pt-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DynIcon icon={room.icon} className="size-6" />
                  {room.name}
                  <CreateLocationDialog
                    size="xs"
                    roomId={room.id}
                    className="ml-auto"
                  />
                </h3>
                {room.locations.length > 0 ? (
                  <ul className="mt-1 list-inside list-disc">
                    {room.locations.map((location) => (
                      <li key={location.id} className="flex gap-1 items-center">
                        <DynIcon icon={location.icon} className="size-4 " />
                        {location.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No locations.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
