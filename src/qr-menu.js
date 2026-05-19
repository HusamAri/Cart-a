// Carta — QR code PNG for guest menus (Carta lockup + property logo).

let qrLibPromise = null;

async function loadQrLib() {
  if (!qrLibPromise) {
    qrLibPromise = import('https://esm.sh/qrcode@1.5.4');
  }
  return qrLibPromise;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = src;
  });
}

/**
 * @param {object} opts
 * @param {string} opts.url
 * @param {string} [opts.menuName]
 * @param {string} [opts.workspaceName]
 * @param {string} [opts.logoUrl]
 * @param {string} [opts.filename]
 * @param {string} [opts.scanHint] — localized CTA under QR (e.g. "Scan to view menu")
 */
export async function downloadGuestMenuQrCard({
  url,
  menuName = '',
  workspaceName = '',
  logoUrl = '',
  filename = 'carta-menu-qr.png',
  scanHint = 'Scan to view menu',
}) {
  const QRCode = (await loadQrLib()).default;
  const W = 720;
  const H = 920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  ctx.fillStyle = '#fbf8f5';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(27, 42, 34, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  const logosY = 56;
  try {
    const carta = await loadImage('/assets/carta-brand-lockup-horizontal.png?v=7');
    const cartaW = 200;
    const cartaH = (carta.height / carta.width) * cartaW;
    ctx.drawImage(carta, 48, logosY, cartaW, cartaH);
  } catch {
    ctx.fillStyle = '#1b2a22';
    ctx.font = '600 22px system-ui, sans-serif';
    ctx.fillText('Carta', 48, logosY + 28);
  }

  if (logoUrl) {
    try {
      const prop = await loadImage(logoUrl);
      const propH = 56;
      const propW = (prop.width / prop.height) * propH;
      ctx.drawImage(prop, W - 48 - propW, logosY + 4, propW, propH);
    } catch { /* optional property logo */ }
  }

  const qrSize = 340;
  const qrX = (W - qrSize) / 2;
  const qrY = 200;
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, url, {
    width: qrSize,
    margin: 2,
    color: { dark: '#1b2a22', light: '#fbf8f5' },
    errorCorrectionLevel: 'M',
  });
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#1b2a22';
  ctx.textAlign = 'center';
  ctx.font = 'italic 400 28px Georgia, "Times New Roman", serif';
  const title = menuName || workspaceName || 'Menu';
  ctx.fillText(title, W / 2, qrY + qrSize + 52);

  if (workspaceName && menuName) {
    ctx.font = '500 14px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(27, 42, 34, 0.72)';
    ctx.fillText(workspaceName, W / 2, qrY + qrSize + 78);
  }

  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(27, 42, 34, 0.55)';
  const shortUrl = url.replace(/^https?:\/\//, '');
  wrapCenterText(ctx, shortUrl, W / 2, qrY + qrSize + 108, W - 120, 14);

  ctx.font = '400 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(27, 42, 34, 0.45)';
  ctx.fillText(String(scanHint || 'Scan to view menu').slice(0, 80), W / 2, H - 56);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob_failed'))), 'image/png');
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 800);
}

function wrapCenterText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineHeight));
}
