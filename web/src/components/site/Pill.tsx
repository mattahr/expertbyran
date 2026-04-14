import styles from "./Pill.module.css";

type PillVariant = "rust" | "marine" | "gold" | "neutral";

type PillProps = {
  children: React.ReactNode;
  variant?: PillVariant;
  className?: string;
};

export function Pill({ children, variant = "rust", className }: PillProps) {
  const variantClass = styles[variant];
  const classes = className ? `${styles.pill} ${variantClass} ${className}` : `${styles.pill} ${variantClass}`;
  return <span className={classes}>{children}</span>;
}
