const paths = require('./paths');
const riskAssessor = require('./riskAssessor');
const planner = require('./planner');

/**
 * Migration Strategy Generator
 * Suggests migration paths and generates actionable plans
 */
class StrategyGenerator {
  constructor(analysisResults) {
    this.analysis = analysisResults;
    this.strategy = {
      source: null,
      target: null,
      path: null,
      risk: null,
      steps: [],
      warnings: []
    };
  }

  /**
   * Generate migration strategy
   * @param {string} target - Target framework/language
   * @returns {Object} Migration strategy
   */
  generate(target) {
    const source = this.detectSource();
    this.strategy.source = source;
    this.strategy.target = target;

    console.log(`\n📋 Generating migration strategy...`);
    console.log(`   Source: ${source} → Target: ${target}`);

    // Find migration path
    this.strategy.path = paths.findPath(source, target);
    if (!this.strategy.path) {
      this.strategy.warnings.push(`No direct migration path found from ${source} to ${target}`);
      return this.strategy;
    }

    // Assess risk
    this.strategy.risk = riskAssessor.assess(this.analysis, target, this.strategy.path);

    // Generate steps
    this.strategy.steps = planner.generateSteps(
      this.analysis,
      target,
      this.strategy.path,
      this.strategy.risk
    );

    // Add warnings
    this.strategy.warnings = riskAssessor.getWarnings(this.analysis, target);

    return this.strategy;
  }

  /**
   * Detect source framework/language
   */
  detectSource() {
    const { languages, frameworks } = this.analysis;

    if (frameworks && frameworks.length > 0) {
      return frameworks[0];
    }

    if (languages && languages.length > 0) {
      return languages[0];
    }

    return 'unknown';
  }

  /**
   * Get supported migration targets
   */
  static getSupportedTargets() {
    return paths.getSupportedTargets();
  }

  /**
   * Generate strategy report
   */
  generateReport(format = 'console') {
    if (format === 'json') {
      return JSON.stringify(this.strategy, null, 2);
    }

    if (format === 'markdown') {
      return this.generateMarkdownReport();
    }

    return this.generateConsoleReport();
  }

  generateConsoleReport() {
    let output = '\n';
    output += '═══════════════════════════════════════════════════════════════\n';
    output += '                    MIGRATION STRATEGY                          \n';
    output += '═══════════════════════════════════════════════════════════════\n\n';

    output += '🎯 MIGRATION PATH\n';
    output += '───────────────────────────────────────────────────────────────\n';
    output += `   From: ${this.strategy.source}\n`;
    output += `   To:   ${this.strategy.target}\n`;
    output += `   Type: ${this.strategy.path ? this.strategy.path.type : 'Unknown'}\n\n`;

    if (this.strategy.risk) {
      output += '⚠️  RISK ASSESSMENT\n';
      output += '───────────────────────────────────────────────────────────────\n';
      output += `   Level:    ${this.strategy.risk.level}\n`;
      output += `   Score:    ${this.strategy.risk.score}/100\n`;
      output += `   Factors:  ${this.strategy.risk.factors.join(', ')}\n\n`;
    }

    output += '📝 MIGRATION STEPS\n';
    output += '───────────────────────────────────────────────────────────────\n';
    for (let i = 0; i < this.strategy.steps.length; i++) {
      const step = this.strategy.steps[i];
      output += `   ${i + 1}. [${step.priority}] ${step.title}\n`;
      output += `      ${step.description}\n`;
      if (step.affectedFiles) {
        output += `      Files: ${step.affectedFiles}\n`;
      }
      output += '\n';
    }

    if (this.strategy.warnings.length > 0) {
      output += '⚡ WARNINGS\n';
      output += '───────────────────────────────────────────────────────────────\n';
      for (const warning of this.strategy.warnings) {
        output += `   • ${warning}\n`;
      }
      output += '\n';
    }

    return output;
  }

  generateMarkdownReport() {
    let md = '# Migration Strategy\n\n';
    md += '## Migration Path\n\n';
    md += `- **From**: ${this.strategy.source}\n`;
    md += `- **To**: ${this.strategy.target}\n`;
    md += `- **Type**: ${this.strategy.path ? this.strategy.path.type : 'Unknown'}\n\n`;

    if (this.strategy.risk) {
      md += '## Risk Assessment\n\n';
      md += `- **Level**: ${this.strategy.risk.level}\n`;
      md += `- **Score**: ${this.strategy.risk.score}/100\n`;
      md += `- **Factors**: ${this.strategy.risk.factors.join(', ')}\n\n`;
    }

    md += '## Migration Steps\n\n';
    for (let i = 0; i < this.strategy.steps.length; i++) {
      const step = this.strategy.steps[i];
      md += `### ${i + 1}. [${step.priority}] ${step.title}\n\n`;
      md += `${step.description}\n\n`;
      if (step.code) {
        md += '```\n' + step.code + '\n```\n\n';
      }
    }

    if (this.strategy.warnings.length > 0) {
      md += '## Warnings\n\n';
      for (const warning of this.strategy.warnings) {
        md += `- ${warning}\n`;
      }
    }

    return md;
  }
}

module.exports = StrategyGenerator;
