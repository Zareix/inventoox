import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { takeFirstOrThrow } from '~/lib/utils'
import { db } from '~/server/db'
import { locations, rooms } from '~/server/db/schema/app'

export const createLocation = createServerFn()
  .inputValidator(
    z.object({
      roomId: z.number(),
      name: z.string().min(3),
      icon: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const room = await db.query.rooms.findFirst({
      where: (_, { eq }) => eq(rooms.id, data.roomId),
    })
    if (!room) {
      throw new Error('Room not found')
    }

    return takeFirstOrThrow(
      await db.insert(locations).values(data).returning(),
      new Error('Failed to create room'),
    )
  })
