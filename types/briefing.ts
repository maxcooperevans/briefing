export interface Competitor {
  name: string;
  description: string;
}

export interface Risk {
  title: string;
  explanation: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Briefing {
  company: string;
  oneLiner: string;
  businessModel: string;
  marketMap: (Competitor | string)[];
  keyRisks: (Risk | string)[];
  investorAngle: string;
  swot: SWOT;
}
