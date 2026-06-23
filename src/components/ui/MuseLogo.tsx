export default function MuseLogo({
  size = 80,
  withBackground = false,
}: {
  size?: number
  withBackground?: boolean
}) {
  if (withBackground) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="muse-bg" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B2FE0" />
            <stop offset="100%" stopColor="#4A1DB0" />
          </linearGradient>
          <clipPath id="muse-clip">
            <rect width="200" height="200" rx="46" />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width="200" height="200" rx="46" fill="url(#muse-bg)" />

        {/* "muse" text — clipped inside the rect */}
        <g clipPath="url(#muse-clip)">
          <text
            x="12"
            y="132"
            fontFamily="'Nunito', -apple-system, 'Helvetica Neue', Arial, sans-serif"
            fontSize="72"
            fontWeight="800"
            letterSpacing="-1"
            fill="white"
          >
            muse
          </text>
        </g>

        {/* dot accent — positioned top-right, inside the square */}
        <circle cx="177" cy="56" r="10" fill="white" />
      </svg>
    )
  }

  // Wordmark only (transparent background) — for use on dark backgrounds
  return (
    <svg
      width={size * 2.6}
      height={size * 0.7}
      viewBox="0 0 260 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="56"
        fontFamily="'Nunito', -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="62"
        fontWeight="800"
        letterSpacing="-1"
        fill="white"
      >
        muse
      </text>
      <circle cx="248" cy="14" r="8" fill="white" />
    </svg>
  )
}
