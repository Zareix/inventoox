import { useState } from 'react'
import { LocationForm } from './form'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

type Props = {
  roomId?: number
  trigger?: React.ReactElement
}

export function CreateLocationDialog({
  roomId,
  trigger,
  ...props
}: Props & React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={trigger ?? <Button {...props}>Create Location</Button>}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new location</DialogTitle>
        </DialogHeader>
        <LocationForm onFinish={() => setIsOpen(false)} roomId={roomId} />
      </DialogContent>
    </Dialog>
  )
}
