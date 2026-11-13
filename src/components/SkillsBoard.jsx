import SkillChip from './SkillChip'
import { SKILLS } from '../data/credentials'

export default function SkillsBoard() {
  return (
    <div className="flex flex-wrap gap-3">
      {SKILLS.map((s) => (
        <SkillChip key={s.name} name={s.name} level={s.level} tools={s.tools} />
      ))}
    </div>
  )
}
