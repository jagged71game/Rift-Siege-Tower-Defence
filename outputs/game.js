const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const $ = id => document.getElementById(id);
const ui = {
  shards: $("shards"), lives: $("lives"), wave: $("wave"), waveProgress: $("waveProgress"),
  levelTag: $("levelTag"), levelName: $("levelName"), start: $("startWaveBtn"), speed: $("speedBtn"),
  sound: $("soundBtn"), pause: $("pauseBtn"), fullscreen: $("fullscreenBtn"),
  commandConsole: $("commandConsole"),
  cardPreview: $("cardPreview"), previewImage: $("previewImage"), previewSplinter: $("previewSplinter"),
  previewName: $("previewName"), previewAbility: $("previewAbility"), previewCost: $("previewCost"),
  sidePanel: $("sidePanel"), sideToggle: $("sideToggle"),
  bestiary: $("bestiary"), bestiaryBtn: $("bestiaryBtn"), bestiaryClose: $("bestiaryClose"),
  bestiaryEmpty: $("bestiaryEmpty"), enemyDossier: $("enemyDossier"),
  enemyRoster: $("enemyRoster"), dossierImage: $("dossierImage"), dossierTrait: $("dossierTrait"),
  dossierName: $("dossierName"), dossierSpecial: $("dossierSpecial"), dossierWeak: $("dossierWeak"),
  dossierResist: $("dossierResist"), dossierHp: $("dossierHp"), dossierArmor: $("dossierArmor"),
  dossierMagic: $("dossierMagic"), dossierSpeed: $("dossierSpeed"),
  cards: $("towerCards"), levelList: $("levelList"), toast: $("toast"), modal: $("modal"),
  play: $("playBtn"), bossBar: $("bossBar"), bossName: $("bossName"), bossHp: $("bossHp"),
  bossHpText: $("bossHpText"), enemyPreview: $("enemyPreview"),
  towerPopover: $("towerPopover"), popoverClose: $("popoverClose"),
  selectedIcon: $("selectedIcon"), selectedName: $("selectedName"), selectedAbility: $("selectedAbility"),
  selectedLevel: $("selectedLevel"), statDamage: $("statDamage"), statRange: $("statRange"),
  statRate: $("statRate"), upgrade: $("upgradeBtn"), upgradeCost: $("upgradeCost"),
  target: $("targetBtn"), targetMode: $("targetMode"), sell: $("sellBtn"), sellValue: $("sellValue")
};

const TOWER_TYPES = [
  { id:"fire", name:"Living Lava", icon:"♨", art:"assets/living-lava.png", cost:90, color:"#f06a45", glow:"rgba(240,80,40,.22)", damage:25, range:116, rate:1.05, shot:500, desc:"Lava Area Splash", detail:"Slow, heavy attacks splash nearby enemies and leave a burning pool for 3.2s, dealing 34% attack damage per second.", strong:"swarm", weak:"fireproof", splash:34, lavaArea:true },
  { id:"water", name:"Deeplurker", icon:"◉", art:"assets/deeplurker.png", cost:105, color:"#50cbea", glow:"rgba(50,180,220,.20)", damage:13, range:150, rate:.68, shot:720, desc:"Snipe · Poison", detail:"Prioritises wounded targets at extended range. Poison deals 8 damage per second for 3s.", strong:"flying", weak:"armored", poison:8, snipe:true },
  { id:"earth", name:"Mycelic Slipspawn", icon:"♠", art:"assets/mycelic-slipspawn.png", cost:130, color:"#8fd167", glow:"rgba(80,170,70,.18)", damage:22, range:155, rate:.78, shot:560, desc:"Magic · Chain", detail:"Fast magic ignores armor, then chains to two nearby enemies for 58% and 46% damage.", strong:"armored", weak:"swift", magic:true, chain:2 },
  { id:"death", name:"Cursed Windeku", icon:"☠", art:"assets/cursed-windeku.png", cost:120, color:"#bd72dc", glow:"rgba(170,70,210,.20)", damage:15, range:125, rate:.88, shot:560, desc:"Thorns · Armor Curse", detail:"Curses armor for 3s. Enemies passing close trigger a 10-damage thorn burst.", strong:"melee", weak:"ethereal", curse:.25, thorns:10 },
  { id:"light", name:"Pelacor Arbalest", icon:"✦", art:"assets/pelacor-arbalest.png", cost:115, color:"#f1d96d", glow:"rgba(230,200,80,.18)", damage:11, range:126, rate:.82, shot:700, desc:"Double Strike", detail:"Fires twice per attack. The second bolt lands shortly after the first for 82% damage.", strong:"ethereal", weak:"armored", doubleStrike:true },
  { id:"time", element:"life", name:"Time Mage", icon:"⌛", art:"assets/time-mage.png", cost:100, color:"#8ce8ff", glow:"rgba(80,205,240,.22)", damage:8, range:138, rate:.58, shot:650, desc:"Slow · Time Snare", detail:"Time Snare evolves from 40% slow for 2.2s to 60% for 3.2s. Enemy Magic Resistance reduces both strength and duration.", strong:"swift", weak:"magic-resistant", slow:.6, slowDuration:2.2 }
];

const CARD_IMAGES = {};
TOWER_TYPES.forEach(t => {
  const image = new Image();
  image.src = t.art;
  CARD_IMAGES[t.id] = image;
});

const ENEMY_TYPES = [
  {name:"Antoid Platoon",art:"assets/antoid-platoon.png",hp:120,speed:49,radius:14,reward:15,armor:.12,magicResist:.10,lavaImmune:true,trait:"fireproof",weakTo:"water",resists:"fire",color:"#c96843"},
  {name:"Cruel Sethropod",art:"assets/cruel-sethropod.png",hp:190,speed:36,radius:17,reward:20,armor:.23,magicResist:.25,trait:"armored",weakTo:"earth",resists:"light",color:"#458fae"},
  {name:"Hill Giant",art:"assets/hill-giant.png",hp:310,speed:28,radius:21,reward:28,armor:.18,magicResist:.15,trait:"melee",weakTo:"death",resists:"water",color:"#7e9b51",splitInto:"Disintegrator"},
  {name:"Riftwing",art:"assets/riftwing.png",hp:145,speed:45,radius:15,reward:20,armor:.08,magicResist:.35,trait:"flying",weakTo:"water",resists:"death",color:"#7b588f",spawnType:"Chaos Agent",spawnCount:2},
  {name:"Stitch Leech",art:"assets/stitch-leech.png",hp:85,speed:78,radius:12,reward:14,armor:0,magicResist:0,trait:"swift",weakTo:"fire",resists:"earth",color:"#d4b75d"},
  {name:"Legionnaire Alvar",art:"assets/legionnaire-alvar.png",hp:430,speed:25,radius:23,reward:36,armor:.32,slowImmune:true,trait:"armored",weakTo:"earth",resists:"light",color:"#a68e6e",splitInto:"Disintegrator"},
  {name:"Disintegrator",art:"assets/disintegrator.png",hp:210,speed:38,radius:17,reward:18,armor:.16,trait:"melee",weakTo:"death",resists:"water",color:"#847e80",splitInto:"Chaos Agent"},
  {name:"Chaos Agent",art:"assets/chaos-agent.png",hp:52,speed:88,radius:10,reward:8,armor:0,slowImmune:true,trait:"ethereal",weakTo:"light",resists:"death",color:"#6c687d"},
  {name:"Forgotten One",art:"assets/forgotten-one.png",hp:380,speed:27,radius:22,reward:32,armor:.26,lavaImmune:true,slowImmune:true,trait:"fireproof",weakTo:"water",resists:"fire",color:"#d35e39"},
  {name:"Goblin Psychic",art:"assets/goblin-psychic.png",hp:175,speed:38,radius:15,reward:23,armor:.06,magicResist:.50,trait:"regenerator",weakTo:"death",resists:"earth",regen:5,color:"#6fbd53"},
  {name:"Soul Strangler",art:"assets/soul-strangler.png",hp:105,speed:73,radius:12,reward:18,armor:0,magicResist:.60,trait:"ethereal",weakTo:"light",resists:"death",color:"#7d4d8d"},
  {name:"Supply Runner",art:"assets/supply-runner.png",hp:155,speed:58,radius:14,reward:22,armor:.08,trait:"support",weakTo:"fire",resists:"water",speedAura:1.16,color:"#a68b70"},
  {name:"River Hellondale",art:"assets/frost-mage.png",hp:205,speed:35,radius:16,reward:28,armor:.10,magicResist:.45,trait:"frost mage",weakTo:"fire",resists:"water",freezeRange:175,freezeDuration:2.4,freezeRate:5.8,color:"#54b9df"}
];
const YABA_PICKLE = {name:"Yaba's Pickle",art:"assets/yabas-pickle.png",hp:240,speed:46,radius:18,reward:35,armor:.12,trait:"special",weakTo:"death",resists:"water",heartReward:3,special:true,color:"#79d84f"};
const ENEMY_SPECIALS = {
  "Antoid Platoon":"Fireproof formation. Immune to Living Lava's burning pools and highly resistant to direct Fire damage.",
  "Cruel Sethropod":"A plated frontline creature built to absorb repeated physical volleys. Earth magic is its cleanest counter.",
  "Hill Giant":"A heavy melee threat that fractures into several Disintegrators when defeated.",
  "Riftwing":"Releases fast Chaos Agents after losing enough health, multiplying the pressure on its current lane.",
  "Stitch Leech":"Low health but extreme speed. It exploits neglected lanes and resists slow Earth projectiles.",
  "Legionnaire Alvar":"An elite armored shell immune to Time Snare. It breaks into Disintegrators, creating a dangerous multi-stage assault.",
  "Disintegrator":"A melee construct that fractures again into Chaos Agents. Death curses and thorns punish it.",
  "Chaos Agent":"Tiny, ethereal, exceptionally fast, and immune to Time Snare. Life attacks purge it efficiently."
  ,"Forgotten One":"A fireproof armored brute immune to lava pools, Fire attacks, and Time Snare."
  ,"Goblin Psychic":"Regenerates 5 health each second while advancing. Death damage prevents its sustain from becoming overwhelming."
  ,"Soul Strangler":"A fast ethereal attacker. Life attacks are its natural counter; Death damage is resisted."
  ,"Supply Runner":"Accelerates nearby enemies by 16%. Eliminate the support unit before the whole lane surges."
  ,"River Hellondale":"A Frost Mage that freezes the nearest tower for 2.4 seconds every 5.8 seconds. Fire attacks counter it."
  ,"Yaba's Pickle":"A rare Rift wanderer that may appear unexpectedly. Defeat it before it escapes to restore 3 Core."
};
const BOSS_SPECIALS = {
  "Yodin Zaku":"Fire Element summoner immune to Time Snare. At 72% and 38% health he summons fireproof Antoid guards.",
  "The Kraken":"Armored Water guardian. Earth magic pierces its shell while Water attacks are resisted.",
  "Kron the Undying":"Relentless melee legend. Death curses punish him; Earth damage is resisted.",
  "Harklaw":"Ethereal Death guardian immune to Time Snare. Life attacks purge his defenses while Death damage is resisted.",
  "Chaos Dragon":"Final Dragon Element guardian immune to Time Snare. It tears open the Rift at 66% and 33% health, summoning Riftwings."
};
const ENEMY_IMAGES = {};
ENEMY_TYPES.forEach(t=>{const image=new Image();image.src=t.art;ENEMY_IMAGES[t.name]=image;});
{const image=new Image();image.src=YABA_PICKLE.art;ENEMY_IMAGES[YABA_PICKLE.name]=image;}

const LEVELS = [
  { name:"Mount Praetoria", realm:"Fire Element", tint:"#6b3527", path:[[0,310],[150,310],[150,150],[370,150],[370,420],[610,420],[610,240],[820,240],[820,430],[1100,430]], pads:[[85,205],[235,250],[285,75],[455,240],[500,510],[690,340],[720,150],[910,330],[970,510]], waves:5, boss:"Yodin Zaku", bossIcon:"♜", bossArt:"assets/yodin-zaku.png" },
  { name:"The Azmaré Trench", realm:"Water Element", tint:"#174a58", path:[[0,120],[210,120],[210,370],[390,370],[390,190],[590,190],[590,480],[790,480],[790,280],[1100,280]], pads:[[100,220],[300,100],[310,480],[480,285],[505,90],[680,360],[690,550],[875,190],[930,390]], waves:6, boss:"The Kraken", bossIcon:"♛", bossArt:"assets/the-kraken.png" },
  { name:"Anumün Wilds", realm:"Earth Element · 2 LANES", tint:"#36512d", path:[[0,500],[170,500],[170,280],[330,280],[330,80],[560,80],[560,350],[730,350],[730,170],[900,170],[900,450],[1100,450]], lanes:[
    [[0,500],[170,500],[170,280],[330,280],[330,80],[560,80],[560,350],[730,350],[730,170],[900,170],[900,450],[1100,450]],
    [[0,120],[210,120],[210,390],[430,390],[430,210],[650,210],[650,500],[850,500],[850,330],[1100,450]]
  ], pads:[[80,400],[255,410],[240,190],[430,175],[470,460],[650,250],[650,450],[810,270],[980,330]], waves:7, boss:"Kron the Undying", bossIcon:"♝", bossArt:"assets/kron-the-undying.png" },
  { name:"Mortis Catacombs", realm:"Death Element · 2 LANES", tint:"#402849", path:[[0,290],[180,290],[180,90],[420,90],[420,500],[620,500],[620,240],[860,240],[860,430],[1100,430]], lanes:[
    [[0,160],[180,160],[180,70],[430,70],[430,270],[650,270],[650,110],[880,110],[880,300],[1100,300]],
    [[0,500],[210,500],[210,350],[390,350],[390,540],[620,540],[620,390],[820,390],[820,520],[1000,520],[1000,300],[1100,300]]
  ], pads:[[90,285],[280,200],[310,455],[510,170],[520,460],[705,280],[745,475],[930,205],[960,405]], waves:8, boss:"Harklaw", bossIcon:"♚", bossArt:"assets/harklaw.png" },
  { name:"Chaos Dragon Rift", realm:"Dragon Element · 3 LANES", tint:"#46335e", path:[[0,510],[130,510],[130,110],[330,110],[330,390],[520,390],[520,160],[700,160],[700,500],[900,500],[900,260],[1100,260]], lanes:[
    [[0,90],[220,90],[220,230],[450,230],[450,90],[700,90],[700,240],[900,240],[900,310],[1100,310]],
    [[0,310],[170,310],[170,170],[350,170],[350,450],[560,450],[560,270],[780,270],[780,430],[980,430],[980,310],[1100,310]],
    [[0,540],[250,540],[250,390],[470,390],[470,540],[680,540],[680,390],[880,390],[880,520],[1040,520],[1040,310],[1100,310]]
  ], pads:[[85,200],[285,285],[335,535],[435,120],[550,350],[620,175],[740,485],[840,170],[950,370]], waves:9, boss:"Chaos Dragon", bossIcon:"♜", bossArt:"assets/chaos-dragon.png" }
];

const state = {
  started:false, level:0, wave:0, shards:320, lives:20, selectedType:null, selectedTower:null,
  towers:[], enemies:[], projectiles:[], particles:[], areas:[], beams:[], floaters:[], waveActive:false, spawnQueue:[],
  spawnTimer:0, time:0, speed:1, completed:0, shake:0, hoveredPad:-1, sound:true, audio:null,
  paused:false, waveStartLives:20, flawlessStreak:0, waveEncounters:new Map(), discoveredEnemies:new Map()
};

function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
function lerp(a,b,t){ return a+(b-a)*t; }
function towerType(id){ return TOWER_TYPES.find(t=>t.id===id); }
function elementLabel(id){ return id==="light"?"LIFE":String(id||"?").toUpperCase(); }
function attackElement(tower){ return tower.element||tower.id; }
function scaleX(){ return canvas.width / canvas.clientWidth; }
function scaleY(){ return canvas.height / canvas.clientHeight; }
function levelPaths(level=LEVELS[state.level]){ return level.lanes||[level.path]; }
function enemyPath(e){ const paths=levelPaths();return paths[e.lane%paths.length]; }

function initCards(){
  ui.cards.innerHTML = "";
  TOWER_TYPES.forEach(t=>{
    const el=document.createElement("div");
    el.className="tower-card"; el.dataset.id=t.id;
    el.style.setProperty("--card",t.color); el.style.setProperty("--card-glow",t.glow); el.style.setProperty("--card-line",t.color+"88");
    const elementName=elementLabel(t.element||t.id);
    el.title=`${t.name}: ${t.detail}`;
    el.innerHTML=`<span class="card-cost">✦ ${t.cost}</span><span class="card-ability">${t.slow?"SLOW":t.poison?"POISON":t.lavaArea?"BURN":t.chain?"CHAIN":t.thorns?"THORNS":t.doubleStrike?"×2":"POWER"}</span><div class="card-art"><img src="${t.art}" alt="${t.name}"></div><h4>${t.name}</h4><p>${t.desc}</p><div class="card-type">${elementName} ELEMENT</div>`;
    el.onclick=()=>{ state.selectedTower=null; state.selectedType=state.selectedType===t.id?null:t.id; updateSelection(); updateUI(); };
    el.addEventListener("pointerenter",event=>showCardPreview(t,el,event.pointerType));
    el.addEventListener("pointerdown",event=>{if(event.pointerType==="touch")showCardPreview(t,el,"touch");});
    el.addEventListener("pointerleave",event=>{if(event.pointerType!=="touch")hideCardPreview();});
    el.addEventListener("focus",()=>showCardPreview(t,el,"keyboard"));
    el.addEventListener("blur",hideCardPreview);
    el.tabIndex=0;
    ui.cards.appendChild(el);
  });
}

function showCardPreview(t,anchor,pointerType){
  ui.previewImage.src=t.art;ui.previewImage.alt=t.name;
  ui.previewSplinter.textContent=`${elementLabel(t.element||t.id)} ELEMENT`;
  ui.previewName.textContent=t.name;
  ui.previewAbility.innerHTML=`<b>${t.desc}</b><br>${t.detail}<br><span class="attack-speed">At 1× speed: ${(1/t.rate).toFixed(2)} attacks/s · ${t.rate.toFixed(2)}s interval${state.speed>1?`<br>Current ${state.speed}× speed: ${((1/t.rate)*state.speed).toFixed(2)} attacks/s`:""}</span><br><span class="matchup strong">▲ Strong vs ${t.strong}</span> <span class="matchup weak">▼ Weak vs ${t.weak}</span>`;
  ui.previewCost.textContent=`✦ ${t.cost}`;
  ui.cardPreview.style.setProperty("--preview-color",t.color);
  ui.cardPreview.style.setProperty("--preview-glow",t.glow);
  const consoleRect=ui.commandConsole.getBoundingClientRect(),anchorRect=anchor.getBoundingClientRect();
  const previewWidth=matchMedia("(max-width: 950px)").matches?142:190;
  const desired=anchorRect.left-consoleRect.left+(anchorRect.width-previewWidth)/2;
  ui.cardPreview.style.left=`${Math.max(6,Math.min(consoleRect.width-previewWidth-6,desired))}px`;
  ui.cardPreview.classList.add("visible");ui.cardPreview.setAttribute("aria-hidden","false");
  if(pointerType==="touch"){
    clearTimeout(showCardPreview.touchTimer);
    showCardPreview.touchTimer=setTimeout(hideCardPreview,2200);
  }
}
function hideCardPreview(){
  ui.cardPreview.classList.remove("visible");ui.cardPreview.setAttribute("aria-hidden","true");
}

function initLevelList(){
  ui.levelList.innerHTML="";
  LEVELS.forEach((l,i)=>{
    const el=document.createElement("div"); el.className="level-node"; el.dataset.level=i;
    el.innerHTML=`<div class="node-gem"><span>${i+1}</span></div><div><b>${l.name}</b><small>${l.realm} · ${l.waves} waves</small></div><span class="node-status"></span>`;
    ui.levelList.appendChild(el);
  });
}

function initBestiary(){
  ui.enemyRoster.innerHTML="";
  const discovered=[...state.discoveredEnemies.values()];
  ui.bestiaryBtn.textContent=`ENEMY BESTIARY · ${discovered.length} DISCOVERED`;
  ui.bestiaryEmpty.classList.toggle("visible",discovered.length===0);
  ui.enemyDossier.classList.toggle("hidden",discovered.length===0);
  discovered.forEach((enemy,index)=>{
    const button=document.createElement("button");
    button.className="roster-enemy";button.title=enemy.name;
    button.innerHTML=`<img src="${enemy.art}" alt="${enemy.name}"><small>${enemy.name}</small>`;
    button.onclick=()=>selectBestiaryEnemy(enemy,button);
    ui.enemyRoster.appendChild(button);
    if(index===0)selectBestiaryEnemy(enemy,button);
  });
}
function encounterSnapshot(enemy){
  return {...enemy,hp:Math.ceil(enemy.maxHp||enemy.hp),armor:enemy.armor||0,speed:Math.round(enemy.speed)};
}
function selectBestiaryEnemy(enemy,button){
  [...ui.enemyRoster.children].forEach(el=>el.classList.toggle("selected",el===button));
  ui.dossierImage.src=enemy.art;ui.dossierImage.alt=enemy.name;
  ui.dossierTrait.textContent=`${enemy.trait.toUpperCase()} ENEMY`;
  ui.dossierName.textContent=enemy.name;
  ui.dossierSpecial.textContent=ENEMY_SPECIALS[enemy.name]||BOSS_SPECIALS[enemy.name]||"Legendary Rift guardian. Its elemental affinity changes the ideal tower composition for this boss fight.";
  ui.dossierWeak.textContent=elementLabel(enemy.weakTo);ui.dossierResist.textContent=elementLabel(enemy.resists);
  ui.dossierHp.textContent=enemy.hp;ui.dossierArmor.textContent=`${Math.round(enemy.armor*100)}%`;
  ui.dossierMagic.textContent=enemy.slowImmune?"IMMUNE":`${Math.round((enemy.magicResist||0)*100)}%`;
  ui.dossierSpeed.textContent=enemy.speed;
}
ui.bestiaryBtn.onclick=()=>{
  ui.bestiary.classList.add("visible");
  ui.bestiary.setAttribute("aria-hidden","false");
};
ui.bestiaryClose.onclick=()=>{
  ui.bestiary.classList.remove("visible");
  ui.bestiary.setAttribute("aria-hidden","true");
};

function updateUI(){
  const level=LEVELS[state.level];
  ui.shards.textContent=Math.floor(state.shards); ui.lives.textContent=Math.max(0,state.lives);
  ui.wave.textContent=`${state.wave}/${level.waves}`;
  ui.waveProgress.style.width=`${state.wave/level.waves*100}%`;
  ui.levelTag.textContent=`LEVEL ${state.level+1}`; ui.levelName.textContent=level.name;
  ui.start.disabled=state.waveActive || !state.started;
  ui.start.textContent=state.waveActive?"WAVE IN PROGRESS":state.wave===level.waves?"REALM SECURED":"BEGIN WAVE";
  [...ui.cards.children].forEach(el=>{
    const t=towerType(el.dataset.id);
    el.classList.toggle("selected",state.selectedType===t.id);
    el.classList.toggle("poor",state.shards<t.cost);
  });
  [...ui.levelList.children].forEach((el,i)=>{
    el.classList.toggle("active",i===state.level);
    el.classList.toggle("complete",i<state.completed);
    el.querySelector(".node-status").textContent=i<state.completed?"✓":i>state.completed?"◆":"";
  });
  if(!state.waveActive && state.wave<level.waves){
    const boss=state.wave===level.waves-1;
    ui.enemyPreview.innerHTML=`<span>${boss?`<img src="${level.bossArt}" alt="${level.boss}">`:["●","◆","◈"][state.wave%3]}</span><div><b>${boss?level.boss:"Wave "+(state.wave+1)+" scouts"}</b><small>${boss?"LEGENDARY BOSS · armored · relentless":previewText(state.wave)}</small></div>`;
  }
}

function previewText(w){ return ["Swiftlings · mixed pack","Brutes · armored","Swarmers · numerous"][w%3]; }

function updateSelection(){
  const tw=state.selectedTower;
  ui.towerPopover.classList.toggle("hidden",!tw);
  if(!tw)return;
  ui.sell.dataset.confirm="";ui.sell.firstChild.nodeValue="SELL ";
  const t=towerType(tw.type);
  ui.selectedIcon.textContent=t.icon; ui.selectedIcon.style.color=t.color;
  ui.selectedName.textContent=t.name; ui.selectedLevel.textContent=`EVOLUTION ${tw.level} / 3`;
  const stats=towerStats(tw);
  ui.selectedAbility.textContent=tw.type==="time"
    ? `Time Snare: ${Math.round((1-stats.slow)*100)}% slow for ${stats.slowDuration.toFixed(1)}s before enemy Magic Resistance.`
    : t.detail;
  ui.statDamage.textContent=Math.round(stats.damage);
  ui.statRange.textContent=Math.round(stats.range);
  const baseRate=1/(t.rate*(1-(tw.level-1)*.12));
  ui.statRate.textContent=state.speed===1?`${baseRate.toFixed(1)}/s`:`${baseRate.toFixed(1)}/s · ${Math.round(baseRate*state.speed*10)/10} NOW`;
  const cost=upgradeCost(tw); ui.upgradeCost.textContent=tw.level>=3?"MAX":`✦ ${cost}`;
  ui.upgrade.disabled=tw.level>=3||state.shards<cost;
  ui.sellValue.textContent=`✦ ${sellValue(tw)}`;
  ui.targetMode.textContent=(tw.targetMode||"first").toUpperCase();
  requestAnimationFrame(positionTowerPopover);
}

function positionTowerPopover(){
  const tw=state.selectedTower;if(!tw||ui.towerPopover.classList.contains("hidden"))return;
  const shell=document.querySelector(".game-shell").getBoundingClientRect();
  const rect=canvas.getBoundingClientRect();
  const px=rect.left-shell.left+(tw.x/canvas.width)*rect.width;
  const py=rect.top-shell.top+(tw.y/canvas.height)*rect.height;
  const width=ui.towerPopover.offsetWidth,height=ui.towerPopover.offsetHeight;
  const boardTop=rect.top-shell.top;
  const boardBottom=rect.bottom-shell.top;
  const mobile=matchMedia("(max-width: 700px), (max-height: 560px)").matches;
  ui.towerPopover.classList.toggle("mobile-sheet",mobile);
  ui.towerPopover.classList.remove("pointer-left","pointer-right","pointer-up","pointer-down");
  if(mobile)return;

  // Stay visually connected to the tower, but choose whichever nearby side
  // has enough room and obscures the least of its range circle.
  const gap=26,candidates=[
    {side:"pointer-left",left:px+gap,top:py-height/2},
    {side:"pointer-right",left:px-width-gap,top:py-height/2},
    {side:"pointer-up",left:px-width/2,top:py+gap},
    {side:"pointer-down",left:px-width/2,top:py-height-gap}
  ];
  const valid=candidates.filter(c=>c.left>=8&&c.left+width<=shell.width-8&&c.top>=boardTop+8&&c.top+height<=boardBottom-78);
  const choice=valid[0]||candidates
    .map(c=>({...c,penalty:Math.max(0,8-c.left)+Math.max(0,c.left+width-shell.width+8)+Math.max(0,boardTop+8-c.top)+Math.max(0,c.top+height-boardBottom+78)}))
    .sort((a,b)=>a.penalty-b.penalty)[0];
  const left=Math.max(8,Math.min(shell.width-width-8,choice.left));
  const top=Math.max(boardTop+8,Math.min(boardBottom-height-78,choice.top));
  ui.towerPopover.classList.add(choice.side);
  ui.towerPopover.style.left=`${left}px`;ui.towerPopover.style.top=`${top}px`;
}
ui.popoverClose.onclick=()=>{state.selectedTower=null;updateSelection();};
window.addEventListener("resize",positionTowerPopover);

function upgradeCost(tw){ return Math.round(towerType(tw.type).cost*(.7+tw.level*.45)); }
function sellValue(tw){ return Math.round(towerType(tw.type).cost*(.58+(.45*(tw.level-1)))); }

ui.upgrade.onclick=()=>{
  const tw=state.selectedTower;if(!tw||tw.level>=3)return;
  const cost=upgradeCost(tw);if(state.shards<cost)return;
  const oldRange=Math.round(towerStats(tw).range);
  state.shards-=cost;tw.level++;
  const newRange=Math.round(towerStats(tw).range);
  burst(tw.x,tw.y,towerType(tw.type).color,18);
  toast(`CHAMPION EVOLVED · RANGE ${oldRange} → ${newRange}`);updateSelection();updateUI();
};
ui.sell.onclick=()=>{
  const tw=state.selectedTower;if(!tw)return;
  if(performance.now()-(tw.selectedAt||0)<500)return;
  if(ui.sell.dataset.confirm!=="yes"){
    ui.sell.dataset.confirm="yes";ui.sell.firstChild.nodeValue="CONFIRM ";ui.sellValue.textContent=`+✦ ${sellValue(tw)}`;
    clearTimeout(ui.sell.confirmTimer);
    ui.sell.confirmTimer=setTimeout(()=>{ui.sell.dataset.confirm="";ui.sell.firstChild.nodeValue="SELL ";ui.sellValue.textContent=`✦ ${sellValue(tw)}`;},1800);
    return;
  }
  ui.sell.dataset.confirm="";
  const value=sellValue(tw);
  state.shards+=value;state.towers=state.towers.filter(x=>x!==tw);state.selectedTower=null;
  burst(tw.x,tw.y,"#d2bc8b",12);toast(`TOWER SOLD · +✦ ${value}`);updateSelection();updateUI();
};
const TARGET_MODES=["first","strong","weak","fast"];
ui.target.onclick=()=>{
  const tw=state.selectedTower;if(!tw)return;
  const index=TARGET_MODES.indexOf(tw.targetMode||"first");
  tw.targetMode=TARGET_MODES[(index+1)%TARGET_MODES.length];
  updateSelection();toast(`TARGETING: ${tw.targetMode.toUpperCase()}`);
};

function beginWave(){
  if(state.waveActive||state.wave>=LEVELS[state.level].waves)return;
  state.waveActive=true; state.wave++;
  state.waveEncounters.clear();initBestiary();
  state.waveStartLives=state.lives;
  const isBoss=state.wave===LEVELS[state.level].waves;
  const count=isBoss?1:9+state.wave*2+state.level;
  state.spawnQueue=[];
  for(let i=0;i<count;i++) state.spawnQueue.push(makeEnemy(i,isBoss));
  if(!isBoss&&state.wave>=2&&Math.random()<.22){
    const lane=Math.floor(Math.random()*levelPaths().length);
    const pickle=enemyFromType(YABA_PICKLE,1+state.level*.18,-30,0,1,lane);
    state.spawnQueue.splice(Math.floor(state.spawnQueue.length*(.35+Math.random()*.4)),0,pickle);
  }
  state.spawnTimer=.2; ui.start.disabled=true;
  if(isBoss){
    const level=LEVELS[state.level], boss=state.spawnQueue[0];
    ui.bossBar.classList.remove("hidden");ui.bossName.textContent=level.boss;
    ui.bossHp.style.width="100%";ui.bossHpText.textContent=`${Math.ceil(boss.maxHp)} / ${Math.ceil(boss.maxHp)}`;
  }else ui.bossBar.classList.add("hidden");
  sound("wave");
  toast(isBoss?`BOSS: ${LEVELS[state.level].boss.toUpperCase()}`:`WAVE ${state.wave} INCOMING`);
  updateUI();
}
ui.start.onclick=beginWave;

function makeEnemy(index,boss){
  const wave=state.wave, lev=state.level;
  if(boss){
    const bossHealth=[6200,4800,6000,7200,9500];
    const bossArmor=[.32,.29,.32,.36,.39];
    const hp=bossHealth[lev];
    const bossMatchups=[
      {weakTo:"water",resists:"fire",trait:"fireproof",slowImmune:true,magicResist:1,summonPhases:[.72,.38],summonType:"Antoid Platoon",summonCount:2},
      {weakTo:"earth",resists:"water",trait:"armored",magicResist:.45},
      {weakTo:"death",resists:"earth",trait:"melee",magicResist:.55},
      {weakTo:"light",resists:"death",trait:"ethereal",slowImmune:true,magicResist:1},
      {weakTo:"light",resists:"earth",trait:"dragon",slowImmune:true,magicResist:1}
    ][lev];
    return {x:-60,y:0,pathIndex:1,progress:0,hp,maxHp:hp,speed:34+lev*2,reward:240+lev*80,
      radius:29,boss:true,name:LEVELS[lev].boss,icon:LEVELS[lev].bossIcon,armor:bossArmor[lev],
      art:LEVELS[lev].bossArt,lane:0,...bossMatchups,dragonPhases:lev===4?[.66,.33]:[],
      slowUntil:0,slowFactor:1,curseUntil:0,poisonUntil:0,poisonDps:0};
  }
  let rosterMax=Math.min(ENEMY_TYPES.length,3+wave+lev);
  let d=ENEMY_TYPES[(index*3+wave+lev)%rosterMax];
  if(wave===1)d=[ENEMY_TYPES[0],ENEMY_TYPES[1],ENEMY_TYPES[4]][index%3];
  const mult=1.02+(wave-1)*.20+lev*.22;
  return enemyFromType(d,mult,-30,0,1,index%levelPaths(LEVELS[lev]).length);
}

function enemyFromType(d,mult=1,x=-30,y=0,pathIndex=1,lane=0){
  return {x,y,pathIndex,progress:0,hp:d.hp*mult,maxHp:d.hp*mult,speed:d.speed,radius:d.radius,
    reward:Math.round(d.reward*Math.max(1,mult*.72)),color:d.color,armor:d.armor||0,name:d.name,art:d.art,
    lavaImmune:!!d.lavaImmune,slowImmune:!!d.slowImmune,magicResist:d.magicResist||0,trait:d.trait,weakTo:d.weakTo,resists:d.resists,
    splitInto:d.splitInto||null,spawnType:d.spawnType||null,spawnCount:d.spawnCount||0,
    regen:d.regen||0,speedAura:d.speedAura||0,freezeRange:d.freezeRange||0,freezeDuration:d.freezeDuration||0,
    freezeRate:d.freezeRate||0,heartReward:d.heartReward||0,special:!!d.special,
    boss:false,lane,slowUntil:0,slowFactor:1,curseUntil:0,poisonUntil:0,poisonDps:0,spawned:false};
}

function spawnEnemy(e){
  const p=enemyPath(e)[0]; e.x=p[0];e.y=p[1]; state.enemies.push(e);
  if(!state.waveEncounters.has(e.name)){
    const snapshot=encounterSnapshot(e);
    state.waveEncounters.set(e.name,snapshot);
    state.discoveredEnemies.set(e.name,snapshot);
    initBestiary();
    toast(`NEW ENEMY DISCOVERED: ${e.name.toUpperCase()}`);
  }
  if(e.special)toast("A RARE YABA'S PICKLE HAS ENTERED THE RIFT!");
  if(e.boss){ui.bossBar.classList.remove("hidden");ui.bossName.textContent=e.name;}
}

function damageCore(amount){
  state.lives=Math.max(0,state.lives-amount);
  ui.lives.textContent=state.lives;
  const box=ui.lives.closest(".resource");
  box.classList.remove("core-hit");
  void box.offsetWidth;
  box.classList.add("core-hit");
  toast(`CORE BREACHED  −${amount} ♥`);
  sound("core");
}

function displayEnergyGain(amount){
  ui.shards.textContent=Math.floor(state.shards);
  const box=ui.shards.closest(".resource");
  box.classList.remove("energy-gain");
  void box.offsetWidth;
  box.classList.add("energy-gain");
}

function initAudio(){
  if(state.audio)return;
  state.audio=new (window.AudioContext||window.webkitAudioContext)();
}
function sound(kind){
  if(!state.sound)return;
  initAudio();if(state.audio.state==="suspended")state.audio.resume();
  const now=state.audio.currentTime, osc=state.audio.createOscillator(), gain=state.audio.createGain();
  const sounds={
    wave:["sawtooth",130,260,.35,.12],core:["square",110,48,.45,.18],fire:["sawtooth",105,58,.14,.055],
    water:["sine",680,310,.12,.035],earth:["sine",260,760,.22,.045],death:["triangle",190,82,.18,.04],
    light:["square",520,740,.12,.025],time:["sine",760,320,.18,.035],split:["sawtooth",180,420,.24,.07],down:["triangle",130,70,.09,.025],
    bossDown:["sawtooth",220,44,.7,.12],flawless:["sine",420,880,.3,.055]
  };
  const s=sounds[kind]||sounds.down;osc.type=s[0];osc.frequency.setValueAtTime(s[1],now);osc.frequency.exponentialRampToValueAtTime(Math.max(30,s[2]),now+s[3]);
  gain.gain.setValueAtTime(s[4],now);gain.gain.exponentialRampToValueAtTime(.001,now+s[3]);
  osc.connect(gain);gain.connect(state.audio.destination);osc.start(now);osc.stop(now+s[3]);
}

function updateEnemy(e,dt){
  if(e.slowUntil<state.time)e.slowFactor=1;
  if(e.regen&&e.hp>0)e.hp=Math.min(e.maxHp,e.hp+e.regen*dt);
  if(e.freezeRange){
    e.freezeCooldown=(e.freezeCooldown??(1.2+Math.random()*1.5))-dt;
    if(e.freezeCooldown<=0){
      const targets=state.towers.filter(t=>dist(e,t)<=e.freezeRange);
      if(targets.length){
        targets.sort((a,b)=>dist(e,a)-dist(e,b));
        const tower=targets[0];tower.frozenUntil=Math.max(tower.frozenUntil||0,state.time+e.freezeDuration);
        state.beams.push({x1:e.x,y1:e.y,x2:tower.x,y2:tower.y-15,color:"#8be7ff",life:.35,max:.35});
        burst(tower.x,tower.y-18,"#8be7ff",16);toast(`${e.name.toUpperCase()} FROZE ${towerType(tower.type).name.toUpperCase()}`);
        sound("water");
      }
      e.freezeCooldown=e.freezeRate;
    }
  }
  if(e.poisonUntil>state.time){
    e.hp-=e.poisonDps*dt;
    if(e.hp<=0&&!e.dead){
      killEnemy(e,"#61d486");
      return;
    }
  }
  if(e.spawnType&&!e.spawned&&e.hp<e.maxHp*.62){
    e.spawned=true;
    spawnChildren(e,e.spawnType,e.spawnCount||2,false);
    toast(`${e.name.toUpperCase()} RELEASED REINFORCEMENTS`);
    sound("split");
  }
  if(e.boss&&e.summonPhases?.length&&e.hp/e.maxHp<=e.summonPhases[0]){
    const threshold=e.summonPhases.shift();
    const type=ENEMY_TYPES.find(unit=>unit.name===e.summonType);
    for(let i=0;i<(e.summonCount||2);i++){
      const child=enemyFromType(type,1.2+state.level*.15,e.x-20-i*13,e.y+(i-.5)*18,e.pathIndex,e.lane);
      child.reward=Math.round(child.reward*.5);state.enemies.push(child);
      if(!state.discoveredEnemies.has(child.name)){
        const snapshot=encounterSnapshot(child);
        state.waveEncounters.set(child.name,snapshot);state.discoveredEnemies.set(child.name,snapshot);
      }
    }
    initBestiary();state.shake=8;burst(e.x,e.y,"#ff7a3e",18);
    toast(`${e.name.toUpperCase()} SUMMONS FIREPROOF GUARDS · ${Math.round(threshold*100)}%`);
    sound("split");
  }
  if(e.boss&&e.dragonPhases?.length&&e.hp/e.maxHp<=e.dragonPhases[0]){
    const threshold=e.dragonPhases.shift();
    const riftwing=ENEMY_TYPES.find(type=>type.name==="Riftwing");
    const paths=levelPaths();
    paths.forEach((_,lane)=>{
      const child=enemyFromType(riftwing,1.25+state.level*.18,e.x+(lane-1)*18,e.y+(lane-1)*12,e.pathIndex,lane);
      child.reward=Math.round(child.reward*.45);
      state.enemies.push(child);
      if(!state.waveEncounters.has(child.name)){
        const snapshot=encounterSnapshot(child);
        state.waveEncounters.set(child.name,snapshot);
        state.discoveredEnemies.set(child.name,snapshot);
      }
    });
    initBestiary();
    state.shake=12;burst(e.x,e.y,"#b77cff",28);
    toast(`CHAOS DRAGON RIPS OPEN THE RIFT · ${Math.round(threshold*100)}%`);
    sound("split");
  }
  const path=enemyPath(e), target=path[e.pathIndex];
  if(!target)return;
  const dx=target[0]-e.x,dy=target[1]-e.y,d=Math.hypot(dx,dy);
  const supportBoost=state.enemies.some(o=>o!==e&&!o.dead&&o.speedAura&&dist(o,e)<105)?1.16:1;
  const move=e.speed*e.slowFactor*supportBoost*dt;
  if(move>=d){
    e.x=target[0];e.y=target[1];e.pathIndex++;
    if(e.pathIndex>=path.length){
      e.escaped=true;damageCore(e.boss?8:1);state.shake=e.boss?18:7;burst(e.x,e.y,"#e3484f",18);
    }
  } else { e.x+=dx/d*move;e.y+=dy/d*move; }
}

function towerStats(tw){
  const t=towerType(tw.type), lm=1+(tw.level-1)*.52, aura=lifeAura(tw);
  const timeLevel=tw.type==="time"?tw.level-1:0;
  const evolvedRange=t.range*(1+(tw.level-1)*.20);
  const effectiveRange=evolvedRange*(t.snipe?1.32:1);
  return {...t,damage:t.damage*lm*(1+aura),range:effectiveRange,rate:t.rate*(1-(tw.level-1)*.12),shot:t.shot,
    slow:t.slow?Math.max(.4,t.slow-timeLevel*.10):0,
    slowDuration:t.slowDuration?t.slowDuration+timeLevel*.5:0};
}
function lifeAura(tw){
  let boost=0;
  state.towers.forEach(o=>{const aura=towerType(o.type).aura||0;if(o!==tw&&aura&&dist(o,tw)<120)boost=Math.max(boost,aura*o.level);});
  return boost;
}
function updateTower(tw,dt){
  tw.cooldown-=dt;
  const s=towerStats(tw);
  if((tw.frozenUntil||0)>state.time)return;
  if(s.thorns){
    tw.thornCooldown=(tw.thornCooldown||0)-dt;
    const close=state.enemies.filter(e=>!e.dead&&!e.escaped&&dist(tw,e)<78);
    if(close.length&&tw.thornCooldown<=0){
      tw.thornCooldown=1.05;
      close.forEach(e=>{
        e.hp-=s.thorns*(1+(tw.level-1)*.5)*affinityMultiplier("death",e);
        state.beams.push({x1:tw.x,y1:tw.y-15,x2:e.x,y2:e.y,color:"#cf70e5",life:.22,max:.22,thorn:true});
        if(e.hp<=0&&!e.dead)killEnemy(e,"#bd72dc");
      });
      tw.thornPulse=.4;
      burst(tw.x,tw.y,"#bd72dc",9);
    }
  }
  tw.thornPulse=Math.max(0,(tw.thornPulse||0)-dt);
  if(tw.cooldown>0)return;
  let targets=state.enemies.filter(e=>!e.dead&&!e.escaped&&dist(tw,e)<=s.range);
  if(!targets.length)return;
  const mode=tw.targetMode||(s.snipe?"weak":"first");
  if(mode==="strong")targets.sort((a,b)=>b.hp-a.hp);
  else if(mode==="weak")targets.sort((a,b)=>a.hp-b.hp);
  else if(mode==="fast")targets.sort((a,b)=>b.speed*b.slowFactor-a.speed*a.slowFactor);
  else targets.sort((a,b)=>b.pathIndex-a.pathIndex||b.x-a.x);
  const target=targets[0];tw.cooldown=s.rate;
  const shot={x:tw.x,y:tw.y-18,target,damage:s.damage,speed:s.shot,color:s.color,type:attackElement(s),visualType:tw.type,splash:s.splash||0,curse:s.curse||0,poison:s.poison||0,slow:s.slow||0,slowDuration:s.slowDuration||0,lavaArea:s.lavaArea||false,magic:s.magic||false,chain:s.chain||0};
  state.projectiles.push(shot);
  if(s.doubleStrike){
    state.projectiles.push({...shot,x:tw.x-7,y:tw.y-13,damage:s.damage*.82,speed:s.shot*.9,delay:.11});
    burst(tw.x,tw.y-20,"#f1d96d",6);
  }
  tw.angle=Math.atan2(target.y-tw.y,target.x-tw.x);
  sound(tw.type);
}

function killEnemy(e,color){
  if(e.dead)return;
  if(e.splitInto)spawnChildren(e,e.splitInto,e.name==="Legionnaire Alvar"?2:3,true);
  e.dead=true;state.shards+=e.reward;
  displayEnergyGain(e.reward);
  state.floaters.push({x:e.x,y:e.y-12,text:`+✦ ${e.reward}`,color:"#f3c85d",life:.9,max:.9});
  burst(e.x,e.y,e.boss?"#f3c85d":color,e.boss?35:10);
  if(e.heartReward){
    state.lives=Math.min(22,state.lives+e.heartReward);ui.lives.textContent=state.lives;
    toast(`YABA'S PICKLE RESCUED · +${e.heartReward} ♥ CORE`);
  }
  sound(e.boss?"bossDown":"down");
  if(e.boss){state.shake=20;ui.bossBar.classList.add("hidden");toast(`${e.name.toUpperCase()} DEFEATED`);}
}

function spawnChildren(parent,typeName,count,fromSplit){
  const d=ENEMY_TYPES.find(t=>t.name===typeName);if(!d)return;
  const mult=Math.max(.72,parent.maxHp/(ENEMY_TYPES.find(t=>t.name===parent.name)?.hp||parent.maxHp)*.72);
  for(let i=0;i<count;i++){
    const child=enemyFromType(d,mult,parent.x+(i-(count-1)/2)*11,parent.y+(Math.random()-.5)*16,parent.pathIndex,parent.lane);
    child.reward=Math.max(3,Math.round(child.reward*(fromSplit?.55:.35)));
    state.enemies.push(child);
    if(!state.waveEncounters.has(child.name)){
      const snapshot=encounterSnapshot(child);
      state.waveEncounters.set(child.name,snapshot);
      state.discoveredEnemies.set(child.name,snapshot);
      initBestiary();
    }
    burst(child.x,child.y,d.color,7);
  }
  state.shake=Math.max(state.shake,fromSplit?6:3);
}

function hitEnemy(p,e){
  let armor=e.armor||0;if(e.curseUntil>state.time)armor=Math.max(0,armor-.25);
  if(p.magic)armor=0;
  const affinity=affinityMultiplier(p.type,e);
  e.hp-=p.damage*(1-armor)*affinity;
  if(p.poison){e.poisonDps=p.poison*affinity;e.poisonUntil=state.time+3;}
  if(p.slow){
    if(e.slowImmune){
      if((e.slowNoticeUntil||0)<state.time){
        state.floaters.push({x:e.x,y:e.y-18,text:"TIME IMMUNE",color:"#9deaff",life:.75,max:.75});
        e.slowNoticeUntil=state.time+1.5;
      }
    }else{
      const resist=Math.max(0,Math.min(.9,e.magicResist||0));
      const appliedStrength=(1-p.slow)*(1-resist);
      e.slowFactor=1-appliedStrength;
      e.slowUntil=state.time+(p.slowDuration||2)*(1-resist*.65);
      state.floaters.push({x:e.x,y:e.y-18,text:`-${Math.round(appliedStrength*100)}% SPEED`,color:"#9deaff",life:.55,max:.55});
    }
  }
  if(p.type==="death")e.curseUntil=state.time+3;
  if(p.splash)state.enemies.forEach(o=>{
    if(o!==e&&!o.dead&&!o.lavaImmune&&dist(o,e)<p.splash){
      o.hp-=p.damage*.48*(1-(o.armor||0))*affinityMultiplier("fire",o);
      if(o.hp<=0)killEnemy(o,p.color);
    }
  });
  if(p.lavaArea)state.areas.push({x:e.x,y:e.y,radius:46,life:3.2,max:3.2,dps:p.damage*.34,color:"#ed5a31"});
  if(p.chain){
    let source=e;
    state.enemies.filter(o=>o!==e&&!o.dead&&dist(o,e)<105).sort((a,b)=>dist(a,e)-dist(b,e)).slice(0,p.chain).forEach((o,i)=>{
      o.hp-=p.damage*(.58-i*.12)*affinityMultiplier("earth",o);
      state.beams.push({x1:source.x,y1:source.y,x2:o.x,y2:o.y,color:"#9cf083",life:.24,max:.24});
      burst(o.x,o.y,"#8fd167",4);
      if(o.hp<=0)killEnemy(o,"#8fd167");
      source=o;
    });
  }
  burst(e.x,e.y,p.color,5);
  if(e.hp<=0&&!e.dead)killEnemy(e,p.color);
}

function affinityMultiplier(type,e){
  if(e.weakTo===type)return 1.38;
  if(e.resists===type)return .62;
  return 1;
}

function updateProjectile(p,dt){
  if(p.delay>0){p.delay-=dt;return;}
  if(p.target.dead||p.target.escaped){p.dead=true;return;}
  const d=dist(p,p.target),move=p.speed*dt;
  if(move>=d){hitEnemy(p,p.target);p.dead=true;}
  else{p.x+=(p.target.x-p.x)/d*move;p.y+=(p.target.y-p.y)/d*move;}
}

function updateArea(a,dt){
  a.life-=dt;
  state.enemies.forEach(e=>{
    if(!e.dead&&!e.escaped&&!e.lavaImmune&&dist(a,e)<a.radius){
      e.hp-=a.dps*dt*affinityMultiplier("fire",e);
      if(e.hp<=0)killEnemy(e,a.color);
    }
  });
  if(Math.random()<dt*12)state.particles.push({x:a.x+(Math.random()-.5)*a.radius*1.4,y:a.y+(Math.random()-.5)*a.radius*.7,vx:(Math.random()-.5)*20,vy:-25-Math.random()*35,life:.4,max:.4,color:Math.random()>.5?"#ffb13b":"#e84b2d",size:2+Math.random()*4});
}

function burst(x,y,color,count){
  for(let i=0;i<count;i++)state.particles.push({x,y,vx:(Math.random()-.5)*170,vy:(Math.random()-.5)*170,life:.35+Math.random()*.45,max:.8,color,size:2+Math.random()*3});
}

function completeWaveCheck(){
  if(!state.waveActive||state.spawnQueue.length||state.enemies.some(e=>!e.dead&&!e.escaped))return;
  state.waveActive=false;
  const level=LEVELS[state.level];
  if(state.wave>=level.waves){
    state.completed=Math.max(state.completed,state.level+1);
    if(state.level===LEVELS.length-1){ showEnd(true); }
    else setTimeout(()=>showLevelComplete(),700);
  }else{
    const baseBonus=35+state.wave*8;
    if(state.lives===state.waveStartLives){
      state.flawlessStreak++;
      const flawless=18+state.flawlessStreak*7;
      state.shards+=baseBonus+flawless;
      toast(`FLAWLESS ×${state.flawlessStreak} · BONUS ✦ ${baseBonus+flawless}`);
      sound("flawless");
    }else{
      state.flawlessStreak=0;state.shards+=baseBonus;
      toast(`WAVE CLEARED · BONUS ✦ ${baseBonus}`);
    }
  }
  updateUI();
}

function showLevelComplete(){
  ui.modal.classList.add("visible");
  ui.modal.innerHTML=`<div class="modal-card"><div class="sigil">✓</div><p class="eyebrow">REALM SECURED</p><h2>${LEVELS[state.level].name}</h2><p>The rift guardian has fallen. Your surviving champions have been recalled, and the next battlefield awaits.</p><div class="mini-rules"><span>Clear bonus <b>✦</b> ${180+state.level*50}</span><span>Core restored <b>♥</b> +7</span></div><button id="nextLevel" class="primary large">TRAVEL TO ${LEVELS[state.level+1].name.toUpperCase()}</button></div>`;
  $("nextLevel").onclick=()=>{state.shards+=180+state.level*50;state.lives=Math.min(22,state.lives+7);state.level++;state.wave=0;state.towers=[];state.enemies=[];state.projectiles=[];state.areas=[];state.beams=[];state.selectedTower=null;state.selectedType=null;ui.modal.classList.remove("visible");updateSelection();updateUI();};
}

function showEnd(win){
  ui.modal.classList.add("visible");
  ui.modal.innerHTML=`<div class="modal-card"><div class="sigil">${win?"✦":"☠"}</div><p class="eyebrow">${win?"CAMPAIGN COMPLETE":"THE HEARTSTONE FELL"}</p><h2>${win?"THE REALMS ENDURE":"THE RIFT CONSUMES ALL"}</h2><p>${win?"Every guardian is broken. For now, the Elements stand united—and your legend is carved into the Heartstone.":"Rebuild your deck, rethink your placements, and return stronger."}</p><button id="restartGame" class="primary large">BEGIN A NEW CAMPAIGN</button></div>`;
  $("restartGame").onclick=()=>location.reload();
}

function toast(msg){
  ui.toast.textContent=msg;ui.toast.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>ui.toast.classList.remove("show"),1800);
}

canvas.addEventListener("mousemove",e=>{
  const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*scaleX(),y=(e.clientY-r.top)*scaleY();
  state.hoveredPad=LEVELS[state.level].pads.findIndex(p=>Math.hypot(x-p[0],y-p[1])<28);
});
canvas.addEventListener("mouseleave",()=>state.hoveredPad=-1);
canvas.addEventListener("click",e=>{
  if(!state.started)return;
  const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*scaleX(),y=(e.clientY-r.top)*scaleY();
  const clicked=state.towers.find(t=>Math.hypot(x-t.x,y-t.y)<36);
  if(clicked){clicked.selectedAt=performance.now();state.selectedTower=clicked;state.selectedType=null;updateSelection();updateUI();return;}
  const padIndex=LEVELS[state.level].pads.findIndex(p=>Math.hypot(x-p[0],y-p[1])<30);
  if(padIndex<0||!state.selectedType){state.selectedTower=null;updateSelection();return;}
  if(state.towers.some(t=>t.pad===padIndex)){toast("THAT RUNE IS OCCUPIED");return;}
  const type=towerType(state.selectedType);if(state.shards<type.cost){toast("NOT ENOUGH SHARDS");return;}
  const p=LEVELS[state.level].pads[padIndex];state.shards-=type.cost;
  const tw={x:p[0],y:p[1],pad:padIndex,type:type.id,level:1,cooldown:.2,angle:-Math.PI/2,thornCooldown:.4,thornPulse:0,targetMode:type.snipe?"weak":"first"};
  state.towers.push(tw);state.selectedTower=tw;state.selectedType=null;burst(tw.x,tw.y,type.color,14);updateSelection();updateUI();
});

ui.speed.onclick=()=>{
  state.speed=state.speed===1?2:state.speed===2?3:1;ui.speed.textContent=state.speed+"×";
  if(state.selectedTower)updateSelection();
  toast(state.speed===1?"NORMAL TIME · ADVERTISED ATTACK RATES":`${state.speed}× TIME · ALL COMBAT RUNS ${state.speed}× FASTER`);
};
ui.sound.onclick=()=>{state.sound=!state.sound;ui.sound.textContent=state.sound?"♫":"♩";ui.sound.style.opacity=state.sound?1:.45;if(state.sound)sound("wave");};
ui.pause.onclick=()=>{
  if(!state.started)return;
  state.paused=!state.paused;
  ui.pause.textContent=state.paused?"▶":"Ⅱ";
  ui.pause.title=state.paused?"Resume game":"Pause game";
  canvas.parentElement.classList.toggle("paused",state.paused);
};
ui.sideToggle.onclick=()=>{
  const mobile=matchMedia("(max-width: 1000px)").matches;
  if(mobile){
    const open=document.querySelector("main").classList.toggle("mobile-side-open");
    ui.sideToggle.textContent=open?"›":"‹";
    ui.sideToggle.title=open?"Hide campaign panel":"Show campaign panel";
    ui.sideToggle.setAttribute("aria-label",open?"Hide campaign panel":"Show campaign panel");
  }else{
    const collapsed=document.querySelector("main").classList.toggle("side-collapsed");
    ui.sideToggle.textContent=collapsed?"‹":"›";
    ui.sideToggle.title=collapsed?"Show campaign panel":"Hide campaign panel";
    ui.sideToggle.setAttribute("aria-label",collapsed?"Show campaign panel":"Hide campaign panel");
  }
};
function syncSideDrawer(){
  const main=document.querySelector("main");
  const mobile=matchMedia("(max-width: 1000px)").matches;
  if(mobile)main.classList.remove("side-collapsed");
  else main.classList.remove("mobile-side-open");
  ui.sideToggle.textContent=mobile?"‹":main.classList.contains("side-collapsed")?"‹":"›";
  ui.sideToggle.title=mobile?"Show campaign panel":"Hide campaign panel";
}
matchMedia("(max-width: 1000px)").addEventListener?.("change",syncSideDrawer);
syncSideDrawer();
ui.fullscreen.onclick=async()=>{
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
      if(screen.orientation?.lock)screen.orientation.lock("landscape").catch(()=>{});
    }else await document.exitFullscreen();
  }catch(_){toast("FULL SCREEN IS NOT AVAILABLE IN THIS BROWSER");}
};
document.addEventListener("fullscreenchange",()=>ui.fullscreen.textContent=document.fullscreenElement?"×":"⛶");
ui.play.onclick=()=>{initAudio();state.started=true;ui.modal.classList.remove("visible");updateUI();toast("SELECT A CARD, THEN PLACE IT ON A RUNE");};
document.addEventListener("keydown",event=>{
  if(event.code==="Space"&&state.started&&event.target===document.body){event.preventDefault();ui.pause.click();}
  if(event.key.toLowerCase()==="t"&&state.selectedTower)ui.target.click();
  if(event.key==="Escape"&&ui.bestiary.classList.contains("visible"))ui.bestiaryClose.click();
});

function roundedRect(c,x,y,w,h,r){
  c.beginPath();c.roundRect(x,y,w,h,r);
}
function drawMap(){
  const l=LEVELS[state.level];
  ctx.fillStyle=l.tint;ctx.fillRect(0,0,canvas.width,canvas.height);
  const grad=ctx.createRadialGradient(500,270,40,500,270,700);grad.addColorStop(0,"rgba(55,65,58,.2)");grad.addColorStop(1,"rgba(2,5,8,.58)");ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalAlpha=.14;ctx.strokeStyle="#d5be8a";ctx.lineWidth=1;
  for(let x=-100;x<1200;x+=55){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+240,620);ctx.stroke();}
  ctx.globalAlpha=1;
  ctx.lineCap="round";ctx.lineJoin="round";
  levelPaths(l).forEach((path,lane)=>{
    ctx.strokeStyle="rgba(3,5,7,.62)";ctx.lineWidth=64;drawPath(path);
    ctx.strokeStyle=lane===0?"#473f35":"#3f3a42";ctx.lineWidth=52;drawPath(path);
    ctx.strokeStyle=lane===0?"#786750":"#665a76";ctx.lineWidth=3;ctx.setLineDash([6,13]);drawPath(path);ctx.setLineDash([]);
  });
  l.pads.forEach((p,i)=>drawPad(p[0],p[1],i));
  const pathEnds=levelPaths(l).map(path=>path[path.length-1]);
  pathEnds.forEach(end=>{ctx.save();ctx.translate(end[0]-12,end[1]);ctx.fillStyle="#d3484d";ctx.shadowColor="#e3484f";ctx.shadowBlur=18;ctx.font="32px Cinzel";ctx.fillText("◆",-14,10);ctx.restore();});
}
function drawPath(path){ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);for(let i=1;i<path.length;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.stroke();}
function drawPad(x,y,i){
  const occupied=state.towers.some(t=>t.pad===i),hover=i===state.hoveredPad&&!occupied;
  ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);
  ctx.fillStyle=hover?"rgba(240,184,73,.2)":"rgba(10,15,18,.55)";ctx.strokeStyle=hover?"#f0b849":"rgba(198,184,147,.42)";ctx.lineWidth=hover?3:2;
  ctx.fillRect(-24,-24,48,48);ctx.strokeRect(-24,-24,48,48);ctx.strokeStyle="rgba(198,184,147,.22)";ctx.strokeRect(-15,-15,30,30);ctx.restore();
  if(!occupied){ctx.fillStyle=hover?"#f0b849":"rgba(210,196,157,.4)";ctx.font="18px serif";ctx.textAlign="center";ctx.fillText("✦",x,y+6);}
}
function drawTower(tw){
  const t=towerType(tw.type), selected=state.selectedTower===tw,s=towerStats(tw);
  const frozen=(tw.frozenUntil||0)>state.time;
  if(selected){ctx.beginPath();ctx.arc(tw.x,tw.y,s.range,0,Math.PI*2);ctx.fillStyle=t.glow;ctx.fill();ctx.strokeStyle=t.color+"66";ctx.stroke();}
  ctx.save();ctx.translate(tw.x,tw.y);
  // Dimensional stone plinth.
  ctx.fillStyle="rgba(0,0,0,.46)";ctx.beginPath();ctx.ellipse(4,25,34,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#252b31";ctx.strokeStyle=selected?"#f5cf69":t.color;ctx.lineWidth=selected?3:2;
  ctx.beginPath();ctx.moveTo(-29,9);ctx.lineTo(0,23);ctx.lineTo(29,9);ctx.lineTo(24,31);ctx.lineTo(0,41);ctx.lineTo(-24,31);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=t.color+"77";ctx.beginPath();ctx.ellipse(0,11,24,8,0,0,Math.PI*2);ctx.fill();
  // Upright card-totem with perspective and a glowing frame.
  const bob=Math.sin(state.time*2.4+tw.x)*1.5;
  ctx.translate(0,-31+bob);ctx.transform(1,0,-.1,1,0,0);
  ctx.shadowColor=t.color;ctx.shadowBlur=tw.thornPulse>0?26:12;
  ctx.fillStyle="#070b0f";ctx.fillRect(-24,-40,48,66);
  const image=CARD_IMAGES[tw.type];
  if(image&&image.complete&&image.naturalWidth)ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight*.76,-23,-39,46,64);
  else{ctx.fillStyle=t.color;ctx.font="bold 20px serif";ctx.textAlign="center";ctx.fillText(t.icon,0,-3);}
  ctx.shadowBlur=0;ctx.strokeStyle=selected?"#fff1a2":t.color;ctx.lineWidth=2.5;ctx.strokeRect(-24,-40,48,66);
  ctx.fillStyle="rgba(5,8,12,.84)";ctx.fillRect(-22,18,44,6);
  ctx.fillStyle=t.color;ctx.fillRect(-22,18,44*(tw.level/3),3);
  ctx.restore();
  if(tw.thornPulse>0){
    const r=36+(1-tw.thornPulse/.4)*34;ctx.strokeStyle=`rgba(207,112,229,${tw.thornPulse/.4})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(tw.x,tw.y-8,r,0,Math.PI*2);ctx.stroke();
  }
  for(let i=0;i<tw.level;i++){ctx.fillStyle="#f2ce67";ctx.beginPath();ctx.arc(tw.x+(i-(tw.level-1)/2)*8,tw.y+45,2.5,0,Math.PI*2);ctx.fill();}
  if(frozen){
    const remain=tw.frozenUntil-state.time;
    ctx.save();ctx.globalAlpha=.58;ctx.fillStyle="#75dcff";ctx.strokeStyle="#d5f7ff";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(tw.x-31,tw.y+20);ctx.lineTo(tw.x-25,tw.y-55);ctx.lineTo(tw.x+22,tw.y-62);ctx.lineTo(tw.x+32,tw.y+18);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.globalAlpha=1;ctx.fillStyle="#e8fbff";ctx.font="bold 9px Inter";ctx.textAlign="center";ctx.fillText(`FROZEN ${remain.toFixed(1)}s`,tw.x,tw.y-68);ctx.restore();
  }
}
function drawEnemy(e){
  ctx.save();ctx.translate(e.x,e.y);
  if(e.boss){ctx.shadowColor="#e14f50";ctx.shadowBlur=20;}
  const portraitW=e.radius*1.75,portraitH=e.radius*2.25;
  ctx.fillStyle=e.boss?"#2b1015":e.color;ctx.strokeStyle=e.curseUntil>state.time?"#cc72eb":"rgba(235,220,180,.8)";ctx.lineWidth=e.boss?3:1.5;
  ctx.beginPath();ctx.roundRect(-portraitW/2,-portraitH/2,portraitW,portraitH,e.radius*.45);ctx.fill();ctx.stroke();
  const image=e.boss?bossImage(e):ENEMY_IMAGES[e.name];
  if(image&&image.complete&&image.naturalWidth){
    ctx.save();ctx.beginPath();ctx.roundRect(-portraitW/2+2,-portraitH/2+2,portraitW-4,portraitH-4,e.radius*.38);ctx.clip();
    ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight*.78,-portraitW/2,-portraitH/2,portraitW,portraitH*1.18);ctx.restore();
  }else{
    ctx.fillStyle=e.boss?"#efbd63":"#171417";ctx.font=`bold ${e.boss?28:12}px serif`;ctx.textAlign="center";ctx.fillText(e.icon||"◆",0,e.boss?9:4);
  }
  if(e.lavaImmune){ctx.strokeStyle="#ffb24b";ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.roundRect(-portraitW/2-3,-portraitH/2-3,portraitW+6,portraitH+6,e.radius*.55);ctx.stroke();ctx.setLineDash([]);}
  if(e.splitInto){ctx.fillStyle="#f4d66f";ctx.font="bold 10px serif";ctx.textAlign="center";ctx.fillText("◇",portraitW/2,-portraitH/2);}
  if(e.spawnType){ctx.fillStyle="#85e2d5";ctx.font="bold 10px serif";ctx.textAlign="center";ctx.fillText("✣",-portraitW/2,-portraitH/2);}
  if(e.freezeRange){ctx.fillStyle="#9deaff";ctx.font="bold 11px serif";ctx.textAlign="center";ctx.fillText("❄",0,-portraitH/2-14);}
  if(e.heartReward){ctx.fillStyle="#ff7786";ctx.font="bold 12px serif";ctx.textAlign="center";ctx.fillText("♥",0,-portraitH/2-14);}
  if(e.slowImmune){ctx.fillStyle="#9deaff";ctx.font="bold 10px serif";ctx.textAlign="center";ctx.fillText("⌛̸",0,portraitH/2+10);}
  ctx.font="bold 7px Inter";ctx.textAlign="center";
  ctx.fillStyle="#68d99a";ctx.fillRect(-portraitW/2,-portraitH/2-10,portraitW/2-1,9);
  ctx.fillStyle="#102118";ctx.fillText(`W:${(e.weakTo||"?")[0].toUpperCase()}`,-portraitW/4,-portraitH/2-3);
  ctx.fillStyle="#e67370";ctx.fillRect(1,-portraitH/2-10,portraitW/2-1,9);
  ctx.fillStyle="#271010";ctx.fillText(`R:${(e.resists||"?")[0].toUpperCase()}`,portraitW/4,-portraitH/2-3);
  ctx.restore();
  if(!e.boss){const w=portraitW;ctx.fillStyle="#191515";ctx.fillRect(e.x-w/2,e.y-portraitH/2-7,w,4);ctx.fillStyle=e.hp/e.maxHp>.5?"#73c477":"#e26055";ctx.fillRect(e.x-w/2,e.y-portraitH/2-7,w*Math.max(0,e.hp/e.maxHp),4);}
  if(e.slowFactor<1){ctx.strokeStyle="#65d8ee";ctx.beginPath();ctx.arc(e.x,e.y,e.radius+4,0,Math.PI*2);ctx.stroke();}
}
const BOSS_IMAGES={};
function bossImage(e){
  if(!BOSS_IMAGES[e.name]){const image=new Image();image.src=e.art;BOSS_IMAGES[e.name]=image;}
  return BOSS_IMAGES[e.name];
}
function drawProjectile(p){
  if(p.delay>0)return;
  const visualType=p.visualType||p.type;
  ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=14;
  if(visualType==="fire"){
    ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffd050";ctx.beginPath();ctx.arc(-2,-2,3,0,Math.PI*2);ctx.fill();
  }else if(visualType==="water"){
    ctx.rotate(Math.atan2(p.target.y-p.y,p.target.x-p.x));ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-7,-4);ctx.lineTo(-3,0);ctx.lineTo(-7,4);ctx.closePath();ctx.fill();
  }else if(visualType==="earth"){
    ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,7+Math.sin(state.time*12)*2,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
  }else if(visualType==="death"){
    ctx.rotate(Math.atan2(p.target.y-p.y,p.target.x-p.x));ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-6,-5);ctx.lineTo(-2,0);ctx.lineTo(-6,5);ctx.closePath();ctx.fill();
  }else if(visualType==="time"){
    ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-5);ctx.moveTo(0,0);ctx.lineTo(4,2);ctx.stroke();
  }else{
    ctx.rotate(Math.atan2(p.target.y-p.y,p.target.x-p.x));ctx.fillRect(-9,-2,18,4);ctx.fillStyle="#fff8c5";ctx.fillRect(1,-1,9,2);
  }
  ctx.restore();
}
function drawArea(a){
  const alpha=Math.min(.48,a.life/a.max);
  ctx.save();ctx.globalAlpha=alpha;
  const g=ctx.createRadialGradient(a.x,a.y,3,a.x,a.y,a.radius);g.addColorStop(0,"#ffd054");g.addColorStop(.42,"#e8572f");g.addColorStop(1,"rgba(105,20,13,0)");
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(a.x,a.y,a.radius,a.radius*.58,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#ff9d3b";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(a.x,a.y,a.radius*.75,a.radius*.4,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function drawBeam(b){
  ctx.save();ctx.globalAlpha=Math.max(0,b.life/b.max);ctx.strokeStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=10;ctx.lineWidth=b.thorn?3:2;
  ctx.beginPath();ctx.moveTo(b.x1,b.y1);
  const mx=(b.x1+b.x2)/2+(Math.random()-.5)*18,my=(b.y1+b.y2)/2+(Math.random()-.5)*18;
  ctx.lineTo(mx,my);ctx.lineTo(b.x2,b.y2);ctx.stroke();ctx.restore();
}
function drawParticle(p){
  ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);ctx.globalAlpha=1;
}
function drawFloater(f){
  ctx.save();ctx.globalAlpha=Math.max(0,f.life/f.max);ctx.fillStyle=f.color;
  ctx.strokeStyle="rgba(5,8,11,.85)";ctx.lineWidth=3;ctx.font="bold 12px Inter";ctx.textAlign="center";
  ctx.strokeText(f.text,f.x,f.y);ctx.fillText(f.text,f.x,f.y);ctx.restore();
}

let last=performance.now();
function loop(now){
  const raw=Math.min(.035,(now-last)/1000);last=now;
  const dt=state.paused?0:raw*state.speed;state.time+=dt;
  if(state.started&&!state.paused){
    if(state.waveActive&&state.spawnQueue.length){state.spawnTimer-=dt;if(state.spawnTimer<=0){spawnEnemy(state.spawnQueue.shift());state.spawnTimer=.58;}}
    state.enemies.forEach(e=>{if(!e.dead&&!e.escaped)updateEnemy(e,dt);});
    state.towers.forEach(t=>updateTower(t,dt));
    state.projectiles.forEach(p=>updateProjectile(p,dt));
    state.areas.forEach(a=>updateArea(a,dt));
    state.beams.forEach(b=>b.life-=dt);
    state.floaters.forEach(f=>{f.y-=22*dt;f.life-=dt;});
    state.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;});
    state.enemies=state.enemies.filter(e=>!e.dead&&!e.escaped);
    state.projectiles=state.projectiles.filter(p=>!p.dead);
    state.areas=state.areas.filter(a=>a.life>0);
    state.beams=state.beams.filter(b=>b.life>0);
    state.floaters=state.floaters.filter(f=>f.life>0);
    state.particles=state.particles.filter(p=>p.life>0);
    completeWaveCheck();
    if(state.lives<=0){state.waveActive=false;showEnd(false);state.started=false;}
    const boss=state.enemies.find(e=>e.boss);
    if(boss){ui.bossHp.style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;ui.bossHpText.textContent=`${Math.ceil(Math.max(0,boss.hp))} / ${Math.ceil(boss.maxHp)}`;}
  }
  ctx.save();
  if(state.shake>0){ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake);state.shake*=.88;if(state.shake<.3)state.shake=0;}
  drawMap();state.areas.forEach(drawArea);state.towers.forEach(drawTower);state.enemies.forEach(drawEnemy);state.beams.forEach(drawBeam);state.projectiles.forEach(drawProjectile);state.particles.forEach(drawParticle);state.floaters.forEach(drawFloater);ctx.restore();
  requestAnimationFrame(loop);
}

// Start the battlefield independently from auxiliary panels. A dossier UI fault
// should never be able to prevent the core canvas renderer from appearing.
initCards();initLevelList();updateSelection();updateUI();requestAnimationFrame(loop);
try{initBestiary();}catch(error){console.error("Bestiary failed to initialise:",error);}
