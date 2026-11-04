function rnd(a,b){const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)}
function caseLike(src,g){return src!==src.toLowerCase()?g[0].toUpperCase()+g.slice(1):g}
function act(l,ch,r,d){return l<ch||(l===ch&&r<d)}
function convert(src,ch,seed,d){
  const out=[];let i=0;
  while(i<src.length){
    const c=src[i];
    if(c==='['){const j=src.indexOf(']',i);out.push({t:src.slice(i+1,j)});i=j+1;continue}
    if(c==='{'){const j=src.indexOf('}',i);const [ru,gr]=src.slice(i+1,j).split(':');
      if(act(4,ch,rnd(seed,i),d))out.push({t:gr,ru,n:ch===4});else out.push({t:ru});i=j+1;continue}
    const two=src.substr(i,2),tl=two.toLowerCase();
    if(DIG[tl]&&act(DIG[tl].l,ch,rnd(seed,i),d)){out.push({t:caseLike(two[0],DIG[tl].g),ru:two,n:DIG[tl].l===ch});i+=2;continue}
    const lc=c.toLowerCase(),s=SUB[lc];
    if(lc==='я'&&!(i>0&&/[бвгджзйклмнпрстфхцчшщ]/i.test(src[i-1]))){out.push({t:c});i++;continue}
    if(s&&act(s.l,ch,rnd(seed,i),d)){
      let g=s.g,n=s.l===ch;
      if((lc==='о'||lc==='и')&&act(4,ch,rnd(seed+7,i),d)){const r=rnd(seed+13,i);
        if(lc==='о'&&r<.28){g='ω';n=ch===4}else if(lc==='и'&&r<.18){g='η';n=ch===4}else if(lc==='и'&&r<.3){g='υ';n=ch===4}}
      out.push({t:caseLike(c,g),ru:c,n});i++;continue}
    out.push({t:c});i++;
  }
  for(let k=0;k<out.length;k++){if(out[k].t==='σ'){const nx=out[k+1];if(!nx||!/[a-zа-яёα-ωάέήίόύώ]/i.test(nx.t[0]))out[k].t='ς'}}
  return out;
}
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function toHTML(segs){return segs.map(s=>s.ru?`<span class="g${s.n?' n':''}" data-ru="${esc(s.ru)}">${esc(s.t)}</span>`:esc(s.t)).join('')}
const plain=src=>src.replace(/\{([^:}]+):[^}]+\}/g,'$1').replace(/[\[\]]/g,'');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

const KEY='alfa-omega-v1';
let st={ch:1,hl:true,done:[]};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.ch)st=Object.assign(st,s)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};

const $=id=>document.getElementById(id);

function renderNav(){
  $('nav').innerHTML=CH.map((c,i)=>`<button data-ch="${i+1}" aria-current="${st.ch===i+1}"><span class="nm">${NUM[i]}</span><span class="t">${esc(plain(c.t))}</span>${st.done.includes(i+1)?'<span class="done">✓</span>':''}</button>`).join('');
}
function renderTitle(){
  $('title').innerHTML=st.ch>=5?'<span class="g">Άλφα και ωμέγα</span>':toHTML(convert('Альфа и омега',st.ch,7,1));
}
let tipFor=null;
function renderABC(){
  const cur=st.ch;
  let h='<h3>Буквы</h3>';
  for(let l=1;l<=4;l++){
    h+=`<div class="lv"><div class="lvh">${NUM[l-1]} глава${l>cur?' · впереди':''}</div><div class="cells">`;
    CARDS.forEach((c,i)=>{if(c.l!==l)return;const lock=c.l>cur;
      h+=`<button class="cell${lock?' locked':''}${c.l===cur?' cur':''}" data-card="${i}" ${lock?'disabled':''}><span class="gl">${c.gl}</span><span class="ru">${lock?'?':c.ru}</span><span class="nm">${c.nm}</span></button>`});
    h+='</div></div>';
  }
  h+=`<div class="tip" id="tip">${tipFor!=null?tipHTML(tipFor):'Нажми на открытую букву, чтобы прочитать о ней. В тексте можно нажать на любую греческую букву.'}</div>`;
  $('abc').innerHTML=h;
}
function tipHTML(i){const c=CARDS[i];return `<b>${c.gl}</b> → ${esc(c.ru)}. ${esc(c.tip||'Выглядит почти как наша буква и читается так же.')}`}

function renderChapter(){
  const ch=st.ch,c=CH[ch-1],m=$('main');
  if(ch===5){renderReal();return}
  if(ch===6){renderSigns();return}
  const n=c.paras.length;
  const newGl=CARDS.filter(x=>x.l===ch).map(x=>`<b>${x.gl.split(' ').pop()}</b>`).join(' ');
  let h=`<div class="chhead"><span class="num">${NUM[ch-1]}</span><h2>${toHTML(convert(c.t,ch,ch*31,1))}</h2></div>`;
  h+=`<div class="newl">Новые буквы появятся сами: ${newGl}</div>`;
  if(ch===1)h+=`<p class="note">Просто читай, как обычную книгу. Некоторые буквы будут греческими, и с каждым абзацем их становится больше. Не останавливайся и не заучивай: смысл подскажет, что за буква. Застрял — нажми на букву или на «подсмотреть».</p>`;
  if(ch===4)h+=`<p class="note">Теперь «о» иногда пишется как ω, а «и» как η или υ. В греческом так и есть: звук один, букв несколько. А θ стоит там, где в русских словах из греческого появились «ф» или «т».</p>`;
  h+='<article id="text">';
  c.paras.forEach((p,i)=>{const d=n===1?1:.3+.7*i/(n-1);
    h+=`<p><span class="gr">${toHTML(convert(p,ch,ch*100+i,d))}</span><span class="ru">${esc(plain(p))}</span> <button class="peek">подсмотреть</button></p>`});
  h+='</article><section class="quiz" id="quiz"><h3>Проверь себя</h3><p class="note" style="border:0;padding:0">Восемь коротких вопросов: буквы и слова из этой главы.</p><button class="primary" id="startq">Начать проверку</button></section>';
  m.innerHTML=h;
  $('startq').onclick=()=>runQuiz(buildQuiz(ch));
}

function buildQuiz(ch){
  const qs=[];
  const pool=CARDS.filter(x=>x.l<=ch),fresh=shuffle(CARDS.filter(x=>x.l===ch)).slice(0,4);
  fresh.forEach(c=>{
    const glyph=c.gl.split(' ').pop();
    const dis=shuffle(pool.filter(x=>x.ru!==c.ru)).slice(0,3).map(x=>x.ru);
    const opts=shuffle([c.ru,...dis]);
    qs.push({p:'Как читается эта буква?',big:glyph,cls:'qbig',opts,a:opts.indexOf(c.ru)});
  });
  const words=[...new Set(CH[ch-1].paras.flatMap(p=>plain(p).toLowerCase().match(/[а-яё]+/g)||[]).filter(w=>w.length>=4&&w.length<=10))];
  const good=shuffle(words.filter(w=>convert(w,ch,3,1).filter(s=>s.ru).length>=2));
  good.slice(0,4).forEach((w,k)=>{
    const shown=toHTML(convert(w,ch,50+k,1));
    let near=words.filter(x=>x!==w&&x[0]===w[0]&&Math.abs(x.length-w.length)<=2);
    if(near.length<3)near=near.concat(shuffle(words.filter(x=>x!==w&&!near.includes(x)&&Math.abs(x.length-w.length)<=2)));
    if(near.length<3)near=near.concat(shuffle(words.filter(x=>x!==w&&!near.includes(x))));
    const opts=shuffle([w,...shuffle(near).slice(0,3)]);
    qs.push({p:'Что здесь написано?',big:shown,cls:'qword',opts,a:opts.indexOf(w)});
  });
  return {ch,qs};
}

function runQuiz({ch,qs}){
  let i=0,score=0;const box=$('quiz');
  function show(){
    if(i>=qs.length){finish();return}
    const q=qs[i];
    box.innerHTML=`<div class="qcount">Вопрос ${i+1} из ${qs.length}</div><div class="qprompt">${q.p}</div><div class="${q.cls}">${q.big}</div>
      <div class="opts">${q.opts.map((o,k)=>`<button data-k="${k}">${esc(o)}</button>`).join('')}</div><div class="fb" id="fb"></div>`;
    box.querySelectorAll('.opts button').forEach(b=>b.onclick=()=>{
      const k=+b.dataset.k,ok=k===q.a;if(ok)score++;
      box.querySelectorAll('.opts button').forEach((x,j)=>{x.disabled=true;if(j===q.a)x.classList.add('right');else if(j===k)x.classList.add('wrong')});
      const fb=$('fb');fb.className='fb '+(ok?'ok':'bad');fb.textContent=ok?'Верно.':'Правильно: '+q.opts[q.a];
      const nx=document.createElement('button');nx.className='primary';nx.textContent=i+1<qs.length?'Дальше':'Итог';nx.onclick=()=>{i++;show()};box.appendChild(nx);nx.focus();
    });
  }
  function finish(){
    if(!st.done.includes(ch))st.done.push(ch);save();renderNav();
    if(ch===5){box.innerHTML=`<p class="bravo">Μπράβο!</p><p class="prose">${score} из ${qs.length}. Ты только что прочитал слово «браво» по-гречески. Осталось последнее: на улицах почти всё написано заглавными буквами, и выглядит это иначе.</p><button class="primary" id="nextch">Последняя глава: Вывески</button>`;$('nextch').onclick=()=>go(6);return}
    if(ch===6){box.innerHTML=`<p class="bravo">ΜΠΡΑΒΟ!</p><p class="prose">${score} из ${qs.length}. Теперь ты читаешь греческий и строчными, и заглавными. Дальше учат сами улицы: меню, указатели, названия станций метро.</p>`;return}
    box.innerHTML=`<div class="qcount">Итог</div><p class="prose">${score} из ${qs.length}. ${score>=6?'Отлично, мозг уже узнаёт эти буквы сам.':'Неплохо. Можно перечитать главу ещё раз, буквы закрепятся быстрее, чем кажется.'}</p><button class="primary" id="nextch">Следующая глава: ${esc(plain(CH[ch].t))}</button>`;
    $('nextch').onclick=()=>go(ch+1);
  }
  show();
}

function renderReal(){
  const m=$('main');
  const finalText=FINAL_TEXT.map(([gr,ru])=>`<p><span class="gr">${esc(gr)}</span><span class="ru">${esc(ru)}</span> <button class="peek">подсмотреть</button></p>`).join('');
  const h=`<div class="chhead"><span class="num">${NUM[4]}</span><h2>Настоящий греческий</h2></div>
  <p class="prose">Подсказок больше нет. Ниже настоящие греческие слова, многие из них ты уже знаешь по-русски. Прочитай слово про себя, потом нажми на карточку и проверь. Значок над гласной (ά, έ, ή) — это ударение, он называется «тонос».</p>
  <h3 style="margin:8px 0 0;font-size:1rem">Последний день на острове</h3>
  <p class="note">Сначала русский текст, полностью записанный греческими буквами, без подсветки и подсказок. Для звуков, которых в греческом нет, взяты привычные греческие замены: ж и з пишутся ζ, ш и щ пишутся σ, ч и ц пишутся τσ, ы и й пишутся ι, а ь просто пропадает.</p>
  <article>${finalText}</article>
  <p class="prose">А теперь настоящие греческие слова. Многие из них ты уже знаешь по-русски.</p>
  <div class="cards">${REAL.map((w,i)=>`<button class="card" data-w="${i}"><span class="w">${w[0]}</span><span class="r">${w[1]}</span><span class="m">${w[2]}</span></button>`).join('')}</div>
  <h3 style="margin:8px 0 0;font-size:1rem">Буквосочетания, которые встретятся дальше</h3>
  <div class="tblw"><table><thead><tr><th>Пишется</th><th>Читается</th><th>Пример</th></tr></thead><tbody>
  ${DIGRAPHS.map(d=>`<tr><td class="gk">${d[0]}</td><td class="rd">${d[1]}</td><td class="rd">${d[2]}</td></tr>`).join('')}</tbody></table></div>
  <section class="quiz" id="quiz"><h3>Последняя проверка</h3><p class="note" style="border:0;padding:0">Шесть слов: прочитай и выбери перевод.</p><button class="primary" id="startq">Начать</button></section>`;
  m.innerHTML=h;
  m.querySelectorAll('.card').forEach(c=>c.onclick=()=>c.classList.toggle('open'));
  $('startq').onclick=()=>{
    const qs=shuffle(REAL).slice(0,6).map(w=>{const opts=shuffle([w[2],...shuffle(REAL.filter(x=>x!==w)).slice(0,3).map(x=>x[2])]);
      return {p:'Что значит это слово?',big:w[0],cls:'qword',opts,a:opts.indexOf(w[2])}});
    runQuiz({ch:5,qs});
  };
}

function renderSigns(){
  const m=$('main');
  const h=`<div class="chhead"><span class="num">${NUM[5]}</span><h2>Вывески</h2></div>
  <p class="prose">На вывесках, указателях и в меню греки почти всегда пишут заглавными, простым рубленым шрифтом. В таком тексте пропадают ударения, а строчные хвостики, которые ты учил, исчезают. Хорошая новость: для того, кто читает по-русски, заглавные даже проще строчных.</p>
  <div class="sgroups">${UP.map(g=>`<div class="sg"><h3>${g.k}</h3><p class="sub">${g.sub}</p><div class="lt">${g.L.map(l=>`<div class="lc"><span class="up">${l[0]}</span><span class="lo"><span class="s1">${l[1]}</span><span class="s2">${l[1]}</span></span><span class="rd">${l[2]}</span>${l[3]?`<span class="warn">${l[3]}</span>`:''}</div>`).join('')}</div></div>`).join('')}</div>
  <p class="note">В каждой карточке: заглавная, как на вывеске, а под ней строчная в двух шрифтах, рубленом и книжном.</p>
  <div class="sg"><h3>Сочетания заглавными</h3><p class="sub">Те же правила, что у строчных, просто крупнее.</p>
  <div class="dg">${CAPDG.map(d=>`<div><b>${d[0]}</b><i>${d[1]}</i><br>${d[2]}</div>`).join('')}</div></div>
  <div class="sg"><h3>Прогулка по улице</h3><p class="sub">Прочитай вывеску вслух, потом нажми, чтобы проверить себя.</p>
  <div class="signs">${SIGNS.map(s=>`<button class="plate p-${s[2]}"><span class="w">${s[0]}</span><span class="m">${s[1]}</span></button>`).join('')}</div></div>
  <p class="note">Хочешь потренироваться на длинном тексте? Включи наверху «заглавные» и перечитай любую главу: история станет похожа на сплошную вывеску.</p>
  <section class="quiz" id="quiz"><h3>Проверка на улице</h3><p class="note" style="border:0;padding:0">Восемь вывесок: прочитай и выбери, что это.</p><button class="primary" id="startq">Начать</button></section>`;
  m.innerHTML=h;
  m.querySelectorAll('.plate').forEach(c=>c.onclick=()=>c.classList.toggle('open'));
  $('startq').onclick=()=>{
    const mean=s=>s[1].includes('·')?s[1].split('·')[1].trim():s[1];
    const qs=shuffle(SIGNS).slice(0,8).map(w=>{const opts=shuffle([mean(w),...shuffle(SIGNS.filter(x=>x!==w)).slice(0,3).map(mean)]);
      return {p:'Что это за вывеска?',big:w[0],cls:'qsign',opts,a:opts.indexOf(mean(w))}});
    runQuiz({ch:6,qs});
  };
}

function go(ch){st.ch=ch;save();tipFor=null;renderAll();window.scrollTo({top:0,behavior:'smooth'})}
function renderAll(){renderNav();renderTitle();renderChapter();renderABC();document.body.classList.toggle('nohl',!st.hl);$('hl').checked=st.hl;document.body.classList.toggle('caps',!!st.caps);$('caps').checked=!!st.caps}

$('nav').addEventListener('click',e=>{const b=e.target.closest('button[data-ch]');if(b)go(+b.dataset.ch)});
$('abc').addEventListener('click',e=>{const b=e.target.closest('.cell:not(.locked)');if(!b)return;tipFor=+b.dataset.card;$('tip').innerHTML=tipHTML(tipFor)});
$('main').addEventListener('click',e=>{
  const pk=e.target.closest('.peek');
  if(pk){const p=pk.parentElement;p.classList.toggle('orig');pk.textContent=p.classList.contains('orig')?'спрятать':'подсмотреть';return}
  const g=e.target.closest('.g');
  document.querySelectorAll('.g.show').forEach(x=>{if(x!==g)x.classList.remove('show')});
  if(g)g.classList.toggle('show');
});
$('hl').onchange=e=>{st.hl=e.target.checked;save();document.body.classList.toggle('nohl',!st.hl)};
$('caps').onchange=e=>{st.caps=e.target.checked;save();document.body.classList.toggle('caps',st.caps)};
$('reset').onclick=()=>{st={ch:1,hl:st.hl,done:[]};save();go(1)};
renderAll();
