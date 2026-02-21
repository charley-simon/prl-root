// src/data/mockData.ts
import type {People} from './types.js'

export const movies = [
  { id: 1, title: 'Le Parrain' },
  { id: 2, title: 'Scarface' },
  { id: 3, title: 'Heat' }
];

export const actorsByMovie: Record<number, { id: number; name: string; }[]> = {
  1: [{ id: 10, name: 'Al Pacino' }],
  2: [{ id: 10, name: 'Al Pacino' }],
  3: [{ id: 11, name: 'Robert De Niro' }]
};

export const people = [
  { id: 10, name: 'Al Pacino' },
  { id: 11, name: 'Robert De Niro' },
  { id: 12, name: 'Francis Ford Coppola' }
];

export let datas = new Map();
datas.set("Movies", movies );
datas.set("Actors", people );
datas.set("Directors", people );

/**
 * Frontend:
 * +------------------------+-------------------------------+----------------------------------------------+-------------------------+-----------------------------+-------------------------------+----------------------------------------------------------------------------------------+
 * | Action Utilisateur     | Actions Stack                 | path/Breadcrumb                              | types d'affichage       | Type de données             | Grid/Card                     | UX                                                                                     |
 * |------------------------+-------------------------------+----------------------------------------------+-------------------------+-----------------------------+-------------------------------+----------------------------------------------------------------------------------------+
 * | Clic sur Directors     | stack.push(table='Directors') | Directors                                    | liste                   | Table                       | 'DirectorsGrid'               | Affiche la liste des Directors                                                         |
 * | Clic sur Directors(12) | stack.updateContext(id=12)    | Directors(12)                                | fiche                   | Record                      | 'PeopleDetail/DirectorDetail' | Affiche la fiche de Directors(12)                                                      |
 * | clic sur Movies        | stack.push(table='Movies')    | Directors(12).Movies                         | fiche.liste             | Record.Table                | 'MoviesGrid'                  | Affiche la liste des films de Directors(12)                                            |
 * | clic sur Movies(1)     | stack.updateContext(id=1)     | Directors(12).Movies(1)                      | fiche.fiche             | Record.Record               | 'MovieDetail'                 | Affiche la fiche de Movies(1)                                                          |
 * | clic sur Actors        | stack.push(table='Actors')    | Directors(12).Movies(1).Actors               | fiche.fiche.liste       | Record.Record.Table         | 'Actors'                      | Affiche la liste de Actors qui joue dans Movies(1) de Directors(12)                    |
 * | clic sur Actors(10)    | stack.updateContext(id=10)    | Directors(12).Movies(1).Actors(10)           | fiche.fiche.fiche       | Record.Record.Record        | 'PeopleDetail/ActorDetail'    | Affiche la fiche de Actors(10)                                                         |
 * | clic sur Movies        | stack.push(table='Movies')    | Directors(12).Movies(1).Actors(10).Movies    | fiche.fiche.fiche.liste | Record.Record.Record.Table  | 'MoviesGrid'                  | Affiche la liste de Movies où joue Actors(10) qui jour dans Movies(1) de Directors(12) |
 * | clic sur Movies(2)     | stack.updateContext(id=2)     | Directors(12).Movies(1).Actors(10).Movies(2) | fiche.fiche.fiche.fiche | Record.Record.Record.Record | 'MovieDetail'                 | Affiche la fiche de Movies(2)                                                          |
 * +------------------------+-------------------------------+----------------------------------------------+-------------------------+-----------------------------+-------------------------------+----------------------------------------------------------------------------------------+
 * 
 * Backend:
 * Je ne me souviens plus bien entre les distinct/group by et également les jointures; Left outer join ...
 * Vue Directors:
 *   select Directors.*                       // Les données de Directors
 *     from people as Directors, moviepeople  // Directors=people
 *    where Directors.id=moviepeople.peopleId // Jointure PEOPLE <-> MOVIE-PEOPLE
 *      and ('DI') in moviepeople.jobs        // DIrecteur
 *     [and moviepeople.movieId=:MovieId]     // Pour un film donné
 *
 * Vue Actors:
 *   select Actors.*                        // Les données de Actors
 *     from people as Actors, moviepeople   // Actors=people
 *    where Actors.id=moviepeople.peopleId  // Jointure PEOPLE <-> MOVIE-PEOPLE
 *      and ('AP'|'AC') in moviepeople.jobs // Acteur Principal ou Acteur Secondaire
 *     [and moviepeople.movieId=:MovieId]   // Pour un film donné
 * 
 */
