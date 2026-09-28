import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/asa/shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Shell />;
}
