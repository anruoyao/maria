declare module "@/themes/*.json5" {
	import type { Theme } from "@/scripts/theme";

	const theme: Theme;

	export default theme;
}
