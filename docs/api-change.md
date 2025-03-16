# Changes to the Firefish API

Breaking changes are indicated by the :warning: icon.

## v20240728

- Added `name`, `category`, `aliases`, `license` optional parameters to `admin/emoji/add` endpoint.
- Added `name` optional parameter to `drive/files/upload-from-url` endpoint.

## v20240725

- Added `i/export-followers` endpoint.

## v20240714

- The old Mastodon API has been replaced with a new implementation based on Iceshrimp’s.
  - :warning: The new API uses a new format to manage Mastodon sessions in the database, whereas old implementation uses Misskey sessions. All previous client app and token registrations will not work with the new API. All clients need to be re-registered and all users need to re-authenticate.
  - :warning: All IDs (of statuses/notes, notifications, users, etc.) will be using the alphanumerical format, aligning with the Firefish/Misskey API. The old numerical IDs will not work when queried against the new API.

<details>

<summary>Available endpoints (under <code>https://instance-domain/api/</code>)</summary>

|  method  |              endpoint              |                    note                    |
|----------|------------------------------------|--------------------------------------------|
|   `POST` | `oauth/token`                      |                                            |
|   `POST` | `oauth/revoke`                     |                                            |
|   `POST` | `v1/apps`                          |                                            |
|    `GET` | `v1/apps/verify_credentials`       |                                            |
|   `POST` | `v1/firefish/apps/info`            | Firefish extension, uses MiAuth            |
|   `POST` | `v1/firefish/auth/code`            | Firefish extension, uses MiAuth            |
|          |                                    |                                            |
|    `GET` | `v1/accounts/verify_credentials`   |                                            |
|  `PATCH` | `v1/accounts/update_credentials`   |                                            |
|    `GET` | `v1/accounts/lookup`               |                                            |
|    `GET` | `v1/accounts/relationships`        |                                            |
|    `GET` | `v1/accounts/search`               |                                            |
|    `GET` | `v1/accounts/:id`                  |                                            |
|    `GET` | `v1/accounts/:id/statuses`         |                                            |
|    `GET` | `v1/accounts/:id/featured_tags`    |                                            |
|    `GET` | `v1/accounts/:id/followers`        |                                            |
|    `GET` | `v1/accounts/:id/following`        |                                            |
|    `GET` | `v1/accounts/:id/lists`            |                                            |
|   `POST` | `v1/accounts/:id/follow`           |                                            |
|   `POST` | `v1/accounts/:id/unfollow`         |                                            |
|   `POST` | `v1/accounts/:id/block`            |                                            |
|   `POST` | `v1/accounts/:id/unblock`          |                                            |
|   `POST` | `v1/accounts/:id/mute`             |                                            |
|   `POST` | `v1/accounts/:id/unmute`           |                                            |
|          |                                    |                                            |
|    `GET` | `v1/featured_tags`                 | always returns an empty list               |
|    `GET` | `v1/followed_tags`                 | always returns an empty list               |
|    `GET` | `v1/bookmarks`                     |                                            |
|    `GET` | `v1/favourites`                    |                                            |
|          |                                    |                                            |
|    `GET` | `v1/mutes`                         |                                            |
|    `GET` | `v1/blocks`                        |                                            |
|    `GET` | `v1/follow_requests`               |                                            |
|   `POST` | `v1/follow_requests/:id/authorize` |                                            |
|   `POST` | `v1/follow_requests/:id/reject`    |                                            |
|          |                                    |                                            |
|    `GET` | `v1/filters`                       |                                            |
|   `POST` | `v1/filters`                       |                                            |
|    `GET` | `v2/filters`                       |                                            |
|   `POST` | `v2/filters`                       |                                            |
|          |                                    |                                            |
|    `GET` | `v1/lists`                         |                                            |
|   `POST` | `v1/lists`                         |                                            |
|    `GET` | `v1/lists/:id`                     |                                            |
|    `PUT` | `v1/lists/:id`                     |                                            |
| `DELETE` | `v1/lists/:id`                     |                                            |
|    `GET` | `v1/lists/:id/accounts`            |                                            |
|   `POST` | `v1/lists/:id/accounts`            |                                            |
| `DELETE` | `v1/lists/:id/accounts`            |                                            |
|          |                                    |                                            |
|    `GET` | `v1/media/:id`                     |                                            |
|    `PUT` | `v1/media/:id`                     |                                            |
|   `POST` | `v1/media`                         |                                            |
|   `POST` | `v2/media`                         |                                            |
|          |                                    |                                            |
|    `GET` | `v1/custom_emojis`                 |                                            |
|    `GET` | `v1/instance`                      |                                            |
|    `GET` | `v2/instance`                      |                                            |
|    `GET` | `v1/announcements`                 |                                            |
|   `POST` | `v1/announcements/:id/dismiss`     |                                            |
|    `GET` | `v1/trends`                        | pagination is unimplemented                |
|    `GET` | `v1/trends/tags`                   | pagination is unimplemented                |
|    `GET` | `v1/trends/statuses`               |                                            |
|    `GET` | `v1/trends/links`                  | always returns an empty list               |
|    `GET` | `v1/preferences`                   |                                            |
|    `GET` | `v2/suggestions`                   |                                            |
|          |                                    |                                            |
|    `GET` | `v1/notifications`                 |                                            |
|    `GET` | `v1/notifications/:id`             |                                            |
|   `POST` | `v1/notifications/clear`           |                                            |
|   `POST` | `v1/notifications/:id/dismiss`     |                                            |
|   `POST` | `v1/conversations/:id/read`        |                                            |
|    `GET` | `v1/push/subscription`             |                                            |
|   `POST` | `v1/push/subscription`             |                                            |
| `DELETE` | `v1/push/subscription`             |                                            |
|          |                                    |                                            |
|    `GET` | `v1/search`                        |                                            |
|    `GET` | `v2/search`                        |                                            |
|          |                                    |                                            |
|   `POST` | `v1/statuses`                      |                                            |
|    `PUT` | `v1/statuses/:id`                  |                                            |
|    `GET` | `v1/statuses/:id`                  |                                            |
| `DELETE` | `v1/statuses/:id`                  |                                            |
|    `GET` | `v1/statuses/:id/context`          |                                            |
|    `GET` | `v1/statuses/:id/history`          |                                            |
|    `GET` | `v1/statuses/:id/source`           |                                            |
|    `GET` | `v1/statuses/:id/reblogged_by`     |                                            |
|    `GET` | `v1/statuses/:id/favourited_by`    |                                            |
|   `POST` | `v1/statuses/:id/favourite`        |                                            |
|   `POST` | `v1/statuses/:id/unfavourite`      |                                            |
|   `POST` | `v1/statuses/:id/reblog`           |                                            |
|   `POST` | `v1/statuses/:id/unreblog`         |                                            |
|   `POST` | `v1/statuses/:id/bookmark`         |                                            |
|   `POST` | `v1/statuses/:id/unbookmark`       |                                            |
|   `POST` | `v1/statuses/:id/pin`              |                                            |
|   `POST` | `v1/statuses/:id/unpin`            |                                            |
|   `POST` | `v1/statuses/:id/react/:name`      |                                            |
|   `POST` | `v1/statuses/:id/unreact/:name`    |                                            |
|   `POST` | `v1/statuses/:id/translate`        |                                            |
|          |                                    |                                            |
|    `GET` | `v1/polls/:id`                     |                                            |
|   `POST` | `v1/polls/:id/votes`               |                                            |
|          |                                    |                                            |
|    `GET` | `v1/scheduled_statuses`            |                                            |
|    `GET` | `v1/scheduled_statuses/:id`        | reschedule (`PUT` method) is unimplemented |
| `DELETE` | `v1/scheduled_statuses/:id`        |                                            |
|          |                                    |                                            |
|    `GET` | `v1/streaming/health`              |                                            |
|          |                                    |                                            |
|    `GET` | `v1/timelines/public`              |                                            |
|    `GET` | `v1/timelines/tag/:hashtag`        |                                            |
|    `GET` | `v1/timelines/home`                |                                            |
|    `GET` | `v1/timelines/list/:listId`        |                                            |
|    `GET` | `v1/conversations`                 |                                            |
|    `GET` | `v1/markers`                       |                                            |
|   `POST` | `v1/markers`                       |                                            |

</details>

## v20240710

- Added `readCatLanguage` field to the response of `i` and request of `i/update` (optional).

## v20240607

- `GET` request is now allowed for the `latest-version` endpoint.

## v20240523

- Added `scheduledAt` optional parameter to `notes/create` (!10789)

## v20240516

- :warning: `server-info` (an endpoint to get server hardware information) now requires credentials.
- :warning: `net` (server's default network interface) has been removed from `admin/server-info`.
- Adding `lang` to the response of `i` and the request parameter of `i/update`.

## v20240504

- :warning: Removed `release` endpoint.

## v20240424

- Added `antennaLimit` field to the response of `meta` and `admin/meta`, and the request of `admin/update-meta` (optional).
- Added `filter` optional parameter to `notes/renotes` endpoint to filter the types of renotes. It can take the following values:
	- `all` (default)
  - `renote`
  - `quote`
- :warning: Removed the following optional parameters in `notes/reactions`, as they were never taken into account due to a bug:
	- `sinceId`
	- `untilId`

## v20240413

- :warning: Removed `patrons` endpoint.

## v20240405

- Added `notes/history` endpoint.

## v20240319

- :warning: `followingCount` and `followersCount` in `users/show` will be `null` (instead of 0) if these values are unavailable.
- :warning: `admin/search/index-all` is removed since posts are now indexed automatically.
- New optional parameters are added to `notes/search` endpoint:
	- `sinceDate`
	- `untilDate`
	- `withFiles`
	- `searchCwAndAlt`
- Added `enableGuestTimeline` field to the response of `meta` and `admin/meta`, and the request of `admin/update-meta` (optional).

## v20240301

- With the addition of new features, the following endpoints are added:
	- check your follow requests that haven't been approved
		- `following/requests/sent`
	- per-user reply mutes
		- `reply-mute/create`
		- `reply-mute/delete`
		- `reply-mute/list`
- :warning: The following (horrible) endpoints are removed:
	- `admin/vacuum`
	- `reset-db`

## v20240228

- :warning: The following endpoints are removed:
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

- Added `admin/set-emoji-moderator` endpoint, where moderators can give these permissions to regular users:
	- `add`: Add new custom emojis, set tag/category/license to newly added custom emojis
	- `mod`: `add` permission + edit the name/category/tag/license of the existing custom emojis
	- `full`: `mod` permission + delete existing custom emojis
- Emoji moderators are able to access to the endpoints under `admin/emoji/`
- Removed `lang` from the response of `i` and the request parameter of `i/update`.
- Added `notes/make-private` endpoint.

## v20240217

- :warning: Since the auto NSFW media detection has been removed, these endpoints are affected:
  - `admin/meta`
    - These parameter(s) are removed from the response field:
      - `sensitiveMediaDetection`
      - `sensitiveMediaDetectionSensitivity`
      - `setSensitiveFlagAutomatically`
      - `enableSensitiveMediaDetectionForVideos`
  - `admin/update-meta`
    - These parameter(s) are removed from the request field:
      - `sensitiveMediaDetection`
      - `sensitiveMediaDetectionSensitivity`
      - `setSensitiveFlagAutomatically`
      - `enableSensitiveMediaDetectionForVideos`
  - `admin/show-user`
    - These parameter(s) are removed from the response field:
      - `autoSensitive`
  - `i/update`
    - These parameter(s) are removed from the request field:
      - `autoSensitive`
- `/api/emojis` endpoint has been added.

## v20240212

- :warning: The field name of the response of `latest-version` has been changed from `tag_name` to `latest_version`.

## v1.0.5-rc

- `admin/update-meta` can now take `moreUrls` parameter, and response of `admin/meta` now includes `moreUrls`
  - These URLs are used for the help menu ([related merge request](https://firefish.dev/firefish/firefish/-/merge_requests/10640))
- :warning: response of `meta` no longer includes the following:
  - `enableTwitterIntegration`
  - `enableGithubIntegration`
  - `enableDiscordIntegration`
- :warning: parameter of `admin/update-meta` and response of `admin/meta` no longer include the following:
  - `enableTwitterIntegration`
  - `enableGithubIntegration`
  - `enableDiscordIntegration`
  - `twitterConsumerKey`
  - `twitterConsumerSecret`
  - `githubClientId`
  - `githubClientSecret`
  - `discordClientId`
  - `discordClientSecret`
- :warning: response of `admin/show-user` no longer includes `integrations`.
- Added `lang` parameter to `notes/create` and `notes/edit`.
- :warning: `notes/translate` now requires credentials.
