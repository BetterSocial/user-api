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

## Testing

### Prerequisite

1. set `EXECUTABLE_PHP` environment variable in `.env` file. you can run `which php` in your console to find it

```
EXECUTABLE_PHP=/path/to/bin/php
```

2. set `LARAVEL_PATH` environment variable in `.env` file. need to set fullpath to your laravel project that contain migration

```
LARAVEL_PATH=/path/to/laravel
```

3. you need to create database named "testing" in your Postgresdb
4. open `.env.test` file. If you don't have this `.env.test` file, copy paste from `.env`
5. Change these value in `.env.test`

```
DB_HOST=localhost
DB_NAME=testing
DB_PASSWORD=<your-postgresql-password>
DB_USERNAME=<your-postgresql-username>
// Add this value if you copy from .env file
DB_SSL=false
```

### Running Test

1. To run api (integration) testing

```bash
npm run test:api
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
