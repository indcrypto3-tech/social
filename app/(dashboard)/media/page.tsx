
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon, MoreHorizontal, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MediaPage() {
    const mediaItems = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        url: `/placeholder-image-${i}.jpg`, // In real app these are S3 URLs
        name: `Image ${i + 1}.jpg`
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Media Library</h1>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaItems.map((item) => (
                    <Card key={item.id} className="group relative overflow-hidden aspect-square border-none bg-muted/30">
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <ImageIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="absolute bottom-0 w-full bg-black/60 p-2 text-xs text-white truncate">
                            {item.name}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
