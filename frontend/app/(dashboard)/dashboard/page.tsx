
import { getOnboardingProgress } from "./actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
    const data = await getOnboardingProgress();

    return <DashboardClient data={data} />;
}
