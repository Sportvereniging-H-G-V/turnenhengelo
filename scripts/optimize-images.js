import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const imagesDir = join(__dirname, '../public/images');
const sportsDir = join(imagesDir, 'sports');

async function optimizeImage(inputPath, outputDir, isHero = false) {
  const file = basename(inputPath);
  const baseName = basename(file, extname(file));
  
  // Higher quality for hero images
  const avifQuality = isHero ? 90 : 80;
  const avifEffort = isHero ? 6 : 4;
  const webpQuality = isHero ? 90 : 80;
  
  // Generate AVIF version
  const avifPath = join(outputDir, `${baseName}.avif`);
  console.log(`Converting ${file} to AVIF (quality: ${avifQuality}, effort: ${avifEffort})...`);
  
  await sharp(inputPath)
    .avif({ quality: avifQuality, effort: avifEffort })
    .toFile(avifPath);
  
  // Generate WebP version if not already WebP
  if (!file.toLowerCase().endsWith('.webp')) {
    const webpPath = join(outputDir, `${baseName}.webp`);
    console.log(`Converting ${file} to WebP (quality: ${webpQuality})...`);
    
    await sharp(inputPath)
      .webp({ quality: webpQuality })
      .toFile(webpPath);
  }
  
  console.log(`✅ Optimized ${file}`);
}

async function optimizeImages() {
  try {
    // Optimize sports images
    const sportsFiles = await readdir(sportsDir);
    const sportsImageFiles = sportsFiles.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`Found ${sportsImageFiles.length} sports images to optimize...`);

    for (const file of sportsImageFiles) {
      const inputPath = join(sportsDir, file);
      await optimizeImage(inputPath, sportsDir);
    }

    // Optimize hero image
    const imagesFiles = await readdir(imagesDir);
    const heroImageFiles = imagesFiles.filter(file => 
      /^hero\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    if (heroImageFiles.length > 0) {
      console.log(`Found ${heroImageFiles.length} hero image(s) to optimize...`);
      for (const file of heroImageFiles) {
        const inputPath = join(imagesDir, file);
        await optimizeImage(inputPath, imagesDir, true); // true = isHero
      }
    }

    console.log('✨ Image optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages();

