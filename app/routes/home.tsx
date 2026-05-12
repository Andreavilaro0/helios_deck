import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Observatorio de Clima Espacial" },
    { name: "description", content: "Un observatorio fullstack para datos heliosfísicos y geofísicos normalizados." },
  ];
}

export default function Home() {
  return (
    <>
      <nav className="p-4 flex justify-center">
        <Link
          to="/dashboard"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          → Panel del Observatorio
        </Link>
      </nav>
      <Welcome />
    </>
  );
}
