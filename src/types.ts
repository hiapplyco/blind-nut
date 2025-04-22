
// Profile and enriched data types for the application

export interface Profile {
  name: string;
  title?: string;
  location?: string;
  profile_name: string;
  profile_title?: string;
  profile_location?: string;
  profile_url: string;
  relevance_score?: number;
  snippet?: string;
}

export interface Education {
  school?: string;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  field?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
}

export interface Experience {
  title: string;
  company?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  description?: string;
}

export interface Language {
  language: string;
  proficiency?: string;
}

export interface SocialProfile {
  network: string;
  url: string;
  username?: string;
}

export interface EnrichedProfileData {
  name?: string;
  work_email?: string;
  personal_emails?: string[];
  mobile_phone?: string;
  phone_numbers?: string[];
  job_company_name?: string;
  company?: string;
  company_size?: string;
  industry?: string;
  job_title?: string;
  title?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  languages?: Language[];
  social_profiles?: SocialProfile[];
  profiles?: SocialProfile[];
  profile?: Profile;
}
