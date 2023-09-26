# MasterQuizz

An interactive, multiplayer quizz website powered by Angular and Node.

## Recommended configuration

-   Python v3.10.7
-   Node v16.18.1
-   NPM v8.19.2

### Fedora install

```
((sudo dnf install python3.10 python3.11 && sudo ln -sf /usr/bin/python3.10 /usr/bin/python && sudo ln -sf /usr/bin/python3.10 /usr/bin/python3) || echo "python install failed") && ((sudo dnf install npm || echo "npm install failed") && (sudo npm install -g n || echo "n install failed") && (sudo n 16.18.1 || echo "n version change failed") && sudo npm install)
```

#### Troubleshooting

If the command above results in `ModuleNotFoundError: No module named 'dnf'`, simply run this to fix Fedora's package manager :

```
sudo sed -i 's|#!/usr/bin/python3|#!/usr/bin/python3.10|g' /usr/bin/dnf
```

then run the second part of the installation command again :

```
(sudo dnf install npm || echo "npm install failed") && (sudo npm install -g n || echo "n install failed") && (sudo n 16.18.1 || echo "n version change failed") && sudo npm install
```

### Ubuntu install

```
((sudo apt-get install python3.10 python3.11 && sudo ln -sf /usr/bin/python3.10 /usr/bin/python && sudo ln -sf /usr/bin/python3.10 /usr/bin/python3) || echo "python install failed") && ((sudo apt-get install npm || echo "npm install failed") && (sudo npm install -g n || echo "n install failed") && (sudo n 16.18.1 || echo "n version change failed") && sudo npm install)
```

## Development server

Run `npm run dev` for a development frontend+backend. Navigate to `http://localhost:8080/`. The application will automatically reload if you change any of the source files.

## Production build

Run `npm run prod` to build the project and start the server in production conditions, then navigate to `http://localhost:3000/`. The build artifacts will be stored in the `dist/` directory.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.
