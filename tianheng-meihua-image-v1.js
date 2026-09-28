'use strict';
(function attachMeihuaImage(root){
  function analyzePixels(imageData,width,height,meta={}){
    if(!imageData||!imageData.length||!width||!height)throw new Error('圖片像素資料不完整');
    let r=0,g=0,b=0,n=0,light=0,light2=0,top=0,bottom=0,topN=0,bottomN=0,hash=2166136261;
    const step=Math.max(4,Math.floor(imageData.length/16384/4)*4);
    for(let i=0;i<imageData.length;i+=step){if(imageData[i+3]===0)continue;const rr=imageData[i],gg=imageData[i+1],bb=imageData[i+2],p=i/4,y=Math.floor(p/width);const l=Math.round(.299*rr+.587*gg+.114*bb);r+=rr;g+=gg;b+=bb;light+=l;light2+=l*l;n++;if(y<height/2){top+=l;topN++;}else{bottom+=l;bottomN++;}hash^=rr|(gg<<8)|(bb<<16);hash=Math.imul(hash,16777619)>>>0;}
    if(!n)throw new Error('圖片沒有可分析的可見像素');
    const avg=x=>Math.round(x/n);const brightness=avg(light);const variance=Math.max(0,light2/n-(light/n)**2);const ar=avg(r),ag=avg(g),ab=avg(b);const upperBrightness=Math.round(top/Math.max(1,topN));const lowerBrightness=Math.round(bottom/Math.max(1,bottomN));
    return{fileName:meta.fileName||'',fileSize:Number(meta.fileSize)||0,width,height,averageRGB:{r:ar,g:ag,b:ab},brightness,contrast:Math.round(Math.sqrt(variance)),upperBrightness,lowerBrightness,dominantTone:ar-ab>18?'偏暖':ab-ar>18?'偏冷':'中性',pixelHash:hash,upperSeed:hash+upperBrightness+ar+width,lowerSeed:(hash>>>8)+lowerBrightness+ab+height,movingSeed:(hash>>>16)+brightness+Math.round(Math.sqrt(variance))+width+height,source:'瀏覽器本機像素取象'};
  }
  const api={version:'1.0.0',analyzePixels};root.TianhengMeihuaImageV1=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
