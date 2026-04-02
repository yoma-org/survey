// Diagnostic Framework — dual-axis tagging for every statement
// Axis A: 3 Key Relationships (where the problem lives)
// Axis B: 5 Pillars + Dimensions (what the problem is)

export type Relationship = 'colleagues' | 'job' | 'management';

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  colleagues: 'Colleagues (Horizontal Trust)',
  job: 'Their Job (Task Reality)',
  management: 'Their Management (Vertical Trust)',
};

export const RELATIONSHIP_LABELS_MY: Record<Relationship, string> = {
  colleagues: 'လုပ်ဖော်ကိုင်ဖက်များ (အလျားလိုက်ယုံကြည်မှု)',
  job: '၎င်းတို့၏အလုပ် (လုပ်ငန်းတကယ်)',
  management: '၎င်းတို့၏စီမံခန့်ခွဲမှု (ဒေါင်လိုက်ယုံကြည်မှု)',
};

export function getRelationshipLabels(locale: string): Record<Relationship, string> {
  return locale === 'my' ? RELATIONSHIP_LABELS_MY : RELATIONSHIP_LABELS;
}

export const RELATIONSHIP_DESCRIPTIONS: Record<Relationship, string> = {
  colleagues: 'Measures peer survival. Does the employee feel a sense of belonging and mutual support with their peers?',
  job: 'Measures the daily grind. Does the work have meaning, is the workload sane, and do they have the tools to actually do it?',
  management: 'Measures leadership accountability. Do leaders communicate well, act with integrity, and create an environment where people feel safe and recognized?',
};

// Map every question ID to its relationship axis
export const QUESTION_RELATIONSHIP_MAP: Record<string, Relationship> = {
  // Camaraderie → mostly Colleagues
  'CAM-01': 'colleagues',
  'CAM-02': 'colleagues',
  'CAM-03': 'colleagues',
  'CAM-04': 'colleagues',
  'CAM-05': 'colleagues',
  'CAM-06': 'management', // approaching manager
  'CAM-07': 'management', // welcomed when joined
  'CAM-08': 'job',        // fun working here

  // Credibility → mostly Management
  'CRE-09': 'management',
  'CRE-10': 'management',
  'CRE-11': 'management', // trusted with responsibility
  'CRE-12': 'management',
  'CRE-13': 'management',
  'CRE-14': 'job',        // clear about success in role
  'CRE-15': 'management',
  'CRE-16': 'job',        // secure in role
  'CRE-17': 'management',

  // Fairness → mixed
  'FAI-18': 'colleagues',  // treated fairly regardless
  'FAI-19': 'job',         // compensated fairly
  'FAI-20': 'management',  // concern taken seriously
  'FAI-21': 'management',  // same support from manager
  'FAI-22': 'management',  // opportunity for recognition
  'FAI-23': 'colleagues',  // full member regardless of position
  'FAI-24': 'job',         // workload reasonable
  'FAI-25': 'management',  // policies enforced consistently

  // Pride → mostly Job
  'PRI-26': 'job',         // customers rate excellent
  'PRI-27': 'job',         // sense of pride
  'PRI-28': 'job',         // adapt to changes
  'PRI-29': 'job',         // want to work long time
  'PRI-30': 'job',         // special meaning
  'PRI-31': 'colleagues',  // endorse to friends
  'PRI-32': 'colleagues',  // proud to tell others
  'PRI-33': 'colleagues',  // contribute to community
  'PRI-34': 'job',         // make a difference
  'PRI-35': 'job',         // recommend products

  // Respect → mixed
  'RES-36': 'job',         // tools and resources
  'RES-37': 'management',  // appreciated and valued
  'RES-38': 'management',  // encouraged to share ideas
  'RES-39': 'job',         // meaningful benefits
  'RES-40': 'job',         // time off when necessary
  'RES-41': 'job',         // work-life balance
  'RES-42': 'management',  // training offered
  'RES-43': 'management',  // appreciated for extra effort
  'RES-44': 'management',  // encouraged to try new approaches
  'RES-45': 'management',  // asked for input
  'RES-46': 'job',         // psychologically healthy

  // Uncategorized
  'UNC-47': 'job',         // great place to work (overall)
};

// ENPS statements — the two specific ones for loyalty metric
export const ENPS_STATEMENT_IDS = ['PRI-31', 'PRI-35'] as const;
// PRI-31: "I would strongly endorse my company to friends and family as a great place to work."
// PRI-35: "I would recommend our products and services to family and friends."

// Sub-pillar dimension descriptions
export const PILLAR_DIMENSIONS: Record<string, { description: string; subPillars: { name: string; description: string }[] }> = {
  camaraderie: {
    description: 'Are we just coworkers or a community?',
    subPillars: [
      { name: 'Community', description: 'Sense of team and celebration' },
      { name: 'Hospitality', description: 'Welcoming and enjoyable environment' },
      { name: 'Intimacy', description: 'Personal connections and authenticity' },
    ],
  },
  credibility: {
    description: 'Do we actually believe our leaders?',
    subPillars: [
      { name: 'Communication', description: 'Transparency and being kept in the loop' },
      { name: 'Competence', description: 'Clear goals and smart organization' },
      { name: 'Integrity', description: 'Walking the talk and trusting employees' },
    ],
  },
  fairness: {
    description: 'Is the playing field level?',
    subPillars: [
      { name: 'Justice', description: 'Consistent rules and fair problem resolution' },
      { name: 'Equity', description: 'Fair pay, recognition, and workload' },
      { name: 'Impartiality', description: 'Equal treatment regardless of background or rank' },
    ],
  },
  pride: {
    description: 'Does the work matter?',
    subPillars: [
      { name: 'Corporate Image', description: 'Pride in the brand and community impact' },
      { name: 'Team', description: 'Pride in the group output and adaptability' },
      { name: 'Personal Job', description: 'Finding personal meaning and longevity in the role' },
    ],
  },
  respect: {
    description: 'How do we treat the humans doing the work?',
    subPillars: [
      { name: 'Collaboration', description: 'Listening to ideas and recognizing effort' },
      { name: 'Support', description: 'Providing tools, training, and recognition needed' },
      { name: 'Caring', description: 'Respecting boundaries, protecting work-life balance' },
    ],
  },
};
