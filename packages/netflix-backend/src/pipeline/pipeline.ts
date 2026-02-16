import {
  userEvents,
  engineEvents,
  UserEventType,
  EngineEventType,
  StatsEventType
} from '../events/events'
import { MovieRepository } from '../repository/MovieRepository'

const movieRepo = new MovieRepository([
  /* providers HTTP / File */
])

userEvents.on(UserEventType.FileAdded, async (filePath: string) => {
  const movie = movieRepo.createMinimal(550, 'Fight Club', filePath)
  await movieRepo.enrich(movie, 'basic')
})

userEvents.on(UserEventType.MovieClicked, async (movieId: number) => {
  const movie = movieRepo.get(movieId)
  if (!movie) return
  movieRepo.recordView(movie)
  if (movie.status === 'basic') await movieRepo.enrich(movie, 'medium')
  if (movie.status === 'medium') await movieRepo.enrich(movie, 'deep')
})

engineEvents.on(EngineEventType.HousekeepingDone, () => {
  movieRepo.get(550) && movieRepo.maybeDowngrade(movieRepo.get(550)!)
})

export async function simulate() {
  userEvents.emit(UserEventType.FileAdded, './movies/fight-club.mp4')
  setTimeout(() => userEvents.emit(UserEventType.MovieClicked, 550), 2000)
  setTimeout(() => engineEvents.emit(EngineEventType.HousekeepingDone), 5000)
}
