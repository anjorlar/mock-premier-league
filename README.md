# mock-premier-league

Mock of the premier league where users can register and login and view teams and fixtures created by an admin.

Heroku url can be found here :(https://mock-league.herokuapp.com)

## Documentation
To access the postman documentation click this url
[Postman Collection](https://documenter.getpostman.com/view/7087675/UVkiTe9n)


# Tools
```sh
  - Node.js/TypeScript     
  - Express
  - MongoDB
  - Redis
  - Mocha
  - Heroku
  - Docker
```
### Requirements and Installation

Mock Premier League requires [Node.js](https://nodejs.org/) v14 to run.

- git clone this repo
- Open the terminal and cd into the root of the cloned repo from the terminal
- run npm install to install dependencies and devDependencies
- Create a `.env` file in the root directory then check sample.env to set environment Variables values
- run `npm start to start the app in production`
- run `npm run dev to start this app in development mode`

## Setting up Docker

- Install Docker Desktop [https://docs.docker.com/engine/install/]
- Run the Docker Desktop on your local machine
## To builds image and start containers

- RUN `docker-compose up --build` [only use the --build whenever you make changes to Dockerfile or Package.json]

- RUN `docker-compose up -d` [only use the -d flag to run docker container underground]

- To kill running container(s) `docker-compose down`
- To remove image `docker rmi [IMAGE_ID] -f`
- To remove multiple images `docker rmi -f $(docker images -aq)`
- To access running container `docker exec -it [container_id or container_name] bash`

### Test
- npm run test to run all test

AUTHOR
[Adebayo Anjola](https://github.com/anjorlar)

License
----

MIT
