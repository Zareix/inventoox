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
import {
  createCategory,
  getAllRootCategories,
} from '~/server/functions/categories'

type Props = {
  parentCategoryId?: number
  onFinish?: () => void
}

export function CategoryForm({ onFinish, parentCategoryId }: Props) {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllRootCategories(),
  })
  const queryClient = useQueryClient()
  const createCategoryMutation = useMutation({
    mutationKey: ['categories', 'create'],
    mutationFn: (data: Parameters<typeof createCategory>[0]['data']) =>
      createCategory({
        data,
      }),
    onSuccess: (data) => {
      form.reset()
      onFinish?.()
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(`Category "${data.name}" created successfully`)
    },
    onError: (error) => {
      toast.error(`Error creating category`, {
        description: error instanceof Error ? error.message : String(error),
      })
    },
  })
  const form = useForm({
    defaultValues: {
      name: '',
      parentCategoryId: parentCategoryId ? String(parentCategoryId) : null,
      icon: 'package',
    },
    onSubmit: ({ value }) => {
      const submittedValue = {
        ...value,
        parentCategoryId: value.parentCategoryId
          ? Number(value.parentCategoryId)
          : undefined,
      }
      createCategoryMutation.mutate(submittedValue)
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(3, 'Category name must be at least 3 characters.'),
        parentCategoryId: z.string().nullable(),
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

  const categories = categoriesQuery.data ?? []

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
          name="parentCategoryId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Parent Category</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.handleChange(value ?? null)
                  }}
                  value={field.state.value}
                  items={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
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
                            : 'Select a parent category (optional)'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {categories.length === 0 ? (
                        <SelectItem value="" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        <SelectItem
                          value={null}
                          className="text-muted-foreground"
                        >
                          Unselect
                        </SelectItem>
                      )}
                      {categories.map((category) => (
                        <SelectItem
                          value={String(category.id)}
                          key={category.name}
                        >
                          {category.name}
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
                  placeholder="Enter category name"
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
