## 一，系统更新

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw
```

## 二，核心依赖安装

1.Node.js 20.x

```sh
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable && corepack prepare pnpm@latest --activate
```

2.PostgreSQL 16 + PGroonga

添加 PostgreSQL 官方源

```sh
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
sudo apt update
sudo apt install -y postgresql-16
```

安装 PGroonga 扩展

```sh
wget "https://apache.jfrog.io/artifactory/arrow/$(lsb_release --id --short | tr 'A-Z' 'a-z')/apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb"
sudo apt install -y "./apache-arrow-apt-source-latest-$(lsb_release --codename --short).deb"
wget "https://packages.groonga.org/debian/groonga-apt-source-latest-$(lsb_release --codename --short).deb"
sudo apt install -y "./groonga-apt-source-latest-$(lsb_release --codename --short).deb"
sudo apt update
sudo apt install -y postgresql-16-pgdg-pgroonga
```

清理安装包

```sh
rm *-apt-source-latest-*.deb
```

2.1创建数据库用户

```sh
sudo -u postgres createuser --no-createdb --no-createrole --no-superuser --encrypted --pwprompt maria
```

按提示设置密码

2.2创建数据库

```sh
sudo -u postgres createdb --encoding='UTF8' --owner=maria maria_db
```

2.3启用 PGroonga 扩展

```sh
sudo -u postgres psql -d maria_db -c "CREATE EXTENSION pgroonga;"
```

3.Redis 7.x

```sh
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt update && sudo apt install -y redis
sudo systemctl enable --now redis-server
```

4.安装构建依赖

* At least [Rust](https://www.rust-lang.org/) v1.74
* C/C++ compiler & build tools (like [GNU Make](https://www.gnu.org/software/make/))
  
  * `build-essential` on Debian/Ubuntu Linux
  * `base-devel` on Arch Linux
  * `"Development Tools"` on Fedora/Red Hat Linux
* [Python 3](https://www.python.org/)
* [Perl](https://www.perl.org/)
* 演示Debian/Ubuntu：

```sh
sudo apt-get update
sudo apt-get install build-essential
```

5.推荐安装依赖

* FFmpeg for video transcoding (optional)

* Caching server (optional, one of the following)

  *  DragonflyDB

  *  KeyDB

  *  Another Redis / Valkey server

## 三，Maria 部署

1.创建专用用户

```sh
   sudo useradd -m -s /bin/bash maria
   sudo su - maria
```

2.克隆仓库

```sh
git clone https://github.com/buka5587/maria.git
cd maria
```

3.配置文件

```sh
cp .config/example.yml .config/default.yml
nano .config/default.yml
```

4.安装 Rust 工具链

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

## 四，编译构建

1.构建命令

先安装依赖

```sh
pnpm install
```

构建命令

```sh
NODE_OPTIONS='--max-old-space-size=3584' NODE_ENV=production pnpm run build
```

2.数据库初始化

```sh
pnpm run migrate
```

## 五、服务管理(不要忘记切换你的执行用户)

1.创建 systemd 服务

```sh
sudo nano /etc/systemd/system/maria.service
```

内容：

```sh
[Unit]
Description=maria daemon
Requires=redis.service postgresql.service
After=redis.service postgresql.service network-online.target

[Service]
Type=simple
User=maria
Group=maria
UMask=0027
ExecStart=/usr/bin/pnpm run start
WorkingDirectory=/home/maria/maria
Environment="NODE_ENV=production"
Environment="npm_config_cache=/tmp"
Environment="NODE_OPTIONS=--max-old-space-size=3072"

#uncomment the following line if you use jemalloc (note that the path varies on different environments)

#Environment="LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2"

StandardOutput=journal
StandardError=journal
SyslogIdentifier=maria
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

2.启动服务

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now maria
```
