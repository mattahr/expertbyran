import type { Route } from "next";
import Link from "next/link";

import styles from "./CTAButton.module.css";

type Variant = "primary" | "secondary" | "outline";

type CTAButtonProps = {
  href: Route | string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  external = false,
}: CTAButtonProps) {
  const variantClass =
    variant === "primary" ? styles.primary : variant === "secondary" ? styles.secondary : styles.outline;
  const classes = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`;

  if (external) {
    return (
      <a href={href as string} className={classes} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href as Route} className={classes}>
      {children}
    </Link>
  );
}
