'use client'

import { useState } from 'react'
import { ProfileSettings } from './components/profile-settings'
import { NotificationSettings } from './components/notification-settings'
import { BillingSettings } from './components/billing-settings'
import { TeamSettings } from './components/team-settings'
import { DangerZone } from './components/danger-zone'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'billing', label: 'Billing' },
    { id: 'team', label: 'Team' },
]

export function SettingsClient({ user, preferences }: { user: any, preferences: any }) {
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <div className="space-y-6">
            <div className="relative flex w-full items-center gap-6 overflow-x-auto border-b border-border pb-px no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative flex h-10 shrink-0 items-center px-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            activeTab === tab.id
                                ? "text-primary font-semibold after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
                <button
                    onClick={() => setActiveTab('danger')}
                    className={cn(
                        "relative flex h-10 shrink-0 items-center px-2 text-sm font-medium transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        activeTab === 'danger'
                            ? "text-destructive font-semibold after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-destructive"
                            : "text-muted-foreground hover:text-destructive"
                    )}
                >
                    Danger Zone
                </button>
            </div>

            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'profile' && <ProfileSettings user={user} />}
                        {activeTab === 'notifications' && <NotificationSettings preferences={preferences} />}
                        {activeTab === 'billing' && <BillingSettings user={user} />}
                        {activeTab === 'team' && <TeamSettings />}
                        {activeTab === 'danger' && <DangerZone />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
