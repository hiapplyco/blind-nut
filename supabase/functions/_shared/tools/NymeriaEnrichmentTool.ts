import { BaseTool, Tool, ToolDefinition } from "../agents/Agent.ts";

interface NymeriaResponse {
  data?: {
    emails?: Array<{ email: string; type: string }>;
    phoneNumbers?: Array<{ number: string; type: string }>;
    socialProfiles?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    currentEmployment?: {
      companyName?: string;
      title?: string;
      startDate?: string;
    };
  };
  error?: string;
}

export class NymeriaEnrichmentTool extends BaseTool implements Tool {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  definition: ToolDefinition = {
    name: 'nymeria_enrichment',
    description: 'Enrich LinkedIn profiles with contact information using Nymeria API',
    parameters: {
      linkedinUrl: {
        type: 'string',
        description: 'LinkedIn profile URL to enrich',
        required: true
      }
    }
  };

  async execute(params: any): Promise<any> {
    this.validateParams(params);

    const { linkedinUrl } = params;

    try {
      // Extract profile ID from LinkedIn URL
      const profileId = this.extractProfileId(linkedinUrl);
      
      if (!profileId) {
        return {
          success: false,
          error: 'Invalid LinkedIn URL format'
        };
      }

      // Make request to Nymeria API
      const response = await fetch('https://www.nymeria.io/api/v4/person/enrich', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: linkedinUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Nymeria API error: ${response.statusText}`);
      }

      const data: NymeriaResponse = await response.json();

      if (data.error) {
        return {
          success: false,
          error: data.error
        };
      }

      // Format the enriched data
      return {
        success: true,
        enrichedData: {
          emails: data.data?.emails || [],
          phoneNumbers: data.data?.phoneNumbers || [],
          socialProfiles: data.data?.socialProfiles || {},
          location: data.data?.location || {},
          currentEmployment: data.data?.currentEmployment || {},
          linkedinUrl
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Enrichment failed'
      };
    }
  }

  private extractProfileId(url: string): string | null {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : null;
  }
}