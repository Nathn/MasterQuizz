# MasterQuizz

An interactive, multiplayer quizz website powered by Angular and Node.

![status](https://img.shields.io/website?url=http%3A%2F%masterquizz.fr)

## Installation

### Prerequisites
-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/en/download) with [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Clone the repository
```
git clone git@github.com:Nathn/MasterQuizz.git
cd MasterQuizz
```

### Install dependencies
```
npm install --include=dev --legacy-peer-deps
```
This will install both frontend and backend dependencies, including:
- [Angular 19.1.6](https://github.com/angular/angular/releases/tag/19.1.6)
- [Typescript 5.8.2](https://github.com/microsoft/TypeScript/releases/tag/v5.8.2)

## Set up environment(s)
### Frontend
Edit `frontend/environments/environment.ts` to add Firebase credentials. These should have Google authentification set up in [your console](console.firebase.google.com). If you plan to run a production server, duplicate the environment.ts file into a new `environment.prod.ts` with production credentials, a reliable `encryptionKey` and `production` set to `true`. You can also have a `environment.prodhttp.ts` if you want to support `http://` in production.

### Backend
Create `backend/.env` to the following :
```
PORT=3000
WS_PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@<domain>/masterquizz
CORS_WHITELIST=http://localhost:3000,http://localhost:8080
ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY
```
You can get a `MONGO_URI` by creating a new project on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).

## Development server
Run `npm run dev` for a development frontend+backend. Navigate to `http://localhost:8080/`. The application will automatically reload if you change any of the source files.

## Production build
Run `npm run prod` to build the project and start the server in production conditions, then navigate to `http://localhost:3000/`. The build artifacts will be stored in the `dist/` directory.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
