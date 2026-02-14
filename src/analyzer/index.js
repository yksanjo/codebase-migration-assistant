const fileScanner = require('./fileScanner');
const languageDetector = require('./languageDetector');
const parser = require('./parser');
const dependencyAnalyzer = require('./dependencyAnalyzer');

/**
 * Main analyzer module - coordinates all analysis operations
 */
class CodeAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.results = {
      files: [],
      languages: [],
      frameworks: [],
      dependencies: [],
      complexity: {},
      structure: {}
    };
  }

  /**
   * Analyze a directory or file
   * @param {string} path - Path to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(path) {
    console.log(`🔍 Analyzing: ${path}`);

    // Step 1: Scan for files
    const files = await fileScanner.scan(path, this.options);
    this.results.files = files;
    console.log(`   Found ${files.length} source files`);

    // Step 2: Detect languages
    const languages = languageDetector.detect(files);
    this.results.languages = languages;
    console.log(`   Detected languages: ${languages.join(', ')}`);

    // Step 3: Parse code structure
    const parsedFiles = await parser.parse(files);
    this.results.structure = parsedFiles;

    // Step 4: Analyze dependencies
    const dependencies = dependencyAnalyzer.analyze(parsedFiles);
    this.results.dependencies = dependencies;
    console.log(`   Found ${dependencies.length} unique dependencies`);

    // Step 5: Detect frameworks
    const frameworks = this.detectFrameworks(parsedFiles, dependencies);
    this.results.frameworks = frameworks;
    if (frameworks.length > 0) {
      console.log(`   Detected frameworks: ${frameworks.join(', ')}`);
    }

    // Step 6: Calculate complexity
    this.results.complexity = this.calculateComplexity(parsedFiles);
    console.log(`   Total lines of code: ${this.results.complexity.totalLines}`);

    return this.results;
  }

  /**
   * Detect frameworks from parsed code and dependencies
   */
  detectFrameworks(parsedFiles, dependencies) {
    const frameworks = new Set();
    const dependencyNames = dependencies.map(d => d.name.toLowerCase());

    // Check dependencies for known frameworks
    const frameworkMap = {
      'express': 'Express.js',
      'fastify': 'Fastify',
      'koa': 'Koa',
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'next': 'Next.js',
      'nuxt': 'Nuxt.js',
      'django': 'Django',
      'flask': 'Flask',
      'fastapi': 'FastAPI',
      'rails': 'Ruby on Rails',
      'spring': 'Spring',
      'laravel': 'Laravel'
    };

    for (const [key, framework] of Object.entries(frameworkMap)) {
      if (dependencyNames.some(dep => dep.includes(key))) {
        frameworks.add(framework);
      }
    }

    // Check package.json for frameworks
    for (const file of parsedFiles) {
      if (file.path.includes('package.json')) {
        try {
          const pkg = JSON.parse(file.content);
          if (pkg.dependencies) {
            for (const [key, framework] of Object.entries(frameworkMap)) {
              if (pkg.dependencies[key]) {
                frameworks.add(framework);
              }
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    return Array.from(frameworks);
  }

  /**
   * Calculate complexity metrics
   */
  calculateComplexity(parsedFiles) {
    let totalLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;

    for (const file of parsedFiles) {
      if (file.ast) {
        totalLines += file.content.split('\n').length;
        totalFunctions += file.ast.functions || 0;
        totalClasses += file.ast.classes || 0;
      }
    }

    return {
      totalLines,
      totalFiles: parsedFiles.length,
      totalFunctions,
      totalClasses,
      avgLinesPerFile: parsedFiles.length > 0 ? Math.round(totalLines / parsedFiles.length) : 0
    };
  }

  /**
   * Generate analysis report
   */
  generateReport(format = 'console') {
    const report = {
      summary: {
        totalFiles: this.results.files.length,
        languages: this.results.languages,
        frameworks: this.results.frameworks,
        complexity: this.results.complexity
      },
      dependencies: this.results.dependencies,
      structure: this.results.structure
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    if (format === 'markdown') {
      return this.generateMarkdownReport(report);
    }

    return this.generateConsoleReport(report);
  }

  generateConsoleReport(report) {
    let output = '\n';
    output += '═══════════════════════════════════════════════════════════════\n';
    output += '                    CODEBASE ANALYSIS REPORT                     \n';
    output += '═══════════════════════════════════════════════════════════════\n\n';

    output += '📊 SUMMARY\n';
    output += '───────────────────────────────────────────────────────────────\n';
    output += `   Total Files:        ${report.summary.totalFiles}\n`;
    output += `   Languages:          ${report.summary.languages.join(', ') || 'Unknown'}\n`;
    output += `   Frameworks:         ${report.summary.frameworks.join(', ') || 'None detected'}\n`;
    output += `   Total Lines:        ${report.summary.complexity.totalLines}\n`;
    output += `   Total Functions:    ${report.summary.complexity.totalFunctions}\n`;
    output += `   Total Classes:      ${report.summary.complexity.totalClasses}\n`;
    output += `   Avg Lines/File:     ${report.summary.complexity.avgLinesPerFile}\n\n`;

    output += '📦 DEPENDENCIES\n';
    output += '───────────────────────────────────────────────────────────────\n';
    if (report.dependencies.length > 0) {
      report.dependencies.slice(0, 20).forEach(dep => {
        output += `   • ${dep.name} (${dep.version || 'unknown'}) - ${dep.usageCount} usages\n`;
      });
      if (report.dependencies.length > 20) {
        output += `   ... and ${report.dependencies.length - 20} more\n`;
      }
    } else {
      output += '   No external dependencies detected\n';
    }
    output += '\n';

    return output;
  }

  generateMarkdownReport(report) {
    let md = '# Codebase Analysis Report\n\n';
    md += '## Summary\n\n';
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Files | ${report.summary.totalFiles} |\n`;
    md += `| Languages | ${report.summary.languages.join(', ') || 'Unknown'} |\n`;
    md += `| Frameworks | ${report.summary.frameworks.join(', ') || 'None detected'} |\n`;
    md += `| Total Lines | ${report.summary.complexity.totalLines} |\n`;
    md += `| Total Functions | ${report.summary.complexity.totalFunctions} |\n`;
    md += `| Total Classes | ${report.summary.complexity.totalClasses} |\n\n`;

    md += '## Dependencies\n\n';
    if (report.dependencies.length > 0) {
      md += '| Package | Version | Usages |\n';
      md += '|---------|---------|--------|\n';
      report.dependencies.forEach(dep => {
        md += `| ${dep.name} | ${dep.version || 'unknown'} | ${dep.usageCount} |\n`;
      });
    } else {
      md += 'No external dependencies detected.\n';
    }

    return md;
  }
}

module.exports = CodeAnalyzer;
