import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCharts1709047957489 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "__chart__ap_request" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__ap_request" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__drive" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__federation" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__hashtag" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__instance" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__network" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__notes" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart_day__per_user_drive" CASCADE`);
		await queryRunner.query(
			`DROP TABLE "__chart_day__per_user_following" CASCADE`,
		);
		await queryRunner.query(`DROP TABLE "__chart_day__per_user_notes" CASCADE`);
		await queryRunner.query(
			`DROP TABLE "__chart_day__per_user_reaction" CASCADE`,
		);
		await queryRunner.query(`DROP TABLE "__chart_day__users" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__drive" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__federation" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__hashtag" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__instance" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__network" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__notes" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__per_user_drive" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__per_user_following" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__per_user_notes" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__per_user_reaction" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__test" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__test_unique" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__test_grouped" CASCADE`);
		await queryRunner.query(`DROP TABLE "__chart__users" CASCADE`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE public.__chart__ap_request (
					id integer NOT NULL,
					date integer NOT NULL,
					"___deliverFailed" integer DEFAULT 0 NOT NULL,
					"___deliverSucceeded" integer DEFAULT 0 NOT NULL,
					"___inboxReceived" integer DEFAULT 0 NOT NULL
			);
			CREATE SEQUENCE public.__chart__ap_request_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__ap_request_id_seq OWNED BY public.__chart__ap_request.id;
			
			CREATE TABLE public.__chart__drive (
					id integer NOT NULL,
					date integer NOT NULL,
					"___local_incCount" integer DEFAULT '0'::bigint NOT NULL,
					"___local_incSize" integer DEFAULT '0'::bigint NOT NULL,
					"___local_decCount" integer DEFAULT '0'::bigint NOT NULL,
					"___local_decSize" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_incCount" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_incSize" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_decCount" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_decSize" integer DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__drive_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__drive_id_seq OWNED BY public.__chart__drive.id;
			
			CREATE TABLE public.__chart__federation (
					id integer NOT NULL,
					date integer NOT NULL,
					"unique_temp___deliveredInstances" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					"___deliveredInstances" smallint DEFAULT '0'::smallint NOT NULL,
					"unique_temp___inboxInstances" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					"___inboxInstances" smallint DEFAULT '0'::smallint NOT NULL,
					unique_temp___stalled character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					___stalled smallint DEFAULT '0'::smallint NOT NULL,
					___sub smallint DEFAULT '0'::smallint NOT NULL,
					___pub smallint DEFAULT '0'::smallint NOT NULL,
					___pubsub smallint DEFAULT '0'::smallint NOT NULL,
					"___subActive" smallint DEFAULT '0'::smallint NOT NULL,
					"___pubActive" smallint DEFAULT '0'::smallint NOT NULL
			);
			CREATE SEQUENCE public.__chart__federation_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__federation_id_seq OWNED BY public.__chart__federation.id;
			
			CREATE TABLE public.__chart__hashtag (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___local_users integer DEFAULT 0 NOT NULL,
					___remote_users integer DEFAULT 0 NOT NULL,
					unique_temp___local_users character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					unique_temp___remote_users character varying[] DEFAULT '{}'::character varying[] NOT NULL
			);
			CREATE SEQUENCE public.__chart__hashtag_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__hashtag_id_seq OWNED BY public.__chart__hashtag.id;
			
			CREATE TABLE public.__chart__instance (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___requests_failed smallint DEFAULT '0'::bigint NOT NULL,
					___requests_succeeded smallint DEFAULT '0'::bigint NOT NULL,
					___requests_received smallint DEFAULT '0'::bigint NOT NULL,
					___notes_total integer DEFAULT '0'::bigint NOT NULL,
					___notes_inc integer DEFAULT '0'::bigint NOT NULL,
					___notes_dec integer DEFAULT '0'::bigint NOT NULL,
					___notes_diffs_normal integer DEFAULT '0'::bigint NOT NULL,
					___notes_diffs_reply integer DEFAULT '0'::bigint NOT NULL,
					___notes_diffs_renote integer DEFAULT '0'::bigint NOT NULL,
					___users_total integer DEFAULT '0'::bigint NOT NULL,
					___users_inc smallint DEFAULT '0'::bigint NOT NULL,
					___users_dec smallint DEFAULT '0'::bigint NOT NULL,
					___following_total integer DEFAULT '0'::bigint NOT NULL,
					___following_inc smallint DEFAULT '0'::bigint NOT NULL,
					___following_dec smallint DEFAULT '0'::bigint NOT NULL,
					___followers_total integer DEFAULT '0'::bigint NOT NULL,
					___followers_inc smallint DEFAULT '0'::bigint NOT NULL,
					___followers_dec smallint DEFAULT '0'::bigint NOT NULL,
					"___drive_totalFiles" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_incFiles" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_incUsage" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_decFiles" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_decUsage" integer DEFAULT '0'::bigint NOT NULL,
					"___notes_diffs_withFile" integer DEFAULT 0 NOT NULL
			);
			CREATE SEQUENCE public.__chart__instance_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__instance_id_seq OWNED BY public.__chart__instance.id;
			
			CREATE TABLE public.__chart__network (
					id integer NOT NULL,
					date integer NOT NULL,
					"___incomingRequests" integer DEFAULT '0'::bigint NOT NULL,
					"___outgoingRequests" integer DEFAULT '0'::bigint NOT NULL,
					"___totalTime" integer DEFAULT '0'::bigint NOT NULL,
					"___incomingBytes" integer DEFAULT '0'::bigint NOT NULL,
					"___outgoingBytes" integer DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__network_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__network_id_seq OWNED BY public.__chart__network.id;
			
			CREATE TABLE public.__chart__notes (
					id integer NOT NULL,
					date integer NOT NULL,
					___local_total integer DEFAULT '0'::bigint NOT NULL,
					___local_inc integer DEFAULT '0'::bigint NOT NULL,
					___local_dec integer DEFAULT '0'::bigint NOT NULL,
					___local_diffs_normal integer DEFAULT '0'::bigint NOT NULL,
					___local_diffs_reply integer DEFAULT '0'::bigint NOT NULL,
					___local_diffs_renote integer DEFAULT '0'::bigint NOT NULL,
					___remote_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_inc integer DEFAULT '0'::bigint NOT NULL,
					___remote_dec integer DEFAULT '0'::bigint NOT NULL,
					___remote_diffs_normal integer DEFAULT '0'::bigint NOT NULL,
					___remote_diffs_reply integer DEFAULT '0'::bigint NOT NULL,
					___remote_diffs_renote integer DEFAULT '0'::bigint NOT NULL,
					"___local_diffs_withFile" integer DEFAULT 0 NOT NULL,
					"___remote_diffs_withFile" integer DEFAULT 0 NOT NULL
			);
			CREATE SEQUENCE public.__chart__notes_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__notes_id_seq OWNED BY public.__chart__notes.id;
			
			CREATE TABLE public.__chart__per_user_drive (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					"___totalCount" integer DEFAULT '0'::bigint NOT NULL,
					"___totalSize" integer DEFAULT '0'::bigint NOT NULL,
					"___incCount" smallint DEFAULT '0'::bigint NOT NULL,
					"___incSize" integer DEFAULT '0'::bigint NOT NULL,
					"___decCount" smallint DEFAULT '0'::bigint NOT NULL,
					"___decSize" integer DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__per_user_drive_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__per_user_drive_id_seq OWNED BY public.__chart__per_user_drive.id;
			
			CREATE TABLE public.__chart__per_user_following (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___local_followings_total integer DEFAULT '0'::bigint NOT NULL,
					___local_followings_inc smallint DEFAULT '0'::bigint NOT NULL,
					___local_followings_dec smallint DEFAULT '0'::bigint NOT NULL,
					___local_followers_total integer DEFAULT '0'::bigint NOT NULL,
					___local_followers_inc smallint DEFAULT '0'::bigint NOT NULL,
					___local_followers_dec smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followings_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_followings_inc smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followings_dec smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followers_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_followers_inc smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followers_dec smallint DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__per_user_following_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__per_user_following_id_seq OWNED BY public.__chart__per_user_following.id;
			
			CREATE TABLE public.__chart__per_user_notes (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___total integer DEFAULT '0'::bigint NOT NULL,
					___inc smallint DEFAULT '0'::bigint NOT NULL,
					___dec smallint DEFAULT '0'::bigint NOT NULL,
					___diffs_normal smallint DEFAULT '0'::bigint NOT NULL,
					___diffs_reply smallint DEFAULT '0'::bigint NOT NULL,
					___diffs_renote smallint DEFAULT '0'::bigint NOT NULL,
					"___diffs_withFile" smallint DEFAULT '0'::smallint NOT NULL
			);
			CREATE SEQUENCE public.__chart__per_user_notes_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__per_user_notes_id_seq OWNED BY public.__chart__per_user_notes.id;
			
			CREATE TABLE public.__chart__per_user_reaction (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___local_count smallint DEFAULT '0'::bigint NOT NULL,
					___remote_count smallint DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__per_user_reaction_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__per_user_reaction_id_seq OWNED BY public.__chart__per_user_reaction.id;
			
			CREATE TABLE public.__chart__test (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128),
					___foo_total bigint NOT NULL,
					___foo_inc bigint NOT NULL,
					___foo_dec bigint NOT NULL
			);
			CREATE TABLE public.__chart__test_grouped (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128),
					___foo_total bigint NOT NULL,
					___foo_inc bigint NOT NULL,
					___foo_dec bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__test_grouped_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__test_grouped_id_seq OWNED BY public.__chart__test_grouped.id;
			
			CREATE SEQUENCE public.__chart__test_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__test_id_seq OWNED BY public.__chart__test.id;
			
			CREATE TABLE public.__chart__test_unique (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128),
					___foo character varying[] DEFAULT '{}'::character varying[] NOT NULL
			);
			CREATE SEQUENCE public.__chart__test_unique_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__test_unique_id_seq OWNED BY public.__chart__test_unique.id;
			
			CREATE TABLE public.__chart__users (
					id integer NOT NULL,
					date integer NOT NULL,
					___local_total integer DEFAULT '0'::bigint NOT NULL,
					___local_inc smallint DEFAULT '0'::bigint NOT NULL,
					___local_dec smallint DEFAULT '0'::bigint NOT NULL,
					___remote_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_inc smallint DEFAULT '0'::bigint NOT NULL,
					___remote_dec smallint DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart__users_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart__users_id_seq OWNED BY public.__chart__users.id;
			
			CREATE TABLE public.__chart_day__ap_request (
					id integer NOT NULL,
					date integer NOT NULL,
					"___deliverFailed" integer DEFAULT 0 NOT NULL,
					"___deliverSucceeded" integer DEFAULT 0 NOT NULL,
					"___inboxReceived" integer DEFAULT 0 NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__ap_request_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__ap_request_id_seq OWNED BY public.__chart_day__ap_request.id;
			
			CREATE TABLE public.__chart_day__drive (
					id integer NOT NULL,
					date integer NOT NULL,
					"___local_incCount" integer DEFAULT '0'::bigint NOT NULL,
					"___local_incSize" integer DEFAULT '0'::bigint NOT NULL,
					"___local_decCount" integer DEFAULT '0'::bigint NOT NULL,
					"___local_decSize" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_incCount" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_incSize" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_decCount" integer DEFAULT '0'::bigint NOT NULL,
					"___remote_decSize" integer DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__drive_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__drive_id_seq OWNED BY public.__chart_day__drive.id;
			
			CREATE TABLE public.__chart_day__federation (
					id integer NOT NULL,
					date integer NOT NULL,
					"unique_temp___deliveredInstances" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					"___deliveredInstances" smallint DEFAULT '0'::smallint NOT NULL,
					"unique_temp___inboxInstances" character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					"___inboxInstances" smallint DEFAULT '0'::smallint NOT NULL,
					unique_temp___stalled character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					___stalled smallint DEFAULT '0'::smallint NOT NULL,
					___sub smallint DEFAULT '0'::smallint NOT NULL,
					___pub smallint DEFAULT '0'::smallint NOT NULL,
					___pubsub smallint DEFAULT '0'::smallint NOT NULL,
					"___subActive" smallint DEFAULT '0'::smallint NOT NULL,
					"___pubActive" smallint DEFAULT '0'::smallint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__federation_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__federation_id_seq OWNED BY public.__chart_day__federation.id;
			
			CREATE TABLE public.__chart_day__hashtag (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___local_users integer DEFAULT 0 NOT NULL,
					___remote_users integer DEFAULT 0 NOT NULL,
					unique_temp___local_users character varying[] DEFAULT '{}'::character varying[] NOT NULL,
					unique_temp___remote_users character varying[] DEFAULT '{}'::character varying[] NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__hashtag_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__hashtag_id_seq OWNED BY public.__chart_day__hashtag.id;
			
			CREATE TABLE public.__chart_day__instance (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___requests_failed smallint DEFAULT '0'::bigint NOT NULL,
					___requests_succeeded smallint DEFAULT '0'::bigint NOT NULL,
					___requests_received smallint DEFAULT '0'::bigint NOT NULL,
					___notes_total integer DEFAULT '0'::bigint NOT NULL,
					___notes_inc integer DEFAULT '0'::bigint NOT NULL,
					___notes_dec integer DEFAULT '0'::bigint NOT NULL,
					___notes_diffs_normal integer DEFAULT '0'::bigint NOT NULL,
					___notes_diffs_reply integer DEFAULT '0'::bigint NOT NULL,
					___notes_diffs_renote integer DEFAULT '0'::bigint NOT NULL,
					___users_total integer DEFAULT '0'::bigint NOT NULL,
					___users_inc smallint DEFAULT '0'::bigint NOT NULL,
					___users_dec smallint DEFAULT '0'::bigint NOT NULL,
					___following_total integer DEFAULT '0'::bigint NOT NULL,
					___following_inc smallint DEFAULT '0'::bigint NOT NULL,
					___following_dec smallint DEFAULT '0'::bigint NOT NULL,
					___followers_total integer DEFAULT '0'::bigint NOT NULL,
					___followers_inc smallint DEFAULT '0'::bigint NOT NULL,
					___followers_dec smallint DEFAULT '0'::bigint NOT NULL,
					"___drive_totalFiles" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_incFiles" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_incUsage" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_decFiles" integer DEFAULT '0'::bigint NOT NULL,
					"___drive_decUsage" integer DEFAULT '0'::bigint NOT NULL,
					"___notes_diffs_withFile" integer DEFAULT 0 NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__instance_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__instance_id_seq OWNED BY public.__chart_day__instance.id;
			
			CREATE TABLE public.__chart_day__network (
					id integer NOT NULL,
					date integer NOT NULL,
					"___incomingRequests" integer DEFAULT '0'::bigint NOT NULL,
					"___outgoingRequests" integer DEFAULT '0'::bigint NOT NULL,
					"___totalTime" integer DEFAULT '0'::bigint NOT NULL,
					"___incomingBytes" integer DEFAULT '0'::bigint NOT NULL,
					"___outgoingBytes" integer DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__network_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__network_id_seq OWNED BY public.__chart_day__network.id;
			
			CREATE TABLE public.__chart_day__notes (
					id integer NOT NULL,
					date integer NOT NULL,
					___local_total integer DEFAULT '0'::bigint NOT NULL,
					___local_inc integer DEFAULT '0'::bigint NOT NULL,
					___local_dec integer DEFAULT '0'::bigint NOT NULL,
					___local_diffs_normal integer DEFAULT '0'::bigint NOT NULL,
					___local_diffs_reply integer DEFAULT '0'::bigint NOT NULL,
					___local_diffs_renote integer DEFAULT '0'::bigint NOT NULL,
					___remote_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_inc integer DEFAULT '0'::bigint NOT NULL,
					___remote_dec integer DEFAULT '0'::bigint NOT NULL,
					___remote_diffs_normal integer DEFAULT '0'::bigint NOT NULL,
					___remote_diffs_reply integer DEFAULT '0'::bigint NOT NULL,
					___remote_diffs_renote integer DEFAULT '0'::bigint NOT NULL,
					"___local_diffs_withFile" integer DEFAULT 0 NOT NULL,
					"___remote_diffs_withFile" integer DEFAULT 0 NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__notes_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__notes_id_seq OWNED BY public.__chart_day__notes.id;
			
			CREATE TABLE public.__chart_day__per_user_drive (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					"___totalCount" integer DEFAULT '0'::bigint NOT NULL,
					"___totalSize" integer DEFAULT '0'::bigint NOT NULL,
					"___incCount" smallint DEFAULT '0'::bigint NOT NULL,
					"___incSize" integer DEFAULT '0'::bigint NOT NULL,
					"___decCount" smallint DEFAULT '0'::bigint NOT NULL,
					"___decSize" integer DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__per_user_drive_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__per_user_drive_id_seq OWNED BY public.__chart_day__per_user_drive.id;
			
			CREATE TABLE public.__chart_day__per_user_following (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___local_followings_total integer DEFAULT '0'::bigint NOT NULL,
					___local_followings_inc smallint DEFAULT '0'::bigint NOT NULL,
					___local_followings_dec smallint DEFAULT '0'::bigint NOT NULL,
					___local_followers_total integer DEFAULT '0'::bigint NOT NULL,
					___local_followers_inc smallint DEFAULT '0'::bigint NOT NULL,
					___local_followers_dec smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followings_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_followings_inc smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followings_dec smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followers_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_followers_inc smallint DEFAULT '0'::bigint NOT NULL,
					___remote_followers_dec smallint DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__per_user_following_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__per_user_following_id_seq OWNED BY public.__chart_day__per_user_following.id;
			
			CREATE TABLE public.__chart_day__per_user_notes (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___total integer DEFAULT '0'::bigint NOT NULL,
					___inc smallint DEFAULT '0'::bigint NOT NULL,
					___dec smallint DEFAULT '0'::bigint NOT NULL,
					___diffs_normal smallint DEFAULT '0'::bigint NOT NULL,
					___diffs_reply smallint DEFAULT '0'::bigint NOT NULL,
					___diffs_renote smallint DEFAULT '0'::bigint NOT NULL,
					"___diffs_withFile" smallint DEFAULT '0'::smallint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__per_user_notes_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__per_user_notes_id_seq OWNED BY public.__chart_day__per_user_notes.id;
			
			CREATE TABLE public.__chart_day__per_user_reaction (
					id integer NOT NULL,
					date integer NOT NULL,
					"group" character varying(128) NOT NULL,
					___local_count smallint DEFAULT '0'::bigint NOT NULL,
					___remote_count smallint DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__per_user_reaction_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__per_user_reaction_id_seq OWNED BY public.__chart_day__per_user_reaction.id;
			
			CREATE TABLE public.__chart_day__users (
					id integer NOT NULL,
					date integer NOT NULL,
					___local_total integer DEFAULT '0'::bigint NOT NULL,
					___local_inc smallint DEFAULT '0'::bigint NOT NULL,
					___local_dec smallint DEFAULT '0'::bigint NOT NULL,
					___remote_total integer DEFAULT '0'::bigint NOT NULL,
					___remote_inc smallint DEFAULT '0'::bigint NOT NULL,
					___remote_dec smallint DEFAULT '0'::bigint NOT NULL
			);
			CREATE SEQUENCE public.__chart_day__users_id_seq
					AS integer
					START WITH 1
					INCREMENT BY 1
					NO MINVALUE
					NO MAXVALUE
					CACHE 1;
			ALTER SEQUENCE public.__chart_day__users_id_seq OWNED BY public.__chart_day__users.id;	
		`);
	}
}
