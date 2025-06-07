// Simple CSV SLA calculator running fully in-browser
let rows = [];
function inferServiceKey(label) {
  const l = label.toLowerCase();
  if (l.includes('load balancer')) return 'alb_nlb';
  if (l.includes('lambda')) return 'lambda';
  if (l.includes('gateway')) return 'api_gateway';
  if (l.includes('s3')) return 's3';
  if (l.includes('dynamo')) return 'dynamodb';
  if (l.includes('front')) return 'cloudfront';
  return null;
}

function parseCloudWatchCsv(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let meta = {};
  let data = [];
  for (const line of lines) {
    if (line.startsWith('MetricName:')) {
      if (Object.keys(meta).length && data.length) {
        blocks.push({ meta, data: data.join('\n') });
        meta = {}; data = [];
      }
      const [, val] = line.split(':');
      meta.MetricName = val.trim();
    } else if (line.includes(':') && !data.length) {
      const [k, v] = line.split(':');
      meta[k.trim()] = v.trim();
    } else {
      data.push(line);
    }
  }
  if (Object.keys(meta).length && data.length) blocks.push({ meta, data: data.join('\n') });
  return blocks;
}

function availabilityFromBlocks(blocks) {
  let total = 0, errors = 0, ns = null;
  for (const { meta, data } of blocks) {
    ns = meta.Namespace;
    const role = METRIC_ROLE_MAP[ns]?.[meta.MetricName];
    if (!role) continue;
    const dfLines = data.trim();
    const rows = dfLines.split(/\r?\n/).slice(1); // skip header
    const colName = meta.Statistic; // 'Sum', etc.
    for (const row of rows) {
      const parts = row.split(',');
      const val = parseFloat(parts[1]);
      if (!isNaN(val)) {
        if (role === 'total') total += val; else errors += val;
      }
    }
  }
  const availability = total ? 100 * (1 - errors / total) : 100;
  return { availability, total, errors };
}

function creditPercent(serviceKey, availability) {
  const tiers = SLA_THRESHOLDS[serviceKey].creditTiers;
  for (const t of tiers) {
    if (availability < t.max && availability >= t.min) return t.credit;
  }
  return 0;
}

async function handleCalculate() {
  rows = [];
  const boxes = document.querySelectorAll('#upload-grid .upload-box');
  for (const box of boxes) {
    const input = box.querySelector('.file-input');
    if (!input || !input.files.length) continue;
    const label = box.textContent.trim();
    const svc = inferServiceKey(label);
    if (!svc) continue;
    const text = await input.files[0].text();
    const blocks = parseCloudWatchCsv(text);
    const { availability } = availabilityFromBlocks(blocks);
    const credit = creditPercent(svc, availability);
    rows.push({ service: label, availability: availability.toFixed(4), credit });
  }
  const table = document.getElementById('results-table');
  if (!table) {
    alert('No results table element');
    return;
  }
  let html = '<tr><th>service</th><th>availability %</th><th>credit %</th></tr>';
  for (const r of rows) {
    html += `<tr><td>${r.service}</td><td>${r.availability}</td><td>${r.credit}</td></tr>`;
  }
  table.innerHTML = html;
  // enable claim button if email filled
  toggleClaimBtn();
}

// expose
function toggleClaimBtn(){
  const btn=document.getElementById('claim-btn');
  const email=document.getElementById('claim-email').value.trim();
  if(rows.length && email){btn.classList.remove('disabled-btn');}
  else{btn.classList.add('disabled-btn');}
}

// validate on email input
document.getElementById('claim-email').addEventListener('input',toggleClaimBtn);

function sendClaimEmail(){
  const email=document.getElementById('claim-email').value.trim();
  if(!rows.length){alert('Run the calculation first.');return;}
  if(!email){alert('Please enter your email.');return;}
  let body='SLA Credit Request%0D%0A%0D%0A';
  rows.forEach(r=>{
    body+=`${r.service}: ${r.availability}% availability → ${r.credit}% credit%0D%0A`;
  });
  body+='%0D%0APlease assist with filing an SLA credit request for the services above.';
  const mailto=`mailto:${email}?subject=SLA%20Credit%20Request&body=${body}`;
  window.location.href=mailto;
}

window.sendClaimEmail=sendClaimEmail;

async function sendClaimEmailBackend(){
  const email=document.getElementById('claim-email').value.trim();
  if(!rows.length||!email){alert('Run calculation and enter email first');return;}
  const form=new FormData();
  form.append('email',email);
  form.append('summary',JSON.stringify(rows));
  // attach files
  document.querySelectorAll('#upload-grid .upload-box').forEach(box=>{
    const input=box.querySelector('.file-input');
    if(input && input.files.length){form.append('files',input.files[0]);}
  });
  const res=await fetch('/api/send-claim',{method:'POST',body:form});
  if(res.ok){alert('Claim package sent — check your inbox');}
  else{alert('Failed to send claim');}
}

window.sendClaimEmailBackend=sendClaimEmailBackend;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCloudWatchCsv,
    availabilityFromBlocks,
    creditPercent,
  };
}
