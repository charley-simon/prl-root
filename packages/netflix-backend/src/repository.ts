import fs from "fs";
import path from "path";
import {
  MovieSchema,
  PeopleSchema,
  MoviePeopleSchema,
  JobSchema,
  DepartmentSchema,
  GenderSchema,
} from "./types";

const dataPath = path.join(__dirname, "../data");

function readJSON(fileName: string) {
  return JSON.parse(fs.readFileSync(path.join(dataPath, fileName), "utf-8"));
}

export class Repository {
  movies = readJSON("movies.json") as (typeof MovieSchema)[];
  people = readJSON("people.json") as (typeof PeopleSchema)[];
  moviePeople = readJSON("movie_people.json") as (typeof MoviePeopleSchema)[];
  references = readJSON("reference.json");

  getMovies() {
    return this.movies;
  }

  getMovieById(id: number) {
    const movie = this.movies.find((m) => m.id == id);
    console.log(`getMovieById(${id}) => ${movie ? movie.title : "not found"}`);
    return movie;
  }

  getPeople() {
    return this.people;
  }

  getPersonById(id: number) {
    return this.people.find((p) => p.id == id);
  }

  getReferences() {
    return this.references;
  }

  getPeoples(
    filters: {
      movieId?: number;
      roles?: string[];
      departments?: string[];
      genderId?: number;
    } = {},
  ) {
    let result = this.moviePeople;

    if (filters.movieId) {
      result = result.filter((mp) => mp.movieId == filters.movieId);
    }

    if (filters.roles) {
      const roleIds = this.references.jobs
        .filter((j: any) => filters.roles?.includes(j.name))
        .map((j: any) => j.id);
      result = result.filter((mp) => roleIds.includes(mp.jobId));
    }

    if (filters.departments) {
      const deptIds = this.references.departments
        .filter((d: any) => filters.departments?.includes(d.name))
        .map((d: any) => d.id);
      result = result.filter((mp) => deptIds.includes(mp.departmentId));
    }

    if (filters.genderId) {
      result = result.filter((mp) => {
        const person = this.people.find((p) => p.id == mp.peopleId);
        return person?.genderId == filters.genderId;
      });
    }

    // Retourne objets détaillés people + role + department + characterName
    return result.map((mp) => {
      const person = this.people.find((p) => p.id == mp.peopleId);
      const job = this.references.jobs.find((j: any) => j.id == mp.jobId);
      const department = this.references.departments.find(
        (d: any) => d.id == mp.departmentId,
      );
      return {
        ...person,
        role: job?.name,
        department: department?.name,
        characterName: mp.characterName,
      };
    });
  }

  getActors(movieId: number) {
    return this.getPeoples({ movieId, roles: ["Actor"] });
  }

  getDirectors(movieId: number) {
    return this.getPeoples({ movieId, roles: ["Director"] });
  }
}
