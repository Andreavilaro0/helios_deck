import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Space Weather Observatory" },
    { name: "description", content: "A fullstack observatory for normalized heliophysical and geophysical data." },
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
          → Observatory Dashboard
        </Link>
      </nav>
      <Welcome />
    </>
  );
}
