import AchievementCard from './AchievementCard'
import { ACHIEVEMENTS } from '../data/credentials'

export default function AchievementGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {ACHIEVEMENTS.map((a) => (
        <AchievementCard key={a.title} title={a.title} detail={a.detail} icon={a.icon} />
      ))}
    </div>
  )
}
