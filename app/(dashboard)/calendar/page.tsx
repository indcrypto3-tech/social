import { getScheduledPosts } from "../posts/actions";
import CalendarView from "./calendar-view";

export default async function CalendarPage() {
    const posts = await getScheduledPosts();

    return <CalendarView posts={posts} />;
}
