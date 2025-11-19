/**
 * Help Text Content for Activity Definitions
 *
 * This file contains all help text, definitions, examples, and edge cases
 * for activity tracking and income requirements. All content is derived from
 * HR1 Section 71119 and the CFA Service Blueprint.
 *
 * Content is written in plain language (8th grade reading level) to ensure
 * accessibility for all Medicaid beneficiaries.
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Edge case example showing a specific scenario and whether it counts
 */
export interface EdgeCaseExample {
  scenario: string;
  counts: boolean | "varies";
  explanation: string;
}

/**
 * Activity definition with examples and edge cases
 */
export interface ActivityDefinition {
  title: string;
  definition: string;
  examples: string[];
  counterExamples: string[];
  edgeCases: EdgeCaseExample[];
  source: string;
}

/**
 * Income definition section
 */
export interface IncomeDefinition {
  title: string;
  definition: string;
  calculation?: string;
  whatCounts?: {
    title: string;
    description: string;
    examples: string[];
  };
  whatDoesNotCount?: {
    title: string;
    description: string;
    examples: string[];
  };
  whoQualifies?: string;
  howToCalculate?: string[];
  example?: {
    scenario: string;
    calculation: string;
    result: string;
  };
  options?: Array<{
    option: string;
    description: string;
    benefit: string;
  }>;
  note?: string;
  edgeCases?: EdgeCaseExample[];
  source: string;
}

/**
 * Dashboard guidance step
 */
export interface DashboardGuidanceStep {
  icon: string;
  text: string;
  action: string | null;
}

/**
 * Combination rules for activities
 */
export interface CombinationRules {
  title: string;
  definition: string;
  examples: string[];
  note: string;
  source: string;
}

/**
 * Dashboard guidance content
 */
export interface DashboardGuidance {
  title: string;
  steps: DashboardGuidanceStep[];
}

// ============================================================================
// Activity Definitions
// ============================================================================

export const activityDefinitions: Record<string, ActivityDefinition> = {
  work: {
    title: "Work (Paid Employment)",
    definition: "Paid employment where you work at least 80 hours per month.",
    examples: [
      "Full-time or part-time job",
      "Multiple part-time jobs that total 80+ hours",
      "Gig work (Uber, DoorDash, etc.) if you work 80+ hours",
      "Self-employment if you work 80+ hours",
    ],
    counterExamples: [
      "Job searching or applying for jobs",
      "Unpaid internships",
      "Work under 80 hours per month (unless combined with other activities)",
    ],
    edgeCases: [
      {
        scenario: "I work 60 hours at one job and 20 hours at another",
        counts: true,
        explanation:
          "Yes! You can combine hours from multiple jobs. 60 + 20 = 80 hours total.",
      },
      {
        scenario: "I spend 80 hours per month looking for a job",
        counts: false,
        explanation:
          "No. Job searching does NOT count as a qualifying activity. You need to volunteer, go to school, or join a work program instead.",
      },
      {
        scenario: "I do gig work but my hours vary each month",
        counts: true,
        explanation:
          "Yes, as long as you work at least 80 hours in the month you're reporting. Track your hours carefully.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(A)",
  },

  volunteer: {
    title: "Volunteer (Community Service)",
    definition:
      "Unpaid community service where you volunteer at least 80 hours per month.",
    examples: [
      "Volunteering at a food bank",
      "Helping at a community center",
      "Volunteering at a school or library",
      "Community cleanup or service projects",
    ],
    counterExamples: [
      "Informal help for friends or family",
      "Volunteering less than 80 hours per month (unless combined with other activities)",
    ],
    edgeCases: [
      {
        scenario: "I volunteer 40 hours and work 40 hours",
        counts: true,
        explanation:
          "Yes! You can combine volunteer hours with work hours. 40 + 40 = 80 hours total.",
      },
      {
        scenario: "I help my neighbor with yard work",
        counts: false,
        explanation:
          "No. Informal help for friends or family doesn't count. You need to volunteer with an organization.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(B)",
  },

  education: {
    title: "Education (School Enrollment)",
    definition: "Enrolled at least half-time in an educational program.",
    examples: [
      "Community college (6+ credit hours)",
      "University or 4-year college (6+ credit hours)",
      "Trade school or vocational training",
      "Career and technical education programs",
      "GED or adult education programs (half-time or more)",
    ],
    counterExamples: [
      "Online courses that aren't part of a formal program",
      "Less than half-time enrollment",
      "Informal learning or self-study",
    ],
    edgeCases: [
      {
        scenario: "I'm taking 2 classes (6 credit hours) at community college",
        counts: true,
        explanation:
          "Yes! 6 credit hours is typically considered half-time enrollment.",
      },
      {
        scenario: "I'm taking one online course for personal interest",
        counts: false,
        explanation:
          "No. The course must be part of a formal educational program and you must be enrolled at least half-time.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(D) and (xx)(9)(B)",
  },

  workProgram: {
    title: "Work Program (Job Training)",
    definition:
      "Participating in a job training or workforce development program for at least 80 hours per month.",
    examples: [
      "SNAP Employment & Training (E&T) program",
      "TANF work program",
      "Workforce development programs",
      "Job training or apprenticeship programs",
      "Vocational rehabilitation programs",
    ],
    counterExamples: [
      "Informal job training",
      "Programs less than 80 hours per month (unless combined with other activities)",
    ],
    edgeCases: [
      {
        scenario: "I'm in a SNAP E&T program for 80 hours per month",
        counts: true,
        explanation:
          "Yes! SNAP E&T and similar workforce programs count as work programs.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(C) and (xx)(9)(D)",
  },
};

// ============================================================================
// Income Definitions
// ============================================================================

export const incomeDefinitions: Record<string, IncomeDefinition> = {
  threshold: {
    title: "Income Threshold",
    definition:
      "If you earn at least $580 per month, you automatically meet work requirements without tracking hours.",
    calculation: "$580 = 80 hours × $7.25 (federal minimum wage)",
    whatCounts: {
      title: "What Types of Income Count?",
      description:
        "Only earned income from working counts toward the $580 threshold.",
      examples: [
        "Wages from a job (W-2 income)",
        "Self-employment income (1099 income)",
        "Tips and commissions from work",
        "Gig work earnings (Uber, DoorDash, etc.)",
        "Freelance or contract work income",
      ],
    },
    whatDoesNotCount: {
      title: "What Types of Income Do NOT Count?",
      description: "Unearned income does not count toward the $580 threshold.",
      examples: [
        "SSI (Supplemental Security Income)",
        "SSDI (Social Security Disability Insurance)",
        "Unemployment benefits",
        "Child support payments",
        "Gifts or loans from family/friends",
        "Investment income or interest",
        "Rental income (unless it's your business)",
      ],
    },
    note: "Only earned income from work counts toward the $580 threshold. If you earn less than $580/month, you need to track your hours.",
    edgeCases: [
      {
        scenario: "I earn $600 per month from my job",
        counts: true,
        explanation:
          "Yes! Since you earn more than $580/month, you automatically meet work requirements. You don't need to track hours.",
      },
      {
        scenario: "I earn $400 from work and $200 from unemployment",
        counts: false,
        explanation:
          "No. Only the $400 from work counts. Unemployment benefits don't count. Since $400 is less than $580, you need to track your work hours or do other activities.",
      },
      {
        scenario:
          "I do gig work and my income varies. Some months I earn $700, other months $400",
        counts: "varies",
        explanation:
          "It depends on the month. In months where you earn $580 or more, you meet requirements. In months under $580, you need to track hours or qualify as a seasonal worker.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(F)",
  },

  seasonalWorker: {
    title: "Seasonal Workers",
    definition:
      "If you're a seasonal worker, your income is averaged over the past 6 months instead of just one month.",
    whoQualifies:
      "You may be a seasonal worker if your income varies significantly by season (e.g., farm work, holiday retail, summer tourism).",
    calculation:
      "Average monthly income over past 6 months must be at least $580",
    howToCalculate: [
      "Add up your total income from the past 6 months",
      "Divide by 6 to get your average monthly income",
      "If the average is $580 or more, you meet requirements",
    ],
    example: {
      scenario: "You earned $3,480 over the past 6 months",
      calculation: "$3,480 ÷ 6 months = $580 per month average",
      result: "You meet work requirements as a seasonal worker",
    },
    edgeCases: [
      {
        scenario:
          "I work at a ski resort and only earn income 4 months per year",
        counts: true,
        explanation:
          "Yes! As a seasonal worker, your income is averaged over 6 months. If your 6-month average is $580 or more, you meet requirements.",
      },
      {
        scenario:
          "I earned $4,000 in the summer but nothing the rest of the year",
        counts: "varies",
        explanation:
          "It depends on your 6-month average. If $4,000 ÷ 6 = $667/month average, you meet requirements. But you need to recalculate every 6 months.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(G)",
  },

  incomeVsHours: {
    title: "Income OR Hours - You Choose",
    definition:
      "You can meet work requirements in two ways: earn $580/month OR track 80 hours/month of activities.",
    options: [
      {
        option: "Option 1: Income",
        description: "Earn at least $580 per month from work",
        benefit: "No need to track hours",
      },
      {
        option: "Option 2: Hours",
        description:
          "Track 80 hours per month of work, volunteer, education, or work programs",
        benefit: "Counts even if you earn less than $580",
      },
    ],
    note: "You only need to meet ONE of these requirements, not both.",
    edgeCases: [
      {
        scenario: "I work 100 hours per month but only earn $400",
        counts: true,
        explanation:
          "Yes! You meet requirements because you have 80+ hours, even though your income is under $580.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)",
  },

  gigEconomy: {
    title: "Gig Economy Workers",
    definition:
      "If you work for gig economy platforms like Uber, DoorDash, or Instacart, your income counts toward the $580 threshold.",
    whatCounts: {
      title: "What Gig Work Counts?",
      description:
        "Earnings from gig economy platforms count as earned income.",
      examples: [
        "Uber or Lyft driving",
        "DoorDash, Uber Eats, or Grubhub delivery",
        "Instacart shopping",
        "TaskRabbit tasks",
        "Fiverr or Upwork freelancing",
        "Other app-based gig work",
      ],
    },
    note: "Track your income from all gig platforms. If you earn $580 or more per month total, you meet requirements.",
    edgeCases: [
      {
        scenario: "I drive for Uber and made $650 this month",
        counts: true,
        explanation:
          "Yes! Since you earned more than $580 from gig work, you automatically meet work requirements.",
      },
      {
        scenario:
          "I do DoorDash but my income varies. Some months $700, some $400",
        counts: "varies",
        explanation:
          "It depends on the month. In months where you earn $580 or more, you meet requirements. In months under $580, you may need to track hours or qualify as a seasonal worker.",
      },
      {
        scenario: "I work for multiple gig apps. Do I add them together?",
        counts: true,
        explanation:
          "Yes! Add up all your gig work income. If the total is $580 or more, you meet requirements.",
      },
    ],
    source: "HR1 Section 71119(xx)(2)(F)",
  },
};

// ============================================================================
// Combination Rules
// ============================================================================

export const combinationRules: CombinationRules = {
  title: "Combining Activities",
  definition:
    "You can combine different activities to reach 80 hours per month.",
  examples: [
    "40 hours work + 40 hours volunteer = 80 hours ✓",
    "60 hours work + 20 hours education = 80 hours ✓",
    "30 hours work + 30 hours volunteer + 20 hours work program = 80 hours ✓",
  ],
  note: "The total must equal at least 80 hours per month.",
  source: "HR1 Section 71119(xx)(2)(E)",
};

// ============================================================================
// Dashboard Guidance
// ============================================================================

export const dashboardGuidance: DashboardGuidance = {
  title: "Getting Started",
  steps: [
    {
      icon: "compass",
      text: "Decide how you want to use HourKeep, log hours, income, or seasonal income",
      action: null,
    },
    {
      icon: "add",
      text: "Click + on the bottom right to add your monthly hours or income",
      action: null,
    },
    {
      icon: "download",
      text: "Export and share your data with your state Medicaid agency",
      action: null,
    },
  ],
};

// ============================================================================
// Verification Documents Help
// ============================================================================

export interface DocumentVerificationHelp {
  title: string;
  definition: string;
  why: string;
  workExamples: string[];
  volunteerExamples: string[];
  educationExamples: string[];
  incomeExamples: string[];
  gigWorkExamples: string[];
  tips: string[];
  gigWorkTips: string[];
  note: string;
}

export const documentVerificationHelp: DocumentVerificationHelp = {
  title: "Verification Documents",
  definition:
    "Documents that prove you completed work, volunteer, or education activities, or that verify your income.",
  why: "Your state Medicaid agency may ask for proof that you met the 80-hour requirement or the $580 income threshold. Having documents ready makes it easier to verify your hours or income.",
  workExamples: [
    "Pay stubs showing hours worked",
    "Timesheet or work schedule",
    "Letter from your employer confirming hours",
    "Self-employment records (invoices, receipts)",
    "Gig work app screenshots showing completed hours",
  ],
  volunteerExamples: [
    "Letter from the organization where you volunteer",
    "Signed timesheet from volunteer coordinator",
    "Certificate of volunteer service",
    "Email confirmation of volunteer hours",
  ],
  educationExamples: [
    "Class schedule showing you're enrolled",
    "Letter from school saying you're enrolled",
    "Transcript or grade report",
    "Tuition receipt or financial aid papers",
  ],
  incomeExamples: [
    "Pay stubs showing income amount",
    "Bank statements showing deposits from work",
    "1099 forms for self-employment or contract work",
    "Self-employment records (invoices, receipts, payment confirmations)",
    "Payment platform screenshots (PayPal, Venmo, Cash App for business)",
  ],
  gigWorkExamples: [
    "Uber or Lyft earnings summary from the app",
    "DoorDash weekly payment summary screenshot",
    "Instacart payment history from the app",
    "TaskRabbit earnings report",
    "Fiverr or Upwork payment confirmations",
    "Any gig platform's earnings dashboard screenshot",
  ],
  tips: [
    "Take a clear photo of the whole document",
    "Make sure you can read all the text",
    "Include the date and your name if you can see them",
    "You can add more than one document for each activity or income entry",
  ],
  gigWorkTips: [
    "Screenshot your earnings dashboard from the app",
    "Make sure the screenshot shows the date and total amount",
    "Include weekly or monthly summaries if available",
    "Capture payment confirmations or deposit notifications",
    "If you work for multiple apps, document each one separately",
  ],
  note: "Documents are optional but we recommend them. They stay private on your device. You only share them when you export your data.",
};
