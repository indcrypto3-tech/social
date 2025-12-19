import { getPendingPosts } from "./actions";
import { ApprovalList } from "./components/approval-list"; // Client component
import { PageHeader } from "../components/page-header";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ApprovalsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Role check? Any user can see approvals? Or just admins/editors?
    // Let's assume everyone can see for now, logic in list might hide buttons.

    const pendingPosts = await getPendingPosts();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader heading="Approval Queue" text="Review and approve posts before they are published." />
            <ApprovalList posts={pendingPosts} />
        </div>
    );
}
