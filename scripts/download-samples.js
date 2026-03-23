const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://tonejs.github.io/audio/salamander';
const OUTPUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'samples', 'salamander');

const files = [
  'A0.mp3',
  'C1.mp3', 'Ds1.mp3', 'Fs1.mp3', 'A1.mp3',
  'C2.mp3', 'Ds2.mp3', 'Fs2.mp3', 'A2.mp3',
  'C3.mp3', 'Ds3.mp3', 'Fs3.mp3', 'A3.mp3',
  'C4.mp3', 'Ds4.mp3', 'Fs4.mp3', 'A4.mp3',
  'C5.mp3', 'Ds5.mp3', 'Fs5.mp3', 'A5.mp3',
  'C6.mp3', 'Ds6.mp3', 'Fs6.mp3', 'A6.mp3',
  'C7.mp3', 'Ds7.mp3', 'Fs7.mp3', 'A7.mp3',
  'C8.mp3'
];

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

console.log('========================================');
console.log('  Salamander Piano Sample Downloader');
console.log('========================================');
console.log(`  Source: ${BASE_URL}`);
console.log(`  Target: ${OUTPUT_DIR}`);
console.log(`  Files: ${files.length}`);
console.log('========================================');
console.log();

let successCount = 0;
let skipCount = 0;
let failCount = 0;

function downloadFile(file, index) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}/${file}`;
    const dest = path.join(OUTPUT_DIR, file);

    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`[${index + 1}/${files.length}] [SKIP] ${file} exists (${sizeKB} KB)`);
      skipCount++;
      resolve();
      return;
    }

    process.stdout.write(`[${index + 1}/${files.length}] [DL] ${file}...`);

    const protocol = url.startsWith('https') ? https : http;

    const fileStream = fs.createWriteStream(dest);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        process.stdout.write(' FAILED (HTTP ' + response.statusCode + ')\n');
        failCount++;
        fs.unlink(dest, () => {});
        resolve();
        return;
      }

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          const stats = fs.statSync(dest);
          const sizeKB = (stats.size / 1024).toFixed(1);
          process.stdout.write(` OK (${sizeKB} KB)\n`);
          successCount++;
          resolve();
        });
      });
    }).on('error', (err) => {
      process.stdout.write(` FAILED: ${err.message}\n`);
      failCount++;
      fs.unlink(dest, () => {});
      resolve();
    });
  });
}

async function downloadAll() {
  for (let i = 0; i < files.length; i++) {
    await downloadFile(files[i], i);
  }

  console.log();
  console.log('========================================');
  console.log('  Download Complete');
  console.log('========================================');
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log('========================================');

  if (failCount > 0) {
    console.log();
    console.log('Some files failed. Please re-run the script to continue.');
    process.exit(1);
  }

  console.log();
  console.log('Next: Set VITE_PIANO_SAMPLE_SOURCE=self-hosted in .env file');
}

downloadAll();
