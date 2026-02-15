interface MovieService {
  // Toutes les informations sur le film. Sauf les sous-listes 'Actors','Directors', etc...
  getMovieDetailById(movieId: number): Promise<Movie>;

  // Toutes les informations sur un pêople. Sauf les sous-listes 'Movies', 'Actors','Directors', etc...
  getMovieDetailById(movieId: number): Promise<Person>;

  // Récupère une sous-liste d'un film. 'Actors','Directors', etc...
  getPeopleFromMovie(movieId: number, kind?: 'Actors' | 'Directors'): Promise<Person[]>;

  // Récupère les films dans lesquels peopleId est intervenu en tant que: 'Actors','Directors', etc...
  getMoviesFromPeople(peopleId: number, kind?: 'Actors' | 'Directors'): Promise<Movie[]>;

  // Récupère les personnes ('Writers' | 'Directors') avec lesquels peopleId à travaillé
  getPeopleFromPeople(peopleId: number, kind?: 'Writers' | 'Directors'): Promise<Person[]>;

  // Récupère une liste simplifiée et paginée de films
  listMovies(batch?: { offset: number, limit: number }): Promise<Movie[]>;
}

Les fonctions; getPeopleFromMovie() et getMoviesFromPeople() sont les mêmes sauf que l'une retourne une liste films et l'autre une liste de personnes.
On aurait pu simplifier en:
getListFromPeople(peopleId: number, kind?: 'Movies' | 'Writers' | 'Directors'): Promise<Person[]> | Promise<Person[]>;
Question: Est ce faisable ? est ce plus clair ou plus simple ?
