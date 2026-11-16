type Props = {
  size?: number;
  flipping?: boolean;
};

// A moeda do lado positivo: toda azul, com o + ao centro, como na entrada.
export default function Logo({ size = 32, flipping = false }: Props) {
  return (
    <svg
      className={flipping ? "moeda moeda-a-virar" : "moeda"}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18.5" fill="var(--ganga)" />
      <path
        d="M20 12v16M12 20h16"
        stroke="var(--papel)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
