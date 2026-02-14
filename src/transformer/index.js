const patterns = require('./patterns');
const converter = require('./converter');
const explainer = require('./explainer');

/**
 * Code Transformer
 * Transforms code from source to target format with explanations
 */
class Transformer {
  constructor(options = {}) {
    this.options = options;
    this.transformations = [];
  }

  /**
   * Transform code from source to target
   * @param {string} code - Source code
   * @param {string} source - Source framework/language
   * @param {string} target - Target framework/language
   * @returns {Object} Transformed code with explanations
   */
  transform(code, source, target) {
    console.log(`\n🔄 Transforming: ${source} → ${target}`);

    const sourceLower = source.toLowerCase();
    const targetLower = target.toLowerCase();

    // Get transformation patterns for this migration
    const migrationPatterns = patterns.getPatterns(sourceLower, targetLower);

    if (!migrationPatterns || migrationPatterns.length === 0) {
      return {
        success: false,
        original: code,
        transformed: code,
        transformations: [],
        explanation: `No transformation patterns available for ${source} → ${target}`
      };
    }

    let transformed = code;
    const transformations = [];

    // Apply each pattern
    for (const pattern of migrationPatterns) {
      const result = converter.applyPattern(transformed, pattern);
      
      if (result.changed) {
        transformations.push({
          pattern: pattern.name,
          explanation: explainer.explain(pattern),
          originalSnippet: result.original,
          transformedSnippet: result.transformed,
          line: result.line
        });
        transformed = result.code;
      }
    }

    this.transformations = transformations;

    return {
      success: true,
      original: code,
      transformed,
      transformations,
      summary: explainer.generateSummary(transformations)
    };
  }

  /**
   * Transform a file
   */
  async transformFile(file, source, target) {
    const result = this.transform(file.content, source, target);

    return {
      ...file,
      originalContent: file.content,
      transformedContent: result.transformed,
      transformations: result.transformations,
      success: result.success
    };
  }

  /**
   * Batch transform multiple files
   */
  async transformFiles(files, source, target) {
    const results = [];

    for (const file of files) {
      const result = await this.transformFile(file, source, target);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate transformation report
   */
  generateReport(results, format = 'console') {
    const report = {
      totalFiles: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalTransformations: results.reduce((sum, r) => sum + (r.transformations?.length || 0), 0),
      files: results.map(r => ({
        path: r.relativePath,
        success: r.success,
        transformations: r.transformations?.length || 0
      }))
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    if (format === 'markdown') {
      return this.generateMarkdownReport(results);
    }

    return this.generateConsoleReport(results);
  }

  generateConsoleReport(results) {
    let output = '\n';
    output += '═══════════════════════════════════════════════════════════════\n';
    output += '                    TRANSFORMATION REPORT                     \n';
    output += '═══════════════════════════════════════════════════════════════\n\n';

    output += '📊 SUMMARY\n';
    output += '───────────────────────────────────────────────────────────────\n';
    output += `   Total Files:     ${results.length}\n`;
    output += `   Successful:     ${results.filter(r => r.success).length}\n`;
    output += `   Failed:          ${results.filter(r => !r.success).length}\n`;
    output += `   Transformations: ${results.reduce((sum, r) => sum + (r.transformations?.length || 0), 0)}\n\n`;

    // Show details for each file with transformations
    const filesWithChanges = results.filter(r => r.transformations?.length > 0);
    
    if (filesWithChanges.length > 0) {
      output += '📝 TRANSFORMATIONS\n';
      output += '───────────────────────────────────────────────────────────────\n';
      
      for (const file of filesWithChanges) {
        output += `\n   📄 ${file.relativePath}\n`;
        for (const trans of file.transformations) {
          output += `      └─ ${trans.pattern}\n`;
          output += `         ${trans.explanation}\n`;
        }
      }
    }

    return output;
  }

  generateMarkdownReport(results) {
    let md = '# Code Transformation Report\n\n';
    md += '## Summary\n\n';
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Files | ${results.length} |\n`;
    md += `| Successful | ${results.filter(r => r.success).length} |\n`;
    md += `| Failed | ${results.filter(r => !r.success).length} |\n`;
    md += `| Total Transformations | ${results.reduce((sum, r) => sum + (r.transformations?.length || 0), 0)} |\n\n`;

    const filesWithChanges = results.filter(r => r.transformations?.length > 0);
    
    if (filesWithChanges.length > 0) {
      md += '## Transformations\n\n';
      
      for (const file of filesWithChanges) {
        md += `### ${file.relativePath}\n\n`;
        
        for (const trans of file.transformations) {
          md += `#### ${trans.pattern}\n\n`;
          md += `${trans.explanation}\n\n`;
          
          if (trans.originalSnippet && trans.transformedSnippet) {
            md += '```javascript\n';
            md += `// Before:\n${trans.originalSnippet}\n\n`;
            md += `// After:\n${trans.transformedSnippet}\n`;
            md += '```\n\n';
          }
        }
      }
    }

    return md;
  }
}

module.exports = Transformer;
