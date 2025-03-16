# Set up a development environment by installing all dependencies locally

This document demonstrates an example procedure to set up a Firefish development environment on Debian 12. You can refer to this document if you prefer to install all dependencies (Node.js, PostgreSQL, Redis, etc.) locally.

Make sure that you can use the `sudo` command before proceeding.

## 1. Install dependencies

### Utilities

```sh
sudo apt update
sudo apt install build-essential python3 curl wget git lsb-release
```

### Node.js

Firefish requires Node.js v18.20.0 or later. While you can choose any versions between v18.20.0 and the latest version (v22.2.0 as of writing), we recommend that you install v18.x so as not to use new features inadvertently and introduce incompatibility issues.

Instructions can be found at [this repository](https://github.com/nodesource/distributions).

```sh
NODE_MAJOR=18
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
sudo apt install nodejs

# check version
node --version
```

### Rust toolchain

Instructions can be found at [this page](https://www.rust-lang.org/tools/install).

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
. "${HOME}/.cargo/env"

# check version
cargo --version
```

### Cargo nextest

Instructions can be found at [this page](https://nexte.st/book/pre-built-binaries).

```sh
curl -LsSf https://get.nexte.st/latest/linux | tar zxf - -C ${CARGO_HOME:-~/.cargo}/bin
```

### PostgreSQL and PGroonga

Firefish requires PostgreSQL v12 or later. We recommend that you install v12.x for the same reason as Node.js.

PostgreSQL install instructions can be found at [this page](https://www.postgresql.org/download/).

```sh
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-12

sudo systemctl enable --now postgresql

# check version
psql --version
```

PGroonga install instructions can be found at [this page](https://pgroonga.github.io/install/).

```sh
wget "https://apache.jfrog.io/artifactory/arrow/$(lsb_release --id --short | tr 'A-Z' 'a-z')/apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb"
sudo apt install "./apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb"
wget "https://packages.groonga.org/debian/groonga-apt-source-latest-$(lsb_release --codename --short).deb"
sudo apt install "./groonga-apt-source-latest-$(lsb_release --codename --short).deb"
sudo apt update
sudo apt install postgresql-12-pgdg-pgroonga

rm "apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb" "groonga-apt-source-latest-$(lsb_release --codename --short).deb"
```

### Redis

Instructions can be found at [this page](https://redis.io/docs/install/install-redis/).

```sh
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt update
sudo apt install redis

sudo systemctl enable --now redis-server

# check version
redis-cli --version
```

### FFmpeg

```sh
sudo apt install ffmpeg
```

## 2. Set up a database

1. Create a database user
    ```sh
    sudo -u postgres createuser --no-createdb --no-createrole --no-superuser --encrypted --pwprompt firefish
    ```
    If you forgot the password you typed, you can reset it by executing `sudo -u postgres psql -c "ALTER USER firefish PASSWORD 'password';"`.
2. Create a database
    ```sh
    sudo -u postgres createdb --encoding='UTF8' --owner=firefish firefish_db
    ```
3. Enable PGronnga extension
    ```sh
    sudo -u postgres psql --command='CREATE EXTENSION pgroonga;' --dbname=firefish_db
    ```

## 3. Configure Firefish

1. Fork the Firefish repository on GitLab
1. Clone your Firefish repository
    ```sh
    git clone https://codeberg.org/your-user-name/firefish.git
    ```
1. Copy the example database config file
    ```sh
    cp dev/config.example.env dev/config.env
    ```
1. Create a config file for Firefish
    ```sh
    cd firefish
    vim .config/default.yml
    ```
    
    ```yaml
    url: http://localhost:3000
    port: 3000
    
    db:
      host: localhost
      port: 5432
      db: firefish_db
      user: firefish
      pass: password
    
    redis:
      host: localhost
      port: 6379
    
    maxLogLevel: 'debug'  # or 'trace'
    ```

## 4. Build and start Firefish

1. Install pnpm
    ```sh
    sudo corepack enable
    corepack prepare pnpm@latest --activate
    
    # check version
    pnpm --version
    ```
1. Build
    ```sh
    pnpm install
    pnpm run build:debug
    ```
1. Execute database migrations
    ```sh
    pnpm run migrate
    ```
1. Start Firefish
    ```sh
    pnpm run start
    ```
    You can access to the local Firefish server on http://localhost:3000 after this message shows up!
    ```
    DONE *  [core boot]     All workers started
    DONE *  [core boot]     Now listening on port 3000 on http://localhost:3000
    ```
