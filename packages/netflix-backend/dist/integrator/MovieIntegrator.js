"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieIntegrator = void 0;
class MovieIntegrator {
    async integrate(bundle) {
        const details = bundle.details;
        const credits = bundle.credits;
        const images = bundle.images;
        return {
            id: details.id,
            title: details.title,
            year: details.release_date ? parseInt(details.release_date.split('-')[0]) : 0,
            poster: images?.posters?.[0]?.file_path || '',
            backdrop: images?.backdrops?.[0]?.file_path || '',
            cast: credits?.cast?.map(c => ({
                id: c.id,
                name: c.name,
                character: c.character
            })) || [],
            crew: credits?.crew?.map(c => ({
                id: c.id,
                name: c.name,
                job: c.job
            })) || []
        };
    }
}
exports.MovieIntegrator = MovieIntegrator;
