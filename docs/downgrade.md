# 降级到版本 `20240206`/`1.0.5-rc`

## :warning: 在进行操作之前

- **确保你的Firefish版本大于或等于 `20240809`.**
- **确保你已经停止了你的Firefish服务器.**
- **确保你在执行任何命令之前已经备份了你的数据库.**

## systemd/pm2

:information_source: 如果你有一个专门的Firefish用户，请以该用户身份运行以下命令（除了`sudo`操作）

```sh
# 切换到firefish用户
sudo su --login firefish

# 从firefish用户登出
exit
```

1. 前往本地Firefish仓库目录
    ```sh
    # 请根据你的环境替换路径
    cd /home/firefish/firefish
    ```
1. 下载 [`downgrade.sql`](https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql)
    ```sh
    wget -O /tmp/downgrade.sql https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql
    ```
1. 执行降级查询（这可能需要一段时间）
    ```sh
    psql --file=/tmp/downgrade.sql --user=your_user_name --dbname=your_database_name
    ```

    用户名和数据库名可以在`.config/default.yml`中找到.
    ```yaml
    db:
      port: 5432
      db: your_database_name  # database name
      user: your_user_name    # user name
      pass: your_password     # password
    ```

    如果你遇到`FATAL: Peer authentication failed`错误，你还需要提供`--host`选项（将会被要求输入密码）：
    ```sh
    psql --file=/tmp/downgrade.sql --user=your_user_name --dbname=your_database_name --host=127.0.0.1
    ```
1. 移除已安装的npm/cargo包和构建产物
    ```sh
    pnpm run clean-all
    git checkout -- packages
    ```
1. 切换回`v20240206`或`v1.0.5-rc`标签
    ```sh
    git switch --detach v20240206  # or v1.0.5-rc
    ```
1. 重新构建Firefish

    v20240206/v1.0.5-rc无法与Rust 1.80及以上版本编译，因此在构建之前请检查你的Rust版本.
    ```sh
    # 检查Rust版本
    cargo version
    # 使用Rust 1.79
    rustup override set 1.79
    ```

    ```sh
    pnpm install --frozen-lockfile
    NODE_ENV='production' NODE_OPTIONS='--max_old_space_size=3072' pnpm run rebuild
    ```
1. 移除PGroonga扩展
    ```sh
    sudo --user=postgres psql --command='DROP EXTENSION pgroonga CASCADE' --dbname=your_database_name
    ```
1. 启动Firefish服务并确认Firefish已降级
    ```sh
    sudo systemctl start your-firefish-service.service
    # or pm2 start firefish
    ```

**Note**: 如果你打算将你的服务器迁移到另一个*key变体，你可能需要再次运行`pnpm run clean-all && git checkout -- packages`以清理Firefish依赖和构建产物。

## Docker/Podman
:information_source: 根据你的Docker版本，你可能需要使用`docker-compose`命令而不是`docker compose`

1. 启动数据库容器
    ```sh
    docker compose up --detach db
    # 或 podman-compose up --detach db
    ```
1. 下载 [`downgrade.sql`](https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql)
    ```sh
    docker compose exec db wget -O /tmp/downgrade.sql https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql
    # 或 podman-compose exec db wget -O /tmp/downgrade.sql https://codeberg.org/firefish/firefish/raw/branch/develop/docs/downgrade.sql
    ```
1. 回滚数据库迁移（这可能需要一段时间）
    ```sh
    docker compose exec db psql --file=/tmp/downgrade.sql --user=user_name --dbname=database_name
    docker compose exec db psql --command='DROP EXTENSION pgroonga CASCADE' --user=user_name --dbname=database_name

    # or
    podman-compose exec db psql --file=/tmp/downgrade.sql --user=user_name --dbname=database_name
    podman-compose exec db psql --command='DROP EXTENSION pgroonga CASCADE' --user=user_name --dbname=database_name
    ```

    用户名和数据库名可以在`.config/docker.env`中找到
    ```env
    POSTGRES_PASSWORD=password
    POSTGRES_USER=user_name    # user name
    POSTGRES_DB=database_name  # database name
    ```
1. 停止容器
    ```sh
    docker compose down
    # 或 podman-compose down
    ```
1. 将Firefish镜像标签从`latest`更改为`v20240206`或`v1.0.5-rc`
    ```sh
    vim docker-compose.yml
    ```

    ```yaml
    version: "3"

    services:
      web:
        image: codeberg.org/firefish/firefish:v20240206  # or v1.0.5-rc
    ```
1. 将数据库镜像从`docker.io/groonga/pgroonga`更改为`docker.io/postgres`

请确保使用相同的PostgreSQL版本。例如，如果你正在使用`docker.io/groonga/pgroonga:3.1.8-alpine-16`，你应该将其更改为`docker.io/postgres:16-alpine`。PGroonga镜像的标签格式为{PGroonga版本}-{alpine或debian}-{PostgreSQL主版本}。PostgreSQL镜像的标签可以在<https://hub.docker.com/_/postgres/tags>找到。
1. 启动容器并确认Firefish已降级
    ```sh
    docker compose up --detach
    # 或 podman-compose up --detach
    ```
