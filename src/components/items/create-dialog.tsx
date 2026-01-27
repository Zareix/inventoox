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
  trigger?: React.ReactElement
}

export function CreateItemDialog({
  trigger,
  ...props
}: Props & React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={trigger ?? <Button {...props}>Create Item</Button>}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new item</DialogTitle>
        </DialogHeader>
        <ItemForm onFinish={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
