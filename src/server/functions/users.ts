import { createServerFn } from '@tanstack/react-start'
import { db } from '~/server/db'

export const getAllUsers = createServerFn().handler(async () => {
  return await db.query.user.findMany({
    columns: {
      id: true,
      name: true,
    },
  })
})
