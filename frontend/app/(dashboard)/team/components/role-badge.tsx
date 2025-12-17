
import { Badge } from '@/components/ui/badge';

export function RoleBadge({ role }: { role: string }) {
    const styles = {
        owner: 'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200',
        editor: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
        viewer: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
    };

    return (
        <Badge variant="outline" className={`capitalize ${styles[role as keyof typeof styles] || ''}`}>
            {role}
        </Badge>
    );
}
