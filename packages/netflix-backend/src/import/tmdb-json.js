import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

function readJSON(fileName) {
  return JSON.parse(fs.readFileSync(fileName, 'utf-8'))
}

function writeJSON(fileName, jsonData) {
  console.log(`writing: ${fileName}, array.length ${jsonData.length}`)
  return fs.writeFileSync(fileName, JSON.stringify(jsonData), 'utf-8')
}

const moviesSource = readJSON('./data/tmdb/movies.json')
// console.log('movie-list: ', moviesSource);

const moviesListe = []
const moviesDetail = []
const categories = []
const peoples = []
const peoplesDetail = []
const roles = []
const jobs = []
const departments = []

function getMovieById(id) {
  const movie = moviesSource.find(m => m.id == id)
  console.log(`getMovieById(${id}) => ${movie ? movie.title : 'not found'}`)
  return movie
}

function addCategory(category) {
  let result = categories.find(m => m.id == category.id)
  if (!result) {
    categories.push(category)
    result = category
  }
  return result
}

function addJob(job, department) {
  if (!job) job = 'Unknow'
  let result = jobs.find(m => m.name == job)
  if (!result) {
    result = { id: jobs.length, name: job, departmentId: department.id }
    jobs.push(result)
  }
  return result
}

function addDepartment(department) {
  if (!department) department = 'Unknow'
  let result = departments.find(m => m.name == department)
  if (!result) {
    result = { id: departments.length, name: department }
    departments.push(result)
  }
  return result
}

function addPeople(people, movieId) {
  const result = peoples.find(p => p.id == people.id)
  if (!result) {
    // Job & Department
    if (people.job) addJob(people.job, addDepartment(people.department))

    peoples.push({
      id: people.id,
      gender: people.gender,
      name: people.name
    })
    peoplesDetail.push({
      id: people.id,
      gender: people.gender,
      name: people.name
    })
  }
  const job = jobs.find(m => m.name == people.job)
  if (job) {
    let role = { id: roles.length, movieId: movieId, personId: people.id, jobId: job.id }
    if (job.name == 'Actor') role.options = people.character
    roles.push(role)
  }
}

function convertImage(fromImageName, toImageName, width) {
  // console.log(`    Before: convertImage(${fromImageName}, ${toImageName}, ${width})`)
  if (fs.existsSync(fromImageName)) {
    sharp(fromImageName)
      .resize(width)
      .toFormat('avif', { palette: true })
      .toFile(toImageName)
      // .then(info => console.log(`    Image converted: ${toImageName} (${info.size} bytes)`))
      .catch(err => console.error(`Error in converting ${fromImageName} to ${toImageName}: ${err}`))
  }
  // console.log(`    After: convertImage(${fromImageName}, ${toImageName}, ${width})`)
  return toImageName
}

function importMovie(movieId) {
  const movie = getMovieById(movieId)
  let movieShort = {}
  let movieDetail = {}

  // categories
  const movieCategories = []
  if (movie.genres) {
    movie.categories.forEach(genre => {
      movieCategories.push(addCategory(genre))
    })
  }
  // Directors
  if (movie.directors) {
    movie.directors.forEach(people => {
      if (!people.job) people.job = 'Director'
      if (!people.department) people.department = 'Directing'
      addPeople(people, movieId)
    })
  }
  if (movie.writers) {
    movie.writers.forEach(people => {
      if (!people.job) people.job = 'Writer'
      if (!people.department) people.department = 'Writing'
      addPeople(people, movieId)
    })
  }
  if (movie.actors) {
    movie.actors.forEach(people => {
      if (!people.job) people.job = 'Actor'
      if (!people.department) people.department = 'Acting'
      addPeople(people, movieId)
    })
  }
  // Traitements des images

  movieShort = {
    id: movieId,
    title: movie.title,
    categories: movieCategories,
    releaseYear: movie.year,
    tagLine: movie.tagline,
    trailerSource: '',
    isLocal: false
  }
  moviesListe.push(movieShort)

  movieDetail = {
    id: movieId,
    title: movie.title,
    originalTitle: movie.original_title,
    categories: movieCategories,
    releaseYear: movie.year,
    trailerSource: '',
    isLocal: false,
    movieSource: '',
    synopsis: movie.overview,
    tagLine: movie.tagline,
    popularity: movie.popularity,
    vote: movie.rating
  }

  convertImage(
    `./tmdb/${movie.id}-poster.avif`,
    `./data/assets/movies/${movie.id}-posterSm.avif`,
    100
  )
  convertImage(
    `./tmdb/${movie.id}-poster.avif`,
    `./data/assets/movies/${movie.id}-posterMd.avif`,
    300
  )
  convertImage(
    `./tmdb/${movie.id}-poster.avif`,
    `./data/assets/movies/${movie.id}-posterLg.avif`,
    500
  )
  convertImage(
    `./tmdb/${movie.id}-backdrop.avif`,
    `./data/assets/movies/${movie.id}-backgroundMd.avif`,
    300
  )
  convertImage(
    `./tmdb/${movie.id}-backdrop.avif`,
    `./data/assets/movies/${movie.id}-backgroundLg.avif`,
    1000
  )
  moviesDetail.push(movieDetail)

  console.log(
    `Movie id: ${movieDetail.id}, title: ${movieDetail.title} added ${movieDetail.length}`
  )
}

function saveMovieDetail(index) {
  const movie = moviesDetail[index]
  if (!movie) return

  writeJSON(`./data/movies/${movie.id}-detail.json`, movie)
}

function savePeopleDetail(index) {
  const people = peoplesDetail[index]
  if (!people) return

  writeJSON(`./data/people/${people.id}-profil.json`, people)
}

function main() {
  addJob('Unknow', addDepartment('Unknow'))
  addJob('Actor', addDepartment('Acting'))
  addJob('Director', addDepartment('Directing'))
  addJob('Writer', addDepartment('Writing'))

  moviesSource.forEach(movieSource => {
    importMovie(movieSource.id)
  })

  moviesDetail.forEach((movie, index) => {
    saveMovieDetail(index)
  })
  peoplesDetail.forEach((people, index) => {
    savePeopleDetail(index)
  })

  writeJSON('./data/categories.json', categories)
  writeJSON('./data/departments.json', departments)
  writeJSON('./data/jobs.json', jobs)
  writeJSON('./data/people-liste.json', peoples)
  writeJSON('./data/people.json', peoplesDetail)
  writeJSON('./data/movies-liste.json', moviesListe)
  writeJSON('./data/movies.json', moviesDetail)
  writeJSON('./data/movies-people.json', roles)

  // Récap
  /*
  console.log('categories:');
  categories.forEach( (genre) => {console.log('id: ', genre.id, ', name: ', genre.name)} );
  console.log('DEPARTMENTS:');
  departments.forEach( (department) => {console.log('id: ', department.id, ', name: ', department.name)} );
  console.log('JOBS:');
  jobs.forEach( (job) => {console.log('id: ', job.id, ', name: ', job.name, ' departmentId: ', job.departmentId )} );
  console.log('ROLES:');
  roles.forEach( (role) => {console.log('id: ', role.id, ', movieId: ', role.movieId, ' peopleId: ', role.peopleId, 'jobId:', role.jobId, ', options: ', role.options )} );
  */
}

await main()

/** TODO:
 * Gérer les images:
 * récupérer les images dans data/ : OK
 * Les transformer en .avif        : OK
 * Les normaliser format, taille, portrait/landscape : OK
 * Les colorimétrie, transparence.
 * - Générer plusieurs images à partir de la même : OK
 */
