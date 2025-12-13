'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Trash2, Loader2, Search, Filter, SortAsc, SortDesc, RefreshCw } from "lucide-react";
import { uploadMedia, deleteMedia } from './actions';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "../components/page-header";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MediaItem = {
    id: string;
    url: string;
    fileName: string | null;
    createdAt: Date;
    fileType: string;
};

type SortOption = 'newest' | 'oldest' | 'name';

export default function MediaList({ initialData }: { initialData: MediaItem[] }) {
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast()
    const router = useRouter();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadMedia(formData);
            toast({ title: "Success", description: "Image uploaded successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string, url: string) => {
        // In a real app, use a custom Dialog instead of confirm
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await deleteMedia(id, url);
            toast({ title: "Deleted", description: "Image deleted successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
        }
    }

    const filteredAndSortedData = useMemo(() => {
        let items = [...initialData];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                (item.fileName || "").toLowerCase().includes(query)
            );
        }

        switch (sortBy) {
            case 'newest':
                items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'name':
                items.sort((a, b) => (a.fileName || "").localeCompare(b.fileName || ""));
                break;
        }

        return items;
    }, [initialData, searchQuery, sortBy]);

    return (
        <>
            <PageHeader heading="Media Library" text="Upload and manage your images and videos.">
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button onClick={handleUploadClick} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Uploading...' : 'Upload Media'}
                    </Button>
                </div>
            </PageHeader>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search media..."
                        className="pl-8 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1"
                        onClick={() => router.refresh()}
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Refresh</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <Filter className="h-3.5 w-3.5 mr-1" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Sort by</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortBy('newest')}>
                                <SortDesc className="mr-2 h-4 w-4" /> Newest
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                                <SortAsc className="mr-2 h-4 w-4" /> Oldest
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy('name')}>
                                <Filter className="mr-2 h-4 w-4" /> Name
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {filteredAndSortedData.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/10 h-[400px]">
                    <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">
                        {searchQuery ? "No matching media found" : "No media uploaded"}
                    </h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        {searchQuery ? "Try adjusting your search query." : "Upload images to use them in your social media posts."}
                    </p>
                    {!searchQuery && (
                        <Button variant="outline" className="mt-6" onClick={handleUploadClick}>
                            Upload First Image
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredAndSortedData.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden aspect-square border-0 ring-1 ring-border bg-muted/10 hover:shadow-xl transition-all duration-300">
                            <div className="absolute inset-0 bg-muted/20 animate-pulse" /> {/* Placeholder loading skeleton effect if needed, but Image handles loading */}
                            <div className="relative w-full h-full">
                                <Image
                                    src={item.url}
                                    alt={item.fileName || 'Media'}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 duration-300">
                                <div className="flex justify-end">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0"
                                        onClick={() => handleDelete(item.id, item.url)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="translate-y-[10px] group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-white text-xs font-medium truncate w-full">
                                        {item.fileName}
                                    </p>
                                    <p className="text-white/70 text-[10px]">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}
