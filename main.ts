import { readLines } from "https://deno.land/std@0.224.0/io/mod.ts";
import Delaunator from "npm:delaunator@5.0.0";
import { getPixels, getFormat } from "@unpic/pixels";

export function add(a: number, b: number): number {
  return a + b;
}

// Function to get image path from environment variable
function getImagePath(): string {
  const imagePath = Deno.env.get("IMAGE_PATH");
  if (!imagePath) {
    console.error("Error: IMAGE_PATH environment variable is not set.");
    Deno.exit(1);
  }
  return imagePath;
}

// Function to generate random points
function generateRandomPoints(width: number, height: number, numberOfPoints: number): number[][] {
  const points: number[][] = [];
  for (let i = 0; i < numberOfPoints; i++) {
    points.push([Math.random() * width, Math.random() * height]);
  }
  return points;
}

interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  format: string;
}

// Function to get triangle color
// Calculates the color of the pixel at the centroid of the triangle.
function getTriangleColor(
  p1: number[],
  p2: number[],
  p3: number[],
  imageData: PixelData,
): string {
  // Calculate centroid of the triangle
  const centroidX = Math.round((p1[0] + p2[0] + p3[0]) / 3);
  const centroidY = Math.round((p1[1] + p2[1] + p3[1]) / 3);

  // Ensure centroid is within image bounds
  const x = Math.max(0, Math.min(centroidX, imageData.width - 1));
  const y = Math.max(0, Math.min(centroidY, imageData.height - 1));

  const pixelIndex = (y * imageData.width + x) * 4; // Assuming RGBA

  if (pixelIndex < 0 || pixelIndex + 3 >= imageData.data.length) {
    // Should not happen if points are within image bounds
    console.warn(`Centroid pixel index out of bounds for triangle: [${p1}], [${p2}], [${p3}]. Centroid: (${centroidX}, ${centroidY}) -> (${x}, ${y})`);
    return "rgb(0,0,0)"; // Default to black if something is wrong
  }

  const r = imageData.data[pixelIndex];
  const g = imageData.data[pixelIndex + 1];
  const b = imageData.data[pixelIndex + 2];
  // const a = imageData.data[pixelIndex + 3]; // Alpha channel, if needed

  return `rgb(${r},${g},${b})`;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));

  const imagePath = getImagePath();
  console.log("Image path:", imagePath);

  let imageData: PixelData;
  try {
    const fileBuffer = await Deno.readFile(imagePath);
    const format = getFormat(fileBuffer);

    if (!format) {
      throw new Error("Could not determine image format from file content.");
    }

    const pixels = await getPixels(fileBuffer);
    if (!pixels || !pixels.width || !pixels.height || !pixels.data) {
      throw new Error("Failed to decode image or image data is incomplete.");
    }
    imageData = {
      data: new Uint8ClampedArray(pixels.data),
      width: pixels.width,
      height: pixels.height,
      format: format,
    };
    console.log(`Image loaded: ${imageData.width}x${imageData.height}, Format: ${imageData.format}`);
  } catch (error: any) {
    console.error(`Error loading or decoding image: ${error.message}`);
    Deno.exit(1);
  }

  const imageWidth = imageData.width;
  const imageHeight = imageData.height;
  const numPoints = 100; // TODO: Make this configurable or adaptive

  const randomPoints = generateRandomPoints(imageWidth, imageHeight, numPoints);
  console.log("Generated random points:", randomPoints.length);

  // Delaunay triangulation
  const delaunay = Delaunator.from(randomPoints);
  const triangles = delaunay.triangles;

  console.log("Number of triangles:", triangles.length / 3);

  // Process each triangle
  const outputTriangles = [];
  for (let i = 0; i < triangles.length; i += 3) {
    // const tIndex = i / 3; // Not used for now
    const p1Index = triangles[i];
    const p2Index = triangles[i + 1];
    const p3Index = triangles[i + 2];

    const p1 = randomPoints[p1Index];
    const p2 = randomPoints[p2Index];
    const p3 = randomPoints[p3Index];

    const color = getTriangleColor(p1, p2, p3, imageData);
    outputTriangles.push({ p1, p2, p3, color });
    // console.log(`Triangle ${tIndex}: [${p1}], [${p2}], [${p3}], Color: ${color}`);
    // TODO: Render this triangle with the calculated color
  }
  console.log(`Processed ${outputTriangles.length} triangles.`);
  console.log("Low poly generation process (concept) finished.");
  console.log("Next steps: Implement rendering of these triangles (e.g., to SVG or canvas).");
  // Example: console.log(outputTriangles.slice(0, 2)); // Log first two triangles for inspection
}
