import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Item } from '~/server/db/schema/app'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { deleteItem } from '~/server/functions/items'

type Props = {
  item: Pick<Item, 'id' | 'name'>
  trigger?: React.ReactElement
}

export function DeleteItemDialog({
  trigger,
  item,
  ...props
}: Props & React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => deleteItem({ data: { id: id } }),
    onSuccess: () => {
      setIsOpen(false)
      toast('Item deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: (error) => {
      toast.error(`Error deleting item: ${error}`)
    },
  })
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={trigger ?? <Button {...props}>Delete Item</Button>}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete item "{item.name}"</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            variant="destructive"
            onClick={() => deleteItemMutation.mutate(item.id)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
