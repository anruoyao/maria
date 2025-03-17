# Firefish API 变更记录

标有 :warning: 图标的表示存在破坏性变更。

## v20240728

- 在 `admin/emoji/add` 端点新增可选参数 `name`、`category`、`aliases`、`license`
- 在 `drive/files/upload-from-url` 端点新增可选参数 `name`

## v20240725

- 新增 `i/export-followers` 端点

## v20240714

- 旧的 Mastodon API 实现已替换为基于 Iceshrimp 的新实现
  - :warning: 新 API 使用全新格式管理 Mastodon 会话（旧实现沿用 Misskey 会话机制），所有已注册客户端需重新注册，用户需重新认证
  - :warning: 所有 ID（帖子/通知/用户等）将采用字母数字格式，与 Firefish/Misskey API 保持一致，旧数字格式 ID 将不再有效

<details>

<summary>可用端点列表（位于 <code>https://instance-domain/api/</code>）</summary>

|  方法   |              端点               |                    备注                    |
|---------|----------------------------------|--------------------------------------------|
|  `POST` | `oauth/token`                    |                                            |
|  `POST` | `oauth/revoke`                   |                                            |
|  `POST` | `v1/apps`                        |                                            |
|   `GET` | `v1/apps/verify_credentials`     |                                            |
|  `POST` | `v1/firefish/apps/info`          | Firefish 扩展功能，使用 MiAuth 认证        |
|  `POST` | `v1/firefish/auth/code`          | Firefish 扩展功能，使用 MiAuth 认证        |
|         |                                  |                                            |
|   `GET` | `v1/accounts/verify_credentials` |                                            |
| `PATCH` | `v1/accounts/update_credentials` |                                            |
|   `GET` | `v1/accounts/lookup`             |                                            |
|   `GET` | `v1/accounts/relationships`      |                                            |
|   `GET` | `v1/accounts/search`             |                                            |
|   `GET` | `v1/accounts/:id`                |                                            |
|   `GET` | `v1/accounts/:id/statuses`       |                                            |
|   `GET` | `v1/accounts/:id/featured_tags`  |                                            |
|   `GET` | `v1/accounts/:id/followers`      |                                            |
|   `GET` | `v1/accounts/:id/following`      |                                            |
|   `GET` | `v1/accounts/:id/lists`          |                                            |
|  `POST` | `v1/accounts/:id/follow`         |                                            |
|  `POST` | `v1/accounts/:id/unfollow`       |                                            |
|  `POST` | `v1/accounts/:id/block`          |                                            |
|  `POST` | `v1/accounts/:id/unblock`        |                                            |
|  `POST` | `v1/accounts/:id/mute`           |                                            |
|  `POST` | `v1/accounts/:id/unmute`         |                                            |
|         |                                  |                                            |
|   `GET` | `v1/featured_tags`               | 始终返回空列表                             |
|   `GET` | `v1/followed_tags`               | 始终返回空列表                             |
|   `GET` | `v1/bookmarks`                   |                                            |
|   `GET` | `v1/favourites`                  |                                            |
|         |                                  |                                            |
|   `GET` | `v1/mutes`                       |                                            |
|   `GET` | `v1/blocks`                      |                                            |
|   `GET` | `v1/follow_requests`             |                                            |
|  `POST` | `v1/follow_requests/:id/authorize` |                                        |
|  `POST` | `v1/follow_requests/:id/reject`  |                                            |
|         |                                  |                                            |
|   `GET` | `v1/filters`                     |                                            |
|  `POST` | `v1/filters`                     |                                            |
|   `GET` | `v2/filters`                     |                                            |
|  `POST` | `v2/filters`                     |                                            |
|         |                                  |                                            |
|   `GET` | `v1/lists`                       |                                            |
|  `POST` | `v1/lists`                       |                                            |
|   `GET` | `v1/lists/:id`                   |                                            |
|   `PUT` | `v1/lists/:id`                   |                                            |
|`DELETE` | `v1/lists/:id`                   |                                            |
|   `GET` | `v1/lists/:id/accounts`          |                                            |
|  `POST` | `v1/lists/:id/accounts`          |                                            |
|`DELETE` | `v1/lists/:id/accounts`          |                                            |
|         |                                  |                                            |
|   `GET` | `v1/media/:id`                   |                                            |
|   `PUT` | `v1/media/:id`                   |                                            |
|  `POST` | `v1/media`                       |                                            |
|  `POST` | `v2/media`                       |                                            |
|         |                                  |                                            |
|   `GET` | `v1/custom_emojis`               |                                            |
|   `GET` | `v1/instance`                    |                                            |
|   `GET` | `v2/instance`                    |                                            |
|   `GET` | `v1/announcements`               |                                            |
|  `POST` | `v1/announcements/:id/dismiss`   |                                            |
|   `GET` | `v1/trends`                      | 分页功能未实现                             |
|   `GET` | `v1/trends/tags`                 | 分页功能未实现                             |
|   `GET` | `v1/trends/statuses`             |                                            |
|   `GET` | `v1/trends/links`                | 始终返回空列表                             |
|   `GET` | `v1/preferences`                 |                                            |
|   `GET` | `v2/suggestions`                 |                                            |
|         |                                  |                                            |
|   `GET` | `v1/notifications`               |                                            |
|   `GET` | `v1/notifications/:id`           |                                            |
|  `POST` | `v1/notifications/clear`         |                                            |
|  `POST` | `v1/notifications/:id/dismiss`   |                                            |
|  `POST` | `v1/conversations/:id/read`      |                                            |
|   `GET` | `v1/push/subscription`           |                                            |
|  `POST` | `v1/push/subscription`           |                                            |
|`DELETE` | `v1/push/subscription`           |                                            |
|         |                                  |                                            |
|   `GET` | `v1/search`                      |                                            |
|   `GET` | `v2/search`                      |                                            |
|         |                                  |                                            |
|  `POST` | `v1/statuses`                    |                                            |
|   `PUT` | `v1/statuses/:id`                |                                            |
|   `GET` | `v1/statuses/:id`                |                                            |
|`DELETE` | `v1/statuses/:id`                |                                            |
|   `GET` | `v1/statuses/:id/context`        |                                            |
|   `GET` | `v1/statuses/:id/history`        |                                            |
|   `GET` | `v1/statuses/:id/source`         |                                            |
|   `GET` | `v1/statuses/:id/reblogged_by`   |                                            |
|   `GET` | `v1/statuses/:id/favourited_by`  |                                            |
|  `POST` | `v1/statuses/:id/favourite`      |                                            |
|  `POST` | `v1/statuses/:id/unfavourite`    |                                            |
|  `POST` | `v1/statuses/:id/reblog`         |                                            |
|  `POST` | `v1/statuses/:id/unreblog`       |                                            |
|  `POST` | `v1/statuses/:id/bookmark`       |                                            |
|  `POST` | `v1/statuses/:id/unbookmark`     |                                            |
|  `POST` | `v1/statuses/:id/pin`            |                                            |
|  `POST` | `v1/statuses/:id/unpin`          |                                            |
|  `POST` | `v1/statuses/:id/react/:name`    |                                            |
|  `POST` | `v1/statuses/:id/unreact/:name`  |                                            |
|  `POST` | `v1/statuses/:id/translate`      |                                            |
|         |                                  |                                            |
|   `GET` | `v1/polls/:id`                   |                                            |
|  `POST` | `v1/polls/:id/votes`             |                                            |
|         |                                  |                                            |
|   `GET` | `v1/scheduled_statuses`          |                                            |
|   `GET` | `v1/scheduled_statuses/:id`      | 重新调度功能（`PUT` 方法）未实现           |
|`DELETE` | `v1/scheduled_statuses/:id`      |                                            |
|         |                                  |                                            |
|   `GET` | `v1/streaming/health`            |                                            |
|         |                                  |                                            |
|   `GET` | `v1/timelines/public`            |                                            |
|   `GET` | `v1/timelines/tag/:hashtag`      |                                            |
|   `GET` | `v1/timelines/home`              |                                            |
|   `GET` | `v1/timelines/list/:listId`      |                                            |
|   `GET` | `v1/conversations`               |                                            |
|   `GET` | `v1/markers`                     |                                            |
|  `POST` | `v1/markers`                     |                                            |

</details>

## v20240710

- 在 `i` 端点响应和 `i/update` 请求中新增 `readCatLanguage` 字段（可选）

## v20240607

- 允许对 `latest-version` 端点使用 `GET` 请求

## v20240523

- 在 `notes/create` 端点新增 `scheduledAt` 可选参数 (!10789)

## v20240516

- :warning: `server-info` 端点（获取服务器硬件信息）现在需要身份验证
- :warning: `admin/server-info` 中移除了 `net`（服务器默认网络接口）字段
- 在 `i` 端点响应和 `i/update` 请求参数中新增 `lang` 字段

## v20240504

- :warning: 移除 `release` 端点

## v20240424

- 在 `meta` 和 `admin/meta` 的响应及 `admin/update-meta` 请求中新增 `antennaLimit` 字段（可选）
- 在 `notes/renotes` 端点新增 `filter` 可选参数，支持以下值：
  - `all`（默认）
  - `renote`
  - `quote`
- :warning: 由于存在 bug，移除 `notes/reactions` 端点中未生效的以下可选参数：
  - `sinceId`
  - `untilId`

## v20240413

- :warning: 移除 `patrons` 端点

## v20240405

- 新增 `notes/history` 端点

## v20240319

- :warning: `users/show` 中的 `followingCount` 和 `followersCount` 在不可用时将返回 `null`（原返回 0）
- :warning: 由于帖子现已自动索引，移除 `admin/search/index-all` 端点
- 在 `notes/search` 端点新增以下可选参数：
  - `sinceDate`
  - `untilDate`
  - `withFiles`
  - `searchCwAndAlt`
- 在 `meta` 和 `admin/meta` 的响应及 `admin/update-meta` 请求中新增 `enableGuestTimeline` 字段（可选）

## v20240301

- 新增功能相关端点：
  - 查看未通过关注的请求：
    - `following/requests/sent`
  - 用户级回复静音：
    - `reply-mute/create`
    - `reply-mute/delete`
    - `reply-mute/list`
- :warning: 移除以下端点：
  - `admin/vacuum`
  - `reset-db`

## v20240228

- :warning: 移除以下端点：
  - `charts/ap-request`
  - `charts/drive`
  - `charts/federation`
  - `charts/hashtag`
  - `charts/instance`
  - `charts/notes`
  - `charts/user/drive`
  - `charts/user/following`
  - `charts/user/notes`
  - `charts/user/reactions`
  - `charts/users`

## v20240221

- 新增 `admin/set-emoji-moderator` 端点，支持设置以下权限：
  - `add`: 添加新表情，设置标签/分类/许可证
  - `mod`: `add` 权限 + 编辑现有表情名称/分类/标签/许可证
  - `full`: `mod` 权限 + 删除表情
- 表情审核员可访问 `admin/emoji/` 下所有端点
- 从 `i` 响应和 `i/update` 请求参数中移除 `lang` 字段
- 新增 `notes/make-private` 端点

## v20240217

- :warning: 移除自动 NSFW 媒体检测功能，影响以下端点：
  - `admin/meta` 响应中移除字段：
    - `sensitiveMediaDetection`
    - `sensitiveMediaDetectionSensitivity`
    - `setSensitiveFlagAutomatically`
    - `enableSensitiveMediaDetectionForVideos`
  - `admin/update-meta` 请求中移除字段：
    - `sensitiveMediaDetection`
    - `sensitiveMediaDetectionSensitivity`
    - `setSensitiveFlagAutomatically`
    - `enableSensitiveMediaDetectionForVideos`
  - `admin/show-user` 响应中移除字段：
    - `autoSensitive`
  - `i/update` 请求中移除字段：
    - `autoSensitive`
- 新增 `/api/emojis` 端点

## v20240212

- :warning: `latest-version` 端点响应字段名从 `tag_name` 改为 `latest_version`

## v1.0.5-rc

- `admin/update-meta` 支持 `moreUrls` 参数，`admin/meta` 响应包含该字段（用于帮助菜单）
- :warning: `meta` 响应中移除以下字段：
  - `enableTwitterIntegration`
  - `enableGithubIntegration`
  - `enableDiscordIntegration`
- :warning: `admin/update-meta` 请求和 `admin/meta` 响应中移除以下字段：
  - `enableTwitterIntegration`
  - `enableGithubIntegration`
  - `enableDiscordIntegration`
  - `twitterConsumerKey`
  - `twitterConsumerSecret`
  - `githubClientId`
  - `githubClientSecret`
  - `discordClientId`
  - `discordClientSecret`
- :warning: `admin/show-user` 响应中移除 `integrations` 字段
- 在 `notes/create` 和 `notes/edit` 中新增 `lang` 参数
- :warning: `notes/translate` 端点现在需要身份验证
