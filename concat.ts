import fs from 'fs';

const files = [
  'raw_data_part1.txt',
  'raw_data_part2.txt',
  'raw_data_part3.txt',
  'raw_data_part4.txt',
  'raw_data_part5.txt',
  'raw_data_part6.txt',
  'raw_data_part7.txt',
  'raw_data_part8.txt',
  'raw_data_part9.txt',
  'raw_data_part10.txt',
  'raw_data_part11.txt',
  'raw_data_part12.txt'
];

let text = '';
for (const file of files) {
  if (fs.existsSync(file)) {
    text += fs.readFileSync(file, 'utf8') + '\n';
  }
}
fs.writeFileSync('raw_data.txt', text, 'utf8');
console.log('Concatenated successfully');
