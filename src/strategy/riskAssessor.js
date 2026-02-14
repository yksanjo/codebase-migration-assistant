/**
 * Risk Assessor - evaluates migration complexity and potential issues
 */

/**
 * Assess migration risk
 */
function assess(analysis, target, path) {
  let score = 0;
  const factors = [];

  // Base risk from difficulty
  const difficultyScores = {
    'easy': 10,
    'medium': 30,
    'hard': 60
  };
  score += difficultyScores[path.difficulty] || 30;
  factors.push(`Migration type: ${path.difficulty}`);

  // Code size factor
  const totalLines = analysis.complexity?.totalLines || 0;
  if (totalLines > 10000) {
    score += 20;
    factors.push('Large codebase (>10K lines)');
  } else if (totalLines > 5000) {
    score += 10;
    factors.push('Medium codebase (>5K lines)');
  }

  // Dependency factor
  const depCount = analysis.dependencies?.length || 0;
  if (depCount > 50) {
    score += 15;
    factors.push('Many dependencies (>50)');
  } else if (depCount > 20) {
    score += 5;
    factors.push('Moderate dependencies (>20)');
  }

  // Framework-specific risks
  const source = path.source;
  const targetLower = target.toLowerCase();

  if (source.toLowerCase().includes('express') && targetLower.includes('fastify')) {
    const hasMiddleware = analysis.dependencies?.some(d => 
      d.name.includes('express') || d.name.includes('middleware')
    );
    if (hasMiddleware) {
      score += 10;
      factors.push('Custom middleware may need rewriting');
    }
  }

  if (source.toLowerCase().includes('jquery')) {
    const jqueryUsage = analysis.dependencies?.find(d => d.name.toLowerCase().includes('jquery'));
    if (jqueryUsage && jqueryUsage.usageCount > 100) {
      score += 15;
      factors.push('Heavy jQuery usage requires significant refactoring');
    }
  }

  if (source.toLowerCase().includes('react') && targetLower.includes('functional')) {
    const classComponents = countClassComponents(analysis);
    if (classComponents > 10) {
      score += 10;
      factors.push(`${classComponents} class components to convert`);
    }
  }

  // Calculate risk level
  let level;
  if (score < 20) {
    level = 'Low';
  } else if (score < 50) {
    level = 'Medium';
  } else {
    level = 'High';
  }

  return {
    score: Math.min(score, 100),
    level,
    factors,
    recommendations: getRecommendations(score, path)
  };
}

/**
 * Count class components in React code
 */
function countClassComponents(analysis) {
  if (!analysis.structure) return 0;

  let count = 0;
  for (const file of analysis.structure) {
    if (file.ast && file.ast.classes) {
      count += file.ast.classes.length;
    }
  }
  return count;
}

/**
 * Get risk-based recommendations
 */
function getRecommendations(score, path) {
  const recommendations = [];

  if (score > 50) {
    recommendations.push('Consider breaking migration into smaller phases');
    recommendations.push('Set up comprehensive test coverage before starting');
  }

  if (path.difficulty === 'hard') {
    recommendations.push('Hire or consult with experts in the target technology');
    recommendations.push('Plan for longer migration timeline');
  }

  if (path.tools && path.tools.length > 0) {
    recommendations.push(`Recommended tools: ${path.tools.join(', ')}`);
  }

  recommendations.push('Create a rollback plan before starting');
  recommendations.push('Communicate timeline changes to stakeholders');

  return recommendations;
}

/**
 * Get migration warnings
 */
function getWarnings(analysis, target) {
  const warnings = [];
  const targetLower = target.toLowerCase();

  // Check for incompatible dependencies
  if (analysis.dependencies) {
    const incompatibleMap = {
      'fastify': ['express', 'koa', 'hapi'],
      'typescript': [],
      'react functional': ['react-class']
    };

    const incompatible = incompatibleMap[targetLower] || [];

    for (const dep of analysis.dependencies) {
      for (const inc of incompatible) {
        if (dep.name.toLowerCase().includes(inc)) {
          warnings.push(`${dep.name} may not be compatible with ${target}`);
        }
      }
    }
  }

  // Check for deprecated patterns
  if (targetLower.includes('react') && targetLower.includes('functional')) {
    const hasClassComponents = countClassComponents(analysis) > 0;
    if (hasClassComponents) {
      warnings.push('Class components need to be converted to functional components with hooks');
    }
  }

  if (targetLower.includes('typescript')) {
    const jsFiles = analysis.files?.filter(f => f.language === 'javascript').length || 0;
    if (jsFiles > 0) {
      warnings.push(`${jsFiles} JavaScript files will need type annotations`);
    }
  }

  return warnings;
}

module.exports = {
  assess,
  getWarnings,
  getRecommendations
};
