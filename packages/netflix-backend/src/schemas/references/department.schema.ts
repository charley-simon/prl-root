import { Type, Static } from '@sinclair/typebox'

export const DepartmentSchema = Type.Object({
  id: Type.Integer({ minimum: 0 }),
  name: Type.String({ minLength: 1 })
})

export const DepartmentsSchema = Type.Array(DepartmentSchema)

export type Department = Static<typeof DepartmentSchema>
export type Departments = Static<typeof DepartmentsSchema>
