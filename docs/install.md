## 一，系统更新

```sh
  sudo apt update && sudo apt upgrade -y

  sudo apt install -y curl wget git
```

## 二，核心依赖安装

**【创建专属用户并进入】**：
```sh
   sudo useradd -m -s /bin/bash maria

   sudo su - maria
```

1.Node.js 20.x(**采用nvm安装node，为了防止不同用户之间的node版本冲突，因此该步骤需要进入maria用户，其他核心依赖安装步骤可以在root用户下执行，也可以在maria用户下执行更具您的安全策略决定**)

```sh
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

  \. "$HOME/.nvm/nvm.sh"

  nvm install 20

  node -v 

  nvm current 

  corepack enable pnpm

  pnpm -v

```

2.PostgreSQL 16 + PGroonga（**可以退出maria用户，继续使用root，当然，根据您的安全策略决定即可**）

添加 PostgreSQL 官方源并安装PostgreSQL 16

```sh
  sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
```

  <small>此步骤如果报错：”gnupg, gnupg2 and gnupg1 do not seem to be installed, but one of them is required for this operation”，则执行如下命令：

  ```sh
  sudo apt install gnupg
  ```

  </small>

```sh
  sudo apt update

  sudo apt install postgresql-16
```

Postgresql 16安装完成，可以检查是否运行：

```sh
  sudo systemctl status postgresql
```

**安装 PGroonga 扩展**

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

2.1创建数据库用户(默认maria，请自行修改以下代码中maria字段为自己想要的数据库名称)

```sh
sudo -u postgres createuser --no-createdb --no-createrole --no-superuser --encrypted --pwprompt maria
```

**按提示自行设置密码**

2.2创建数据库(默认maria_db，请自行修改以下代码中maria_db字段为自己想要的数据库名称)

```sh
sudo -u postgres createdb --encoding='UTF8' --owner=maria maria_db
```

2.3为maria_db数据库(请根据上一步您的数据库名称自行修改以下代码中的maria_db字段)启用 PGroonga 扩展

```sh
sudo -u postgres psql -d maria_db -c "CREATE EXTENSION pgroonga;"
```

3.Redis安装

```sh
sudo apt install redis-server
```

查看redis状态：

```sh
sudo systemctl status redis
```

4.安装构建依赖

* At least [Rust](https://www.rust-lang.org/) v1.74
* C/C++ compiler & build tools (like [GNU Make](https://www.gnu.org/software/make/))
**根据自己的系统版本选择如下构建依赖：**  
  * `build-essential` on Debian/Ubuntu Linux
  * `base-devel` on Arch Linux
  * `"Development Tools"` on Fedora/Red Hat Linux
* [Python 3](https://www.python.org/)
* [Perl](https://www.perl.org/)
* 演示Debian/Ubuntu（其他系统版本依赖请自行搜索或询问ai，这个很简单）：

```sh
sudo apt-get update

sudo apt-get install build-essential
```

5.推荐安装依赖

* FFmpeg for video transcoding (optional)【下载静态编译版 FFmpeg（兼容性更强）！】

* Caching server (optional, one of the following)

  *  DragonflyDB

  *  KeyDB

  *  Another Redis / Valkey server

  **此处推荐安装ffmpeg，安装代码：**

  ```sh
  # 下载静态编译版 FFmpeg
  wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz

  # 解压
  tar -xvf ffmpeg-release-amd64-static.tar.xz

  # 将解压后的文件移动到 /usr/local/bin 目录下
  cd ffmpeg-*-static
  sudo mv ffmpeg /usr/local/bin/
  sudo mv ffprobe /usr/local/bin/

  # 检查是否安装成功
  ffmpeg -version
  ffprobe -version
  ```
## 三，Maria 部署

1.进入专用用户(若已在maria用户则无视此条)

```sh
   sudo su - maria
```

2.克隆仓库

```sh
git clone https://github.com/buka5587/maria.git

cd maria
```

3.复制并配置文件(重点修改域名，数据库信息，其他内容根据配置文件中的注释自行修改)

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

## 五、服务管理(提示，注意接下操作的用户，可根据实际情况选择是否切换)

克隆下来的项目目录以及准备好了一个systemd服务文件，您可以直接使用，也可以根据自己的需要修改

**如果您的安装步骤全程根据本文档进行（重点是node安装步骤）则可以直接用下方方法复制已经准备好的服务文件：**

```sh
  #直接进行复制
  sudo cp /home/maria/maria/maria.service /etc/systemd/system/maria.service
  #然后直接启动服务即可
  sudo systemctl daemon-reload
  sudo systemctl enable --now maria
  #查看服务状态
  sudo systemctl status maria
```

**如果需要修改，请确保您具有相关领域知识**

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

# 设置Node.js和pnpm的路径
# 注意！！！此处根据你的实际情况来填写，如果你是完整的按照安装文档的步骤来，则无需任何修改
Environment="PATH=/home/maria/.nvm/versions/node/v20.19.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="NODE_ENV=production"
Environment="npm_config_cache=/tmp"
Environment="NODE_OPTIONS=--max-old-space-size=3072"

# 使用绝对路径调用pnpm
# 注意！！！此处根据你的实际情况来填写，如果你是完整的按照安装文档的步骤来，则无需任何修改
ExecStart=/home/maria/.nvm/versions/node/v20.19.2/bin/pnpm run start

WorkingDirectory=/home/maria/maria
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
  #查看服务状态
  sudo systemctl status maria
```
<big>恭喜您，完成了maria的安装步骤，maria是从一个停更项目fork而来，因此，为了使maria运行的更加稳定完美，推荐您进行以下维护和详细的自定义操作</big>

# 1.更新maria

  Maria具有自动检测新版本功能，若检测到发布新版本，会在控制面板中出现提示，当您发现提示时，请及时更新，更新方法如下：
  - [更新指南](https://github.com/buka5587/maria/blob/main/docs/upgrade.md)

# 2.日志轮转

随着服务器运行时间越来越长，日志文件的大小会增加，从而填满磁盘空间。为防止这种情况，您应该设置日志轮换（自动删除旧日志）。

**您可以在 /etc/systemd/journald.conf 的 [journal] 部分中编辑 SystemMaxUse 值来执行此作：**

```sh
[journal]
... (omitted)
SystemMaxUse=500M  # 最大使用空间为 500MB, 您可以根据需要调整此值。
...
```

确保删除前导 # 以取消注释该行。编辑配置文件后，您需要重新启动 systemd-journald 服务。

```sh
  sudo systemctl restart systemd-journald
```
此外，还建议您更改 PGroonga 日志级别 。默认级别是 notice，但这对于日常使用来说太冗长了。

要控制日志级别，请将此行添加到您的 postgresql.conf 中：
```sh
  pgroonga.log_level = error
```

您可以通过以下命令检查 postgresql.conf 位置：

```sh
  sudo --user=postgres psql --command='SHOW config_file'
```
PGroonga 日志文件 （pgroonga.log） 位于以下目录下：

```sh
  sudo --user=postgres psql --command='SHOW data_directory'
```

# 3.优化数据库配置

默认 PostgreSQL 配置不适合运行 Firefish 服务器。因此，强烈建议您使用 [PGTune](https://pgtune.leopard.in.ua/)来调整配置。

以下是您可以提供给 PGTune 的一组示例参数：

| 参数                    | 值                      |
|-----------------------|------------------------|
| DB version            | 16(您的 PostgreSQL 主要版本) |
| OS Type               | Linux                  |
| DB Type               | Data warehouse         |
| Total Memory          | [总物理内存] 减去 700 MB      |
| Number of CPUs  CPU   | CPU 线程数（如果有很多，则为更低值）   |
| Number of connections | 200                    |
| Data storage          | SSD storage            |

由于 Maria 服务器不是专用数据库服务器，因此请务必为其他软件（如 Maria、Redis 和反向代理）留出一些内存空间。

为您的环境输入适当的值后，单击 “Generate” 按钮以生成配置并将 postgresql.conf 中的值替换为建议的值。

之后，您需要重新启动 PostgreSQL 服务。

```sh
  sudo systemctl stop maria

  sudo systemctl restart postgresql

  sudo systemctl start maria
```

# 4.VACUUM 您的数据库

如果数据库运行时间较长，则累积的“垃圾”可能会降低其性能或导致问题。为防止这种情况，您应该定期对数据库执行 VACUUM 作。

```sh
  sudo systemctl stop maria

  #此处注意将以下代码中的maria_db替换为您的数据库名称
  sudo --user=postgres psql --dbname=maria_db --command='VACUUM FULL VERBOSE ANALYZE'

  sudo systemctl start maria
```

请注意，此作需要一些时间。

# 5.自定义配置

* 全局 CSS 定制：
  编辑 ./custom/assets/instance.css 为所有用户添加自定义 CSS

* 静态资源添加
  要添加静态资源（例如初始屏幕的图像），请将它们放在 ./custom/assets/ 目录中。然后，它们将在 https://yourserver.tld/static-assets/filename.ext 提供

* 多语言定制
  自定义语言文件存放于 ./custom/locales/，文件名需遵循 语言代码-地区代码.yml 格式（如 en-FOO.yml）

* 错误页面图片替换
  要添加自定义错误图像，请将它们放在 ./custom/assets/badges 目录中，替换那里已有的文件。

* 音效定制
  要添加自定义声音，请仅将 mp3 文件放在 ./custom/assets/sounds 目录中

* 要在不重新构建的情况下更新自定义资产，只需运行 pnpm run build：assets 即可

* 要阻止 ChatGPT、CommonCrawl 或其他爬虫为您的实例编制索引，请取消注释 ./custom/robots.txt 中的相应规则。

<big>小提示和技巧</big>

* 编辑配置文件时，请不要填写底部的设置。它们仅用于托管托管，而不是自托管。在 Firefish 的控制面板中设置这些设置要好得多。

* Maria默认使用3001端口，若此端口已被使用，您可以在./config/default.yml中的prot字段更改此端口。

* 我们建议不要使用 CloudFlare，但如果您这样做，请确保关闭代码压缩。

* 对于推送通知，请运行 `npx web-push generate-vapid-keys` ，然后将公钥和私钥放入控制面板 > 常规 > ServiceWorker 中。