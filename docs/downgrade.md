# Downgrade to version `20240206`/`1.0.5-rc`

## :warning: Before proceeding

- **Ensure your Firefish version is greater than or equal to `20240809`.**
- **Ensure you have stopped your Firefish server.**
- **Ensure you have backups of your database before performing any commands.**

## systemd/pm2

:information_source: If you have a dedicated Firefish user, please run the following commands (except for `sudo` operations) as that user:

```sh
# switch to firefish user
sudo su --login firefish

# logout from firefish user
exit
```

1. Go to the local Firefish repo directory
    ```sh
    # Please replace the path according to your environment
    cd /home/firefish/firefish
    ```
1. Download [`downgrade.sql`](https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql)
    ```sh
    wget -O /tmp/downgrade.sql https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql
    ```
1. Execute the downgrade queries (this may take a while)
    ```sh
    psql --file=/tmp/downgrade.sql --user=your_user_name --dbname=your_database_name
    ```

    The user and database name can be found in `.config/default.yml`.
    ```yaml
    db:
      port: 5432
      db: your_database_name  # database name
      user: your_user_name    # user name
      pass: your_password     # password
    ```

    If you get the `FATAL: Peer authentication failed` error, you also need to provide the `--host` option (you will be asked the password):
    ```sh
    psql --file=/tmp/downgrade.sql --user=your_user_name --dbname=your_database_name --host=127.0.0.1
    ```
1. Remove installed npm/cargo packages and build artifacts
    ```sh
    pnpm run clean-all
    git checkout -- packages
    ```
1. Switch back to the `v20240206` or `v1.0.5-rc` tag
    ```sh
    git switch --detach v20240206  # or v1.0.5-rc
    ```
1. Rebuild Firefish

    v20240206/v1.0.5-rc does not compile with Rust 1.80 and up, so please check your Rust version before building.
    ```sh
    # check Rust version
    cargo version
    # use Rust 1.79
    rustup override set 1.79
    ```

    ```sh
    pnpm install --frozen-lockfile
    NODE_ENV='production' NODE_OPTIONS='--max_old_space_size=3072' pnpm run rebuild
    ```
1. Remove PGroonga extension
    ```sh
    sudo --user=postgres psql --command='DROP EXTENSION pgroonga CASCADE' --dbname=your_database_name
    ```
1. Start the Firefish service and confirm that Firefish is downgraded
    ```sh
    sudo systemctl start your-firefish-service.service
    # or pm2 start firefish
    ```

**Note**: If you are going to migrate your server to another *key variant, you may need to run `pnpm run clean-all && git checkout -- packages` again to clean up Firefish dependencies and build artifacts.

## Docker/Podman
:information_source: Depending on your Docker version, you may need to use the `docker-compose` command instead of `docker compose`.

1. Start the database container
    ```sh
    docker compose up --detach db
    # or podman-compose up --detach db
    ```
1. Download [`downgrade.sql`](https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql)
    ```sh
    docker compose exec db wget -O /tmp/downgrade.sql https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql
    # or podman-compose exec db wget -O /tmp/downgrade.sql https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql
    ```
1. Revert database migrations (this may take a while)
    ```sh
    docker compose exec db psql --file=/tmp/downgrade.sql --user=user_name --dbname=database_name
    docker compose exec db psql --command='DROP EXTENSION pgroonga CASCADE' --user=user_name --dbname=database_name

    # or
    podman-compose exec db psql --file=/tmp/downgrade.sql --user=user_name --dbname=database_name
    podman-compose exec db psql --command='DROP EXTENSION pgroonga CASCADE' --user=user_name --dbname=database_name
    ```

    The user and database name can be found in `.config/docker.env`.
    ```env
    POSTGRES_PASSWORD=password
    POSTGRES_USER=user_name    # user name
    POSTGRES_DB=database_name  # database name
    ```
1. Stop the container
    ```sh
    docker compose down
    # or podman-compose down
    ```
1. Change Firefish image tag from `latest` to `v20240206` or `v1.0.5-rc`
    ```sh
    vim docker-compose.yml
    ```

    ```yaml
    version: "3"

    services:
      web:
        image: codeberg.org/firefish/firefish:v20240206  # or v1.0.5-rc
    ```
1. Change database image from `docker.io/groonga/pgroonga` to `docker.io/postgres`

    Please make sure to use the same PostgreSQL version. For example, if you are using `docker.io/groonga/pgroonga:3.1.8-alpine-16`, you should change it to `docker.io/postgres:16-alpine`. PGroonga images are tagged as `{PGroonga version}-{alpine or debian}-{PostgreSQL major version}`. PostgreSQL image tags can be found at <https://hub.docker.com/_/postgres/tags>.
1. Start the container and confirm that Firefish is downgraded
    ```sh
    docker compose up --detach
    # or podman-compose up --detach
    ```
