'use strict';
const ImageCore=require('./tianheng-meihua-image-v1.js');
const pixels=new Uint8ClampedArray(4*4*4);for(let i=0;i<pixels.length;i+=4){pixels[i]=i<32?220:40;pixels[i+1]=80;pixels[i+2]=30;pixels[i+3]=255;}
const a=ImageCore.analyzePixels(pixels,4,4,{fileName:'gift.png',fileSize:64});
const b=ImageCore.analyzePixels(pixels,4,4,{fileName:'gift.png',fileSize:64});
if(a.pixelHash!==b.pixelHash||a.upperSeed!==b.upperSeed||a.fileName!=='gift.png'||a.upperBrightness<=a.lowerBrightness)throw new Error('圖片取象未能穩定保存像素證據');
console.log('PASS 圖片像素取象可重現並保留上下明暗差');
