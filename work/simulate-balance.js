// Rift Siege campaign balance model.
// Acceptance goals:
// 1. Diverse, sensible armies clear with meaningful Core pressure.
// 2. A player using only one placed character cannot clear the campaign.
// 3. Matchup-aware builds outperform badly matched mono builds.

const towers = {
  fire:  {cost:90,  dps:25/1.05,            utility:1.00},
  water: {cost:105, dps:13/.68+8*.55,       utility:1.18},
  earth: {cost:130, dps:(22+22*.58+22*.46)/.78, utility:1.12},
  death: {cost:120, dps:15/.88+10/.95,      utility:1.16},
  light: {cost:115, dps:(11+11*.82)/.82,    utility:1.08},
  time:  {cost:100, dps:8/.58,               utility:1.95}
};

const enemies = [
  {name:"Antoid Platoon", hp:120,armor:.12,share:.18,extra:0,weakTo:"water",resists:"fire",magicResist:.10},
  {name:"Cruel Sethropod",hp:190,armor:.23,share:.14,extra:0,weakTo:"earth",resists:"light",magicResist:.25},
  {name:"Hill Giant",hp:310,armor:.18,share:.11,extra:210*3*.55,weakTo:"death",resists:"water",magicResist:.15},
  {name:"Riftwing",hp:145,armor:.08,share:.10,extra:52*2*.35,weakTo:"water",resists:"death",magicResist:.35},
  {name:"Stitch Leech",hp:85,armor:0,share:.12,extra:0,weakTo:"fire",resists:"earth",magicResist:0},
  {name:"Legionnaire Alvar",hp:430,armor:.32,share:.06,extra:210*2*.55,weakTo:"earth",resists:"light",slowImmune:true,magicResist:1},
  {name:"Disintegrator",hp:210,armor:.16,share:.04,extra:52*3*.55,weakTo:"death",resists:"water"},
  {name:"Chaos Agent",hp:52,armor:0,share:.03,extra:0,weakTo:"light",resists:"death",slowImmune:true,magicResist:1},
  {name:"Forgotten One",hp:380,armor:.26,share:.07,extra:0,weakTo:"water",resists:"fire",slowImmune:true,magicResist:1},
  {name:"Goblin Psychic",hp:175,armor:.06,share:.07,extra:70,weakTo:"death",resists:"earth",magicResist:.50},
  {name:"Soul Strangler",hp:105,armor:0,share:.04,extra:0,weakTo:"light",resists:"death",magicResist:.60},
  {name:"Supply Runner",hp:155,armor:.08,share:.03,extra:60,weakTo:"fire",resists:"water"},
  {name:"River Hellondale",hp:205,armor:.10,share:.01,extra:90,weakTo:"fire",resists:"water",magicResist:.45}
];

const bossMatchups = [
  {weakTo:"water",resists:"fire",slowImmune:true,extra:120*4*1.2},
  {weakTo:"earth",resists:"water"},
  {weakTo:"death",resists:"earth"},
  {weakTo:"light",resists:"death",slowImmune:true},
  {weakTo:"light",resists:"earth",slowImmune:true}
];
const bossHealth=[6200,4800,6000,7200,9500];
const bossArmor=[.32,.29,.32,.36,.39];

const strategies = {
  mixed:    {order:["earth","water","time","fire","light","death"],maxTowers:9},
  control:  {order:["time","water","earth","death","light","fire"],maxTowers:9},
  damage:   {order:["earth","light","fire","water","death"],maxTowers:9},
  fireHeavy:{order:["fire","fire","earth","light","water"],maxTowers:9},
  soloFire: {order:["fire"],maxTowers:1},
  soloWater:{order:["water"],maxTowers:1},
  soloEarth:{order:["earth"],maxTowers:1},
  soloDeath:{order:["death"],maxTowers:1},
  soloLight:{order:["light"],maxTowers:1},
  soloTime: {order:["time"],maxTowers:1}
};

function affinity(type,target){
  if(target.weakTo===type)return 1.38;
  if(target.resists===type)return .62;
  return 1;
}

function averageAffinity(type){
  return enemies.reduce((sum,e)=>sum+e.share*affinity(type,e),0);
}

function timeUtility(level,wave,boss,target,towerLevel){
  if(boss)return target.slowImmune?.72:(.72+1.23*(1-(target.magicResist||0))*(1+(towerLevel-1)*.18));
  const available=wave===1
    ? [enemies[0],enemies[1],enemies[4]]
    : enemies.slice(0,Math.min(enemies.length,3+wave+level));
  const total=available.reduce((sum,e)=>sum+e.share,0);
  const effectiveness=available.reduce((sum,e)=>sum+(e.slowImmune?0:e.share*(1-(e.magicResist||0))),0)/total;
  return .72+1.23*effectiveness*(1+(towerLevel-1)*.18);
}

function waveDurability(level,wave,count){
  const mult=1.02+(wave-1)*.205+level*.25;
  const available=wave===1
    ? [enemies[0],enemies[1],enemies[4]]
    : enemies.slice(0,Math.min(enemies.length,3+wave+level));
  const totalShare=available.reduce((sum,e)=>sum+e.share,0);
  return available.reduce((sum,e)=>sum+(e.hp/(1-e.armor)+e.extra)*(e.share/totalShare),0)*mult*count;
}

function simulate(name){
  const strategy=strategies[name],results=[];
  let shards=320,lives=20;
  for(let level=0;level<5;level++){
    const lanes=level<2?1:level<4?2:3;
    const owned=[];
    for(let wave=1;wave<=5+level;wave++){
      while(true){
        if(owned.length<strategy.maxTowers){
          const id=strategy.order[owned.length%strategy.order.length],t=towers[id];
          if(shards<t.cost)break;
          shards-=t.cost;owned.push({id,level:1});
        }else{
          const target=owned.filter(x=>x.level<3).sort((a,b)=>a.level-b.level)[0];
          if(!target)break;
          const cost=Math.round(towers[target.id].cost*(.7+target.level*.45));
          if(shards<cost)break;
          shards-=cost;target.level++;
        }
      }

      const boss=wave===5+level;
      const count=boss?1:9+wave*2+level;
      const target=boss?bossMatchups[level]:null;
      const durability=boss
        ? (bossHealth[level]/(1-bossArmor[level]))+(target.extra||0)
        : waveDurability(level,wave,count);
      const lanePenalty=1-(lanes-1)*.08;
      const encounterSeconds=boss?34:30+level*2.5;
      const output=owned.reduce((sum,x)=>{
        const matchup=boss?affinity(x.id,target):averageAffinity(x.id);
        const utility=x.id==="time"?timeUtility(level,wave,boss,target,x.level):towers[x.id].utility;
        // Range evolution improves lane coverage and time-on-target, but less
        // than linearly because paths and tower pads overlap.
        const rangeCoverage=1+(x.level-1)*.07;
        return sum+towers[x.id].dps*utility*matchup*(1+(x.level-1)*.52)*rangeCoverage;
      },0)*encounterSeconds*lanePenalty*(boss?1:Math.max(.95,1-Math.max(0,level-1)*.006));
      const rawRatio=output/durability;
      const ratio=Math.min(1,rawRatio);
      const leaks=boss?(ratio<.78?8:0):Math.ceil(count*Math.max(0,1-ratio)*.72);
      lives-=leaks;
      const earned=boss
        ? (ratio>=.78?240+level*80:0)
        : Math.round(count*(14+level*1.5)*ratio)+(35+wave*8);
      shards+=earned;
      results.push({level:level+1,wave,lanes,towers:owned.length,lives,ratio:+ratio.toFixed(2),rawRatio:+rawRatio.toFixed(2)});
      if(lives<=0)return {name,cleared:false,results};
    }
    shards+=180+level*50;lives=Math.min(22,lives+7);
  }
  return {name,cleared:true,results};
}

let passed=true;
for(const name of Object.keys(strategies)){
  const run=simulate(name),last=run.results.at(-1),solo=name.startsWith("solo");
  const expected=solo?!run.cleared:run.cleared&&last.lives>=3&&last.lives<=15;
  passed&&=expected;
  const yodin=run.results.find(x=>x.level===1&&x.wave===5);
  console.log(`${name.padEnd(10)} cleared=${String(run.cleared).padEnd(5)} end=L${last.level}W${last.wave} core=${String(last.lives).padStart(3)} Yodin=${yodin?.rawRatio??"-"} towers=${last.towers} ${expected?"PASS":"FAIL"}`);
}
console.log(`\nBALANCE SUITE: ${passed?"PASS":"FAIL"}`);
process.exitCode=passed?0:1;
