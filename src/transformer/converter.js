/**
 * Converter - applies transformation patterns to code
 */

/**
 * Apply a transformation pattern to code
 */
function applyPattern(code, pattern) {
  let result = code;
  let changed = false;
  let original = '';
  let transformed = '';
  let line = 0;

  // Reset regex lastIndex
  pattern.pattern.lastIndex = 0;

  // Find all matches
  const matches = [];
  let match;
  while ((match = pattern.pattern.exec(code)) !== null) {
    matches.push({
      match,
      index: match.index
    });
  }

  if (matches.length === 0) {
    return { code, changed: false };
  }

  // Apply transformation to each match
  for (const { match, index } of matches) {
    // Get line number
    line = code.substring(0, index).split('\n').length;

    // Get original snippet
    original = match[0];

    // Apply transformation
    try {
      transformed = pattern.transform(match);
    } catch (e) {
      console.warn(`   ⚠️  Transformation failed for: ${original}`);
      continue;
    }

    if (transformed !== original) {
      // Replace in code (only first occurrence for simplicity)
      result = result.replace(original, transformed);
      changed = true;
      break; // Only apply first match for detailed reporting
    }
  }

  return {
    code: result,
    changed,
    original,
    transformed,
    line
  };
}

/**
 * Apply multiple patterns to code
 */
function applyPatterns(code, patterns) {
  let result = code;
  const appliedTransformations = [];

  for (const pattern of patterns) {
    const applied = applyPattern(result, pattern);
    
    if (applied.changed) {
      appliedTransformations.push({
        pattern: pattern.name,
        description: pattern.description,
        original: applied.original,
        transformed: applied.transformed,
        line: applied.line
      });
      result = applied.code;
    }
  }

  return {
    code: result,
    transformations: appliedTransformations
  };
}

/**
 * Simple type inference for TypeScript conversion
 */
function inferType(value) {
  value = value.trim();

  // String
  if (value.startsWith("'") || value.startsWith('"')) {
    return 'string';
  }

  // Number
  if (!isNaN(value) && value !== '') {
    return 'number';
  }

  // Boolean
  if (value === 'true' || value === 'false') {
    return 'boolean';
  }

  // Array
  if (value.startsWith('[')) {
    return 'any[]';
  }

  // Object
  if (value.startsWith('{')) {
    return 'object';
  }

  // Function
  if (value.includes('=>') || value.startsWith('function')) {
    return 'Function';
  }

  // null/undefined
  if (value === 'null' || value === 'undefined') {
    return 'any';
  }

  // Default
  return 'any';
}

/**
 * Generate a diff between original and transformed code
 */
function generateDiff(original, transformed) {
  const originalLines = original.split('\n');
  const transformedLines = transformed.split('\n');

  let diff = '';
  const maxLines = Math.max(originalLines.length, transformedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || '';
    const transLine = transformedLines[i] || '';

    if (origLine !== transLine) {
      if (origLine) {
        diff += `- ${origLine}\n`;
      }
      if (transLine) {
        diff += `+ ${transLine}\n`;
      }
    } else {
      diff += `  ${origLine}\n`;
    }
  }

  return diff;
}

/**
 * Save transformed code to file
 */
async function saveTransformedCode(filePath, content) {
  const fs = require('fs');
  
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Failed to save file: ${filePath}`, error);
    return false;
  }
}

/**
 * Backup original file before transformation
 */
async function backupFile(filePath) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const backupPath = `${filePath}.backup`;
    const content = fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(backupPath, content, 'utf-8');
    return backupPath;
  } catch (error) {
    console.error(`Failed to backup file: ${filePath}`, error);
    return null;
  }
}

module.exports = {
  applyPattern,
  applyPatterns,
  inferType,
  generateDiff,
  saveTransformedCode,
  backupFile
};
