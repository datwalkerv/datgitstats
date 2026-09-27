import type { Metadata } from "next";
import { Generator } from "@/components/generator/generator";

export const metadata: Metadata = {
  title: "Generator",
  description: "Customize GitHub stats, top languages and streak cards with a live preview.",
};

export default async function GeneratePage({ searchParams }: PageProps<"/generate">) {
  const params = await searchParams;
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) => (v === undefined ? [] : [[k, Array.isArray(v) ? v[0] : v]])),
  ).toString();
  return <Generator initialQuery={query} />;
}
