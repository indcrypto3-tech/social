"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, Check, ImageIcon, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { uploadMedia } from "@/app/(dashboard)/media/actions"; // Importing server action
import { useToast } from "@/hooks/use-toast";

export type MediaItem = {
    id: string;
    url: string;
    fileName: string | null;
    createdAt: string;
    fileType: string;
};

interface MediaPickerProps {
    onSelect: (selected: MediaItem[]) => void;
    trigger?: React.ReactNode;
    maxSelect?: number;
}

export function MediaPicker({ onSelect, trigger, maxSelect = 4 }: MediaPickerProps) {
    const [open, setOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const data = await apiClient<MediaItem[]>('/media');
            setMedia(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to load media", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchMedia();
            setSelectedIds(new Set()); // Reset selection on open? Or keep? Reset for now.
        }
    }, [open]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            toast({ title: "Upload Failed", description: "File size exceeds 50MB limit.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadMedia(formData); // Server action
            toast({ title: "Uploaded successfully", variant: "success" });
            fetchMedia(); // Refresh list
            // Switch to library tab automatically? controlled tabs needed.
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const toggleSelection = (item: MediaItem) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(item.id)) {
            newSet.delete(item.id);
        } else {
            if (newSet.size >= maxSelect) {
                toast({ title: `You can only select up to ${maxSelect} items.`, variant: "destructive" });
                return;
            }
            newSet.add(item.id);
        }
        setSelectedIds(newSet);
    };

    const handleConfirm = () => {
        const selectedItems = media.filter(m => selectedIds.has(m.id));
        onSelect(selectedItems);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Select Media</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Media Library</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 pt-4">
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                            <TabsTrigger value="library">Library</TabsTrigger>
                            <TabsTrigger value="upload">Upload New</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="library" className="flex-1 flex flex-col min-h-0 border-0 p-0 m-0">
                        <div className="flex justify-between items-center px-6 py-2">
                            <span className="text-sm text-muted-foreground">
                                {selectedIds.size} selected (max {maxSelect})
                            </span>
                            <Button variant="ghost" size="sm" onClick={fetchMedia} disabled={loading}>
                                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            </Button>
                        </div>
                        <div className="flex-1 bg-muted/10 overflow-y-auto">
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {loading && media.length === 0 ? (
                                    Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
                                    ))
                                ) : media.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                                        <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                        <p>No media found</p>
                                    </div>
                                ) : (
                                    media.map(item => {
                                        const isSelected = selectedIds.has(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "relative aspect-square group cursor-pointer rounded-md overflow-hidden border-2 transition-all",
                                                    isSelected ? "border-primary ring-2 ring-primary ring-offset-1" : "border-transparent hover:border-muted-foreground/50"
                                                )}
                                                onClick={() => toggleSelection(item)}
                                            >
                                                {item.fileType?.startsWith('video') ? (
                                                    <video src={item.url} className="object-cover w-full h-full" muted />
                                                ) : (
                                                    <Image src={item.url} alt={item.fileName || 'media'} fill className="object-cover" />
                                                )}

                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 bg-background">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
                                Insert Selected ({selectedIds.size})
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 flex flex-col items-center justify-center p-6 m-0">
                        <div className="w-full max-w-md border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/5 transition-colors">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                {uploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Upload Media</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Drag and drop files here or click to browse. <br />
                                Max size: 50MB.
                            </p>
                            <Input
                                type="file"
                                className="hidden"
                                id="picker-file-upload"
                                onChange={handleUpload}
                                disabled={uploading}
                                accept="image/*,video/*"
                            />
                            <Button asChild disabled={uploading}>
                                <label htmlFor="picker-file-upload" className="cursor-pointer">
                                    {uploading ? "Uploading..." : "Select File"}
                                </label>
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
