# mock-premier-league

Mock of a fantasy football league where users can login and view teams and fixtures created by the admin

  - Hosted on heroku - https://mock-league.herokuapp.com
  - Postman Collection can be found here https://documenter.getpostman.com/view/7087675/UVkiTe9n


# Tools

  - Node.js/TypeScript     
  - Express
  - MongoDB
  - Redis
  - Mocha
  - heroku
  - Docker

### Installation

Mock Premier League requires [Node.js](https://nodejs.org/) v14+ to run.

- Install the dependencies and devDependencies,
- Create a `.env` file in the root directory then check sample.env to set Environment Variables values

# To builds image and start containers

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
