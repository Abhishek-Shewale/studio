/**
 * Job role inference based on skills and experience
 */

export interface SkillRoleMapping {
  [key: string]: string[];
}

// Mapping of skills to potential job roles
const SKILL_ROLE_MAPPINGS: SkillRoleMapping = {
  // Frontend Development
  'react': ['Frontend Developer', 'React Developer', 'UI Developer'],
  'vue': ['Frontend Developer', 'Vue.js Developer', 'UI Developer'],
  'angular': ['Frontend Developer', 'Angular Developer', 'UI Developer'],
  'javascript': ['Frontend Developer', 'Full Stack Developer', 'Web Developer'],
  'typescript': ['Frontend Developer', 'Full Stack Developer', 'TypeScript Developer'],
  'html': ['Frontend Developer', 'Web Developer', 'UI Developer'],
  'css': ['Frontend Developer', 'Web Developer', 'UI Developer'],
  'sass': ['Frontend Developer', 'Web Developer', 'UI Developer'],
  'scss': ['Frontend Developer', 'Web Developer', 'UI Developer'],
  'tailwind': ['Frontend Developer', 'Web Developer', 'UI Developer'],
  'bootstrap': ['Frontend Developer', 'Web Developer', 'UI Developer'],
  'next.js': ['Frontend Developer', 'Full Stack Developer', 'React Developer'],
  'nuxt.js': ['Frontend Developer', 'Vue.js Developer'],
  'gatsby': ['Frontend Developer', 'React Developer'],
  'webpack': ['Frontend Developer', 'Web Developer'],
  'vite': ['Frontend Developer', 'Web Developer'],
  'redux': ['Frontend Developer', 'React Developer'],
  'mobx': ['Frontend Developer', 'React Developer'],
  'zustand': ['Frontend Developer', 'React Developer'],

  // Backend Development
  'node.js': ['Backend Developer', 'Full Stack Developer', 'Node.js Developer'],
  'express': ['Backend Developer', 'Full Stack Developer', 'Node.js Developer'],
  'fastify': ['Backend Developer', 'Full Stack Developer', 'Node.js Developer'],
  'koa': ['Backend Developer', 'Full Stack Developer', 'Node.js Developer'],
  'python': ['Backend Developer', 'Python Developer', 'Data Analyst', 'ML Engineer'],
  'django': ['Backend Developer', 'Python Developer', 'Django Developer'],
  'flask': ['Backend Developer', 'Python Developer', 'Flask Developer'],
  'fastapi': ['Backend Developer', 'Python Developer', 'API Developer'],
  'java': ['Backend Developer', 'Java Developer', 'Software Engineer'],
  'spring': ['Backend Developer', 'Java Developer', 'Spring Developer'],
  'spring boot': ['Backend Developer', 'Java Developer', 'Spring Boot Developer'],
  'c#': ['Backend Developer', 'C# Developer', '.NET Developer'],
  '.net': ['Backend Developer', '.NET Developer', 'C# Developer'],
  'asp.net': ['Backend Developer', '.NET Developer', 'C# Developer'],
  'php': ['Backend Developer', 'PHP Developer', 'Web Developer'],
  'laravel': ['Backend Developer', 'PHP Developer', 'Laravel Developer'],
  'symfony': ['Backend Developer', 'PHP Developer', 'Symfony Developer'],
  'ruby': ['Backend Developer', 'Ruby Developer', 'Full Stack Developer'],
  'rails': ['Backend Developer', 'Ruby Developer', 'Rails Developer'],
  'go': ['Backend Developer', 'Go Developer', 'Golang Developer'],
  'rust': ['Backend Developer', 'Rust Developer', 'Systems Developer'],
  'c++': ['Backend Developer', 'C++ Developer', 'Systems Developer'],
  'c': ['Backend Developer', 'C Developer', 'Systems Developer'],

  // Database
  'mysql': ['Backend Developer', 'Database Developer', 'Full Stack Developer'],
  'postgresql': ['Backend Developer', 'Database Developer', 'Full Stack Developer'],
  'mongodb': ['Backend Developer', 'Database Developer', 'Full Stack Developer'],
  'redis': ['Backend Developer', 'Database Developer', 'DevOps Engineer'],
  'sqlite': ['Backend Developer', 'Database Developer', 'Full Stack Developer'],
  'oracle': ['Backend Developer', 'Database Developer', 'Database Administrator'],
  'sql server': ['Backend Developer', 'Database Developer', 'Database Administrator'],
  'dynamodb': ['Backend Developer', 'Database Developer', 'AWS Developer'],
  'cassandra': ['Backend Developer', 'Database Developer', 'Big Data Engineer'],

  // Cloud & DevOps
  'aws': ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer'],
  'azure': ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer'],
  'gcp': ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer'],
  'docker': ['DevOps Engineer', 'Backend Developer', 'Cloud Engineer'],
  'kubernetes': ['DevOps Engineer', 'Cloud Engineer', 'Backend Developer'],
  'terraform': ['DevOps Engineer', 'Cloud Engineer', 'Infrastructure Engineer'],
  'jenkins': ['DevOps Engineer', 'CI/CD Engineer', 'Backend Developer'],
  'gitlab ci': ['DevOps Engineer', 'CI/CD Engineer', 'Backend Developer'],
  'github actions': ['DevOps Engineer', 'CI/CD Engineer', 'Backend Developer'],
  'ansible': ['DevOps Engineer', 'Infrastructure Engineer', 'Cloud Engineer'],

  // Mobile Development
  'react native': ['Mobile Developer', 'React Native Developer', 'Cross-platform Developer'],
  'flutter': ['Mobile Developer', 'Flutter Developer', 'Cross-platform Developer'],
  'swift': ['Mobile Developer', 'iOS Developer', 'Swift Developer'],
  'kotlin': ['Mobile Developer', 'Android Developer', 'Kotlin Developer'],
  'java android': ['Mobile Developer', 'Android Developer', 'Java Developer'],
  'objective-c': ['Mobile Developer', 'iOS Developer', 'Objective-C Developer'],
  'xamarin': ['Mobile Developer', 'Cross-platform Developer', 'Xamarin Developer'],
  'ionic': ['Mobile Developer', 'Cross-platform Developer', 'Ionic Developer'],

  // Data Science & ML
  'machine learning': ['Data Scientist', 'ML Engineer', 'Data Analyst'],
  'deep learning': ['Data Scientist', 'ML Engineer', 'AI Engineer'],
  'tensorflow': ['Data Scientist', 'ML Engineer', 'AI Engineer'],
  'pytorch': ['Data Scientist', 'ML Engineer', 'AI Engineer'],
  'scikit-learn': ['Data Scientist', 'ML Engineer', 'Data Analyst'],
  'pandas': ['Data Scientist', 'Data Analyst', 'Python Developer'],
  'numpy': ['Data Scientist', 'Data Analyst', 'Python Developer'],
  'matplotlib': ['Data Scientist', 'Data Analyst', 'Python Developer'],
  'seaborn': ['Data Scientist', 'Data Analyst', 'Python Developer'],
  'jupyter': ['Data Scientist', 'Data Analyst', 'ML Engineer'],
  'r': ['Data Scientist', 'Data Analyst', 'Statistician'],
  'spark': ['Data Engineer', 'Big Data Engineer', 'Data Scientist'],
  'hadoop': ['Data Engineer', 'Big Data Engineer', 'Data Scientist'],
  'kafka': ['Data Engineer', 'Backend Developer', 'Big Data Engineer'],

  // Testing
  'jest': ['Frontend Developer', 'Full Stack Developer', 'Test Engineer'],
  'cypress': ['Frontend Developer', 'Test Engineer', 'QA Engineer'],
  'selenium': ['Test Engineer', 'QA Engineer', 'Automation Engineer'],
  'junit': ['Backend Developer', 'Test Engineer', 'Java Developer'],
  'pytest': ['Backend Developer', 'Test Engineer', 'Python Developer'],
  'mocha': ['Frontend Developer', 'Test Engineer', 'JavaScript Developer'],
  'chai': ['Frontend Developer', 'Test Engineer', 'JavaScript Developer'],

  // Other Technologies
  'graphql': ['Backend Developer', 'Full Stack Developer', 'API Developer'],
  'rest api': ['Backend Developer', 'API Developer', 'Full Stack Developer'],
  'microservices': ['Backend Developer', 'Software Architect', 'Full Stack Developer'],
  'serverless': ['Backend Developer', 'Cloud Engineer', 'Full Stack Developer'],
  'blockchain': ['Blockchain Developer', 'Smart Contract Developer', 'Web3 Developer'],
  'solidity': ['Blockchain Developer', 'Smart Contract Developer', 'Web3 Developer'],
  'web3': ['Blockchain Developer', 'Web3 Developer', 'Smart Contract Developer'],
  'ethereum': ['Blockchain Developer', 'Smart Contract Developer', 'Web3 Developer'],
};

/**
 * Infer job role from skills and experience
 */
export function inferJobRole(skills: string[], experience?: Array<{ title: string; company: string; duration: string; description?: string }>): string | null {
  if (!skills || skills.length === 0) {
    return null;
  }

  // Normalize skills to lowercase for matching
  const normalizedSkills = skills.map(skill => skill.toLowerCase().trim());
  
  // Score each potential role based on skill matches
  const roleScores: { [role: string]: number } = {};
  
  // Check each skill against role mappings
  normalizedSkills.forEach(skill => {
    Object.entries(SKILL_ROLE_MAPPINGS).forEach(([skillKey, roles]) => {
      if (skill.includes(skillKey) || skillKey.includes(skill)) {
        roles.forEach(role => {
          roleScores[role] = (roleScores[role] || 0) + 1;
        });
      }
    });
  });

  // If we have experience, boost roles that match recent job titles
  if (experience && experience.length > 0) {
    const recentTitle = experience[0].title.toLowerCase();
    Object.keys(roleScores).forEach(role => {
      if (recentTitle.includes(role.toLowerCase()) || role.toLowerCase().includes(recentTitle)) {
        roleScores[role] = (roleScores[role] || 0) + 2; // Boost score for title matches
      }
    });
  }

  // Find the role with the highest score
  const sortedRoles = Object.entries(roleScores)
    .sort(([, a], [, b]) => b - a);

  if (sortedRoles.length === 0) {
    return null;
  }

  // Return the top role, but only if it has a reasonable score
  const [topRole, score] = sortedRoles[0];
  return score >= 1 ? topRole : null;
}

/**
 * Get all possible roles for a given set of skills
 */
export function getPossibleRoles(skills: string[]): string[] {
  if (!skills || skills.length === 0) {
    return [];
  }

  const normalizedSkills = skills.map(skill => skill.toLowerCase().trim());
  const possibleRoles = new Set<string>();
  
  normalizedSkills.forEach(skill => {
    Object.entries(SKILL_ROLE_MAPPINGS).forEach(([skillKey, roles]) => {
      if (skill.includes(skillKey) || skillKey.includes(skill)) {
        roles.forEach(role => possibleRoles.add(role));
      }
    });
  });

  return Array.from(possibleRoles);
}
