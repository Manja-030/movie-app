# Server-side component of Movie App

## Tools

- NodeJS
- Express
- MongoDB

## Getting Started

To get started is to clone the repository:

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

### Start the server

```
node server
```

Note: It is recommended to install nodemon for livereloading - It watches for any changes in your node.js app and automatically restarts the server

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

## User Endpoints
 - Login - 
 - Register - 

## Movie Endpoints

- Get all movies - 



