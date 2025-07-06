import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import archiver from 'archiver';
import "regenerator-runtime/runtime.js";
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FONT_PATH = path.join(__dirname, 'fonts', 'padmaa-Medium-0.5.ttf');
const OUTPUT_FOLDER = path.join(__dirname, 'public', 'invitations');
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');

app.use(express.json());
app.use('/invitations', express.static(OUTPUT_FOLDER));

if (!fs.existsSync(OUTPUT_FOLDER)) fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `uploaded_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// 🔵 Convert HEX to rgb-lib color
function hexToRgbColor(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return undefined;
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  return rgb(r, g, b);
}

// ✍️ Gujarati text drawer with tight spacing and color
function drawGujaratiWithTightSpaces(page, text, xStart, y, font, size, customSpaceWidth = size * 0.2, color) {
  const words = text.split(' ');
  let x = xStart;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    page.drawText(word, {
      x,
      y: (y - (size / 2) - 5), // just hot fix i dont know why added -5
      size,
      font,
      color: color || undefined,
    });

    const wordWidth = font.widthOfTextAtSize(word, size);
    x += wordWidth;

    if (i < words.length - 1) x += customSpaceWidth;
  }
}

app.post('/generate-csv', upload.fields([{ name: 'pdf' }, { name: 'csv' }]), async (req, res) => {
  try {
    const pdfFile = req.files['pdf'][0];
    const csvBuffer = req.files['csv'][0].buffer || fs.readFileSync(req.files['csv'][0].path);

    const nameColumn = req.body.nameColumn;
    const typeColumn = req.body.typeColumn;
    const namePosition = JSON.parse(req.body.namePosition);
    const typePosition = JSON.parse(req.body.typePosition);
    const fontSettings = JSON.parse(req.body.fontSettings || '{}');

    const nameFontSize = fontSettings.nameFontSize || 18;
    const typeFontSize = fontSettings.typeFontSize || 18;
    const nameColor = hexToRgbColor(fontSettings.nameColor);
    const typeColor = hexToRgbColor(fontSettings.typeColor);

    const parsedCSV = parse(csvBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });

    const fontBytes = fs.readFileSync(FONT_PATH);
    const zipPath = path.join(OUTPUT_FOLDER, `invites_${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');
    archive.pipe(output);

    for (const row of parsedCSV) {
      const name = row[nameColumn]?.trim();
      const type = row[typeColumn]?.trim();
      if (!name || !type) continue;

      const existingPdfBytes = fs.readFileSync(pdfFile.path);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

      const namePage = pdfDoc.getPages()[namePosition.page - 1];
      const typePage = pdfDoc.getPages()[typePosition.page - 1];

      drawGujaratiWithTightSpaces(namePage, name, namePosition.x, namePosition.y, customFont, nameFontSize, undefined, nameColor);
      drawGujaratiWithTightSpaces(typePage, type, typePosition.x, typePosition.y, customFont, typeFontSize, undefined, typeColor);

      const pdfBytes = await pdfDoc.save();
      const safeName = name.toLowerCase().replace(/\s+/g, '_');
      archive.append(Buffer.from(pdfBytes), { name: `Invite_${safeName}.pdf` });
    }

    await archive.finalize();

    output.on('close', () => {
      const publicURL = `${process.env.CURRENT_URL}/invitations/${path.basename(zipPath)}`;
      res.json({ success: true, url: publicURL });
    });

  } catch (err) {
    console.error('❌ Error generating invitations:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
