"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/admin/admin.module.css";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      if (res.status === 429) setError("För många försök. Vänta en stund och försök igen.");
      else if (res.status === 503) setError("Admin är inte konfigurerad (saknar lösenord).");
      else setError("Fel användarnamn eller lösenord.");
    } catch {
      setError("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.loginCard} onSubmit={onSubmit}>
      <h1 className={styles.loginTitle}>Logga in</h1>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="username">
          Användarnamn
        </label>
        <input
          id="username"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Lösenord
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {error && <p className={styles.loginError}>{error}</p>}
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? "Loggar in…" : "Logga in"}
      </button>
    </form>
  );
}
