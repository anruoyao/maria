
# 使用容器运行Firefish服务器

:warning: **Firefish目前处于维护模式。** [(公告)](https://info.firefish.dev/notes/9xsukr38m3komd63)

## 先决条件

- 安装最新版本的[Docker](https://docs.docker.com/get-docker/)
  - 你也可以使用[Podman](https://podman.io/docs/installation)和[Podman Compose](https://github.com/containers/podman-compose)。

## 配置

复制示例配置文件：

```sh
cp docker-compose.example.yml docker-compose.yml
cp .config/example.yml .config/default.yml
cp .config/docker_example.env .config/docker.env
```

然后根据你的环境进行编辑。你可以随意配置`docker.env`，但需要关注`default.yml`文件：

- `url`应设置为托管服务器网页界面的URL。
- `host`, `db`, `user`, `pass`需要在`PostgreSQL配置`部分进行配置 - `host`是postgres容器的名称（例如：*firefish_db_1*），其余的应与你的`docker.env`匹配。
- `host`需要在*Redis配置*部分进行配置 - 它是redis容器的名称（例如：*firefish_redis_1*）

其他内容可以保持不变。

## 拉取容器镜像

镜像标签为[`codeberg.org/firefish/firefish:latest`](https://codeberg.org/firefish/-/packages/container/firefish)。

```sh
docker pull codeberg.org/firefish/firefish:latest
# 或者 podman pull codeberg.org/firefish/firefish:latest
```

## 启用数据库扩展

```sh
docker-compose up db --detach && sleep 5 && docker-compose exec db sh -c 'psql --user="${POSTGRES_USER}" --dbname="${POSTGRES_DB}" --command="CREATE EXTENSION pgroonga;"'
# 或者 podman-compose up db --detach && sleep 5 && podman-compose exec db sh -c 'psql --user="${POSTGRES_USER}" --dbname="${POSTGRES_DB}" --command="CREATE EXTENSION pgroonga;"'
```

## 运行

```sh
docker compose up --detach
# 或者 podman-compose up --detach
```

注意：即使下载并提取容器镜像后，完全上线也需要一些时间，并且在成功完成之前可能会发出一些错误消息。特别是，`db`容器需要初始化，因此不会立即对`web`容器可用。只有当`db`容器上线后，`web`容器才会开始构建并初始化firefish表。

服务器启动后，你可以使用网络浏览器访问位于`http://服务器IP:3000`的网页界面（其中`服务器IP`是你运行firefish服务器的IP地址）。

要发布你的服务器，请遵循[安装指南第5节](./install.md#5-preparation-for-publishing-a-server)中的说明。
