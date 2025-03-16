import * as mfm from "mfm-js";

const animatedMfm = [
	"tada",
	"jelly",
	"twitch",
	"shake",
	"spin",
	"jump",
	"bounce",
	"rainbow",
	"fade",
];

export function extractMfmWithAnimation(nodes: mfm.MfmNode[]): string[] {
	const mfmNodes = mfm.extract(nodes, (node) => {
		return node.type === "fn" && animatedMfm.includes(node.props.name);
	}) as mfm.MfmFn[];
	// FIXME: mfm type error
	const mfms = mfmNodes.map((x) => x.props.fn);

	return mfms;
}
