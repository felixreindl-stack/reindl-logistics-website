document.getElementById('y').textContent = new Date().getFullYear();

(function(){
// Formular ohne Seitenwechsel absenden; ohne JavaScript funktioniert es weiterhin normal.
const form = document.getElementById('anfrage');
const status = document.getElementById('form-status');
  if (!form) return;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; status.className = 'form-status'; status.textContent = 'Wird gesendet …';
  try {
    const res = await fetch(form.action, {method:'POST', headers:{'Accept':'application/json'}, body:new FormData(form)});
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Fehler');
    form.reset();
    status.className = 'form-status ok';
    status.textContent = 'Danke! Ihre Anfrage ist bei uns angekommen. Wir melden uns per E-Mail.';
  } catch (err) {
    status.className = 'form-status err';
    status.textContent = 'Das hat leider nicht geklappt. Bitte rufen Sie uns an (+43 660 5720057) oder schreiben Sie an office@reindl-logistics.at.';
  } finally { btn.disabled = false; }
});
})();

// Preisrechner: durchgestaffelte Preise je Einheit (Standardgröße), Zuschlag für Übergröße.
(function(){
  const BANDS=[{from:1,to:49,price:0.75},{from:50,to:99,price:0.65},{from:100,to:Infinity,price:0.45}];
  const OVERSIZE=1.00;
  const ui=document.querySelector('.calc-ui'); if(!ui) return;
  ui.hidden=false;
  const range=document.getElementById('qty'), num=document.getElementById('qty-num'), over=document.getElementById('oversize');
  const outUnit=document.getElementById('out-unit'), outTotal=document.getElementById('out-total'), outBreak=document.getElementById('out-breakdown');
  const tierEls=[...document.querySelectorAll('.tiers li')];
  const eur={format:v=>v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'};
  function update(q){
    q=Math.max(1,Math.min(100000,Math.round(Number(q)||1)));
    // Durchgestaffelt: jede Stufe gilt nur für die Stücke in ihrem Bereich.
    const add=over.checked?OVERSIZE:0, parts=[];
    let total=0;
    BANDS.forEach(b=>{
      const n=Math.max(0,Math.min(q,b.to)-b.from+1);
      if(n>0){ total+=n*(b.price+add); parts.push(n.toLocaleString('de-DE')+' × '+eur.format(b.price+add)); }
    });
    total=Math.round(total*100)/100;
    outUnit.textContent=eur.format(Math.round(total/q*100)/100);
    outTotal.textContent=eur.format(total);
    outBreak.replaceChildren(...parts.flatMap((t,i)=>{const sp=document.createElement('span');sp.textContent=t;return i?[' + ',sp]:[sp];}));
    tierEls.forEach(el=>el.classList.toggle('on',q>=Math.max(1,Number(el.dataset.min))));
    return q;
  }
  range.addEventListener('input',()=>{num.value=range.value;update(range.value)});
  num.addEventListener('input',()=>{const q=update(num.value);range.value=Math.min(q,500)});
  num.addEventListener('change',()=>{num.value=update(num.value)});
  over.addEventListener('change',()=>update(num.value));
  update(range.value);
})();
