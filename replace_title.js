const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.next') || file.includes('.git')) {
            next();
          } else {
            walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          }
        } else {
          results.push(file);
          next();
        }
      });
    }
    next();
  });
}

walk('./', function(err, results) {
  if (err) throw err;
  
  const extensions = ['.ts', '.tsx', '.md', '.json', '.css'];
  
  results.forEach(file => {
    if (extensions.some(ext => file.endsWith(ext))) {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      
      // Replacements
      content = content.replace(/Fiverr Clone/gi, 'Earner');
      content = content.replace(/Fiverr clone/gi, 'Earner');
      content = content.replace(/fiverr clone/gi, 'Earner');
      content = content.replace(/Fiverr/g, 'Earner');
      content = content.replace(/container-fiverr/g, 'container-earner');
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
      }
    }
  });
  console.log('Done replacing titles!');
});
