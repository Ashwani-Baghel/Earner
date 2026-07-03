const fs = require('fs');
// read the json
const fetchedGigs = JSON.parse(fs.readFileSync('video-gig.json'));
console.log('Fetched Gigs count:', fetchedGigs.length);

// Wait, I will use npx tsx again.
