import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { parse as csvParse } from 'csv-parse/sync'
import { eq as dEq } from 'drizzle-orm'
import { takeFirstOrThrow } from '~/lib/utils'
import { db } from '~/server/db'
import { categories, items, locations, rooms } from '~/server/db/schema/app'
import { user } from '~/server/db/schema/auth'

export const getAllItems = createServerFn().handler(async () => {
  return await db.query.items.findMany({
    with: {
      category: {
        with: {
          parent: true,
        },
      },
      location: {
        with: {
          room: true,
        },
      },
      owner: true,
    },
    orderBy: (item, { desc }) => [desc(item.updated_at), desc(item.createdAt)],
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

export const editItem = createServerFn()
  .inputValidator(
    z.object({
      id: z.number(),
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
    if (
      !(await db.query.items.findFirst({
        where: (_, { eq }) => eq(items.id, data.id),
      }))
    ) {
      throw new Error('Item not found')
    }
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

    const item = takeFirstOrThrow(
      await db
        .update(items)
        .set({
          name: data.name,
          categoryId: data.categoryId,
          locationId: data.locationId,
          value: data.value,
          size: data.size,
          quantity: data.quantity,
          brand: data.brand,
          state: data.state,
          owner_id: data.owner_id,
        })
        .where(dEq(items.id, data.id))
        .returning(),
      new Error('Failed to update item'),
    )

    return item
  })

export const deleteItem = createServerFn()
  .inputValidator(
    z.object({
      id: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    if (
      !(await db.query.items.findFirst({
        where: (_, { eq }) => eq(items.id, data.id),
      }))
    ) {
      throw new Error('Item not found')
    }

    const item = takeFirstOrThrow(
      await db.delete(items).where(dEq(items.id, data.id)).returning(),
      new Error('Failed to delete item'),
    )

    return item
  })

const importCsvSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  room: z.string().min(1),
  location: z.string().optional(),
  value: z.coerce.number().min(0).optional(),
  size: z.string().optional(),
  quantity: z.coerce.number().optional(),
  brand: z.string().optional(),
  state: z.enum(['stored', 'in use']).optional(),
  owner: z.string().optional(),
})

export const importCsvItems = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      csvData: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const rows = csvParse(data.csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    for (const row of rows) {
      const parsed = importCsvSchema.parse(row)

      let room = await db.query.rooms.findFirst({
        where: (_, { eq }) => eq(rooms.name, parsed.room),
      })
      if (!room) {
        room = takeFirstOrThrow(
          await db
            .insert(rooms)
            .values({ name: parsed.room, icon: 'package' })
            .returning(),
          new Error('Failed to create room'),
        )
      }

      let location = await db.query.locations.findFirst({
        where: (_, { and, eq }) =>
          and(
            eq(locations.name, parsed.location ?? ''),
            eq(locations.roomId, room.id),
          ),
      })
      if (!location) {
        location = takeFirstOrThrow(
          await db
            .insert(locations)
            .values({
              name: parsed.location ?? room.name,
              roomId: room.id,
              icon: 'box',
            })
            .returning(),
          new Error('Failed to create location'),
        )
      }

      let category = await db.query.categories.findFirst({
        where: (_, { eq }) => eq(categories.name, parsed.category),
      })
      if (!category) {
        const result = await db
          .insert(categories)
          .values({ name: parsed.category, icon: 'package' })
          .returning()
        category = takeFirstOrThrow(
          result,
          new Error('Failed to create category'),
        )
      }

      let subCategory = await db.query.categories.findFirst({
        where: (_, { eq }) => eq(categories.name, parsed.subcategory ?? ''),
      })
      if (!subCategory && parsed.subcategory && parsed.subcategory !== '') {
        const result = await db
          .insert(categories)
          .values({
            name: parsed.subcategory,
            icon: 'package',
            parentCategoryId: category.id,
          })
          .returning()
        subCategory = takeFirstOrThrow(
          result,
          new Error('Failed to create subcategory'),
        )
      }

      const owner = parsed.owner
        ? await db.query.user.findFirst({
            where: (_, { eq }) => eq(user.name, parsed.owner || ''),
          })
        : null

      await db.insert(items).values({
        name: parsed.name,
        categoryId: subCategory ? subCategory.id : category.id,
        locationId: location.id,
        value: parsed.value ?? 0,
        size: parsed.size ?? '',
        quantity: parsed.quantity ?? 1,
        brand: parsed.brand ?? '',
        state: parsed.state ?? 'stored',
        owner_id: owner?.id,
      })
    }
  })
