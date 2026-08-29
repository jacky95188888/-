/* 天衡・九維命理｜合會局引化 v1｜add-only */
(function(root){'use strict';
var SANHE=[{zhi:['申','子','辰'],huaQi:'水',name:'申子辰三合水局'},{zhi:['亥','卯','未'],huaQi:'木',name:'亥卯未三合木局'},{zhi:['寅','午','戌'],huaQi:'火',name:'寅午戌三合火局'},{zhi:['巳','酉','丑'],huaQi:'金',name:'巳酉丑三合金局'}];
var SANHUI=[{zhi:['寅','卯','辰'],huaQi:'木',name:'寅卯辰三會東方木'},{zhi:['巳','午','未'],huaQi:'火',name:'巳午未三會南方火'},{zhi:['申','酉','戌'],huaQi:'金',name:'申酉戌三會西方金'},{zhi:['亥','子','丑'],huaQi:'水',name:'亥子丑三會北方水'}];
var LIUHE=[{pair:['子','丑'],huaQi:'土'},{pair:['寅','亥'],huaQi:'木'},{pair:['卯','戌'],huaQi:'火'},{pair:['辰','酉'],huaQi:'金'},{pair:['巳','申'],huaQi:'水'},{pair:['午','未'],huaQi:'火/土',noTransform:true}];
var WXGAN={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
var WXZHI={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
function count(a,x){return a.filter(function(v){return v===x;}).length;}
function hasAll(zs,need){return need.every(function(x){return count(zs,x)>0;});}
function positions(zs,x){var r=[];zs.forEach(function(v,i){if(v===x)r.push(i);});return r;}
function adjacent(zs,a,b){return positions(zs,a).some(function(i){return positions(zs,b).some(function(j){return Math.abs(i-j)===1;});});}
function sanhe(zs){var out=[];SANHE.forEach(function(j){if(hasAll(zs,j.zhi)){out.push({type:'三合',name:j.name,zhi:j.zhi.slice(),huaQi:j.huaQi,power:1,status:'成局'});return;}var present=j.zhi.filter(function(x){return zs.indexOf(x)>=0;});if(present.length!==2)return;var a=present[0],b=present[1],idxA=j.zhi.indexOf(a),idxB=j.zhi.indexOf(b),standard=Math.abs(idxA-idxB)===1;out.push({type:standard?'半合':'拱合',name:a+b+(standard?'半合':'拱合')+j.huaQi,zhi:[a,b],huaQi:j.huaQi,power:standard?.5:.3,status:standard?'半合':'拱合'});});return out;}
function sanhui(zs){return SANHUI.filter(function(j){return hasAll(zs,j.zhi);}).map(function(j){return {type:'三會',name:j.name,zhi:j.zhi.slice(),huaQi:j.huaQi,power:1.15,status:'成局'};});}
function liuhe(pillars){var zs=pillars.map(function(p){return p.zhi;}),gans=pillars.map(function(p){return p.gan;}),month=zs[1],out=[];LIUHE.forEach(function(j){var a=j.pair[0],b=j.pair[1];if(zs.indexOf(a)<0||zs.indexOf(b)<0||!adjacent(zs,a,b))return;var monthSupports=!j.noTransform&&WXZHI[month]===j.huaQi,ganSupports=!j.noTransform&&gans.some(function(g){return WXGAN[g]===j.huaQi;}),transform=!!(monthSupports||ganSupports);out.push({type:'六合',pair:j.pair.slice(),huaQi:j.huaQi,status:j.noTransform?'合絆':transform?'合化':'合絆',canTransform:transform,power:transform?.7:.7,monthSupports:monthSupports,ganSupports:ganSupports,restraintFactor:.7});});return out;}
function analyze(pillars){if(!Array.isArray(pillars)||pillars.length!==4)throw Error('需要四柱');var zs=pillars.map(function(p){return p.zhi;});return {version:'1.0',sanHe:sanhe(zs),sanHui:sanhui(zs),liuHe:liuhe(pillars),notes:['三合100%／半合50%／拱合30%／三會115%','六合先論合絆；有化神條件才標記合化','沖刑衝突折減待沖刑模組提供事件後再套用，避免臆造資料']};}
var api=Object.freeze({SANHE:SANHE,SANHUI:SANHUI,LIUHE:LIUHE,analyze:analyze});if(!root.TianhengBaziCombinations)root.TianhengBaziCombinations=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
