export interface MarkdownFile {
  frontmatter: {
    title: string;
    priority?: string;
    requirements?: string;
    timeCommitment?: string;
    about?: string;
    startDate?: string;
    duration?: string;
    teamSize?: string;
    responsibilities?: string;
    applyNow?: string;
    responsibilitiesHeading?: string;
    requirementsHeading?: string;
    [key: string]: any;
  };
  default: string;
}

