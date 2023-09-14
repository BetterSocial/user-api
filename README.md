# user-api
User Services API

## Get Started

- After clone the project
- Install dependency by running
```bash
npm install
```
- Run the app
```bash
npm run dev
```

## Running with docker

- make sure you already have `.env` file (can see the `.env.example` for some connection to docker services)

### Prerequisite
- Docker
- Docker compose

### Whats in `docker-compose.yml`
- user-api (this repository)
- mongodb
- redis
- postgresql
- elasticsearch v7 ([compatible with searchly.com](http://www.searchly.com/docs/intro#:~:text=Currently%20available%20we%20are%20supporting%20all%20avalilable%20major%20versions%20of%20Elasticsearch%3B%200.9%2C%201%2C%202%2C%205%2C%206%20and%207))
- docker network `bettersocial-devnetwork` (to let [queue repository](https://github.com/BetterSocial/bettersocial-dev-queue) docker-compose connected)

### Commands
1. Start docker-compose
```bash
docker-compose up -d
```

2. getting into `user-api` bash console
```bash
docker-compose exec user-api bash
```
