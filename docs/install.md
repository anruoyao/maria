# Install Firefish

:warning: **Firefish is in maintenance mode.** [(announcement)](https://info.firefish.dev/notes/9xsukr38m3komd63)

## Dependencies

Firefish depends on the following software.

### Runtime dependencies

- At least [NodeJS](https://nodejs.org/en/) v18.20.0 (v20/v22 recommended)
- At least [PostgreSQL](https://www.postgresql.org/) v12 (v16 recommended) with [PGroonga](https://pgroonga.github.io/) extension
- At least [Redis](https://redis.io/) v7 or [Valkey](https://valkey.io/) v7
- Web Proxy (one of the following)
  - Caddy (recommended)
  - Nginx (recommended)
  - Apache
- [FFmpeg](https://ffmpeg.org/) for video transcoding (**optional**)
- Caching server (**optional**, one of the following)
  - [DragonflyDB](https://www.dragonflydb.io/)
  - [KeyDB](https://keydb.dev/)
  - Another [Redis](https://redis.io/) / [Valkey](https://valkey.io/) server

### Build dependencies

- At least [Rust](https://www.rust-lang.org/) v1.74
- C/C++ compiler & build tools (like [GNU Make](https://www.gnu.org/software/make/))
  - `build-essential` on Debian/Ubuntu Linux
  - `base-devel` on Arch Linux
  - `"Development Tools"` on Fedora/Red Hat Linux
- [Python 3](https://www.python.org/)
- [Perl](https://www.perl.org/)

This document shows an example procedure for installing these dependencies and Firefish on Debian 12. Note that there is much room for customizing the server setup; this document merely demonstrates a simple installation.

### Install on non-Linux systems

We don't test Firefish on non-Linux systems, so please install Firefish on such an environment **only if you can address any problems yourself**. There is absolutely no support. That said, it is possible to install Firefish on some non-Linux systems.

<details>

<summary>Possible setup on FreeBSD (as of version <code>20240725</code>)</summary>

You can install Firefish on FreeBSD by adding these extra steps to the standard instructions:

1. Install `vips` package
2. Add the following block to [`package.json`](../package.json)
    ```json
      "pnpm": {
        "overrides": {
          "rollup": "npm:@rollup/wasm-node"
        }
      }
    ```
3. Create an rc script for Firefish
    ```sh
    #!/bin/sh

    # PROVIDE: firefish
    # REQUIRE: DAEMON redis caddy postgresql
    # KEYWORD: shutdown

    . /etc/rc.subr

    name=firefish
    rcvar=firefish_enable

    desc="Firefish daemon"

    load_rc_config ${name}

    : ${firefish_chdir:="/path/to/firefish/local/repository"}
    : ${firefish_env:="npm_config_cache=/tmp NODE_ENV=production NODE_OPTIONS=--max-old-space-size=3072"}

    pidfile="/var/run/${name}.pid"
    command=/usr/sbin/daemon
    command_args="-f -S -u firefish -P ${pidfile} /usr/local/bin/pnpm run start"

    run_rc_command "$1"
    ```

</details>

Please let us know if you deployed Firefish on a curious environment :smile:

### Use Docker/Podman containers

If you want to use the pre-built container image, please refer to [`install-container.md`](./install-container.md).

## 1. Install dependencies

Make sure that you can use the `sudo` command before proceeding.

### Utilities

```sh
sudo apt update
sudo apt install build-essential python3 curl wget git lsb-release
```

### Node.js and pnpm

Instructions can be found at [this repository](https://github.com/nodesource/distributions).

```sh
NODE_MAJOR=20
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
sudo apt install nodejs

# check version
node --version
```

You also need to enable `pnpm`.
```sh
sudo corepack enable
corepack prepare pnpm@latest --activate

# check version
pnpm --version
```

### PostgreSQL and PGroonga

PostgreSQL install instructions can be found at [this page](https://www.postgresql.org/download/).

```sh
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-16

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
sudo apt install postgresql-16-pgdg-pgroonga

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

1. Create an user for Firefish and switch user
   ```sh
   sudo useradd --create-home --user-group --shell /bin/bash firefish
   sudo su --login firefish
   
   # check the current working directory
   # the result should be /home/firefish
   pwd
   ```
1. Install Rust toolchain

    Instructions can be found at [this page](https://www.rust-lang.org/tools/install).
    
    ```sh
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    . "${HOME}/.cargo/env"
    
    # check version
    cargo --version
    ```
3. Clone the Firefish repository
    ```sh
    git clone --branch=main https://codeberg.org/firefish/firefish.git
    ```
1. Copy and edit the config file
    ```sh
    cd firefish
    cp .config/example.yml .config/default.yml
    nano .config/default.yml
    ```

    ```yaml
    url: https://your-server-domain.example.com  # change here
    port: 3000
    
    db:
      host: localhost
      port: 5432
      db: firefish_db
      user: firefish
      pass: your-database-password  # and here
    ```

## 4. Build Firefish

1. Build
    ```sh
    pnpm install --frozen-lockfile
    NODE_ENV=production NODE_OPTIONS='--max-old-space-size=3072' pnpm run build
    ```
1. Execute database migrations
    ```sh
    pnpm run migrate
    ```
1. Logout from `firefish` user
    ```sh
    exit
    ```

## 5. Preparation for publishing a server

### 1. Set up a firewall

To expose your server securely, you may want to set up a firewall. We use [ufw](https://launchpad.net/ufw) in this instruction.

```sh
sudo apt install ufw
# if you use SSH
# SSH_PORT=22
# sudo ufw limit "${SSH_PORT}/tcp"
sudo ufw default deny
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# check status
sudo ufw status
```

### 2. Set up a reverse proxy

In this instruction, we use [Caddy](https://caddyserver.com/) to make the Firefish server accesible from internet. However, you can also use [Nginx](https://nginx.org/en/) if you want ([example Nginx config file](./firefish.nginx.conf)).

1. Install Caddy
    ```sh
    sudo apt install debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy

    # check version
    caddy version
    ```
1. Replace the config file
    ```sh
    sudo mv /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak
    sudo nano /etc/caddy/Caddyfile
    ```

    ```Caddyfile
    your-server-domain.example.com {
    	reverse_proxy http://127.0.0.1:3000
    
    	log {
    		output file /var/log/caddy/firefish.log
    	}
    }
    ```
1. Restart Caddy
    ```sh
    sudo systemctl restart caddy
    ```

## 6. Publish your Firefish server

1. Create a service file
    ```sh
    sudo nano /etc/systemd/system/firefish.service
    ```

    ```service
    [Unit]
    Description=Firefish daemon
    Requires=redis.service caddy.service postgresql.service
    After=redis.service caddy.service postgresql.service network-online.target

    [Service]
    Type=simple
    User=firefish
    Group=firefish
    UMask=0027
    ExecStart=/usr/bin/pnpm run start
    WorkingDirectory=/home/firefish/firefish
    Environment="NODE_ENV=production"
    Environment="npm_config_cache=/tmp"
    Environment="NODE_OPTIONS=--max-old-space-size=3072"
    # uncomment the following line if you use jemalloc (note that the path varies on different environments)
    # Environment="LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2"
    StandardOutput=journal
    StandardError=journal
    SyslogIdentifier=firefish
    TimeoutSec=60
    Restart=always

    CapabilityBoundingSet=
    DevicePolicy=closed
    NoNewPrivileges=true
    LockPersonality=true
    PrivateDevices=true
    PrivateIPC=true
    PrivateMounts=true
    PrivateUsers=true
    ProtectClock=true
    ProtectControlGroups=true
    ProtectHostname=true
    ProtectKernelTunables=true
    ProtectKernelModules=true
    ProtectKernelLogs=true
    ProtectProc=invisible
    RestrictNamespaces=true
    RestrictRealtime=true
    RestrictSUIDSGID=true
    SecureBits=noroot-locked
    SystemCallArchitectures=native
    SystemCallFilter=~@chown @clock @cpu-emulation @debug @ipc @keyring @memlock @module @mount @obsolete @privileged @raw-io @reboot @resources @setuid @swap
    SystemCallFilter=capset pipe pipe2 setpriority

    [Install]
    WantedBy=multi-user.target
    ```
1. Start Firefish
    ```sh
    sudo systemctl enable --now firefish
    ```

# Maintain the server

## Upgrade Firefish version

Please refer to the [upgrade instruction](./upgrade.md). Be sure to switch to `firefish` user and go to the Firefish directory before executing the `git` command:

```sh
sudo su --login firefish
cd ~/firefish
```

## Rotate logs

As the server runs longer and longer, the size of the log files increases, filling up the disk space. To prevent this, you should set up a log rotation (removing old logs automatically).

You can edit the `SystemMaxUse` value in the `[journal]` section of `/etc/systemd/journald.conf` to do it:

```conf
[journal]
... (omitted)
SystemMaxUse=500M
...
```

Make sure to remove the leading `#` to uncomment the line. After editing the config file, you need to restart `systemd-journald` service.

```sh
sudo systemctl restart systemd-journald
```

It is also recommended that you change the [PGroonga log level](https://pgroonga.github.io/reference/parameters/log-level.html). The default level is `notice`, but this is too verbose for daily use.

To control the log level, add this line to your `postgresql.conf`:

```conf
pgroonga.log_level = error
```

You can check the `postgresql.conf` location by this command:

```sh
sudo --user=postgres psql --command='SHOW config_file'
```

The PGroonga log file (`pgroonga.log`) is located under this directory:

```sh
sudo --user=postgres psql --command='SHOW data_directory'
```

## Tune database configuration

The default PostgreSQL configuration is not suitable for running a Firefish server. So, it is highly recommended that you use [PGTune](https://pgtune.leopard.in.ua/) to tweak the configuration.

Here is an example set of parameters you can provide to PGTune:

|             Parameter | Value                                                   |
|----------------------:|---------------------------------------------------------|
|            DB version | 16 (your PostgreSQL major version)                      |
|               OS Type | Linux                                                   |
|               DB Type | Data warehouse                                          |
|          Total Memory | [total physical memory] minus 700 MB                    |
|        Number of CPUs | number of CPU threads (or lower value if you have many) |
| Number of connections | 200                                                     |
|          Data storage | SSD storage                                             |

Since a Firefish server is not a dedicated database server, be sure to leave some memory space for other software such as Firefish, Redis, and reverse proxy.

Once you have entered the appropriate values for your environment, click the "Generate" button to generate a configuration and replace the values in `postgresql.conf` with the suggested values.

After that, you need to restart the PostgreSQL service.

```sh
sudo systemctl stop firefish
sudo systemctl restart postgresql
sudo systemctl start firefish
```

## VACUUM your database

If the database runs long, accumulated "garbage" can degrade its performance or cause problems. To prevent this, you should `VACUUM` your database regularly.

```sh
sudo systemctl stop firefish
sudo --user=postgres psql --dbname=firefish_db --command='VACUUM FULL VERBOSE ANALYZE'
sudo systemctl start firefish
```

Note that this operation takes some time.

## Customize

- To add custom CSS for all users, edit `./custom/assets/instance.css`.
- To add static assets (such as images for the splash screen), place them in the `./custom/assets/` directory. They'll then be available on `https://yourserver.tld/static-assets/filename.ext`.
- To add custom locales, place them in the `./custom/locales/` directory. If you name your custom locale the same as an existing locale, it will overwrite it. If you give it a unique name, it will be added to the list. Also make sure that the first part of the filename matches the locale you're basing it on. (Example: `en-FOO.yml`)
- To add custom error images, place them in the `./custom/assets/badges` directory, replacing the files already there.
- To add custom sounds, place only mp3 files in the `./custom/assets/sounds` directory.
- To update custom assets without rebuilding, just run `pnpm run build:assets`.
- To block ChatGPT, CommonCrawl, or other crawlers from indexing your instance, uncomment the respective rules in `./custom/robots.txt`.

## Tips & Tricks

- When editing the config file, please don't fill out the settings at the bottom. They're designed *only* for managed hosting, not self hosting. Those settings are much better off being set in Firefish's control panel.
- Port 3000 (used in the default config) might be already used on your server for something else. To find an open port for Firefish, run `for p in {3000..4000}; do ss -tlnH | tr -s ' ' | cut -d" " -sf4 | grep -q "${p}$" || echo "${p}"; done | head -n 1`. Replace 3000 with the minimum port and 4000 with the maximum port if you need it.
- We'd recommend you use a S3 Bucket/CDN for Object Storage, especially if you use containers.
- When using object storage, setting a proper `Access-Control-Allow-Origin` response header is highly recommended.
- We'd recommend against using CloudFlare, but if you do, make sure to turn code minification off.
- For push notifications, run `npx web-push generate-vapid-keys`, then put the public and private keys into Control Panel > General > ServiceWorker.
- For translations, make a [DeepL](https://deepl.com) account and generate an API key, then put it into Control Panel > General > DeepL Translation.
- To add another admin account:
  - Go to the user's page > 3 Dots > About > Moderation > turn on "Moderator"
  - Go back to Overview > click the clipboard icon next to the ID
  - Run `psql -d firefish` (or whatever the database name is)
  - Run `UPDATE "user" SET "isAdmin" = true WHERE id='999999';` (replace `999999` with the copied ID)
  - Restart your Firefish server
