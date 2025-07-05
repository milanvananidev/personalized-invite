import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
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

app.use(cors())

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FONT_PATH = path.join(__dirname, 'fonts', 'padmaa-Medium-0.5.ttf');
const OUTPUT_FOLDER = path.join(__dirname, 'public', 'invitations');
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');

app.use(express.json());
app.use('/invitations', express.static(OUTPUT_FOLDER));

// Ensure folders exist
if (!fs.existsSync(OUTPUT_FOLDER)) fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

// 📂 Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `uploaded_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// 🔠 Gujarati drawer with tight spacing
function drawGujaratiWithTightSpaces(page, text, xStart, y, font, size, customSpaceWidth = size * 0.2) {
  const words = text.split(' ');
  let x = xStart;  // fixed start

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    page.drawText(word, { x, y: y - (size / 2), size, font });

    const wordWidth = font.widthOfTextAtSize(word, size);
    x += wordWidth;

    if (i < words.length - 1) {
      x += customSpaceWidth;
    }
  }
}



// 💾 Save output PDF
async function savePDF(name, type, pdfBytes) {
  const safeName = name.toLowerCase().replace(/\s+/g, '_');
  const safeType = type.toLowerCase().replace(/\s+/g, '_');

  const fileName = `Paras_Engagement_Invite_${safeName}(${safeType}).pdf`;
  const fullPath = path.join(OUTPUT_FOLDER, fileName);

  fs.writeFileSync(fullPath, pdfBytes);
  console.log(`✅ PDF saved: ${fileName}`);
  return `/invitations/${fileName}`;
}

// 📤 Generate PDF
app.post('/generate', upload.single('pdf'), async (req, res) => {
  const { name, type, namePosition, typePosition } = req.body;

  if (!req.file || !name || !type || !namePosition || !typePosition) {
    return res.status(400).json({ success: false, message: 'Missing file or required fields' });
  }

  try {
    const namePos = JSON.parse(namePosition); // { x: number, y: number }
    const typePos = JSON.parse(typePosition); // { x: number, y: number }

    const existingPdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync(FONT_PATH);
    const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

    const page = pdfDoc.getPages()[0];
    drawGujaratiWithTightSpaces(page, name, namePos.x, namePos.y, customFont, 18);
    drawGujaratiWithTightSpaces(page, type, typePos.x, typePos.y, customFont, 18);

    const pdfBytes = await pdfDoc.save();
    const filePath = await savePDF(name, type, pdfBytes);

    // ❌ Clean up uploaded file
    fs.unlinkSync(req.file.path);

    const fullURL = `${process.env.CURRENT_URL}${filePath}`;
    res.status(200).json({ success: true, message: 'PDF generated', url: fullURL });
  } catch (err) {
    console.error(`❌ Generation failed:`, err);
    res.status(500).json({ success: false, message: 'PDF generation failed' });
  }
});

// 🗑️ Delete generated invitation
app.post('/delete', async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, message: 'Missing name or type' });
  }

  try {
    const safeName = name.toLowerCase().replace(/\s+/g, '_');
    const safeType = type.toLowerCase().replace(/\s+/g, '_');
    const fileName = `Paras_Engagement_Invite_${safeName}(${safeType}).pdf`;
    const filePath = path.join(OUTPUT_FOLDER, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted: ${fileName}`);
      res.status(200).json({ success: true, message: 'PDF deleted' });
    } else {
      res.status(404).json({ success: false, message: 'PDF not found' });
    }
  } catch (err) {
    console.error(`❌ Error deleting PDF:`, err);
    res.status(500).json({ success: false, message: 'Failed to delete PDF' });
  }
});



app.post('/generate-csv', upload.fields([{ name: 'pdf' }, { name: 'csv' }]), async (req, res) => {
  try {
    const pdfFile = req.files['pdf'][0];
    const csvBuffer = req.files['csv'][0].buffer || fs.readFileSync(req.files['csv'][0].path);
    const nameColumn = req.body.nameColumn;
    const typeColumn = req.body.typeColumn;
    const namePosition = JSON.parse(req.body.namePosition);
    const typePosition = JSON.parse(req.body.typePosition);

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

      drawGujaratiWithTightSpaces(namePage, name, namePosition.x, namePosition.y, customFont, 18);
      drawGujaratiWithTightSpaces(typePage, type, typePosition.x, typePosition.y, customFont, 18);


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

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
