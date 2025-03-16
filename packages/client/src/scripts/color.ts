export const alpha = (hex: string, a: number): string => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
	const r = Number.parseInt(result[1], 16);
	const g = Number.parseInt(result[2], 16);
	const b = Number.parseInt(result[3], 16);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
};
