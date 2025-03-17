# 升级指南

## 适用于 systemd/pm2 用户

1. 检查[`docs/notice-for-admins.md`](./notice-for-admins.md)中的内容
1. 停止服务运行
    ```sh
    sudo systemctl stop maria.service
    # 如果使用 pm2 则执行：pm2 stop firefish
    ```
1. 拉取最新源代码
    ```sh
    git checkout -- packages/backend/assets  # 恢复对assets目录的修改
    git pull --ff origin main                # 快速合并方式更新代码
    ```
1. 构建项目并应用数据库变更
    ```sh
    corepack prepare pnpm@latest --activate  # 确保使用最新pnpm
    pnpm install --frozen-lockfile          # 根据lockfile安装依赖
    NODE_ENV='production' NODE_OPTIONS='--max_old_space_size=3072' pnpm run rebuild  # 生产环境构建
    pnpm run migrate                        # 执行数据库迁移
    ```
1. 启动服务
    ```sh
    sudo systemctl start maria.service
    # 如果使用 pm2 则执行：pm2 start firefish
    ```
