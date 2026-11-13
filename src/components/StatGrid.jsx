import StatCounter from './StatCounter'
import { STATS } from '../data/credentials'

export default function StatGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
      {STATS.map((s) => (
        <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
      ))}
    </div>
  )
}
