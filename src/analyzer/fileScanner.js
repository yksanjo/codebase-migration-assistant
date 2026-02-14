const fs = require('fs');
const path = require('path');

/**
 * File Scanner - discovers source files in a directory
 */

// File extensions to scan based on language
const EXTENSION_MAP = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.rb': 'ruby',
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.cpp': 'cpp',
  '.c': 'c',
  '.cs': 'csharp',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell'
};

// Directories to exclude from scanning
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'dist',
  'build',
  'out',
  'coverage',
  '.nyc_output',
  '.next',
  '.nuxt',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv',
  'env',
  '.env',
  'vendor',
  'target',
  'bin',
  'obj'
];

// Files to exclude
const EXCLUDE_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb'
];

/**
 * Scan a directory for source files
 * @param {string} dirPath - Directory to scan
 * @param {Object} options - Scan options
 * @returns {Promise<Array>} Array of file objects
 */
async function scan(dirPath, options = {}) {
  const files = [];
  const maxDepth = options.maxDepth || 10;
  const includeExtensions = options.extensions || null;
  
  await scanDirectory(dirPath, files, 0, maxDepth, includeExtensions);
  
  return files;
}

/**
 * Recursively scan a directory
 */
async function scanDirectory(dirPath, files, depth, maxDepth, includeExtensions) {
  if (depth > maxDepth) {
    return;
  }

  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    console.warn(`   ⚠️  Cannot read directory: ${dirPath}`);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip excluded directories
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
        await scanDirectory(fullPath, files, depth + 1, maxDepth, includeExtensions);
      }
      continue;
    }

    // Skip excluded files
    if (EXCLUDE_FILES.includes(entry.name)) {
      continue;
    }

    // Check file extension
    const ext = path.extname(entry.name).toLowerCase();
    const lang = EXTENSION_MAP[ext];

    if (!lang) {
      continue;
    }

    // Filter by specified extensions if provided
    if (includeExtensions && !includeExtensions.includes(ext)) {
      continue;
    }

    // Read file content
    let content;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.warn(`   ⚠️  Cannot read file: ${fullPath}`);
      continue;
    }

    files.push({
      path: fullPath,
      relativePath: path.relative(process.cwd(), fullPath),
      name: entry.name,
      extension: ext,
      language: lang,
      size: content.length,
      content
    });
  }
}

/**
 * Get supported file extensions
 */
function getSupportedExtensions() {
  return Object.keys(EXTENSION_MAP);
}

/**
 * Check if a file type is supported
 */
function isSupported(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return !!EXTENSION_MAP[ext];
}

module.exports = {
  scan,
  getSupportedExtensions,
  isSupported,
  EXTENSION_MAP
};
