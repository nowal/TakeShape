//styles
const ESCAPE = '\x1b'; // "\u001b"

enum EStyle {
  Reset = '0',
  Bold = '1',
  Faint = '2',
  Italic = '3',
  Underline = '4',
  Blink = '5',
  Inverse = '7',
  Hidden = '8',
}

const RESET = `${ESCAPE}[0m`;

// colors
enum EColor {
  Black = '0',
  Red = '1',
  Green = '2',
  Yellow = '3',
  Blue = '4',
  Magenta = '5',
  Cyan = '6',
  White = '7',
}

enum EColorStyle {
  // Empty = "0",
  // Empty1 = "1",
  // Empty2 = "2",
  Regular = '3',
  Background = '4',
  // Empty5 = "5",
  // Empty6 = "6",
  // Empty7 = "7",
  // Empty8 = "8",
  Intense = '9',
  IntenseBackground = '10',
}

type TUValueOf<T> = T[keyof T];
type TStyle = TUValueOf<EStyle>;
type TColor = TUValueOf<EColor>;
type TColorStyle = TUValueOf<EColorStyle>;

const composer = (
  text: string,
  style: TStyle,
  color: TColor = '',
  colorStyle: TColorStyle = ''
) =>
  `${ESCAPE}[${[style, `${colorStyle}${color}`]
    .filter(Boolean)
    .join(';')}m${text}${RESET}`;

export const bold = (text: string) =>
  composer(text, EStyle.Bold);
export const faint = (text: string) =>
  composer(text, EStyle.Faint);
export const magenta = (text: string) =>
  composer(text, EColor.Magenta, EStyle.Faint);
export const underline = (text: string) =>
  composer(text, EStyle.Underline);
export const inverse = (text: string) =>
  composer(text, EStyle.Inverse);
export const red = (text: string) =>
  composer(
    text,
    EStyle.Bold,
    EColor.Red,
    EColorStyle.Intense
  );
export const green = (text: string) =>
  composer(
    text,
    EStyle.Bold,
    EColor.Green,
    EColorStyle.Intense
  );

/** ~ For testing ~ 
const composerPrint = (text: string, style: TStyle, color: TColor = "", colorStyle: TColorStyle = "") =>
  `[${[style, `${colorStyle}${color}`].filter(Boolean).join(";")}m${text}[0`;

console.log("styles cycle");
Object.values(EStyle).forEach((style: TStyle) => {
  Object.values(EColor).forEach((color: TColor) => {
    Object.values(EColorStyle).forEach((colorStyle: TColorStyle) => {
      console.log("-".repeat(20));
      const args: [TStyle, TColor, TColorStyle] = [style, color, colorStyle];
      const text = ` ${args.map((v) => v).join(" - ")} `;
      console.log(composer(text, ...args));
      console.log(composerPrint(text, ...args));
      console.log("-".repeat(20));
    });
  });
});
*/
