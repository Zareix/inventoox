import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CreateItemDialog } from '~/components/items/create-dialog'
import { getAllItems } from '~/server/functions/items'
import { Badge } from '~/components/ui/badge'

export const Route = createFileRoute('/')({
  component: Items,
})

function Items() {
  const itemsQuery = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  })

  const items = itemsQuery.data ?? []

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <CreateItemDialog />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                {item.name}
              </h2>
              <Badge>{item.state}</Badge>
            </div>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                {item.brand} - {item.size}
              </p>
              <p className="text-sm text-muted-foreground">
                Category: {item.category.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Location: {item.location.name} ({item.location.room.name})
              </p>
              {item.owner && (
                <p className="text-sm text-muted-foreground">
                  Owner: {item.owner.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Quantity: {item.quantity}
              </p>
              <p className="text-sm font-semibold">
                Value: {item.value.toFixed(2)} €
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
