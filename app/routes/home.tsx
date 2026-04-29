import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HELIOS_DECK — Space Weather Observatory" },
    { name: "description", content: "A fullstack observatory for normalized heliophysical and geophysical data." },
  ];
}

export default function Home() {
  return <Welcome />;
}
