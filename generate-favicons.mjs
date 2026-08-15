import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'src', 'assets', 'zerofasions.in2.png');
const publicDir = path.join(__dirname, 'public');

async function generateFavicons() {
  try {
    console.log('Generating 192x192 favicon...');
    await sharp(inputPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent padding
      })
      .toFile(path.join(publicDir, 'favicon-192x192.png'));

    console.log('Generating 512x512 favicon...');
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(publicDir, 'favicon-512x512.png'));

    console.log('Generating standard favicon.png (192x192)...');
    await sharp(inputPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(publicDir, 'favicon.png'));

    console.log('Favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
