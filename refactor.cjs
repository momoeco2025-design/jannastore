const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

// Replace readDB() with await getDB()
code = code.replace(/readDB\(\)/g, 'await getDB()');

// Replace writeDB(db) with await saveDB(db)
code = code.replace(/writeDB\((.*?)\)/g, 'await saveDB($1)');

// Add async to all route handlers
const methods = ['get', 'post', 'put', 'delete'];
methods.forEach(method => {
  const regex = new RegExp(`app\\.${method}\\("([^"]+)",\\s*\\(req: Request, res: Response\\)\\s*=>\\s*{`, 'g');
  code = code.replace(regex, `app.${method}("$1", async (req: Request, res: Response) => {`);
  
  const regexAuth = new RegExp(`app\\.${method}\\("([^"]+)",\\s*adminAuth,\\s*\\(req: Request, res: Response\\)\\s*=>\\s*{`, 'g');
  code = code.replace(regexAuth, `app.${method}("$1", adminAuth, async (req: Request, res: Response) => {`);
});

// Remove old readDB, writeDB, initDB implementations
// Actually, it's easier to just replace them later or manually
fs.writeFileSync('server.ts', code);
console.log('Refactored server.ts');
