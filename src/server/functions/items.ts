import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { takeFirstOrThrow } from '~/lib/utils'
import { db } from '~/server/db'
import { categories, items, locations } from '~/server/db/schema/app'

export const getAllItems = createServerFn().handler(async () => {
  return await db.query.items.findMany({
    with: {
      category: true,
      location: {
        with: {
          room: true,
        },
      },
      owner: true,
    },
  })
})

export const createItem = createServerFn()
  .inputValidator(
    z.object({
      name: z.string().min(3),
      categoryId: z.number(),
      locationId: z.number(),
      value: z.number(),
      size: z.string(),
      quantity: z.number(),
      brand: z.string(),
      state: z.enum(['stored', 'in use']),
      owner_id: z.string().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const category = await db.query.categories.findFirst({
      where: (_, { eq }) => eq(categories.id, data.categoryId),
    })
    if (!category) {
      throw new Error('Category not found')
    }

    const location = await db.query.locations.findFirst({
      where: (_, { eq }) => eq(locations.id, data.locationId),
    })
    if (!location) {
      throw new Error('Location not found')
    }

    return takeFirstOrThrow(
      await db.insert(items).values(data).returning(),
      new Error('Failed to create item'),
    )
  })
