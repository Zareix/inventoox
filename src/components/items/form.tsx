import { useForm } from '@tanstack/react-form'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Euro } from 'lucide-react'
import type { Item } from '~/server/db/schema/app'
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
import { getAllRoomsWithLocations } from '~/server/functions/rooms'
import { createItem } from '~/server/functions/items'
import { getAllCategoriesWithSubcategories } from '~/server/functions/categories'
import { getAllUsers } from '~/server/functions/users'
import { InputGroup } from '~/components/ui/input-group'

type Props = {
  onFinish?: () => void
}

export function ItemForm({ onFinish }: Props) {
  const roomsQuery = useQuery({
    queryKey: ['rooms-with-locations'],
    queryFn: () => getAllRoomsWithLocations(),
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'with-subcategories'],
    queryFn: () => getAllCategoriesWithSubcategories(),
  })
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsers(),
  })

  const queryClient = useQueryClient()
  const createItemMutation = useMutation({
    mutationKey: ['items', 'create'],
    mutationFn: (data: Parameters<typeof createItem>[0]['data']) =>
      createItem({
        data,
      }),
    onSuccess: (data) => {
      form.reset()
      onFinish?.()
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success(`Item "${data.name}" created successfully`)
    },
    onError: (error) => {
      toast.error(`Error creating item`, {
        description: error instanceof Error ? error.message : String(error),
      })
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
      categoryId: '',
      locationId: '',
      value: 0,
      size: '',
      quantity: 1,
      brand: '',
      state: 'stored' as Item['state'],
      owner_id: null as string | null,
    },
    onSubmit: ({ value }) => {
      const submittedValue = {
        ...value,
        categoryId: Number(value.categoryId),
        locationId: Number(value.locationId),
        owner_id: value.owner_id ? String(value.owner_id) : null,
      }
      createItemMutation.mutate(submittedValue)
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(3, 'Item name must be at least 3 characters.'),
        categoryId: z.string().min(1, 'A category must be selected.'),
        locationId: z.string().min(1, 'A location must be selected.'),
        value: z.number().nonnegative('Value must be a positive number.'),
        size: z.string().min(0, 'Size is required.'),
        quantity: z.number().min(1, 'Quantity must be at least 1.'),
        brand: z.string(),
        state: z.enum(['stored', 'in use']),
        owner_id: z.string().nullable(),
      }),
    },
  })

  const rooms = roomsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const users = usersQuery.data ?? []

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
                  placeholder="Enter item name"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="owner_id"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
                <Select
                  onValueChange={(value) => field.handleChange(value ?? '')}
                  value={field.state.value}
                  items={[
                    { value: '', label: 'No Owner' },
                    ...users.map((user) => ({
                      value: String(user.id),
                      label: user.name,
                    })),
                  ]}
                  disabled={usersQuery.isLoading || usersQuery.isError}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        usersQuery.isLoading
                          ? 'Loading users...'
                          : usersQuery.isError
                            ? 'Error loading users'
                            : 'Select an owner (optional)'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Users</SelectLabel>
                      {users.length === 0 && (
                        <SelectItem value="" disabled>
                          No users available
                        </SelectItem>
                      )}
                      <SelectItem
                        value={null}
                        className="text-muted-foreground"
                      >
                        No Owner
                      </SelectItem>
                      {users.map((user) => (
                        <SelectItem value={String(user.id)} key={user.id}>
                          {user.name}
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
          name="categoryId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <Select
                  onValueChange={(value) => field.handleChange(value ?? '')}
                  value={field.state.value}
                  items={categories.flatMap((category) => [
                    {
                      value: String(category.id),
                      label: category.name,
                    },
                    ...category.subcategories.map((subcategory) => ({
                      value: String(subcategory.id),
                      label: `${category.name} / ${subcategory.name}`,
                    })),
                  ])}
                  disabled={
                    categoriesQuery.isLoading || categoriesQuery.isError
                  }
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        categoriesQuery.isLoading
                          ? 'Loading categories...'
                          : categoriesQuery.isError
                            ? 'Error loading categories'
                            : 'Select a category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && (
                      <SelectItem value="" disabled>
                        No categories available
                      </SelectItem>
                    )}
                    {categories.map((category) => (
                      <SelectGroup key={category.id}>
                        <SelectLabel>{category.name}</SelectLabel>
                        <SelectItem
                          value={String(category.id)}
                          key={category.id}
                        >
                          {category.name}
                        </SelectItem>
                        {category.subcategories.map((subcategory) => (
                          <SelectItem
                            value={String(subcategory.id)}
                            key={subcategory.id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="locationId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                <Select
                  onValueChange={(value) => field.handleChange(value ?? '')}
                  value={field.state.value}
                  items={rooms.flatMap((room) =>
                    room.locations.map((location) => ({
                      label:
                        location.name === room.name
                          ? location.name
                          : `${room.name} / ${location.name}`,
                      value: String(location.id),
                    })),
                  )}
                  disabled={roomsQuery.isLoading || roomsQuery.isError}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        roomsQuery.isLoading
                          ? 'Loading locations...'
                          : roomsQuery.isError
                            ? 'Error loading locations'
                            : 'Select a location'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.length === 0 && (
                      <SelectItem value="" disabled>
                        No locations available
                      </SelectItem>
                    )}
                    {rooms.map((room) => (
                      <SelectGroup key={room.id}>
                        <SelectLabel>{room.name}</SelectLabel>
                        {room.locations.map((location) => (
                          <SelectItem
                            value={String(location.id)}
                            key={location.id}
                          >
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <div className="flex gap-2">
          <form.Field
            name="brand"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Brand</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter item brand"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="size"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Size</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter item size"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </div>
        <div className="flex gap-2">
          <form.Field
            name="quantity"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} className="w-full">
                  <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={String(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                    placeholder="Enter item quantity"
                    autoComplete="off"
                    type="number"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="value"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} className="w-full">
                  <FieldLabel htmlFor={field.name}>Value</FieldLabel>
                  <InputGroup>
                    <Euro className="size-4" />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={String(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="Enter item value"
                      autoComplete="off"
                      type="number"
                    />
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </div>
        <form.Field
          name="state"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>State</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.handleChange(value as Item['state'])
                  }}
                  value={field.state.value}
                  items={[
                    { value: 'stored', label: 'Stored' },
                    { value: 'in use', label: 'In use' },
                  ]}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder={'Select a state'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>States</SelectLabel>
                      <SelectItem value="stored">Stored</SelectItem>
                      <SelectItem value="in use">In use</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
