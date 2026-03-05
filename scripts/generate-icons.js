import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');
mkdirSync(iconsDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);

  const pad = size * 0.12;
  const frameW = size * 0.07;

  // Outer frame (white)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = frameW;
  ctx.strokeRect(pad + frameW / 2, pad + frameW / 2, size - pad * 2 - frameW, size - pad * 2 - frameW);

  // Inner image area (gradient)
  const inner = pad + frameW;
  const innerSize = size - inner * 2;
  const grad = ctx.createLinearGradient(inner, inner, inner + innerSize, inner + innerSize);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(1, '#7c3aed');
  ctx.fillStyle = grad;
  ctx.fillRect(inner, inner, innerSize, innerSize);

  // Mountain/photo icon in center
  const cx = size / 2;
  const cy = size / 2;
  const iconSize = innerSize * 0.45;

  // Simple mountain shape
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.moveTo(cx - iconSize * 0.6, cy + iconSize * 0.35);
  ctx.lineTo(cx - iconSize * 0.05, cy - iconSize * 0.35);
  ctx.lineTo(cx + iconSize * 0.6, cy + iconSize * 0.35);
  ctx.closePath();
  ctx.fill();

  // Second peak
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.moveTo(cx + iconSize * 0.1, cy + iconSize * 0.35);
  ctx.lineTo(cx + iconSize * 0.55, cy - iconSize * 0.05);
  ctx.lineTo(cx + iconSize * 0.9, cy + iconSize * 0.35);
  ctx.closePath();
  ctx.fill();

  // Sun / circle
  ctx.fillStyle = 'rgba(255,220,80,0.95)';
  ctx.beginPath();
  ctx.arc(cx - iconSize * 0.25, cy - iconSize * 0.1, iconSize * 0.12, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

const sizes = [192, 512, 180];
for (const size of sizes) {
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`;
  writeFileSync(join(iconsDir, filename), buffer);
  console.log(`Created ${filename}`);
}
