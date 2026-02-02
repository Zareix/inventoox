import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { importCsvItems } from '~/server/functions/items'

type Props = {
  trigger?: React.ReactElement
} & React.ComponentProps<typeof Button>

export const ImportDialogButton = ({ trigger, ...props }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()
  const uploadFileMutation = useMutation({
    mutationFn: async (inputFile: File) => {
      return importCsvItems({
        data: {
          csvData: await inputFile.text(),
        },
      })
    },
    onSuccess: () => {
      setIsOpen(false)
      toast('File imported successfully')
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: (error) => {
      toast.error(`Error importing file: ${error}`)
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={trigger ?? <Button {...props}>Import</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new item</DialogTitle>
        </DialogHeader>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null
            setFile(selectedFile)
          }}
        />
        <Button
          disabled={uploadFileMutation.isPending || !file}
          onClick={() => {
            if (file) {
              uploadFileMutation.mutate(file)
            } else {
              toast.error('Please select a file')
            }
          }}
        >
          {uploadFileMutation.isPending ? 'Importing...' : 'Import CSV'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
