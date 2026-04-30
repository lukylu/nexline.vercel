const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/ts/data.ts');
const content = fs.readFileSync(filePath, 'utf8');

const productsStart = content.indexOf('const products');
const productsEnd = content.indexOf('];', productsStart) + 2;
const productsPart = content.substring(productsStart, productsEnd)
    .replace('const products', 'export const products: Product[]');

const imgsStart = content.indexOf('const productImgs');
const imgsEnd = content.lastIndexOf('};') + 1; // Assuming it ends with };
const imgsPart = content.substring(imgsStart, imgsEnd)
    .replace('const productImgs', 'export const productImgs: Record<number, string[]>');

const output = `import { Product } from './types';\n\n${productsPart}\n\n${imgsPart}\n`;

fs.writeFileSync(filePath, output);
console.log('Successfully cleaned up data.ts');
