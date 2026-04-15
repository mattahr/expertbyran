export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: seedData } = await import("@/lib/storage/seed");
    await seedData();
  }
}
