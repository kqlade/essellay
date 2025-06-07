import express from 'express';
import multer from 'multer';
import { sendClaimEmail } from './email.js';
import archiver from 'archiver';
import OpenAI from 'openai';

const upload = multer();
const app = express();
app.use(express.json({ limit: '10mb' }));

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
      const chat=await openai.chat.completions.create({
        model: MODEL,
        messages:[{role:'user',content:prompt}],
        max_tokens:300
      });
      body=chat.choices[0].message.content.trim();
    } else {
      body = 'SLA Credit Request\n\n';
      summaryObj.forEach(r => {
        body += `${r.service}: ${r.availability}% availability → ${r.creditPercent}% credit\n`;
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
    console.error(err);
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
app.listen(PORT, () => console.log(`API listening on ${PORT}`)); 