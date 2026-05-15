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

export interface Force {
  rating: 'Low' | 'Medium' | 'High';
  explanation: string;
}

export interface FiveForces {
  competitiveRivalry: Force;
  threatOfNewEntrants: Force;
  bargainingPowerOfSuppliers: Force;
  bargainingPowerOfBuyers: Force;
  threatOfSubstitutes: Force;
}

export interface Briefing {
  company: string;
  oneLiner: string;
  businessModel: string;
  marketMap: (Competitor | string)[];
  keyRisks: (Risk | string)[];
  investorAngle: string;
  fiveForces: FiveForces;
  swot: SWOT;
}
