import type { Ref } from "vue";
import { defineAsyncComponent } from "vue";
import type { entities } from "firefish-js";
import { isModerator, isSignedIn, me } from "@/me";
import { i18n } from "@/i18n";
import * as os from "@/os";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { url } from "@/config";
import { noteActions } from "@/store";
import { shareAvailable } from "@/scripts/share-available";
import { getUserMenu } from "@/scripts/get-user-menu";
import icon from "@/scripts/icon";
import { useRouter } from "@/router";
import { notePage } from "@/filters/note";
import type { MenuItem } from "@/types/menu";
import type { NoteDraft } from "@/types/post-form";
import type MkNoteTranslation from "@/components/note/MkNoteTranslation.vue";

const router = useRouter();

export function getNoteMenu(props: {
	note: entities.Note;
	menuButton: Ref<HTMLElement | undefined>;
	isDeleted: Ref<boolean>;
	translationEl: InstanceType<typeof MkNoteTranslation> | null;
	currentClipPage?: Ref<entities.Clip> | null;
}) {
	const isRenote =
		props.note.renote != null &&
		props.note.text == null &&
		props.note.fileIds.length === 0 &&
		props.note.poll == null;

	const appearNote = isRenote
		? (props.note.renote as entities.Note)
		: props.note;

	function del(): void {
		os.confirm({
			type: "warning",
			text: i18n.ts.noteDeleteConfirm,
		}).then(({ canceled }) => {
			if (canceled) return;

			os.api("notes/delete", {
				noteId: appearNote.id,
			});
		});
	}

	async function getVisibleUsers() {
		if (appearNote.visibleUserIds && appearNote.visibleUserIds.length > 0) {
			const users = await os.api("users/show", {
				userIds: appearNote.visibleUserIds,
			});
			return users;
		} else {
			return undefined;
		}
	}

	function delEdit(): void {
		os.confirm({
			type: "warning",
			text: i18n.ts.deleteAndEditConfirm,
		}).then(async ({ canceled }) => {
			if (canceled) return;

			os.api("notes/delete", {
				noteId: appearNote.id,
			});

			os.post({
				initialNote: appearNote as NoteDraft,
				renote: appearNote.renote,
				reply: appearNote.reply,
				channel: appearNote.channel,
				initialVisibleUsers: await getVisibleUsers(),
			});
		});
	}

	async function edit() {
		os.post({
			initialNote: appearNote as NoteDraft,
			renote: appearNote.renote,
			reply: appearNote.reply,
			channel: appearNote.channel,
			editId: appearNote.id,
			initialVisibleUsers: await getVisibleUsers(),
		});
	}

	function showEditHistory(): void {
		router.push(notePage(appearNote, { historyPage: true }));
	}

	function makePrivate(): void {
		os.confirm({
			type: "warning",
			text: i18n.ts.makePrivateConfirm,
		}).then(async ({ canceled }) => {
			if (canceled) return;

			await os.api("notes/make-private", {
				noteId: appearNote.id,
			});
		});
	}

	function toggleFavorite(favorite: boolean): void {
		os.apiWithDialog(
			favorite ? "notes/favorites/create" : "notes/favorites/delete",
			{
				noteId: appearNote.id,
			},
		);
	}

	function toggleWatch(watch: boolean): void {
		os.apiWithDialog(
			watch ? "notes/watching/create" : "notes/watching/delete",
			{
				noteId: appearNote.id,
			},
		);
	}

	function toggleThreadMute(mute: boolean): void {
		os.apiWithDialog(
			mute ? "notes/thread-muting/create" : "notes/thread-muting/delete",
			{
				noteId: appearNote.id,
			},
		);
	}

	function copyContent(): void {
		copyToClipboard(appearNote.text);
		os.success();
	}

	function copyLink(): void {
		copyToClipboard(`${url}/notes/${appearNote.id}`);
		os.success();
	}

	function copyOriginal(): void {
		copyToClipboard(appearNote.url ?? appearNote.uri);
		os.success();
	}

	function togglePin(pin: boolean): void {
		os.apiWithDialog(
			pin ? "i/pin" : "i/unpin",
			{
				noteId: appearNote.id,
			},
			undefined,
		).catch((res) => {
			if (res.id === "72dab508-c64d-498f-8740-a8eec1ba385a") {
				os.alert({
					type: "error",
					text: i18n.ts.pinLimitExceeded,
				});
			}
		});
	}

	async function clip(): Promise<void> {
		const clips = await os.api("clips/list");
		os.popupMenu(
			[
				{
					icon: `${icon("ph-plus")}`,
					text: i18n.ts.createNew,
					action: async () => {
						const { canceled, result } = await os.form(i18n.ts.createNewClip, {
							name: {
								type: "string",
								label: i18n.ts.name,
							},
							description: {
								type: "string",
								required: false,
								multiline: true,
								label: i18n.ts.description,
							},
							isPublic: {
								type: "boolean",
								label: i18n.ts.public,
								default: false,
							},
						});
						if (canceled) return;

						const clip = await os.apiWithDialog("clips/create", result);

						os.apiWithDialog("clips/add-note", {
							clipId: clip.id,
							noteId: appearNote.id,
						});
					},
				},
				null,
				...clips.map((clip) => ({
					text: clip.name,
					action: () => {
						os.promiseDialog(
							os.api("clips/add-note", {
								clipId: clip.id,
								noteId: appearNote.id,
							}),
							null,
							async (err) => {
								if (err.id === "734806c4-542c-463a-9311-15c512803965") {
									const confirm = await os.confirm({
										type: "warning",
										text: i18n.t("confirmToUnclipAlreadyClippedNote", {
											name: clip.name,
										}),
									});
									if (!confirm.canceled) {
										os.apiWithDialog("clips/remove-note", {
											clipId: clip.id,
											noteId: appearNote.id,
										});
										if (props.currentClipPage?.value.id === clip.id)
											props.isDeleted.value = true;
									}
								} else {
									os.alert({
										type: "error",
										text: err.message + "\n" + err.id,
									});
								}
							},
						);
					},
				})),
			],
			props.menuButton.value,
			{},
		).then(focus);
	}

	async function unclip(): Promise<void> {
		os.apiWithDialog("clips/remove-note", {
			clipId: props.currentClipPage.value.id,
			noteId: appearNote.id,
		});
		props.isDeleted.value = true;
	}

	// async function promote(): Promise<void> {
	// 	const { canceled, result: days } = await os.inputNumber({
	// 		title: i18n.ts.numberOfDays,
	// 	});

	// 	if (canceled) return;

	// 	os.apiWithDialog("admin/promo/create", {
	// 		noteId: appearNote.id,
	// 		expiresAt: Date.now() + 86400000 * days,
	// 	});
	// }

	function share(): void {
		navigator.share({
			title: i18n.t("noteOf", { user: appearNote.user.name }),
			text: appearNote.text ?? undefined,
			url: `${url}/notes/${appearNote.id}`,
		});
	}

	let menu: MenuItem[];
	if (isSignedIn(me)) {
		const statePromise = os.api("notes/state", {
			noteId: appearNote.id,
		});

		const isEdited = !!appearNote.updatedAt;

		const isAppearAuthor = appearNote.userId === me.id;

		menu = [
			...(props.currentClipPage?.value.userId === me.id
				? [
						{
							icon: `${icon("ph-minus-circle")}`,
							text: i18n.ts.unclip,
							danger: true,
							action: unclip,
						},
						null,
					]
				: []),
			statePromise.then((state) =>
				state?.isFavorited
					? {
							icon: `${icon("ph-bookmark-simple")}`,
							text: i18n.ts.unfavorite,
							action: () => toggleFavorite(false),
						}
					: {
							icon: `${icon("ph-bookmark-simple")}`,
							text: i18n.ts.favorite,
							action: () => toggleFavorite(true),
						},
			),
			{
				icon: `${icon("ph-paperclip")}`,
				text: i18n.ts.clip,
				action: () => clip(),
			},
			!isAppearAuthor
				? statePromise.then((state) =>
						state?.isWatching
							? {
									icon: `${icon("ph-eye-slash")}`,
									text: i18n.ts.unwatch,
									action: () => toggleWatch(false),
								}
							: {
									icon: `${icon("ph-eye")}`,
									text: i18n.ts.watch,
									action: () => toggleWatch(true),
								},
					)
				: undefined,
			statePromise.then((state) =>
				state?.isMutedThread
					? {
							icon: `${icon("ph-speaker-x ph-dir")}`,
							text: i18n.ts.unmuteThread,
							action: () => toggleThreadMute(false),
						}
					: {
							icon: `${icon("ph-speaker-x ph-dir")}`,
							text: i18n.ts.muteThread,
							action: () => toggleThreadMute(true),
						},
			),
			isAppearAuthor
				? (me.pinnedNoteIds || []).includes(appearNote.id)
					? {
							icon: `${icon("ph-push-pin")}`,
							text: i18n.ts.unpin,
							action: () => togglePin(false),
						}
					: {
							icon: `${icon("ph-push-pin")}`,
							text: i18n.ts.pin,
							action: () => togglePin(true),
						}
				: undefined,
			isEdited
				? {
						icon: `${icon("ph-clock-countdown")}`,
						text: i18n.ts.noteEditHistory,
						action: () => showEditHistory(),
					}
				: undefined,
			props.translationEl?.canTranslate
				? {
						icon: `${icon("ph-translate")}`,
						text: i18n.ts.translate,
						action: props.translationEl.translate,
					}
				: undefined,
			appearNote.url || appearNote.uri
				? {
						icon: `${icon("ph-arrow-square-out")}`,
						text: i18n.ts.showOnRemote,
						action: () => {
							window.open(appearNote.url || appearNote.uri, "_blank");
						},
					}
				: undefined,
			{
				type: "parent" as const,
				icon: `${icon("ph-share-network")}`,
				text: i18n.ts.share,
				children: [
					{
						icon: `${icon("ph-clipboard-text")}`,
						text: i18n.ts.copyContent,
						action: copyContent,
					},
					{
						icon: `${icon("ph-link-simple")}`,
						text: i18n.ts.copyLink,
						action: copyLink,
					},
					(appearNote.url ?? appearNote.uri) != null
						? {
								icon: `${icon("ph-link-simple")}`,
								text: `${i18n.ts.copyLink} (${i18n.ts.origin})`,
								action: copyOriginal,
							}
						: undefined,
					appearNote.user.host == null ||
					(appearNote.url ?? appearNote.uri) != null
						? {
								icon: `${icon("ph-qr-code")}`,
								text:
									appearNote.user.host == null
										? i18n.ts.getQrCode
										: `${i18n.ts.getQrCode} (${i18n.ts.origin})`,
								action: () => {
									os.displayQrCode(
										appearNote.user.host == null
											? `${url}/notes/${appearNote.id}`
											: appearNote.url ?? appearNote.uri,
									);
								},
							}
						: undefined,
					shareAvailable()
						? {
								icon: `${icon("ph-share-network")}`,
								text: i18n.ts.share,
								action: share,
							}
						: undefined,
				],
			},
			/*
		...(isModerator ? [
			null,
			{
				icon: `${icon('ph-megaphone-simple')}`,
				text: i18n.ts.promote,
				action: promote
			}]
			: []
		), */
			null,
			!isAppearAuthor
				? {
						icon: `${icon("ph-warning-circle")}`,
						text: i18n.ts.reportAbuse,
						action: () => {
							const u =
								appearNote.url ||
								appearNote.uri ||
								`${url}/notes/${appearNote.id}`;
							os.popup(
								defineAsyncComponent(
									() => import("@/components/MkAbuseReportWindow.vue"),
								),
								{
									user: appearNote.user,
									initialComment: `Note: ${u}\n-----\n`,
								},
								{},
								"closed",
							);
						},
					}
				: undefined,
			isAppearAuthor
				? {
						icon: `${icon("ph-pencil-line")}`,
						text: i18n.ts.toEdit,
						accent: true,
						action: edit,
					}
				: undefined,
			isAppearAuthor &&
			!(
				appearNote.visibility === "specified" &&
				appearNote.visibleUserIds?.length === 0
			)
				? {
						icon: `${icon("ph-eye-slash")}`,
						text: i18n.ts.makePrivate,
						danger: true,
						action: makePrivate,
					}
				: undefined,
			isAppearAuthor
				? {
						icon: `${icon("ph-eraser")}`,
						text: i18n.ts.deleteAndEdit,
						danger: true,
						action: delEdit,
					}
				: undefined,
			isAppearAuthor || isModerator
				? {
						icon: `${icon("ph-trash")}`,
						text: i18n.ts.delete,
						danger: true,
						action: del,
					}
				: undefined,
			!isAppearAuthor ? null : undefined,
			!isAppearAuthor
				? {
						type: "parent" as const,
						icon: `${icon("ph-user")}`,
						text: i18n.ts.user,
						children: getUserMenu(appearNote.user),
					}
				: undefined,
		].filter((x) => x !== undefined);
	} else {
		menu = [
			(appearNote.url ?? appearNote.uri) != null
				? {
						icon: `${icon("ph-arrow-square-out")}`,
						text: i18n.ts.showOnRemote,
						action: () => {
							window.open(appearNote.url ?? appearNote.uri, "_blank");
						},
					}
				: undefined,
			{
				icon: `${icon("ph-clipboard-text")}`,
				text: i18n.ts.copyContent,
				action: copyContent,
			},
			{
				icon: `${icon("ph-link-simple")}`,
				text: i18n.ts.copyLink,
				action: copyLink,
			},
			(appearNote.url ?? appearNote.uri) != null
				? {
						icon: `${icon("ph-link-simple")}`,
						text: `${i18n.ts.copyLink} (${i18n.ts.origin})`,
						action: copyOriginal,
					}
				: undefined,
			appearNote.user.host == null || (appearNote.url ?? appearNote.uri) != null
				? {
						icon: `${icon("ph-qr-code")}`,
						text:
							appearNote.user.host == null
								? i18n.ts.getQrCode
								: `${i18n.ts.getQrCode} (${i18n.ts.origin})`,
						action: () => {
							os.displayQrCode(
								appearNote.user.host == null
									? `${url}/notes/${appearNote.id}`
									: appearNote.url ?? appearNote.uri,
							);
						},
					}
				: undefined,
			shareAvailable()
				? {
						icon: `${icon("ph-share-network")}`,
						text: i18n.ts.share,
						action: share,
					}
				: undefined,
		].filter((x) => x !== undefined);
	}

	if (noteActions.length > 0) {
		menu = menu.concat([
			null,
			...noteActions.map((action) => ({
				icon: `${icon("ph-plug")}`,
				text: action.title,
				action: () => {
					action.handler(appearNote);
				},
			})),
		]);
	}

	return menu;
}
