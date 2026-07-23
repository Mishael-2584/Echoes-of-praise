import type { Handler } from "@netlify/functions";
import { fundraiserBaseline } from "./_fundraiser-data";

/**
 * Returns live fundraiser totals.
 * Override with FUNDRAISER_RAISED_KES env var (updated after donations)
 * without redeploying the static JSON baseline.
 */
export const handler: Handler = async () => {
  const data = { ...fundraiserBaseline };

  const envRaised = process.env.FUNDRAISER_RAISED_KES;
  if (envRaised && !Number.isNaN(Number(envRaised))) {
    data.raisedKes = Number(envRaised);
    data.updatedAt = new Date().toISOString();
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(data),
  };
};
