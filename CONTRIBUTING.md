# Contribution guide
We're glad you're interested in contributing Firefish! In this document you will find the information you need to contribute to the project.

## Translation (i18n)
Firefish uses [Weblate](https://hosted.weblate.org/engage/firefish/) for translation and internationalization management.

If your language is not listed in Weblate, please open an issue.

You can contribute without knowing how to code by helping translate here:

[![Translation status](https://hosted.weblate.org/widgets/firefish/-/287x66-grey.png)](https://hosted.weblate.org/engage/firefish/)

[![Translation bars](https://hosted.weblate.org/widgets/firefish/-/multi-auto.svg)](https://hosted.weblate.org/engage/firefish/)

## Issues
Before creating an issue, please check the following:
- To avoid duplication, please search for similar issues before creating a new issue.
- Do not use Issues to ask questions or troubleshooting.
	- Issues should only be used to feature requests, suggestions, and bug tracking.
	- Please ask questions or troubleshooting in the [Matrix room](https://matrix.to/#/#firefish-community:nitro.chat).

> **Warning**
> Do not close issues that are about to be resolved. It should remain open until a commit that actually resolves it is merged.

## Coding

### Preparing a development environment

You can prepare your local Firefish environment in multiple ways:

- [Run Firefish and databases on your host](../dev/docs/local-installation.md)
- [Run Firefish on your host and databases in containers](../dev/docs/db-container.md)
- [Run Firefish and databases in containers](../dev/docs/container.md)

### Before implementation
When you want to add a feature or fix a bug, **first have the design and policy reviewed in an Issue** (if it is not there, please make one). Without this step, there is a high possibility that the MR will not be merged even if it is implemented.

At this point, you also need to clarify the goals of the MR you will create, and make sure that the other members of the team are aware of them.
MRs that do not have a clear set of do's and don'ts tend to be bloated and difficult to review.

Also, when you start implementation, assign yourself to the Issue (if you cannot do it yourself, ask another member to assign you). By expressing your intention to work the Issue, you can prevent conflicts in the work.

### Well-known branches
- The **`main`** branch is tracking the latest release and used for production purposes.
- The **`develop`** branch is where we work for the next release.
	- When you create a MR, basically target it to this branch. **But create a different branch**
- The **`l10n_develop`** branch is reserved for localization management.
- **`feature/*`** branches are reserved for the development of a specific feature

### Creating a merge request (MR)
Thank you for your MR! Before creating a MR, please check the following:
- If possible, prefix the title with a keyword that identifies the type of this MR, as shown below.
  - `fix` / `refactor` / `feat` / `enhance` / `perf` / `chore` etc. You are also welcome to use gitmoji. This is important as we use these to A) easier read the git history and B) generate our changelog. Without propper prefixing it is possible that your MR is rejected.
  - Also, make sure that the granularity of this MR is appropriate. Please do not include more than one type of change or interest in a single MR.
- If there is an Issue which will be resolved by this MR, please include a reference to the Issue in the text. Good examples include `Closing: #21` or `Resolves: #21`
- Check if there are any documents that need to be created or updated due to this change.
	- For example, you need to update `docs/api-change.md` if the MR includes API changes.
- If you have added a feature or fixed a bug, please add a test case if possible.
- Please make sure that formatting, tests and Lint are passed in advance.
  - You can run it with `pnpm run format`, `pnpm run test` and `pnpm run lint`. [See more info](#testing)
- If this MR includes UI changes, please attach a screenshot in the text.

Thanks for your cooperation 🤗

## Reviewers guide
Be willing to comment on the good points and not just the things you want fixed 💯

### Review perspective
- Scope
  - Are the goals of the MR clear?
  - Is the granularity of the MR appropriate?
- Security
	- Does merging this MR create a vulnerability?
- Performance
	- Will merging this MR cause unexpected performance degradation?
	- Is there a more efficient way?
- Testing
	- Does the test ensure the expected behavior?
	- Are there any omissions or gaps?
	- Does it check for anomalies?
