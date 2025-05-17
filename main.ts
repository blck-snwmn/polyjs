import { readLines } from "https://deno.land/std@0.224.0/io/mod.ts";
import Delaunator from "npm:delaunator@5.0.0";

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

// Function to get triangle color (placeholder)
// This function would ideally take the image data and triangle vertices
// and calculate the average color within that triangle.
function getTriangleColor(triangleIndex: number): string {
  // Placeholder: return a random color for now
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));

  const imagePath = getImagePath();
  console.log("Image path:", imagePath);

  // TODO: Load the image and get its dimensions
  // For now, use placeholder dimensions and number of points
  const imageWidth = 800;
  const imageHeight = 600;
  const numPoints = 100;

  const randomPoints = generateRandomPoints(imageWidth, imageHeight, numPoints);
  console.log("Generated random points:", randomPoints.length);

  // Delaunay triangulation
  const delaunay = Delaunator.from(randomPoints);
  const triangles = delaunay.triangles;

  console.log("Number of triangles:", triangles.length / 3);

  // Process each triangle
  for (let i = 0; i < triangles.length; i += 3) {
    const tIndex = i / 3;
    const p1Index = triangles[i];
    const p2Index = triangles[i + 1];
    const p3Index = triangles[i + 2];

    const p1 = randomPoints[p1Index];
    const p2 = randomPoints[p2Index];
    const p3 = randomPoints[p3Index];

    const color = getTriangleColor(tIndex);
    // console.log(`Triangle ${tIndex}: [${p1}], [${p2}], [${p3}], Color: ${color}`);
    // TODO: Render this triangle with the calculated color
  }
  console.log("Low poly generation process (concept) finished.");
  console.log("Next steps: Implement actual image loading, color calculation from image, and rendering (e.g., to SVG or canvas).")
}
