'use strict';
(function(root){
  const GAN='甲乙丙丁戊己庚辛壬癸'.split(''),ZHI='子丑寅卯辰巳午未申酉戌亥'.split('');
  const WX={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水',子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const YY={甲:'陽',乙:'陰',丙:'陽',丁:'陰',戊:'陽',己:'陰',庚:'陽',辛:'陰',壬:'陽',癸:'陰'};
  const HIDDEN={子:[['癸',1]],丑:[['己',.6],['癸',.3],['辛',.1]],寅:[['甲',.6],['丙',.3],['戊',.1]],卯:[['乙',1]],辰:[['戊',.6],['乙',.3],['癸',.1]],巳:[['丙',.6],['戊',.3],['庚',.1]],午:[['丁',.7],['己',.3]],未:[['己',.6],['丁',.3],['乙',.1]],申:[['庚',.6],['壬',.3],['戊',.1]],酉:[['辛',1]],戌:[['戊',.6],['辛',.3],['丁',.1]],亥:[['壬',.7],['甲',.3]]};
  const SHENG={木:'火',火:'土',土:'金',金:'水',水:'木'},KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
  const JIE=[{deg:315,zhi:'寅'},{deg:345,zhi:'卯'},{deg:15,zhi:'辰'},{deg:45,zhi:'巳'},{deg:75,zhi:'午'},{deg:105,zhi:'未'},{deg:135,zhi:'申'},{deg:165,zhi:'酉'},{deg:195,zhi:'戌'},{deg:225,zhi:'亥'},{deg:255,zhi:'子'},{deg:285,zhi:'丑'}];
  function jde(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
  function sun(j){const T=(j-2451545)/36525,L=280.46646+36000.76983*T+.0003032*T*T,M=357.52911+35999.05029*T-.0001537*T*T,R=M*Math.PI/180,C=(1.914602-.004817*T-.000014*T*T)*Math.sin(R)+(.019993-.000101*T)*Math.sin(2*R)+.000289*Math.sin(3*R),o=125.04-1934.136*T;return((L+C-.00569-.00478*Math.sin(o*Math.PI/180))%360+360)%360}
  function termJde(y,deg){let m=Math.floor(deg/30)+3;if(m>12)m-=12;let j=jde(y,m,1);for(let i=0;i<10;i++){let x=deg-sun(j);if(x>180)x-=360;if(x<-180)x+=360;j+=x*(365.25/360);if(Math.abs(x)<.00001)break}return j}
  function adjustedDate(y,m,d,h,school){if(h===23&&school==='late'){const n=new Date(Date.UTC(y,m-1,d)+864e5);return[n.getUTCFullYear(),n.getUTCMonth()+1,n.getUTCDate()]}return[y,m,d]}
  function pillars(input){
    let {year:y,month:m,day:d,hour:h=12,ziSchool='late'}=input;[y,m,d]=adjustedDate(y,m,d,h,ziSchool);const bj=jde(y,m,d)+(h-8)/24;
    const terms=[];for(let yr=y-1;yr<=y+1;yr++)JIE.forEach(x=>terms.push({...x,year:yr,jde:termJde(yr,x.deg)}));terms.sort((a,b)=>a.jde-b.jde);
    let cur=terms[0],ly=y;terms.forEach(t=>{if(t.jde<=bj){cur=t;if(t.deg===315)ly=t.year}});
    const yg=GAN[((ly-4)%10+10)%10],yz=ZHI[((ly-4)%12+12)%12],wuhu={甲:2,己:2,乙:4,庚:4,丙:6,辛:6,丁:8,壬:8,戊:0,癸:0},order=(ZHI.indexOf(cur.zhi)-2+12)%12,mg=GAN[(wuhu[yg]+order)%10];
    const jdn=Math.floor(jde(y,m,d)+.5),dg=GAN[(jdn+9)%10],dz=ZHI[(jdn+1)%12],zi=Math.floor(((h+1)%24)/2),wushu={甲:0,己:0,乙:2,庚:2,丙:4,辛:4,丁:6,壬:6,戊:8,癸:8},hg=GAN[(wushu[dg]+zi)%10],hz=ZHI[zi];
    return{pillars:[{gan:yg,zhi:yz,label:'年柱'},{gan:mg,zhi:cur.zhi,label:'月柱'},{gan:dg,zhi:dz,label:'日柱'},{gan:hg,zhi:hz,label:'時柱'}],birthJde:bj,year:input.year,month:input.month,day:input.day,hour:h};
  }
  function tenGod(day,target){const a=WX[day],b=WX[target],same=YY[day]===YY[target];if(a===b)return same?'比肩':'劫財';if(SHENG[a]===b)return same?'食神':'傷官';if(KE[a]===b)return same?'偏財':'正財';if(KE[b]===a)return same?'七殺':'正官';return same?'偏印':'正印'}
  function tally(ps){const t={木:0,火:0,土:0,金:0,水:0};ps.forEach(p=>{t[WX[p.gan]]+=1;HIDDEN[p.zhi].forEach(x=>t[WX[x[0]]]+=x[1])});return t}
  function strength(ps){const day=WX[ps[2].gan],t=tally(ps),support=t[day]+t[Object.keys(SHENG).find(k=>SHENG[k]===day)],total=Object.values(t).reduce((a,b)=>a+b,0),ratio=support/total;return{label:ratio>=.58?'身強':ratio<=.38?'身弱':'中和',ratio,counts:t}}
  function dayun(data,sex){const ps=data.pillars,yg=ps[0].gan,male=sex==='男',forward=(YY[yg]==='陽'&&male)||(YY[yg]==='陰'&&!male),terms=[];for(let y=data.year-1;y<=data.year+1;y++)JIE.forEach(x=>terms.push(termJde(y,x.deg)));terms.sort((a,b)=>a-b);const target=forward?terms.find(x=>x>data.birthJde):terms.filter(x=>x<data.birthJde).pop(),ageF=Math.abs(target-data.birthJde)/3,startAge=Math.floor(ageF),startMonth=Math.round((ageF-startAge)*12);let gi=GAN.indexOf(ps[1].gan),zi=ZHI.indexOf(ps[1].zhi);const list=[];for(let i=0;i<10;i++){gi=(gi+(forward?1:9))%10;zi=(zi+(forward?1:11))%12;list.push({gan:GAN[gi],zhi:ZHI[zi],startAge:startAge+i*10,startYear:data.year+startAge+i*10})}return{direction:forward?'順排':'逆排',startAge,startMonth,list}}
  function analyze(input){const data=pillars(input),ps=data.pillars,day=ps[2].gan,s=strength(ps),dy=dayun(data,input.sex);return{...data,sex:input.sex,strength:s,dayun:dy,details:ps.map(p=>({...p,ganElement:WX[p.gan],zhiElement:WX[p.zhi],tenGod:p.label==='日柱'?'日主':tenGod(day,p.gan),hidden:HIDDEN[p.zhi].map(x=>({gan:x[0],weight:x[1],tenGod:tenGod(day,x[0])}))}))}}
  root.TianhengBaziChartV1=Object.freeze({version:'1.0.0',analyze,tenGod,tally,strength});if(typeof module!=='undefined'&&module.exports)module.exports=root.TianhengBaziChartV1;
})(typeof window!=='undefined'?window:globalThis);
