import fs from 'fs';

for (let i = 0; i <= 3; i++) {
  const filename = `src/data/batch${i}.ts`;
  let text = fs.readFileSync(filename, 'utf-8');
  text = text.replace(/ homicide:/g, ' homicideRate:');
  fs.writeFileSync(filename, text);
}
console.log('Fixed homicideRate');
