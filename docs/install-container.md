# Running a Firefish server with containers

:warning: **Firefish is in maintenance mode.** [(announcement)](https://info.firefish.dev/notes/9xsukr38m3komd63)

## Prerequisites

- Latest [Docker](https://docs.docker.com/get-docker/) installation
  - You can also use [Podman](https://podman.io/docs/installation) and [Podman Compose](https://github.com/containers/podman-compose).

## Configuration

Copy the example config files:

```sh
cp docker-compose.example.yml docker-compose.yml
cp .config/example.yml .config/default.yml
cp .config/docker_example.env .config/docker.env
```

then edit them according to your environment.
You can configure `docker.env` with anything you like, but you will have to pay attention to the `default.yml` file:

- `url` should be set to the URL you will be hosting the web interface for the server at.
- `host`, `db`, `user`, `pass` will have to be configured in the `PostgreSQL configuration` section - `host` is the name of the postgres container (eg: *firefish_db_1*), and the others should match your `docker.env`.
- `host`will need to be configured in the *Redis configuration* section - it is the name of the redis container (eg: *firefish_redis_1*)

Everything else can be left as-is.

## Pull the container image

The image tag is [`codeberg.org/firefish/firefish:latest`](https://codeberg.org/firefish/-/packages/container/firefish).

```sh
docker pull codeberg.org/firefish/firefish:latest
# or podman pull codeberg.org/firefish/firefish:latest
```

## Enable database extension

```sh
docker-compose up db --detach && sleep 5 && docker-compose exec db sh -c 'psql --user="${POSTGRES_USER}" --dbname="${POSTGRES_DB}" --command="CREATE EXTENSION pgroonga;"'
# or podman-compose up db --detach && sleep 5 && podman-compose exec db sh -c 'psql --user="${POSTGRES_USER}" --dbname="${POSTGRES_DB}" --command="CREATE EXTENSION pgroonga;"'
```

## Run

```sh
docker compose up --detach
# or podman-compose up --detach
```

NOTE: This will take some time to come fully online, even after download and extracting the container images, and it may emit some error messages before completing successfully. Specifically, the `db` container needs to initialize and so isn't available to the `web` container right away. Only once the `db` container comes online does the `web` container start building and initializing the firefish tables.

Once the server is up you can use a web browser to access the web interface at `http://serverip:3000` (where `serverip` is the IP of the server you are running the firefish server on).

To publish your server, please follow the instructions in [section 5 of this installation guide](./install.md#5-preparation-for-publishing-a-server).
