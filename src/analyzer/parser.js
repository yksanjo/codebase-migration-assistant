/**
 * Parser - extracts code structure from source files
 */

/**
 * Parse files and extract code structure
 * @param {Array} files - Array of file objects
 * @returns {Promise<Array>} Parsed files with AST-like structure
 */
async function parse(files) {
  const parsed = [];

  for (const file of files) {
    const parsedFile = parseFile(file);
    parsed.push(parsedFile);
  }

  return parsed;
}

/**
 * Parse a single file
 */
function parseFile(file) {
  const content = file.content;
  const language = file.language;
  const ext = file.extension.toLowerCase();

  let ast = null;

  // Use language-specific parser
  switch (language) {
    case 'javascript':
    case 'typescript':
      ast = parseJavaScript(content, language);
      break;
    case 'python':
      ast = parsePython(content);
      break;
    case 'html':
      ast = parseHTML(content);
      break;
    case 'css':
    case 'scss':
    case 'less':
      ast = parseCSS(content);
      break;
    case 'json':
      ast = parseJSON(content);
      break;
    case 'yaml':
      ast = parseYAML(content);
      break;
    default:
      ast = parseGeneric(content);
  }

  return {
    ...file,
    ast
  };
}

/**
 * Parse JavaScript/TypeScript
 */
function parseJavaScript(content, language) {
  const ast = {
    type: language,
    imports: [],
    exports: [],
    functions: [],
    classes: [],
    variables: [],
    comments: []
  };

  const lines = content.split('\n');

  // Extract imports (ES modules and CommonJS)
  const importRegex = /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    ast.imports.push({
      type: 'import',
      source: match[1],
      statement: match[0]
    });
  }

  while ((match = requireRegex.exec(content)) !== null) {
    ast.imports.push({
      type: 'require',
      source: match[1],
      statement: match[0]
    });
  }

  // Extract exports
  const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class)/g;
  while ((match = exportRegex.exec(content)) !== null) {
    ast.exports.push({
      statement: match[0]
    });
  }

  // Extract function declarations
  const funcRegex = /(?:function\s+(\w+)|(\w+)\s*[=:]\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/g;
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[1] || match[2];
    if (name && !name.includes('.')) {
      ast.functions.push({
        name,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }

  // Extract class declarations
  const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?/g;
  while ((match = classRegex.exec(content)) !== null) {
    ast.classes.push({
      name: match[1],
      extends: match[2] || null,
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // Extract variable declarations
  const varRegex = /(?:const|let|var)\s+(\w+)/g;
  while ((match = varRegex.exec(content)) !== null) {
    ast.variables.push({
      name: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // TypeScript-specific: Extract interfaces and types
  if (language === 'typescript') {
    const interfaceRegex = /interface\s+(\w+)(?:\s*<[^>]+>)?(?:\s+extends\s+[\w,\s]+)?\s*\{/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      ast.interfaces = ast.interfaces || [];
      ast.interfaces.push({
        name: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    const typeRegex = /type\s+(\w+)\s*=/g;
    while ((match = typeRegex.exec(content)) !== null) {
      ast.types = ast.types || [];
      ast.types.push({
        name: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }

  return ast;
}

/**
 * Parse Python
 */
function parsePython(content) {
  const ast = {
    type: 'python',
    imports: [],
    functions: [],
    classes: [],
    variables: [],
    comments: []
  };

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Imports
    if (line.startsWith('import ') || line.startsWith('from ')) {
      ast.imports.push({
        statement: line,
        line: i + 1
      });
    }

    // Function definitions
    const funcMatch = line.match(/^def\s+(\w+)\s*\(/);
    if (funcMatch) {
      ast.functions.push({
        name: funcMatch[1],
        line: i + 1
      });
    }

    // Class definitions
    const classMatch = line.match(/^class\s+(\w+)(?:\([^)]*\))?:/);
    if (classMatch) {
      ast.classes.push({
        name: classMatch[1],
        line: i + 1
      });
    }

    // Variables (simple assignment)
    const varMatch = line.match(/^(\w+)\s*=/);
    if (varMatch && !line.startsWith('=') && !line.includes('==')) {
      ast.variables.push({
        name: varMatch[1],
        line: i + 1
      });
    }
  }

  return ast;
}

/**
 * Parse HTML
 */
function parseHTML(content) {
  const ast = {
    type: 'html',
    elements: [],
    scripts: [],
    styles: [],
    comments: []
  };

  // Extract script tags
  const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    ast.scripts.push({
      content: match[1].trim(),
      inline: true
    });
  }

  // Extract style tags
  const styleRegex = /<style(?:\s+[^>]*)?>([\s\S]*?)<\/style>/gi;
  while ((match = styleRegex.exec(content)) !== null) {
    ast.styles.push({
      content: match[1].trim(),
      inline: true
    });
  }

  // Extract major elements
  const elementRegex = /<(\w+)[^>]*>/g;
  while ((match = elementRegex.exec(content)) !== null) {
    ast.elements.push(match[1]);
  }

  return ast;
}

/**
 * Parse CSS
 */
function parseCSS(content) {
  const ast = {
    type: 'css',
    selectors: [],
    properties: [],
    mediaQueries: [],
    keyframes: []
  };

  // Extract selectors
  const selectorRegex = /([.#]?[\w-]+)\s*\{/g;
  let match;
  while ((match = selectorRegex.exec(content)) !== null) {
    ast.selectors.push(match[1]);
  }

  // Extract properties
  const propRegex = /:\s*([^;{}]+)/g;
  while ((match = propRegex.exec(content)) !== null) {
    ast.properties.push(match[1].trim());
  }

  // Extract media queries
  const mediaRegex = /@media\s+([^{]+)/g;
  while ((match = mediaRegex.exec(content)) !== null) {
    ast.mediaQueries.push(match[1].trim());
  }

  return ast;
}

/**
 * Parse JSON
 */
function parseJSON(content) {
  try {
    const data = JSON.parse(content);
    return {
      type: 'json',
      data,
      keys: data ? Object.keys(data) : []
    };
  } catch (e) {
    return {
      type: 'json',
      error: e.message,
      keys: []
    };
  }
}

/**
 * Parse YAML (simplified)
 */
function parseYAML(content) {
  const ast = {
    type: 'yaml',
    keys: [],
    documents: []
  };

  const lines = content.split('\n');
  let inDocument = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '---') {
      inDocument = !inDocument;
      if (inDocument) ast.documents.push([]);
      continue;
    }

    const keyMatch = trimmed.match(/^(\w+):/);
    if (keyMatch && !trimmed.startsWith('#')) {
      ast.keys.push(keyMatch[1]);
      if (inDocument) {
        ast.documents[ast.documents.length - 1].push(keyMatch[1]);
      }
    }
  }

  return ast;
}

/**
 * Generic parser for unknown languages
 */
function parseGeneric(content) {
  return {
    type: 'generic',
    lines: content.split('\n').length,
    hasCode: content.length > 0
  };
}

module.exports = {
  parse,
  parseFile
};
