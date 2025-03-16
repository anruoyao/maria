# Changelog

Critical security updates are indicated by the :warning: icon.

This changelog is not an exhaustive list. Code refactorings, minor bug fixes, documentation/dependency updates, etc. are usually not listed here. If you want to see all changes, click on the version number and check the commit history.

- Server administrators must check [notice-for-admins.md](./notice-for-admins.md) as well.
- Third-party client/bot developers may want to check [api-change.md](./api-change.md) as well.

## :warning: v20241205

- Fix bugs (including a critical security issue)

## :warning: v20241121

- Fix multiple security issues
  - We would like to thank Hazelnoot and Laura Hausmann for helping us fix the security issues.
- Archive the repository on [Codeberg](https://codeberg.org/firefish/firefish) (firefish.dev is also available until the end of February 2025)

## v20240909

- Update dependencies
  - This fixes an issue where push notifications were not working properly.

## v20240905

- Add fallback images for url preview and instance ticker (!10723)
- Fix bugs
- Update documentation
  - :warning: Firefish is in maintenance mode. [(announcement)](https://info.firefish.dev/notes/9xsukr38m3komd63)

## v20240818

- Fix bugs

## v20240809

- Add writing mode (right-to-left, vertical) support (!11222)
- Fix bugs

### Breaking change

The random icon generator has been changed, so your icon will be changed if you haven't set your icon image and random icon generation is enabled on your server.

## v20240729

- Fix bugs (including a medium severity security issue)
	- We are very thankful to Laura Hausmann for kindly sharing the information about the security issue.

## v20240728

- Improve `admin/emoji/add` API
- Fix bugs

## v20240725

- Add followers list export feature
- Add description about excluding conditions (e.g., 'firefish -info.firefish.dev', '(sleepy OR eepy) -morning') in post search
	- Technically this is not a new feature
- Fix bugs

## v20240714

- Mastodon API implementation was ported from Iceshrimp, with added Firefish extensions including push notifications, post languages, schedule post support, and more. (#10880)
- Fix bugs

### Acknowledgement 

The new Mastodon API support would not have been possible without the significant dedication of Laura Hausmann (Iceshrimp lead developer). We thank her and other Iceshrimp contributors from the bottom of our hearts.

### Breaking changes

- The new Mastodon API uses a new format to manage Mastodon sessions in the database, whereas old implementation uses Misskey sessions. All previous client app and token registrations will not work with the new API. All clients need to be re-registered and all users need to re-authenticate.
- All IDs (of statuses/notes, notifications, users, etc.) will be using the alphanumerical format, aligning with the Firefish/Misskey API. The old numerical IDs will not work when queried against the new API.

### Important Notice

The new Mastodon API support still contains some incompatibilities and unimplemented features, so please keep in mind that you may experience glitchy behavior, and please do NOT report such issues to Mastodon client apps. Such a “bug” is likely due to our implementation, and Mastodon client developers should not be bothered by such an invalid bug report. In the worst scenario, they may simply block non-Mastodon implementations (some clients already do that).

If you find an incompatibility issue (a bug not reproducible with a vanilla Mastodon server), file it to the Firefish repository instead. However, please remember that it is impossible to achieve 100% compatibility, given that Mastodon servers don’t behave exactly like its own documentation.

## v20240710

- Add ability to disable the cat language conversion (nyaification)
- Fix bugs

## v20240630

- Add ability to automatically append #Alt4Me hashtag when posting a file without an alt text ([What is #Alt4Me?](https://social.growyourown.services/@FediTips/112055775451305236))
- Fix a build issue on some environments
- Fix bugs

## v20240623

- Fix bugs

## v20240613

This update contains code refactoring and dependency updates, with no major user-facing changes.

## v20240607

- Add the ability to share posts via QR code
- Update the API document page (`/api-doc`)
- Fix bugs

## v20240601

- Fix bugs

## v20240523

- Add scheduled posts
- Fix bugs

## v20240516

- Improve timeline UX (you can restore the original appearance by settings)
- Remove `$[center]` MFM function
	- This function was suddenly added last year (https://codeberg.org/firefish/firefish/commit/1a971efa689323d54eebb4d3646e102fb4d1d95a), but according to the [MFM spec](https://github.com/misskey-dev/mfm.js/blob/6aaf68089023c6adebe44123eebbc4dcd75955e0/docs/syntax.md#fn), `$[something]` must be an inline element (while `center` is a block element), so such a syntax is not expected by MFM renderers. Please use `<center></center>` instead.
- Fix bugs

## v20240504

- Fix bugs

## :warning: v20240430

- Add ability to group similar notifications
- Add features to share links to an account in the three dots menu on the profile page
- Improve server logs
- Fix bugs (including a critical security issue)
	- We are very thankful to @tesaguri and Laura Hausmann for helping to fix the security issue.

## v20240424

- Improve the usability of the feature to prevent forgetting to write alt texts
- Add a server-wide setting for the maximum number of antennas each user can create
- Fix bugs (including a medium severity security issue)
	- We are very thankful to @mei23 for kindly sharing the information about the security issue.

## v20240421

- Fix bugs

## v20240413

- Add "Media" tab to user page
- Improve federation and rendering of mathematical expressions
- Remove donor information from the web client
	- See also: https://info.firefish.dev/notes/9s1n283sb10rh869
- Fix bugs

## v20240405

- Add ability to view the history of post edits (!10714)
- Fix bugs

## v20240401

- Fix bugs

## :warning: v20240330

- Fix bugs (including a critical security issue)
	- We are very thankful to Oneric (the reporter of the security issue) and Laura Hausmann (Iceshrimp maintainer) for kindly and securely sharing the information to fix the issue.

## v20240326

- Fix bugs
- Add an icon in the posting form to indicate that attached files have alt text
- Add a toggleable setting to show a warning if the post language setting might be incorrect

## v20240319

- Introduce new full-text search engine and post search filters
- Refactoring
- Show unlisted posts from following users in antennas (similar to [Fedibird](https://github.com/fedibird/mastodon/tree/fedibird) and [kmyblue](https://github.com/kmycode/mastodon), unlisted posts from people you don't follow won't be shown)
- Add ability to publish the Local and Global timelines on `/timeline` page
- Add langage annotation to post contents (!10687)
- Add a toggleable setting to show a warning when you attempt to post files without alt text
- Fix bugs
- Update documents and example config files
- Added `/authorize_interaction` page, allowing users to jump from a remote Mastodon post/user page to the corresponding page in Firefish (!10702)

## v20240301

- Add a page (`/my/follow-requests/sent`) to check your follow requests that haven't been approved
- Add ability to hide replies from certain users in timelines
- Admins are now allowed to migrate their account
	- This was requested by personal server admins
- Change default client settings (you can restore the previous settings)
	- Use system's font
		- This is for accessibility reasons (related discussion: <https://github.com/misskey-dev/misskey/issues/10192>)
	- Disable vibrations
	- Don't show gaps between posts in timelines
	- Show the instance ticker on local posts
- Change default user settings (existing users are not affected)
	- Reject crawler indexing
	- Set reaction history to public
- Change default server settings (existing servers are not affected)
	- Disable new user registration
- Fix bugs

## v20240229

- Add ability to pull-down-to-refresh timelines in PWA
- Make passkey/security key independent of TOTP (!10670)
- Fix bugs

## v20240228

- Update "About Firefish" page (!10673)
- Fix bugs (!10675 !10676 !10678 !10679)
- Remove charts generation to improve performance (#10611)

## v20240225

- Fix bugs
- Add syntax highlighting in MFM code blocks in various programming languages

## v20240222

- Enhance Mastodon post import feature (!10652)
- Minor style change in the web client
- Refactoring

## v20240221-1

- Fix a bug

## v20240221

- Add the ability to give regular (non-moderator) users permission to manage custom emojis
- Fix a bug that made impossible to update user profiles under some conditions
- Add "private" (only me) post visibility
	- It's just a paraphrase of DMs without recipients
	- You can also convert your existing public posts to private posts

## :warning: v20240217-1

- Fix a [security issue](https://github.com/misskey-dev/misskey/security/advisories/GHSA-qqrm-9grj-6v32)

## v20240217

- Add ability to specify the search engine used in the search bar MFM
- Remove auto NSFW media detection
- The "Hide NSFW media" config is now per device and per account
- Increase the max number of pinned posts from 5 to 15
- Change the second tab on the notifications page from "unread" to "reactions"
- Add ability to show a huge post button on the posting form
	- This is a joke feature inspired by https://mstdn.poyo.me/@prime/110668364208741253
- Fix bugs
- Add `/api/emojis` endpoint (compatible with Misskey v13) for better experiences with Misskey clients
	- This does not mean we will continue to maintain API compatibility with Misskey. Instead, we plan to improve the compatibility with the Mastodon API.

## v20240216

- Style changes in the web client (a770ef4314e21f17fdce1f19feb3758953b04486 ab39ff5954a392cc6688a02f1723e1702df5e35c 4eefd534d8150e2cd5cf31dddd327edceb5b84dc)
- Clicking the "like" button now sends the actual emoji reaction (star, good, heart, etc.) instead of an empty "like"

## v20240215

- Separate settings for displaying rounded avatars for cat and non-cat accounts
- Add a toggleable setting to replace the chat button with account menu on mobile
- Reduce the size of the container image (!10667)

## v20240214

- Fix container images

## v20240213

- Fix bugs
- Refactoring

## v20240212

- Refactoring
- Add a toggleable setting to hide follow buttons in a misclickable position
- Add a toggleable setting to show preview in posting form by default

## v20240210

- Security update (cf5b42a160ae8a4d94bf3dcea04ce12935ca4f76)
- Refactoring

## v20240208

- Fix bugs (!10654 !10665)
- Enlarge profile picture by clicking it (!10659)
- Support Pleroma chat (!10660)
- [Add documentation about downgrading](./docs/downgrade.md)

## v20240206

- Fix many bugs
- Per-post language selector (!10616)
