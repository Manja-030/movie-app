# Movie API

## Description
This is the server-side of a movies web application. The web application will provide users with access to information about different movies and their directors, and movie genres. Users will be able to sign up, update their personal information, create a list of their favorite movies and remove movies from their list.

## Tools

To build the REST API i used for the server side:
- NodeJS
- Express
- MongoDB
User data is verified using LocalStrategy and JWTStrategy from Passport.js.
Bcrypt is used to bcrypt passwords.

## Getting Started

### Clone the repository

```
git clone https://github.com/Manja-030/movie-app.git
```

### Change directory

```
cd movie-app
```

### Install NPM dependencies

```
npm install
```
### Install mongodb

```
npm install
```

### Start the server

```
node server
```

Note: It is recommended to install nodemon for livereloading - It watches for any changes in your node.js app and automatically restarts the server.
For a list of dependencies and middleware refer to the file [package.json](https://github.com/Manja-030/movie-app/blob/main/package.json).

## Deployment
### Deployment to Heroku

- Download and install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
- In a terminal, run `heroku login` and enter your Heroku credentials
- From *your app* directory run `heroku create`
- Use the command `heroku config:set KEY=val` to set the different environment variables (KEY=val) for your application (i.e.  `heroku config:set BASE_URL=[heroku App Name].herokuapp.com` etc.)

- Do `git add .`
- Do `git commit -m" reason for commit"`
- Lastly, do `git push heroku master`.

Please note that you may also use the [Heroko Dashboard](https://dashboard.heroku.com) to set or modify the configurations for your application.

## Test the API
I used postman to test the api.
To use postman, go to the project doc folder and import the docs file into your postman client to ease the testing

## Endpoints

A documentation of all endpoints and examples you can find [here](https://github.com/Manja-030/movie-app/blob/main/public/documentation.html)
