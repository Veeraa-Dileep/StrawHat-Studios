const PATHS = {
  spark: <path d="M12 2v6m0 8v6m10-10h-6M8 12H2m15.5-6.5-4 4m-7 7-4 4m15 0-4-4m-7-7-4-4" />,
  build: <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />,
  code: <path d="M8 6l-6 6 6 6m8-12l6 6-6 6" />,
  book: <path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2zM4 5v14" />,
  trophy: <path d="M8 4h8v4a4 4 0 01-8 0zM8 6H4v2a3 3 0 003 3m8-5h4v2a3 3 0 01-3 3m-5 5v4m-3 3h6" />,
  star: <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1z" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6z" />,
  gauge: <path d="M4 18a8 8 0 1116 0M12 14l4-4" />,
}

export default function Icon({ name, className = '', size = 20, animated = false }) {
  const path = PATHS[name] || PATHS.spark
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      data-icon={animated ? 'draw' : undefined}
    >
      {path}
    </svg>
  )
}
