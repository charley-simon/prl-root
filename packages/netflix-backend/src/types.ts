import { Type } from "@sinclair/typebox";

// Reference schemas
export const JobSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  type: Type.Literal("J"),
});

export const DepartmentSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  type: Type.Literal("D"),
});

export const GenderSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  type: Type.Literal("G"),
});

// Core schemas
export const MovieSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  releaseYear: Type.Number(),
  isLocal: Type.Boolean(),
  source: Type.String(),
});

export const PeopleSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  genderId: Type.Number(),
  birthDate: Type.String(),
});

export const MoviePeopleSchema = Type.Object({
  id: Type.Number(),
  movieId: Type.Number(),
  peopleId: Type.Number(),
  jobId: Type.Number(),
  departmentId: Type.Number(),
  characterName: Type.Optional(Type.String()),
});
