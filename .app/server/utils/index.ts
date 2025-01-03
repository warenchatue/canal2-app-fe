export default function makeId(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

export function generateHexColorPalette(size: number) {
  const colors = []
  const saturation = 70 // Saturation: 70%
  const lightness = 50 // Lightness: 50%
  const alpha = '9A' // 10% opacity in hex

  for (let i = 0; i < size; i++) {
    const hue = Math.floor((500 / size) * i) // Evenly distributed hues
    const color = hslToHex(hue, saturation, lightness) + alpha
    colors.push(color)
  }
  // Shuffle colors using Fisher-Yates algorithm
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[colors[i], colors[j]] = [colors[j], colors[i]]
  }

  return colors
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  let c = (1 - Math.abs(2 * l - 1)) * s
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  let m = l - c / 2
  let r = 0,
    g = 0,
    b = 0
  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }
  let nr = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, '0')
  let ng = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0')
  let nb = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0')
  return `#${nr}${ng}${nb}`
}
