export function formattedDuration(duration: number) {
  if (!duration) {
    return ''
  }
  if (duration > 59) {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`
  }
  return `${duration}m`
}

export function hexToRgba(hex: any, opacity: number) {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16)
    g = parseInt(hex[3] + hex[4], 16)
    b = parseInt(hex[5] + hex[6], 16)
  }
  return `rgba(${r},${g},${b},${opacity})`
}

export function getBackgroundColor(hex: any) {
  const opacity = 0.05
  return hex ? hexToRgba(hex, opacity) : ''
}

export function multipleLabel(value: any[], labelProperty?: string) {
  if (value.length === 0) {
    return 'Vide'
  } else if (value.length > 10) {
    return `${value.length} elements`
  } else {
    return value
      .map((item) => {
        if (labelProperty) {
          return String(item[labelProperty])
        } else {
          return `${String(item[0])} : ${String(item[1])}`
        }
      })
      .join(', ')
  }
}
