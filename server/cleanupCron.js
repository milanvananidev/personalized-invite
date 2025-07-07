import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 📁 Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Define your folders
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
const OUTPUT_FOLDER = path.join(__dirname, 'public', 'invitations');

// 🧹 Delete files NOT modified today
function deleteFilesNotModifiedToday(folderPath) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`❌ Failed to read directory ${folderPath}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`❌ Failed to stat file ${filePath}:`, err);
          return;
        }

        const fileDate = stats.mtime.toISOString().slice(0, 10);
        if (fileDate !== today) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`❌ Failed to delete ${filePath}:`, err);
            } else {
              console.log(`🗑️ Deleted old file (not today): ${filePath}`);
            }
          });
        }
      });
    });
  });
}

// ⏰ Schedule: every day at 2:00 AM
cron.schedule('0 2 * * *', () => {
  console.log('🧹 Running scheduled cleanup...');
  deleteFilesNotModifiedToday(UPLOAD_FOLDER);
  deleteFilesNotModifiedToday(OUTPUT_FOLDER);
});
