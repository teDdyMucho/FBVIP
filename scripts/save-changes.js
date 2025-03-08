import { writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = join(dirPath, file);
    
    if (statSync(fullPath).isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Save current state of project
const projectRoot = join(__dirname, '..');
const files = getAllFiles(projectRoot);
const snapshot = {
  timestamp: new Date().toISOString(),
  files: {}
};

files.forEach(file => {
  try {
    const content = readFileSync(file, 'utf8');
    // Store relative path
    const relativePath = file.replace(projectRoot + '/', '');
    snapshot.files[relativePath] = content;
  } catch (err) {
    console.error(`Error reading file ${file}:`, err);
  }
});

// Save snapshot to file
const snapshotPath = join(projectRoot, 'project-snapshot.json');
writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
console.log('Project snapshot saved to:', snapshotPath);