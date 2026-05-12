import { getLatestSignalByName, listRecentSignalsByName } from "~/services/signals.server";
import { getSpaceWeatherImpact } from "~/utils/space-impact";

// Resource route — returns JSON for React Query client-side polling
export function loader() {
  const signal  = getLatestSignalByName("kp-index");
  const history = listRecentSignalsByName("kp-index", 48);
  const kp      = typeof signal?.value === "number" ? signal.value : 0;
  const impact  = getSpaceWeatherImpact(kp);

  return Response.json({ kp, kpHistory: history, impact });
}
