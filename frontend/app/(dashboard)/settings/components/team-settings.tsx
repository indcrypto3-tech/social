'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TEAM_MEMBERS = [
    { name: 'You', email: 'current@user.com', role: 'Owner', avatar: null },
    { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Editor', avatar: null },
    { name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', avatar: null },
]

export function TeamSettings() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team and their permissions.</CardDescription>
                </div>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {TEAM_MEMBERS.map((member) => (
                        <div key={member.email} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={member.avatar || ''} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge variant={member.role === 'Owner' ? "default" : "secondary"}>
                                    {member.role}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
