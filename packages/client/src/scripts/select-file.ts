import { ref } from "vue";
import type { entities } from "firefish-js";
import * as os from "@/os";
import { useStream } from "@/stream";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import { uploadFile } from "@/scripts/upload";
import icon from "@/scripts/icon";

const stream = useStream();

function select<Multiple extends boolean>(
	src: HTMLElement | null | undefined,
	label: string | null,
	multiple: Multiple,
) {
	return new Promise<
		Multiple extends true ? entities.DriveFile[] : entities.DriveFile
	>((res, rej) => {
		const keepOriginal = ref(defaultStore.state.keepOriginalUploading);

		const chooseFileFromPc = () => {
			const input = document.createElement("input");
			input.type = "file";
			input.multiple = multiple;
			input.onchange = () => {
				if (input.files === null) {
					return;
				}
				const promises = Array.from(input.files).map((file) =>
					uploadFile(
						file,
						defaultStore.state.uploadFolder,
						undefined,
						keepOriginal.value,
					),
				);

				Promise.all(promises)
					.then((driveFiles) => {
						res((multiple ? driveFiles : driveFiles[0]) as never);
					})
					.catch((err) => {
						// アップロードのエラーは uploadFile 内でハンドリングされているためアラートダイアログを出したりはしてはいけない
					});

				// 一応廃棄
				window.__misskey_input_ref__ = null;
			};

			// https://qiita.com/fukasawah/items/b9dc732d95d99551013d
			// iOS Safari で正常に動かす為のおまじない
			window.__misskey_input_ref__ = input;

			input.click();
		};

		const chooseFileFromDrive = () => {
			os.selectDriveFile(multiple).then((files) => {
				res(files);
			});
		};

		const chooseFileFromUrl = () => {
			os.inputText({
				title: i18n.ts.uploadFromUrl,
				type: "url",
				placeholder: i18n.ts.uploadFromUrlDescription,
			}).then(({ canceled, result: url }) => {
				if (canceled) return;

				const marker = Math.random().toString(); // TODO: UUIDとか使う

				const connection = stream.useChannel("main");
				connection.on("urlUploadFinished", (urlResponse) => {
					if (urlResponse.marker === marker) {
						res((multiple ? [urlResponse.file] : urlResponse.file) as never);
						connection.dispose();
					}
				});

				os.api("drive/files/upload-from-url", {
					url,
					folderId: defaultStore.state.uploadFolder,
					marker,
				});

				os.alert({
					title: i18n.ts.uploadFromUrlRequested,
					text: i18n.ts.uploadFromUrlMayTakeTime,
				});
			});
		};

		os.popupMenu(
			[
				label
					? {
							text: label,
							type: "label",
						}
					: undefined,
				{
					type: "switch",
					text: i18n.ts.keepOriginalUploading,
					ref: keepOriginal,
				},
				{
					text: i18n.ts.upload,
					icon: `${icon("ph-upload-simple")}`,
					action: chooseFileFromPc,
				},
				{
					text: i18n.ts.fromDrive,
					icon: `${icon("ph-cloud")}`,
					action: chooseFileFromDrive,
				},
				{
					text: i18n.ts.fromUrl,
					icon: `${icon("ph-link-simple")}`,
					action: chooseFileFromUrl,
				},
			],
			src,
		);
	});
}

export function selectFile(
	src: HTMLElement | null | undefined,
	label: string | null = null,
) {
	return select(src, label, false);
}

export function selectFiles(
	src: HTMLElement | null | undefined,
	label: string | null = null,
) {
	return select(src, label, true);
}
