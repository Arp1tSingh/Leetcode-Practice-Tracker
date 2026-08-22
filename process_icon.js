const sharp = require('sharp');
const path = require('path');

async function processIcon() {
  const input = 'C:\\Users\\Arpit\\.gemini\\antigravity-ide\\brain\\6980bc9d-1dc7-40f2-983b-bce7745c2b24\\.user_uploaded\\media_1787327861571.png';
  
  await sharp(input)
    .flatten({ background: { r: 0, g: 0, b: 0 } }) // Fills transparent areas with solid black
    .toFile(path.join(__dirname, 'src', 'app', 'icon.png'));
    
  await sharp(input)
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .toFile(path.join(__dirname, 'src', 'app', 'apple-icon.png'));
    
  console.log('Icons processed');
}

processIcon().catch(console.error);
