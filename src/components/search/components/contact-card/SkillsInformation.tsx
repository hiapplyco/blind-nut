
interface SkillsInformationProps {
  skills: string[];
}

export const SkillsInformation = ({ skills }: SkillsInformationProps) => {
  return (
    <section>
      <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
      <div className="flex flex-wrap gap-1">
        {skills.map((skill, i) => (
          <span key={i} className="bg-[#FEF7CD] px-2 py-1 rounded text-sm border border-black">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
};
