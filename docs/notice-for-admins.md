# Notice for server administrators

You can skip intermediate versions when upgrading from an old version, but please read the notices and follow the instructions for each intermediate version before [upgrading](./upgrade.md).

## v20241205

### For systemd/pm2 users

The minimum supported Rust version has been bumped from v1.75.0 to v1.80.0.

```sh
cargo version  # check Rust version
rustup update  # upgrade Rust version
```

## v20241121

### For all users

`allowedPrivateNetworks` config item has been removed.

### For systemd/pm2 users

The minimum supported Rust version has been bumped from v1.74.0 to v1.75.0.

```sh
cargo version  # check Rust version
rustup update  # upgrade Rust version
```

## v20240905

:warning: **Firefish is in maintenance mode.** [(announcement)](https://info.firefish.dev/notes/9xsukr38m3komd63)

## v20240809

### For systemd/pm2 users

Required Node.js version has been bumped from v18.19.0 to v18.20.0.

As written in the [v20240710 note](https://codeberg.org/firefish/firefish/src/commit/7660050d9938a5a92293bb8acc361a0ef0715912/docs/notice-for-admins.md#v20240710), it is highly recommended that you use an even newer version since v18.20.0 has known vulnerabilities.

## v20240725

### For LibreTranslate self-hosters

Previously, neither the DeepL API nor the LibreTranslate API provided traditional Chinese translations, so we used to provide traditional Chinese post translations using manual conversion from simplified Chinese translations.

However, now that LibreTranslate API supports traditional Chinese translations, we have removed the manual conversion process for LibreTranslate. So, if you are hosting your LibreTranslate instance, please ensure your LibreTranslate version is new enough to support traditional Chinese.

## v20240714

### For systemd/pm2 users

You can remove the `packages/megalodon` directory after pulling the latest source code (`git pull --ff origin main`).

```sh
rm --recursive --force packages/megalodon
```

## v20240710

### For all users

This is not related to the recent changes, but we have added a new section called "[Maintain the server](./install.md#maintain-the-server)" in the installation guide. We suggest that you take a look at it (and we welcome your docs contributions)!

### For systemd/pm2 users

It is highly recommended that you upgrade Node.js, since [there is a new security release](<https://nodejs.org/en/blog/vulnerability/july-2024-security-releases>).

The new versions are:
  - Node v18.20.4 (v18.x LTS)
  - Node v20.15.1 (v20.x LTS)
  - Node v22.4.1 (v22.x)

[Node v21.x is end-of-life](<https://github.com/nodejs/Release?tab=readme-ov-file#end-of-life-releases>).

### :warning: For Docker/Podman users

This is a security release for you, since the container image for this version is based on the updated Node.js image.

## v20240607

The following environment variables are deprecated and no longer have any effect:
- `MK_ONLY_QUEUE`
- `MK_ONLY_SERVER`
- `MK_NO_DAEMONS`
- `MK_DISABLE_CLUSTERING`
- `MK_VERBOSE`
- `MK_WITH_LOG_TIME`
- `MK_SLOW`

## v20240601

### For systemd/pm2 users

Required Node.js version has been bumped from v18.17.0 to v18.19.0. Also, as written in the [v20240430 note](https://codeberg.org/firefish/firefish/src/commit/d3394b97f021dea323ec3ae36e39930680242482/docs/notice-for-admins.md#v20240430), it is highly recommended that you use an even newer version since v18.19.0 has known vulnerabilities.

## v20240523

### For all users

We regret to inform you that the upgrade may take a long time to fix a regression we have introduced. The time required to upgrade should be the same as [v20240413](<./notice-for-admins.md#v20240413>). This is not a security fix, so please upgrade your server when you have enough time. We are sorry for the inconvenience.

<details>

There are two data types in PostgreSQL to store time: `timestamptz` (`timestamp with time zone`) and `timestamp` (`timestamp without time zone`) [[ref]](<https://www.postgresql.org/docs/current/datatype-datetime.html>).

In Node.js, we manipulate the database using [TypeORM](<https://typeorm.io/>). TypeORM handles time data as a JavaScript `Date` object. Since `Date` doesn't have timezone information [[ref]](<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_components_and_time_zones>), we don't use the timezone information in the Node.js backend, and both `timestamptz` and `timestamp` behave in the same way. (Technically, the type names are a little confusing, and `timestamptz` (`timestamp with time zone`) doesn't store the timezone data either. Please read PostgreSQL documentation for more information.)

In Rust, we manipulate the database using [SeaORM](<https://www.sea-ql.org/SeaORM/>), which does distinguish between `timestamptz` and `timestamp`. `timestamptz` is converted to [`DateTime<FixedOffset>`](<https://docs.rs/chrono/latest/chrono/struct.DateTime.html>) type, whereas `timestamp` is converted to [`NaiveDateTime`](<https://docs.rs/chrono/latest/chrono/struct.NaiveDateTime.html>).

We are using [napi-rs](<https://napi.rs/>) to implement some of the backend features in Rust, which did not support `DateTime<FixedOffset>`. We used to store time data as `timestamptz`, but we converted them to `timestamp` for this reason. As we don't use timezone data, we thought this was okay, and indeed it worked fine.

However, we did not consider the case of migrating a server (hardware) to another timezone. With `timestamp`, there may be inconsistencies in the time data if you migrate your server to another system with a different timezone setting (Docker/Podman users should not be affected by this, as UTC is always used in containers unless you explicitly set one).

Therefore, we have contributed to napi-rs to add support for `DateTime<FixedOffset>` (<https://github.com/napi-rs/napi-rs/pull/2074>) and decided to migrate back from `timestamp` to `timestamptz` to properly address this problem. The migration process takes time roughly proportional to the number of stored posts.

</details>

### For systemd/pm2 users

There is a bug where `pnpm install --frozen-lockfile` may fail on Linux 6.9.0, 6.9.1, and 6.9.2 ([GitHub issue](<https://github.com/nodejs/node/issues/53051>)).

To check your Linux kernel version, run:

```sh
uname --kernel-release
```

## v20240516

### For all users

Firefish is now compatible with [Node v22](https://nodejs.org/en/blog/announcements/v22-release-announce). The pre-built OCI container image will still be using the latest LTS version (v20.13.1 as of now).

## v20240430

### For all users

You can control the verbosity of the server log by adding `maxLogLevel` in `.config/default.yml`. `logLevels` has been deprecated in favor of this setting. (see also: <https://codeberg.org/firefish/firefish/src/commit/33c24bd6480eb0ebd92ab3a622d9b16fdedb5201/.config/example.yml#L152>)

### For systemd/pm2 users

- You need to install Perl to build Firefish. Since Git depends on Perl in many packaging systems, you probably already have Perl installed on your system. You can check the Perl version by this command:
  ```sh
  perl --version
  ```
- Not only Firefish but also Node.js has recently fixed a few security issues:
  - https://nodejs.org/en/blog/vulnerability/april-2024-security-releases
  - https://nodejs.org/en/blog/vulnerability/april-2024-security-releases-2

  So, it is highly recommended that you upgrade your Node.js version as well. The new versions are
    - Node v18.20.2 (v18.x LTS)
    - Node v20.12.2 (v20.x LTS)
    - Node v21.7.3 (v21.x)

  You can check your Node.js version by this command:
    ```sh
    node --version
    ```
  [Node v22](https://nodejs.org/en/blog/announcements/v22-release-announce) was also released several days ago, but we have not yet tested Firefish with this version.

## v20240413

### For all users

Upgrading may take a long time due to the large changes in the database. Please make sure to perform the operations when you have time.

The time required to upgrade varies greatly depending on the database size and the environment. For reference, we have checked that the database migration takes

- 70 seconds if the database stores 600,000 posts
- 28 minutes if the database stores 12,000,000 posts

(i.e., it takes roughly (𝑛 / 470,000) minutes where 𝑛 is the number of posts) on a server with 2 GB of RAM. You may want to tweak your database configuration (`postgres.conf`) if the process is significantly slower than our experimental result.

The number of posts stored on your database can be found at `https://yourserver.example.com/admin/database` (or `notesCount` of `stats` API response).

### For systemd/pm2 users

- Please remove `packages/backend-rs/target` before building Firefish.
    ```sh
    rm --recursive --force packages/backend-rs/target
    ```
- Please do not terminate `pnpm run migrate` even if it appears to be frozen.

### For Docker/Podman users

You may not be able to access your server for a while after starting the container.

## v20240326

### For Docker/Podman users

The Firefish OCI container image is now based on [`docker.io/node:20-alpine`](https://hub.docker.com/layers/library/node/20-alpine/images/sha256-121edf6661770d20483818426b32042da33323b6fd30fc1ad4cd6890a817e240) (migrated from Debian to Alpine). This is a notification only and no action is required.

## v20240319

The full-text search engine used in Firefish has been changed to [PGroonga](https://pgroonga.github.io/). This is no longer an optional feature, so please enable PGroonga on your system. If you are using Sonic, Meilisearch, or Elasticsearch, you can also uninstall it from your system and remove the settings from `.config/default.yml`.

### For systemd/pm2 users

- Required Node.js version has been bumped from v18.16.0 to v18.17.0.
- You need to install PGroonga on your system. Please follow the instructions below.

[Edit (2024/03/23 23:55 UTC+9)] ~~**Warning**: You may fail to install PGroonga, since the package registry of Apache Arrow (one of the subdependencies of PGroonga) is currently down ([GitHub issue](https://github.com/apache/arrow/issues/40759)). We recommend that you hold off on upgrading until this problem is resolved.~~

[Edit (2024/03/25 22:31 UTC+9)] The Apache Arrow repository is now back up and running again.

#### 1. Install PGroonga

Please execute `psql --version` to check your PostgreSQL major version. This will print a message like this:

```text
psql (PostgreSQL) 16.1
```

In this case, your PostgreSQL major version is `16`.

There are official installation instructions for many operating systems on <https://pgroonga.github.io/install>, so please follow the instructions on this page. However, since many users are using Ubuntu LTS or Debian, and there are no instructions for Arch Linux and Fedora, we explicitly list the instructions for Ubuntu LTS, Debian, Arch Linux and Fedora here. Please keep in mind that this is not official information and the procedures may change.

##### Ubuntu LTS

1. Install subdependencies
    ```sh
    sudo apt install -y software-properties-common
    sudo add-apt-repository -y universe
    sudo add-apt-repository -y ppa:groonga/ppa
    sudo apt install -y wget lsb-release
    wget https://packages.groonga.org/ubuntu/groonga-apt-source-latest-$(lsb_release --codename --short).deb
    sudo apt install -y -V ./groonga-apt-source-latest-$(lsb_release --codename --short).deb
    ```
2. Install PGroonga (replace `16` with your PostgreSQL version)
    ```sh
    sudo apt install postgresql-16-pgdg-pgroonga

    # Depending on your PostgreSQL installation method,
    # the above command may fail and you need to run
    # the following instead:
    # sudo apt install postgresql-16-pgroonga
    ```

##### Debian

1. Install subdependencies
    ```sh
    sudo apt install -y -V ca-certificates lsb-release wget
    wget https://apache.jfrog.io/artifactory/arrow/$(lsb_release --id --short | tr 'A-Z' 'a-z')/apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb
    sudo apt install -y -V ./apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb
    wget https://packages.groonga.org/debian/groonga-apt-source-latest-$(lsb_release --codename --short).deb
    sudo apt install -y -V ./groonga-apt-source-latest-$(lsb_release --codename --short).deb
    ```
2. Install PGroonga (replace `16` with your PostgreSQL version)
    ```sh
    sudo apt install postgresql-16-pgdg-pgroonga

    # Depending on your PostgreSQL installation method,
    # the above command may fail and you need to run
    # the following instead:
    # sudo apt install postgresql-16-pgroonga
    ```

##### Arch Linux

You can install PGroonga from the Arch User Repository.

```sh
git clone https://aur.archlinux.org/pgroonga.git && cd pgroonga && makepkg -si
# or paru -S pgroonga
# or yay -S pgroonga
```

##### Fedora

You need to build PGroonga from source and create a policy package.

```sh
sudo dnf install make groonga-devel postgresql-server-devel redhat-rpm-config
wget https://packages.groonga.org/source/pgroonga/pgroonga-3.1.8.tar.gz
tar xvf pgroonga-3.1.8.tar.gz
cd pgroonga-3.1.8
make
sudo make install
```

```sh
cat > pgroonga.te << EOF
module pgroonga 1.0;

require {
    type postgresql_t;
    type postgresql_db_t;
    class file map;
}

allow postgresql_t postgresql_db_t:file map;
EOF
```

```sh
checkmodule -M -m -o pgroonga.mod pgroonga.te
semodule_package -o pgroonga.pp -m pgroonga.mod
sudo semodule -i pgroonga.pp
```

#### 2. Enable PGroonga

After the instllation, please execute this command to enable PGroonga:

```sh
sudo --user=postgres psql --dbname=your_database_name --command='CREATE EXTENSION pgroonga;'
```

The database name can be found in `.config/default.yml`.
```yaml
db:
  port: 5432
  db: database_name  # substitute your_database_name with this
  user: firefish
  pass: password
```

### For Docker/Podman users

Please edit your `docker-compose.yml` to replace the database container image from `docker.io/postgres` to `docker.io/groonga/pgroonga`.

The list of tags can be found on <https://hub.docker.com/r/groonga/pgroonga/tags>. Tags are named as `{PGroonga version}-{alpine or debian}-{PostgreSQL major version}`.

Please make sure to use the same PostgreSQL version. If you are using `docker.io/postgres:16-alpine` (PostgreSQL v16), the corresponding image is `docker.io/groonga/pgroonga:3.1.8-alpine-16` (or `docker.io/groonga/pgroonga:3.1.8-alpine-16-slim`). There are also tags called `latest-alpine-16` and `latest-alpine-16-slim`, but please be careful if you use these tags since [PGroonga may introduce breaking changes](https://pgroonga.github.io/upgrade/), similar to PostgreSQL.

```yaml
db:
  restart: unless-stopped
  image: docker.io/groonga/pgroonga:3.1.8-alpine-16-slim  # change here
  container_name: firefish_db
```

After that, execute this command to enable PGroonga:

```sh
docker-compose up db --detach && sleep 5 && docker-compose exec db sh -c 'psql --user="${POSTGRES_USER}" --dbname="${POSTGRES_DB}" --command="CREATE EXTENSION pgroonga;"'
# or podman-compose up db --detach && sleep 5 && podman-compose exec db sh -c 'psql --user="${POSTGRES_USER}" --dbname="${POSTGRES_DB}" --command="CREATE EXTENSION pgroonga;"'
```

Once this is done, you can start Firefish as usual.

```sh
docker pull codeberg.org/firefish/firefish && docker-compose up --detach
# or podman pull codeberg.org/firefish/firefish && podman-compose up --detach
```

## v20240301

### For all users

A new setting item has been added to control the log levels, so please consider updating your `.config/default.yml`. ([example settings](https://codeberg.org/firefish/firefish/src/commit/e7689fb302a0eed192b9515162258a39800f838a/.config/example.yml#L170-179))

## v20240225

### For Docker/Podman users

- The bug where `custom` directory was not working has (finally) been fixed. Please add the `custom` directory to `volumes` in your `docker-compose.yml`:
    ```yaml
    services:
      web:
        image: codeberg.org/firefish/firefish:latest
        # and so on ...

        volumes:
          - ./custom:/firefish/custom:ro  # <- Please add this line
          - ./files:/firefish/files
          - ./.config:/firefish/.config:ro
    ```

## v20240222

### For Docker/Podman users

- You only need to pull the new container image (`docker/podman pull`) to upgrade your server, so we assume that many of you don't update the code (`git pull --ff`), but it's still worth noting here that we have renamed `docker-compose.yml` to `docker-compose.example.yml` in the repository, and `docker-compose.yml` is now set to be untracked by git.
    - Since `docker-compose.yml` may be edited by users (e.g., change port number, add reverse proxy), it shouldn't have been tracked by git in the first place.
    - If you want to update the repository (`git pull --ff`), please take the following steps to keep your `docker-compose.yml`:
        1. Backup (make a copy) your `docker-compose.yml`
            ```sh
            cp docker-compose.yml /tmp/my-docker-compose.yml  # or somewhere else
            ```
        2. Restore the original `docker-compose.yml` so it doesn't conflict with the upstream changes
            ```sh
            git checkout -- docker-compose.yml
            ```
        3. Pull the new code
            ```sh
            git switch main
            git pull --ff
            ```
        4. Bring back your `docker-compose.yml`
            ```sh
            mv /tmp/my-docker-compose.yml docker-compose.yml
            ```
    - If any modifications are needed to `docker-compose.yml` in the future, we will provide a notice.
    - Also, PostgreSQL v12.2 (`docker.io/postgres:12.2-alpine`) has been used in this compose file, but we highly recommend that you upgrade it to a newer version (e.g., `docker.io/postgres:16-alpine`).
        - Note: some manual (painful) operations are needed to upgrade the PostgreSQL major version, so please be careful when performing upgrades: <https://github.com/docker-library/postgres/issues/37>

## v20240214

### For systemd/pm2 users

- Required Rust version has been bumped from v1.70 to v1.74.
    ```sh
    cargo --version  # check version
    rustup update    # update version
    ```

## v20240213

### For systemd/pm2 users

- `packages/backend/native-utils` can be removed.
    - This directory was removed in the repository, but it's not completely removed from your system by `git pull --ff`, because some folders like `packages/backend/native-utils/built` are not tracked by git.

    ```sh
    rm --recursive --force packages/backend/native-utils
    ```

## v20240206

### For all users

- The git repository has been moved, so please update the `git remote` url.
    ```sh
    git remote set-url origin https://codeberg.org/firefish/firefish.git
    ```

### For systemd/pm2 users

- Required Rust version has been bumped from v1.68 to v1.70.
- `libvips` is no longer required (unless your server OS is *BSD), so you may uninstall it from your system. Make sure to execute the following commands after that:
    ```sh
    pnpm clean-npm
    pnpm install
    ```

### For Docker/Podman users

- The image tag has been changed to `codeberg.org/firefish/firefish:latest`, so please update `docker-compose.yml`.
