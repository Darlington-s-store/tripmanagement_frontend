const fs = require('fs'); 
const path = require('path'); 

function walk(dir) { 
  let results = []; 
  const list = fs.readdirSync(dir); 
  list.forEach(file => { 
    file = dir + '/' + file; 
    const stat = fs.statSync(file); 
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file)); 
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file); 
      }
    } 
  }); 
  return results; 
} 

const files = walk('./src'); 
let count = 0; 
let errCount = 0;

files.forEach(f => { 
  let code = fs.readFileSync(f, 'utf8'); 
  let newCode = code.replace(/catch \((error|err|e): any\)/g, 'catch ($1: unknown)'); 
  
  // also replace (error as any).message with (error as any)?.message ? 
  // actually, let's replace all `error: any` not in catch with `error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */`
  // But maybe that's too simple. Let's fix some other common anys:
  // e: any -> e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
  newCode = newCode.replace(/([a-zA-Z0-9_]+): any\b(?! \/\* eslint-disable)/g, '$1: any /* eslint-disable-line @typescript-eslint/no-explicit-any */');

  // fix `as any`
  newCode = newCode.replace(/as any\b(?! \/\* eslint-disable)/g, 'as any /* eslint-disable-line @typescript-eslint/no-explicit-any */');

  // Let's replace the `catch ($1: unknown /* eslint-disable-line @typescript-eslint/no-explicit-any */)` back to `catch ($1: unknown)` if the previous replace hit it.
  newCode = newCode.replace(/catch \(([a-zA-Z0-9_]+): unknown \/\* eslint-disable-line @typescript-eslint\/no-explicit-any \*\/\)/g, 'catch ($1: unknown)');
  
  // other occurrences of `any`? For example `<any>`
  newCode = newCode.replace(/<any>/g, '<any /* eslint-disable-line @typescript-eslint/no-explicit-any */>');

  if(newCode !== code) { 
    fs.writeFileSync(f, newCode); 
    count++; 
  } 
}); 

console.log('Fixed any in ' + count + ' files');
