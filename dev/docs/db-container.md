# Set up database containers and run Maria locally

## Prerequisites

- Dependencies
  - git
  - Node.js
  - pnpm
  - Rust toolchain and [cargo-nextest](https://nexte.st/)
	- Python 3
	- Perl
  - FFmpeg
  - Container runtime
    - [Docker](https://docs.docker.com/get-docker/)
    - [Podman](https://podman.io/docs/installation) and [Podman Compose](https://github.com/containers/podman-compose)
    - [containerd](https://github.com/containerd/containerd) and [nerdctl](https://github.com/containerd/nerdctl)
    - or whatever you want to use
  - GNU Make
- The following ports are not in use
  - 25432
  - 26379

You can refer to [local-installation.md](./local-installation.md) to install the dependencies.

## Configure the environment

1. Fork the Maria repository on GitLab
1. Clone your Maria repository
    ```sh
    git clone https://github.com/buka5587/maria.git
    cd maria
    ```
1. Copy example config file
    ```sh
    cp dev/config.example.env dev/config.env
    # If you use container runtime other than Podman, you need to modify the "COMPOSE" variable
    # vim dev/config.env
    ```
1. Create `.config/default.yml` with the following content
    ```yaml
    # You can change the port if 3000 is already used
    url: http://localhost:3000
    port: 3000

    db:
      host: localhost
      port: 25432
      db: maria_db
      user: maria
      pass: password

    redis:
      host: localhost
      port: 26379

    maxlogLevel: 'debug'  # or 'trace'
    ```
1. Start database containers
    ```sh
    make db.up
    ```

## Build and start Maria

1. Build Maria
    ```sh
    pnpm install
    pnpm run build:debug
    ```
1. Execute database migrations
    ```sh
    pnpm run migrate
    ```
1. Start Maria
    ```sh
    pnpm run start
    ```
    You can access to the local Maria server on http://localhost:3000 after this message shows up!
    ```
    DONE *  [core boot]     All workers started
    DONE *  [core boot]     Now listening on port 3000 on http://localhost:3000
    ```

## Update auto-generated files in `package/backend-rs`

You need to install `sea-orm-cli` to regenerate database entities.

```sh
cargo install sea-orm-cli
```

```sh
make entities
make napi
```

## Reset the environment

You can recreate a fresh local Maria environment by recreating the database containers:

```sh
make db.init
pnpm run migrate
pnpm run start
```
