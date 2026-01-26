import { useState } from 'react'
import { RoomForm } from './form'
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

export function CreateRoomDialog({
  trigger,
  ...props
}: Props & React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={trigger ?? <Button {...props}>Create Room</Button>}
      ></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
        </DialogHeader>
        <RoomForm onFinish={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
