import Button from './Button'

/**
 * Project action buttons: Live Preview (primary) + optional GitHub (secondary).
 * Both open in a new tab with safe rel; GitHub only renders when a url is given.
 */
export default function ProjectActions({ name, url, github }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {url && (
        <Button
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open live preview of ${name}`}
        >
          Live Preview
        </Button>
      )}

      {github && (
        <Button
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          aria-label={`View ${name} source on GitHub`}
        >
          GitHub
        </Button>
      )}
    </div>
  )
}
