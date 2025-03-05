
import { SocialProfile } from "../../types";

interface SocialProfilesProps {
  profiles: SocialProfile[];
}

export const SocialProfiles = ({ profiles }: SocialProfilesProps) => {
  return (
    <section>
      <h3 className="font-medium text-gray-900 mb-2">Social Profiles</h3>
      <div className="space-y-2">
        {profiles.map((profile, i) => (
          <div key={i} className="flex items-start">
            <span className="text-gray-500 w-24 capitalize">{profile.network}:</span>
            <a 
              href={profile.url.startsWith('http') ? profile.url : `https://${profile.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B5CF6] hover:underline"
            >
              {profile.username}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
