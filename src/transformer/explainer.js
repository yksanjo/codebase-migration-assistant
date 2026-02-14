/**
 * Explainer - generates human-readable explanations for code transformations
 */

/**
 * Generate explanation for a transformation pattern
 */
function explain(pattern) {
  const explanations = {
    // TypeScript patterns
    'Add function parameter types': 
      'Added type annotations to function parameters. This improves type safety and enables better IDE support.',
    
    'Add return type to functions':
      'Added return type annotations to functions. This helps catch type errors at compile time.',
    
    'Add const/let type annotations':
      'Added type annotations to variable declarations. TypeScript can now validate the types of these variables.',
    
    'Convert require to import':
      'Converted CommonJS require() statements to ES6 import statements. This is the modern module syntax in JavaScript.',

    // React patterns
    'Convert class to function':
      'Converted a class component to a function component. Function components are simpler and more performant with React hooks.',
    
    'Convert state to useState':
      'Converted this.state to useState hooks. Each state variable now has its own setter function.',
    
    'Convert componentDidMount to useEffect':
      'Converted componentDidMount lifecycle method to useEffect hook with empty dependency array.',
    
    'Convert this.setState to setter':
      'Converted this.setState() calls to individual setter functions from useState.',
    
    'Convert this.props to props':
      'Converted this.props to the props parameter. Function components receive props directly.',

    // Express to Fastify patterns
    'Convert app initialization':
      'Replaced Express app with Fastify instance. Fastify provides better performance and built-in validation.',
    
    'Convert route handler (req, res)':
      'Converted Express route handlers to Fastify async handlers. Fastify uses request/reply objects instead of req/res.',
    
    'Convert res.send to reply.send':
      'Converted Express res.send() to Fastify reply.send(). Fastify uses a different response object.',
    
    'Convert res.json to reply.send':
      'Converted Express res.json() to Fastify reply.send(). Fastify automatically sets content-type for objects.',
    
    'Convert req.params to request.params':
      'Converted Express req.params to Fastify request.params. Fastify uses "request" instead of "req".',
    
    'Convert req.body to request.body':
      'Converted Express req.body to Fastify request.body. Fastify parses body automatically with schemas.',
    
    'Convert app.use to fastify.register':
      'Converted Express middleware to Fastify plugins. Fastify uses register() for plugins and middleware.',

    // jQuery to Vanilla JS patterns
    'Convert $(".class") to querySelectorAll':
      'Converted jQuery selector to native DOM querySelector/querySelectorAll. Modern browsers support this natively.',
    
    'Convert .addClass to classList.add':
      'Converted jQuery addClass() to native classList.add(). This is more efficient than jQuery.',
    
    'Convert .removeClass to classList.remove':
      'Converted jQuery removeClass() to native classList.remove(). Native API is faster.',
    
    'Convert .hide to style.display = "none"':
      'Converted jQuery hide() to direct CSS manipulation. This is more performant.',
    
    'Convert .show to style.display = ""':
      'Converted jQuery show() to direct CSS manipulation. Removing the display property restores default.',
    
    'Convert .text() to .textContent':
      'Converted jQuery text() getter to native textContent. This is faster and more reliable.',
    
    'Convert .text(value) to .textContent = value':
      'Converted jQuery text() setter to native textContent. More performant than jQuery.',
    
    'Convert .html() to .innerHTML':
      'Converted jQuery html() to native innerHTML. Use with caution for security reasons.',
    
    'Convert .on("click", handler) to addEventListener':
      'Converted jQuery on() to native addEventListener. This is the standard event handling API.',
    
    'Convert $.ajax to fetch':
      'Converted jQuery $.ajax() to native Fetch API. Fetch is promise-based and built into browsers.',
    
    'Convert $ to querySelector':
      'Converted jQuery $() function to native document.querySelector/querySelectorAll.'
  };

  return explanations[pattern.name] || pattern.description || 'Applied code transformation.';
}

/**
 * Generate summary of all transformations
 */
function generateSummary(transformations) {
  if (!transformations || transformations.length === 0) {
    return 'No transformations applied.';
  }

  const summary = {
    total: transformations.length,
    byCategory: {}
  };

  // Categorize transformations
  for (const trans of transformations) {
    const pattern = trans.pattern;
    let category = 'Other';

    if (pattern.includes('TypeScript') || pattern.includes('type')) {
      category = 'Type Annotations';
    } else if (pattern.includes('React') || pattern.includes('class') || pattern.includes('state') || pattern.includes('props')) {
      category = 'React Components';
    } else if (pattern.includes('Fastify') || pattern.includes('express') || pattern.includes('route')) {
      category = 'Framework Migration';
    } else if (pattern.includes('jQuery') || pattern.includes('selector') || pattern.includes('ajax')) {
      category = 'DOM & AJAX';
    }

    if (!summary.byCategory[category]) {
      summary.byCategory[category] = [];
    }
    summary.byCategory[category].push(pattern);
  }

  return summary;
}

/**
 * Generate detailed explanation report
 */
function generateExplanationReport(transformations) {
  if (!transformations || transformations.length === 0) {
    return 'No transformations to explain.';
  }

  let report = '## Transformation Explanations\n\n';

  for (const trans of transformations) {
    report += `### ${trans.pattern}\n\n`;
    report += `**Line ${trans.line}:** ${explain({ name: trans.pattern, description: trans.explanation })}\n\n`;

    if (trans.originalSnippet && trans.transformedSnippet) {
      report += '```diff\n';
      report += `- ${trans.originalSnippet}\n`;
      report += `+ ${trans.translatedSnippet}\n`;
      report += '```\n\n';
    }
  }

  return report;
}

/**
 * Generate migration benefits explanation
 */
function generateBenefitsExplanation(target) {
  const benefits = {
    'typescript': [
      '✓ Improved type safety and compile-time error checking',
      '✓ Better IDE autocompletion and refactoring support',
      '✓ Easier maintenance of large codebases',
      '✓ Self-documenting code through type annotations'
    ],
    'react functional': [
      '✓ Simpler and more readable component code',
      '✓ Better performance with hooks',
      '✓ Easier code reuse with custom hooks',
      '✓ Less boilerplate code'
    ],
    'fastify': [
      '✓ Up to 3x faster than Express.js',
      '✓ Built-in request validation schemas',
      '✓ Native TypeScript support',
      '✓ Better error handling'
    ],
    'vanilla javascript': [
      '✓ Reduced bundle size (no jQuery overhead)',
      '✓ Faster page load times',
      '✓ Better understanding of native APIs',
      '✓ No dependency on external library'
    ]
  };

  const targetLower = target.toLowerCase();
  for (const [key, benefitList] of Object.entries(benefits)) {
    if (targetLower.includes(key)) {
      return benefitList.join('\n');
    }
  }

  return 'Migration will improve code quality and maintainability.';
}

/**
 * Generate warnings for manual review
 */
function generateWarnings(transformations) {
  const warnings = [];

  // Check for patterns that need manual review
  const manualReviewPatterns = [
    'Convert $.ajax to fetch',
    'Convert .html() to .innerHTML',
    'Convert require to import'
  ];

  for (const trans of transformations) {
    if (manualReviewPatterns.includes(trans.pattern)) {
      warnings.push({
        pattern: trans.pattern,
        message: 'This transformation may need manual review for edge cases.',
        line: trans.line
      });
    }
  }

  return warnings;
}

module.exports = {
  explain,
  generateSummary,
  generateExplanationReport,
  generateBenefitsExplanation,
  generateWarnings
};
