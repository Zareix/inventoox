import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { takeFirstOrThrow } from '~/lib/utils'
import { db } from '~/server/db'
import { rooms } from '~/server/db/schema/app'

export const getAllRooms = createServerFn().handler(async () => {
  return await db.query.rooms.findMany()
})

export const getAllRoomsWithLocations = createServerFn().handler(async () => {
  return await db.query.rooms.findMany({
    with: {
      locations: true,
    },
  })
})

export const createRoom = createServerFn()
  .inputValidator(z.object({ name: z.string().min(3), icon: z.string() }))
  .handler(async ({ data }) => {
    return takeFirstOrThrow(
      await db.insert(rooms).values(data).returning(),
      new Error('Failed to create room'),
    )
  })
