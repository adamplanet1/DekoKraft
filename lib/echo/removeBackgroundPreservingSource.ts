import sharp from "sharp";

type Rgb = [number, number, number];

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

export async function removeBackgroundPreservingSource(source: Buffer) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const pixelCount = width * height;
  if (!width || !height || info.channels !== 4) throw new Error("تعذر قراءة بكسلات الصورة الحالية.");

  const sampleSize = Math.max(2, Math.min(24, Math.round(Math.min(width, height) * 0.04)));
  const cornerColors: Rgb[] = [];
  const corners = [[0, 0], [width - sampleSize, 0], [0, height - sampleSize], [width - sampleSize, height - sampleSize]];
  for (const [startX, startY] of corners) {
    for (let y = startY; y < startY + sampleSize; y += 2) {
      for (let x = startX; x < startX + sampleSize; x += 2) {
        const offset = (y * width + x) * 4;
        if (data[offset + 3] > 16) cornerColors.push([data[offset], data[offset + 1], data[offset + 2]]);
      }
    }
  }
  if (!cornerColors.length) throw new Error("تعذر تحديد لون الخلفية من الصورة الحالية.");

  const median = (channel: number) => cornerColors
    .map((color) => color[channel])
    .sort((left, right) => left - right)[Math.floor(cornerColors.length / 2)];
  const background: Rgb = [median(0), median(1), median(2)];
  const colorDistance = (pixelIndex: number) => {
    const offset = pixelIndex * 4;
    return Math.hypot(
      data[offset] - background[0],
      data[offset + 1] - background[1],
      data[offset + 2] - background[2],
    );
  };

  const backgroundLimit = 58;
  const softLimit = 82;
  const visited = new Uint8Array(pixelCount);
  const backgroundConnected = new Uint8Array(pixelCount);
  const queue: number[] = [];
  const add = (pixelIndex: number) => {
    if (!visited[pixelIndex] && colorDistance(pixelIndex) <= softLimit) {
      visited[pixelIndex] = 1;
      queue.push(pixelIndex);
    }
  };
  for (let x = 0; x < width; x += 1) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    add(y * width);
    add(y * width + width - 1);
  }
  for (let head = 0; head < queue.length; head += 1) {
    const pixelIndex = queue[head];
    backgroundConnected[pixelIndex] = 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) add(pixelIndex - 1);
    if (x + 1 < width) add(pixelIndex + 1);
    if (y > 0) add(pixelIndex - width);
    if (y + 1 < height) add(pixelIndex + width);
  }

  const output = Buffer.from(data);
  let transparentPixelCount = 0;
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (!backgroundConnected[pixelIndex]) continue;
    const offset = pixelIndex * 4;
    const distance = colorDistance(pixelIndex);
    const sourceAlpha = data[offset + 3];
    const alphaFactor = distance <= backgroundLimit
      ? 0
      : clamp((distance - backgroundLimit) / (softLimit - backgroundLimit), 0, 1);
    output[offset + 3] = Math.round(sourceAlpha * alphaFactor);
    if (output[offset + 3] < 255) transparentPixelCount += 1;
  }
  if (!transparentPixelCount) throw new Error("لم يتم اكتشاف خلفية قابلة للإزالة في الصورة الحالية.");

  const buffer = await sharp(output, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();
  return { buffer, width, height, transparentPixelCount };
}
