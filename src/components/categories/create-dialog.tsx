import { useState } from 'react'
import { CategoryForm } from '~/components/categories/form'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

type Props = {
  parentCategoryId?: number
  trigger?: React.ReactElement
}

export function CreateCategoryDialog({
  parentCategoryId,
  trigger,
  ...props
}: Props & React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button {...props}>
              {parentCategoryId ? 'Create Subcategory' : 'Create Category'}
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new category</DialogTitle>
        </DialogHeader>
        <CategoryForm
          onFinish={() => setIsOpen(false)}
          parentCategoryId={parentCategoryId}
        />
      </DialogContent>
    </Dialog>
  )
}
