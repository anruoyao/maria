# Set up a fully-containerized development environment

## Prerequisites

- Container runtime installation
  - [Docker](https://docs.docker.com/get-docker/)
  - [Podman](https://podman.io/docs/installation) and [Podman Compose](https://github.com/containers/podman-compose)
  - [containerd](https://github.com/containerd/containerd) and [nerdctl](https://github.com/containerd/nerdctl)
  - or whatever you want to use
- The following ports are not in use
    - 3030
    - 25432
    - 26379

## Start up the environment

1. Download the [`dev/container` directory](./dev/container) and execute `chmod +x docker-entrypoint.sh`
    - Alternatively, you can use `git clone https://codeberg.org/firefish/firefish.git && cd firefish/dev/container`, although this will clone the entire repository.
1. Copy the example config file
    ```sh
    cp config.example.env config.env
    ```
1. Edit `docker-compose.yml` and set `URL` to the URL you want to use (or leave it as `http://localhost:3030`)
1. Run `docker compose up`
    - This will build the environment, install dependencies and prepare the needed config files.
    - If you use Podman, you should run `podman-compose up` instead.
1. Wait until the following message shows up
    ```log
    DONE *  [core boot]     All workers started
    DONE *  [core boot]     Now listening on port 3030 on https://your_firefish_url.example.com
    ```
1. A fresh Firefish environment is created on the URL you have set!

When you want to restart the dev server, you just need to terminate the process (a.k.a. press `Ctrl+C`) and run `docker compose up` again.
