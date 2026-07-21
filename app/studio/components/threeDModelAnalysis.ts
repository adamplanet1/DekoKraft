export type ModelDimensions = {
  x: number;
  y: number;
  z: number;
};

export type ModelMetrics = {
  vertices: number | null;
  polygons: number | null;
  volume: number | null;
  dimensions: ModelDimensions | null;
};

type Point3D = [number, number, number];

const emptyMetrics: ModelMetrics = {
  vertices: null,
  polygons: null,
  volume: null,
  dimensions: null,
};

function createBounds() {
  return {
    min: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY] as Point3D,
    max: [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY] as Point3D,
  };
}

function includePoint(bounds: ReturnType<typeof createBounds>, point: Point3D) {
  for (let index = 0; index < 3; index += 1) {
    bounds.min[index] = Math.min(bounds.min[index], point[index]);
    bounds.max[index] = Math.max(bounds.max[index], point[index]);
  }
}

function dimensionsFromBounds(bounds: ReturnType<typeof createBounds>): ModelDimensions | null {
  if (!bounds.min.every(Number.isFinite) || !bounds.max.every(Number.isFinite)) return null;
  return {
    x: bounds.max[0] - bounds.min[0],
    y: bounds.max[1] - bounds.min[1],
    z: bounds.max[2] - bounds.min[2],
  };
}

function signedTriangleVolume(a: Point3D, b: Point3D, c: Point3D) {
  return (
    a[0] * (b[1] * c[2] - b[2] * c[1])
    - a[1] * (b[0] * c[2] - b[2] * c[0])
    + a[2] * (b[0] * c[1] - b[1] * c[0])
  ) / 6;
}

function analyzeBinaryStl(buffer: ArrayBuffer): ModelMetrics | null {
  if (buffer.byteLength < 84) return null;
  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  if (triangleCount <= 0 || 84 + triangleCount * 50 > buffer.byteLength) return null;

  const bounds = createBounds();
  let volume = 0;
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const start = 84 + triangle * 50 + 12;
    const points: Point3D[] = [];
    for (let vertex = 0; vertex < 3; vertex += 1) {
      const offset = start + vertex * 12;
      const point: Point3D = [
        view.getFloat32(offset, true),
        view.getFloat32(offset + 4, true),
        view.getFloat32(offset + 8, true),
      ];
      points.push(point);
      includePoint(bounds, point);
    }
    volume += signedTriangleVolume(points[0], points[1], points[2]);
  }

  return {
    vertices: triangleCount * 3,
    polygons: triangleCount,
    volume: Math.abs(volume),
    dimensions: dimensionsFromBounds(bounds),
  };
}

function analyzeAsciiStl(text: string): ModelMetrics {
  const matches = [...text.matchAll(/vertex\s+([-+\deE.]+)\s+([-+\deE.]+)\s+([-+\deE.]+)/gi)];
  if (matches.length < 3) return emptyMetrics;
  const bounds = createBounds();
  const points = matches.map<Point3D>((match) => [Number(match[1]), Number(match[2]), Number(match[3])]);
  points.forEach((point) => includePoint(bounds, point));
  let volume = 0;
  for (let index = 0; index + 2 < points.length; index += 3) {
    volume += signedTriangleVolume(points[index], points[index + 1], points[index + 2]);
  }
  return {
    vertices: points.length,
    polygons: Math.floor(points.length / 3),
    volume: Math.abs(volume),
    dimensions: dimensionsFromBounds(bounds),
  };
}

function analyzeObj(text: string): ModelMetrics {
  const bounds = createBounds();
  let vertices = 0;
  let polygons = 0;
  text.split(/\r?\n/).forEach((line) => {
    const value = line.trim();
    if (value.startsWith("v ")) {
      const coordinates = value.slice(2).trim().split(/\s+/).slice(0, 3).map(Number);
      if (coordinates.length === 3 && coordinates.every(Number.isFinite)) {
        includePoint(bounds, coordinates as Point3D);
        vertices += 1;
      }
    } else if (value.startsWith("f ")) {
      const pointCount = value.slice(2).trim().split(/\s+/).length;
      polygons += Math.max(1, pointCount - 2);
    }
  });
  return {
    vertices: vertices || null,
    polygons: polygons || null,
    volume: null,
    dimensions: dimensionsFromBounds(bounds),
  };
}

function analyzeAsciiPly(text: string): ModelMetrics {
  const headerEnd = text.indexOf("end_header");
  if (headerEnd < 0) return emptyMetrics;
  const header = text.slice(0, headerEnd);
  const vertexCount = Number(header.match(/element\s+vertex\s+(\d+)/i)?.[1] ?? 0);
  const faceCount = Number(header.match(/element\s+face\s+(\d+)/i)?.[1] ?? 0);
  const isAscii = /format\s+ascii/i.test(header);
  if (!isAscii || vertexCount <= 0) {
    return { ...emptyMetrics, vertices: vertexCount || null, polygons: faceCount || null };
  }
  const bounds = createBounds();
  const dataLines = text.slice(headerEnd + "end_header".length).trim().split(/\r?\n/).slice(0, vertexCount);
  dataLines.forEach((line) => {
    const coordinates = line.trim().split(/\s+/).slice(0, 3).map(Number);
    if (coordinates.length === 3 && coordinates.every(Number.isFinite)) includePoint(bounds, coordinates as Point3D);
  });
  return {
    vertices: vertexCount,
    polygons: faceCount || null,
    volume: null,
    dimensions: dimensionsFromBounds(bounds),
  };
}

export async function analyzeModelFile(file: File): Promise<ModelMetrics> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const buffer = await file.arrayBuffer();
  if (extension === "stl") {
    return analyzeBinaryStl(buffer) ?? analyzeAsciiStl(new TextDecoder().decode(buffer));
  }
  if (extension === "obj") return analyzeObj(new TextDecoder().decode(buffer));
  if (extension === "ply") return analyzeAsciiPly(new TextDecoder().decode(buffer));
  return emptyMetrics;
}
