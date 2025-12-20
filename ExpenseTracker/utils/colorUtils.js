/**
 * Color Utility Functions
 * 
 * Centralized color manipulation utilities to eliminate duplicate code
 * across components and improve maintainability.
 */

/**
 * Convert hex color to HSL (Hue, Saturation, Lightness)
 * @param {string} hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns {object} HSL object with h, s, l properties
 */
export function hexToHSL(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h * 60;
  }
  
  return { h, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to hex color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @param {number} alpha - Alpha value (0-1), defaults to 1
 * @returns {string} Hex color string
 */
export function hslToHex(h, s, l, alpha = 1) {
  s /= 100;
  l /= 100;
  
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  let hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  
  if (alpha < 1) {
    hex += Math.round(alpha * 255).toString(16).padStart(2, '0');
  }
  
  return hex;
}

/**
 * Shift the hue of a hex color by a specified degree
 * @param {string} hex - Hex color string
 * @param {number} degree - Degrees to shift hue (0-360)
 * @param {number} alpha - Alpha value (0-1), defaults to 1
 * @returns {string} New hex color with shifted hue
 */
export function shiftHue(hex, degree, alpha = 1) {
  const { h, s, l } = hexToHSL(hex);
  const newH = (h + degree) % 360;
  return hslToHex(newH, s, l, alpha);
}

/**
 * Increase the brightness of a hex color by percentage
 * @param {string} hex - Hex color string
 * @param {number} percentage - Percentage to increase brightness (0-100)
 * @returns {string} New hex color with increased brightness
 */
export function increaseBrightness(hex, percentage) {
  const { h, s, l } = hexToHSL(hex);
  const newL = Math.min(100, l + percentage);
  return hslToHex(h, s, newL);
}

/**
 * Darken a hex color by percentage
 * @param {string} hex - Hex color string
 * @param {number} percentage - Percentage to darken (0-100)
 * @returns {string} New hex color with reduced lightness
 */
export function darken(hex, percentage) {
  const { h, s, l } = hexToHSL(hex);
  const newL = Math.max(0, l - percentage);
  return hslToHex(h, s, newL);
}

/**
 * Increase the saturation of a hex color by percentage
 * @param {string} hex - Hex color string
 * @param {number} percentage - Percentage to increase saturation (0-100)
 * @returns {string} New hex color with increased saturation
 */
export function increaseSaturation(hex, percentage) {
  const { h, s, l } = hexToHSL(hex);
  const newS = Math.min(100, s + percentage);
  return hslToHex(h, newS, l);
}

/**
 * Darken and increase saturation of a hex color
 * @param {string} hex - Hex color string
 * @param {number} darkenPercentage - Percentage to darken (0-100)
 * @param {number} saturationPercentage - Percentage to increase saturation (0-100)
 * @returns {string} New hex color with adjusted darkness and saturation
 */
export function darkenAndSaturate(hex, darkenPercentage, saturationPercentage) {
  const { h, s, l } = hexToHSL(hex);
  const newL = Math.max(0, l - darkenPercentage);
  const newS = Math.min(100, s + saturationPercentage);
  return hslToHex(h, newS, newL);
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {object} RGB object with r, g, b properties (0-255)
 */
export function hexToRGB(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate weighted average of multiple colors
 * @param {Array} colors - Array of {color: string, weight: number} objects
 * @returns {string} Weighted average hex color
 */
export function calculateWeightedColor(colors) {
  if (!colors || colors.length === 0) return '#000000';
  
  let totalWeight = 0;
  let weightedR = 0, weightedG = 0, weightedB = 0;
  
  colors.forEach(({ color, weight }) => {
    const rgb = hexToRGB(color);
    weightedR += rgb.r * weight;
    weightedG += rgb.g * weight;
    weightedB += rgb.b * weight;
    totalWeight += weight;
  });
  
  if (totalWeight === 0) return '#000000';
  
  const finalR = Math.round(weightedR / totalWeight);
  const finalG = Math.round(weightedG / totalWeight);
  const finalB = Math.round(weightedB / totalWeight);
  
  return rgbToHex(finalR, finalG, finalB);
} 