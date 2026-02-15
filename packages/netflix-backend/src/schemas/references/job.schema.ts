import { Type, Static } from '@sinclair/typebox'

export const JobSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  name: Type.String({ minLength: 1 }),
  departmentId: Type.Integer({ minimum: 0 })
})

export const JobsSchema = Type.Array(JobSchema)

export type Job = Static<typeof JobSchema>
export type Jobs = Static<typeof JobsSchema>
