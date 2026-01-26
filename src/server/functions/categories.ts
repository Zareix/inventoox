import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { takeFirstOrThrow } from '~/lib/utils'
import { db } from '~/server/db'
import { categories } from '~/server/db/schema/app'

export const getAllCategories = createServerFn().handler(async () => {
  return await db.query.categories.findMany()
})

export const getAllCategoriesWithSubcategories = createServerFn().handler(
  async () => {
    return await db.query.categories.findMany({
      where: (_, { isNull }) => isNull(categories.parentCategoryId),
      with: {
        subcategories: true,
      },
    })
  },
)

export const getAllRootCategories = createServerFn().handler(async () => {
  return await db.query.categories.findMany({
    where: (_, { isNull }) => isNull(categories.parentCategoryId),
  })
})

export const createCategory = createServerFn()
  .inputValidator(
    z.object({
      name: z.string().min(3),
      icon: z.string(),
      parentCategoryId: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    return takeFirstOrThrow(
      await db.insert(categories).values(data).returning(),
      new Error('Failed to create category'),
    )
  })
