
import { Language } from "../../types";

interface LanguagesInformationProps {
  languages: Language[];
}

export const LanguagesInformation = ({ languages }: LanguagesInformationProps) => {
  return (
    <section>
      <h3 className="font-medium text-gray-900 mb-2">Languages</h3>
      <div className="flex flex-wrap gap-1">
        {languages.map((language, i) => (
          <span key={i} className="bg-[#F3E8FF] px-2 py-1 rounded text-sm border border-black">
            {language.language} {language.proficiency && `(${language.proficiency})`}
          </span>
        ))}
      </div>
    </section>
  );
};
