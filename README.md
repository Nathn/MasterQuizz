# MasterQuizz

An interactive, multiplayer quizz website powered by Angular and Node.

## Docker install

```
sudo docker build -t masterquizz -f Dockerfile.environment .
```
```
sudo docker run -p 8080:8080 -p 3000:3000 -p 3001:3001 masterquizz
```

Then open `http://localhost:8080`.

## Development server

Run `npm run dev` for a development frontend+backend. Navigate to `http://localhost:8080/`. The application will automatically reload if you change any of the source files.

## Production build

Run `npm run prod` to build the project and start the server in production conditions, then navigate to `http://localhost:3000/`. The build artifacts will be stored in the `dist/` directory.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
