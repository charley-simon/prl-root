import { Type, Static } from '@sinclair/typebox'

export const CategorySchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  name: Type.String({ minLength: 1 })
})

export const CategoriesSchema = Type.Array(CategorySchema)

export type Category = Static<typeof CategorySchema>
export type Categories = Static<typeof CategoriesSchema>
