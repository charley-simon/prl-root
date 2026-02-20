"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulate = simulate;
const events_1 = require("../events/events");
const MovieRepository_1 = require("../repository/MovieRepository");
const movieRepo = new MovieRepository_1.MovieRepository([
/* providers HTTP / File */
]);
events_1.userEvents.on(events_1.UserEventType.FileAdded, async (filePath) => {
    const movie = movieRepo.createMinimal(550, 'Fight Club', filePath);
    await movieRepo.enrich(movie, 'basic');
});
events_1.userEvents.on(events_1.UserEventType.MovieClicked, async (movieId) => {
    const movie = movieRepo.get(movieId);
    if (!movie)
        return;
    movieRepo.recordView(movie);
    if (movie.status === 'basic')
        await movieRepo.enrich(movie, 'medium');
    if (movie.status === 'medium')
        await movieRepo.enrich(movie, 'deep');
});
events_1.engineEvents.on(events_1.EngineEventType.HousekeepingDone, () => {
    movieRepo.get(550) && movieRepo.maybeDowngrade(movieRepo.get(550));
});
async function simulate() {
    events_1.userEvents.emit(events_1.UserEventType.FileAdded, './movies/fight-club.mp4');
    setTimeout(() => events_1.userEvents.emit(events_1.UserEventType.MovieClicked, 550), 2000);
    setTimeout(() => events_1.engineEvents.emit(events_1.EngineEventType.HousekeepingDone), 5000);
}
