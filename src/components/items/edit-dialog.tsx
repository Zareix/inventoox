import { useState } from 'react'
import { ItemForm } from './form'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

type Props = {
  item: React.ComponentProps<typeof ItemForm>['item']
  trigger?: React.ReactElement
}

export function EditItemDialog({
  trigger,
  item,
  ...props
}: Props & React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={trigger ?? <Button {...props}>Edit Item</Button>}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <ItemForm onFinish={() => setIsOpen(false)} item={item} />
      </DialogContent>
    </Dialog>
  )
}
