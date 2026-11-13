export default function MonoLabel({ children, className = '', as: Tag = 'span', ...props }) {
  return (
    <Tag
      className={`font-['JetBrains_Mono'] text-[0.75rem] tracking-[0.08em] uppercase leading-none ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
