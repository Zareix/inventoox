import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CreateItemDialog } from '~/components/items/create-dialog'
import { getAllItems } from '~/server/functions/items'
import { Badge } from '~/components/ui/badge'
import { authMiddleware } from '~/middleware/auth'
import { ImportDialogButton } from '~/components/items/import'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { EditItemDialog } from '~/components/items/edit-dialog'
import { Button } from '~/components/ui/button'
import { DeleteItemDialog } from '~/components/items/delete-dialog'

export const Route = createFileRoute('/')({
  component: Items,
  server: {
    middleware: [authMiddleware],
  },
})

function Items() {
  const itemsQuery = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  })

  const items = itemsQuery.data ?? []

  return (
    <div className="p-2">
      <div className="flex">
        <h1 className="text-2xl font-bold grow">Items</h1>
        <ImportDialogButton />
        <CreateItemDialog />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itemsQuery.isLoading ? (
          <p className="text-muted-foreground">Loading items...</p>
        ) : itemsQuery.isError ? (
          <p className="text-red-500">
            Error loading items: {String(itemsQuery.error)}
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No items found.</p>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex">
                <CardTitle className="grow">
                  {item.name}
                  {item.quantity > 1 ? (
                    <span className="text-muted-foreground">
                      (x{item.quantity})
                    </span>
                  ) : (
                    ''
                  )}
                </CardTitle>
                <Badge variant="secondary">
                  {item.category.parent
                    ? `${item.category.parent.name} / `
                    : ''}
                  {item.category.name}
                </Badge>
                <Badge>{item.state}</Badge>
              </CardHeader>
              <CardContent>
                {item.brand.length > 0 && (
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                )}
                {item.size.length > 0 && (
                  <p className="text-sm text-muted-foreground">{item.size}</p>
                )}

                {item.owner && (
                  <p className="text-sm text-muted-foreground">
                    Owner: {item.owner.name}
                  </p>
                )}
                {item.value > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Value: {item.value.toFixed(2)} €
                  </p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <p className="text-sm text-muted-foreground grow">
                  {item.location.room.name} / {item.location.name}
                </p>
                <EditItemDialog
                  item={item}
                  trigger={
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  }
                />
                <DeleteItemDialog
                  item={item}
                  trigger={
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  }
                />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
