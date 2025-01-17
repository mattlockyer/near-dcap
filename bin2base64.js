import fs from 'fs';

let str = fs.readFileSync('sgx_quote', 'utf-8');
str = str.replace(/\r?\n|\r/g, ' ');
console.log(str.length);
console.log(
    Buffer.from(Buffer.from(str, 'utf-8').toString('base64'), 'base64').length,
);

fs.writeFileSync('sgx_quote64', Buffer.from(str, 'utf-8').toString('base64'));
