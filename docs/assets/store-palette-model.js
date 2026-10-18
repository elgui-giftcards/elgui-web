export const validHex = value => /^#[0-9a-f]{6}$/i.test(value);
export function luminance(hex) {
  if (!validHex(hex)) throw new Error('Color hexadecimal inválido.');
  const channels = hex.slice(1).match(/../g).map(value => {
    const n = parseInt(value, 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
export function distributePalette(colors) {
  if (![3, 4].includes(colors.length) || !colors.every(validHex)) throw new Error('Elegí 3 o 4 colores con formato #RRGGBB.');
  const [primary, secondary, background, accent = secondary] = colors.map(color => color.toUpperCase());
  const text = bg => {
    const candidates = colors.filter(color => contrast(bg, color) >= 4.5);
    return (candidates.length ? candidates : ['#000000', '#FFFFFF']).sort((a, b) => contrast(bg, b) - contrast(bg, a))[0].toUpperCase();
  };
  return {
    headerColor: primary, headerTextColor: text(primary),
    footerColor: primary, footerTextColor: text(primary),
    pageColor: background, pageTextColor: text(background),
    cardColor: background, cardTextColor: text(background),
    color: secondary, textColor: text(secondary),
    buttonColor: accent, buttonTextColor: text(accent),
  };
}
