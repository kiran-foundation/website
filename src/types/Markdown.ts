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
    cards?: any;
    url?: any;
    summary?: string
    date?: string
    featured_image?: string
    link?: string
    content?:string
    impact?: string
    quote?: string
    roleType?: string
  };
  default: string;
}

