type Props = {
  size?: number;
  flipping?: boolean;
};

// Uma moeda com dois lados: o da direita, o positivo, está sempre preenchido.
export default function Logo({ size = 32, flipping = false }: Props) {
  return (
    <svg
      className={flipping ? "moeda moeda-a-virar" : "moeda"}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <path d="M20 3a17 17 0 0 1 0 34z" fill="var(--ganga)" />
      <circle cx="20" cy="20" r="17" fill="none" stroke="var(--cafe)" strokeWidth="2.5" />
      <path
        d="M27.5 15.5v9M23 20h9"
        stroke="var(--papel)"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
