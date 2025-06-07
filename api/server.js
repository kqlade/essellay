import express from 'express';
import multer from 'multer';
import { sendClaimEmail } from './email.js';
import archiver from 'archiver';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer();
const app = express();
app.use(express.json({ limit: '10mb' }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const MODEL = process.env.OPENAI_MODEL || 'o3';

app.post('/api/send-claim', upload.array('files'), async (req, res) => {
  try {
    const { email, summary } = req.body;
    if (!email || !summary) return res.status(400).json({ error: 'email and summary required' });
    const summaryObj = JSON.parse(summary);

    // Build claim body (LLM if key present)
    let body;
    if(openai){
      const prompt=`Draft a concise AWS Support Center request asking for SLA service credits. Use the data below.\n\n${JSON.stringify(summaryObj,null,2)}`;
      console.log('LLM PROMPT:', prompt);
      const chat=await openai.chat.completions.create({
        model: MODEL,
        messages:[{role:'user',content:prompt}],
        max_completion_tokens:300
      });
      body=chat.choices[0].message.content.trim();
      console.log('LLM RESPONSE:', body);
    }
    if(!body){ // fallback if LLM returned empty or undefined
      body = 'SLA Credit Request\n\n';
      summaryObj.forEach(r => {
        const creditVal = r.creditPercent ?? r.credit ?? 0;
        body += `${r.service}: ${r.availability}% availability → ${creditVal}% credit\n`;
      });
      body += '\nPlease assist with filing an SLA credit request for the services above.';
    }

    // Zip attachments
    const archive = archiver('zip');
    const buffers = [];
    archive.on('data', d => buffers.push(d));
    archive.append(generateCsv(summaryObj), { name: 'summary.csv' });
    req.files.forEach(f => archive.append(f.buffer, { name: f.originalname }));
    await archive.finalize();
    const zipBuffer = Buffer.concat(buffers);

    await sendClaimEmail({ to: email, text: body, zipBuffer });
    res.json({ ok: true });
  } catch (err) {
    console.error('SENDGRID ERROR:', err.response?.body || err);
    res.status(500).json({ error: 'internal-error' });
  }
});

function generateCsv(rows){
  let csv = 'service,availability,creditPercent\n';
  rows.forEach(r=>{
    csv += `${r.service},${r.availability},${r.creditPercent}\n`;
  });
  return csv;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`)); 