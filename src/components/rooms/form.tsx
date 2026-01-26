import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { iconNames } from 'lucide-react/dynamic'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import { createRoom } from '~/server/functions/rooms'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { DynIcon } from '~/components/dyn-icon'

type Props = {
  onFinish?: () => void
}

export function RoomForm({ onFinish }: Props) {
  const queryClient = useQueryClient()
  const createRoomMutation = useMutation({
    mutationKey: ['rooms', 'create'],
    mutationFn: async (data: Parameters<typeof createRoom>[0]['data']) =>
      createRoom({
        data,
      }),
    onSuccess: (data) => {
      form.reset()
      onFinish?.()
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success(`Room "${data.name}" created successfully`)
    },
  })
  const form = useForm({
    defaultValues: {
      name: '',
      icon: 'warehouse',
    },
    onSubmit: ({ value }) => {
      createRoomMutation.mutate(value)
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(3, 'Room name must be at least 3 characters.'),
        icon: z.string(),
      }),
    },
  })
  const [searchIcon, setSearchIcon] = useState('')
  const filteredIconNames = useMemo(
    () =>
      iconNames
        .filter((name) => {
          if (!searchIcon || searchIcon === '') return false
          return name.includes(searchIcon)
        })
        .slice(0, 100),
    [searchIcon],
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="grid gap-2"
    >
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Enter room name"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="icon"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Icon</FieldLabel>
                <Popover modal>
                  <PopoverTrigger
                    render={
                      <div className="flex items-center gap-2">
                        <DynIcon icon={field.state.value} />
                        <Button
                          variant="ghost"
                          className={cn(
                            'h-10 grow justify-between',
                            !field.state.value && 'text-muted-foreground',
                          )}
                          type="button"
                        >
                          {field.state.value
                            ? iconNames.find(
                                (name) => name === field.state.value,
                              )
                            : 'Select icon'}
                          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </div>
                    }
                  ></PopoverTrigger>
                  <PopoverContent className="w-50 p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={'Search icons...'}
                        onValueChange={setSearchIcon}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {!searchIcon || searchIcon === ''
                            ? 'No icons found.'
                            : 'No icons found for '}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredIconNames.map((name) => (
                            <CommandItem
                              value={name}
                              key={name}
                              onSelect={() => {
                                field.handleChange(name)
                              }}
                            >
                              <DynIcon icon={name} />
                              {name}
                              <CheckIcon
                                className={cn(
                                  'ml-auto',
                                  name === field.state.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>
      <Button
        type="submit"
        className="ml-auto"
        disabled={createRoomMutation.isPending}
      >
        {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
      </Button>
    </form>
  )
}
