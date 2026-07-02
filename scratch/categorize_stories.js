import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const dataPath = path.join(__dirname, '../src/utils/data.js');
  let content = fs.readFileSync(dataPath, 'utf8');

  // We can dynamically import the data file to get the array
  const { socialStories } = await import(dataPath);

  const categorize = (story) => {
    const text = (story.title + " " + story.pages.join(" ")).toLowerCase();
    
    // Check keywords for AFLS categories
    if (text.match(/school|teacher|class|recess|homework|test|cafeteria|bus|assembly|substitute/)) return "School Skills";
    if (text.match(/grocery|store|restaurant|library|doctor|haircut|street|park|party/)) return "Community Participation Skills";
    if (text.match(/room|bed|morning|night|shower|teeth|wash|chore|sibling|parents|clean/)) return "Home Skills";
    if (text.match(/job|work|money|schedule/)) return "Vocational Skills";
    
    // Everything else falls into Basic Living Skills (Social/Emotional)
    return "Basic Living Skills";
  };

  socialStories.forEach(story => {
    story.category = categorize(story);
  });

  const arrayString = JSON.stringify(socialStories, null, 4);
  const declarationStr = `export const socialStories = ${arrayString};`;

  // We need to replace the content between `export const socialStories = [` 
  // and `export const openEndedQuiz = [`
  const regex = /export const socialStories = \[[\s\S]*?\];\n*(?=export const openEndedQuiz)/;
  
  if (regex.test(content)) {
    content = content.replace(regex, declarationStr + "\n\n");
    fs.writeFileSync(dataPath, content, 'utf8');
    console.log(`Successfully categorized ${socialStories.length} stories!`);
  } else {
    console.error("Could not find the socialStories block to replace!");
  }
}

main();
