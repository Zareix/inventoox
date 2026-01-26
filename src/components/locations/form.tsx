import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { iconNames } from 'lucide-react/dynamic'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { getAllRooms } from '~/server/functions/rooms'
import { createLocation } from '~/server/functions/locations'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { DynIcon } from '~/components/dyn-icon'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { cn } from '~/lib/utils'

type Props = {
  roomId?: number
  onFinish?: () => void
}

export function LocationForm({ onFinish, roomId }: Props) {
  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: () => getAllRooms(),
  })
  const queryClient = useQueryClient()
  const createLocationMutation = useMutation({
    mutationKey: ['rooms', 'create'],
    mutationFn: (data: Parameters<typeof createLocation>[0]['data']) =>
      createLocation({
        data,
      }),
    onSuccess: (data) => {
      form.reset()
      onFinish?.()
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success(`Location "${data.name}" created successfully`)
    },
    onError: (error) => {
      toast.error(`Error creating location`, {
        description: error instanceof Error ? error.message : String(error),
      })
    },
  })
  const form = useForm({
    defaultValues: {
      name: '',
      roomId: roomId ? String(roomId) : '',
      icon: 'package',
    },
    onSubmit: ({ value }) => {
      const submittedValue = { ...value, roomId: Number(value.roomId) }
      createLocationMutation.mutate(submittedValue)
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(3, 'Location name must be at least 3 characters.'),
        roomId: z.string().min(1, 'A room must be selected.'),
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

  const rooms = roomsQuery.data ?? []

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
          name="roomId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Room</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.handleChange(value ?? '')
                  }}
                  value={field.state.value}
                  items={rooms.map((room) => ({
                    value: String(room.id),
                    label: room.name,
                  }))}
                  disabled={roomsQuery.isLoading || roomsQuery.isError}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        roomsQuery.isLoading
                          ? 'Loading rooms...'
                          : roomsQuery.isError
                            ? 'Error loading rooms'
                            : 'Select a room'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rooms</SelectLabel>
                      {rooms.length === 0 && (
                        <SelectItem value="" disabled>
                          No rooms available
                        </SelectItem>
                      )}
                      {rooms.map((room) => (
                        <SelectItem value={String(room.id)} key={room.name}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
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
                  placeholder="Enter location name"
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
      <Button type="submit" className="ml-auto">
        Submit
      </Button>
    </form>
  )
}
