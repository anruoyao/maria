// import { UserProfiles } from "@/models/index.js";
import type { User } from "@/models/entities/user.js";
// import { sendEmail } from "./send-email.js";
// import { I18n } from "@/misc/i18n.js";
// import { acctToString } from "backend-rs";
// TODO
//const locales = await import('../../../../locales/index.js');

// TODO: locale ファイルをクライアント用とサーバー用で分けたい

async function follow(userId: User["id"], follower: User) {
	/*
	const userProfile = await UserProfiles.findOneByOrFail({ userId: userId });
	if (!userProfile.email || !userProfile.emailNotificationTypes.includes('follow')) return;
	const locale = locales['en-US'];
	const i18n = new I18n(locale);
	// TODO: render user information html
	sendEmail(userProfile.email, i18n.t('_email._follow.title'), `${follower.name} (@${acctToString(follower)})`, `${follower.name} (@${acctToString(follower)})`);
	*/
}

async function receiveFollowRequest(userId: User["id"], follower: User) {
	/*
	const userProfile = await UserProfiles.findOneByOrFail({ userId: userId });
	if (!userProfile.email || !userProfile.emailNotificationTypes.includes('receiveFollowRequest')) return;
	const locale = locales['en-US'];
	const i18n = new I18n(locale);
	// TODO: render user information html
	sendEmail(userProfile.email, i18n.t('_email._receiveFollowRequest.title'), `${follower.name} (@${acctToString(follower)})`, `${follower.name} (@${acctToString(follower)})`);
	*/
}

export const sendEmailNotification = {
	follow,
	receiveFollowRequest,
};
