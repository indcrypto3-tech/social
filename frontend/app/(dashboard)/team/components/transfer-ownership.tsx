
'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { transferOwnership } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type TransferOwnershipProps = {
    isOpen: boolean;
    onClose: () => void;
    memberId: string;
    memberName: string;
};

export function TransferOwnership({ isOpen, onClose, memberId, memberName }: TransferOwnershipProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        setLoading(true);
        const res = await transferOwnership(memberId);
        setLoading(false);

        if (res?.error) {
            toast({
                title: 'Error',
                description: res.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Ownership Transferred',
                description: `You have transferred ownership to ${memberName}. You are now an Editor.`,
            });
            onClose();
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Transfer Team Ownership?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to transfer ownership of this team to <strong>{memberName}</strong>?
                        You will be downgraded to an Editor and will lose administrative privileges. This action cannot be undone by you.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={loading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700">
                        {loading ? 'Transferring...' : 'Transfer Ownership'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
