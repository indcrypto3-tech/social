import { getScheduledPosts } from "../posts/actions";
import CalendarView from "./calendar-view";

export default async function CalendarPage() {
    let posts = [];
    try {
        posts = await getScheduledPosts() as any;
    } catch (error) {
        console.error("CALENDAR_LOAD_FAILED", { error });
        // In a real app we might want to return an error UI, but for now we fallback to empty state
    }

    return <CalendarView posts={posts || []} />;
}
