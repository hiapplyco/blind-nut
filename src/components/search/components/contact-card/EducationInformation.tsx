
import { Education } from "../../types";

interface EducationInformationProps {
  education: Education[];
}

export const EducationInformation = ({ education }: EducationInformationProps) => {
  return (
    <section>
      <h3 className="font-medium text-gray-900 mb-2">Education</h3>
      <div className="space-y-3">
        {education.map((edu, i) => (
          <div key={i} className="border-l-2 border-[#8B5CF6] pl-3">
            <p className="font-medium">{edu.school}</p>
            {edu.degree && <p className="text-sm">{edu.degree}</p>}
            {edu.field_of_study && <p className="text-sm">{edu.field_of_study}</p>}
            {(edu.start_date || edu.end_date) && (
              <p className="text-xs text-gray-500">
                {edu.start_date && edu.start_date}{edu.start_date && edu.end_date && ' - '}{edu.end_date && edu.end_date}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
