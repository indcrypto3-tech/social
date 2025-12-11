'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { uploadMedia, deleteMedia } from './actions';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";

type MediaItem = {
    id: string;
    url: string;
    fileName: string | null;
    createdAt: Date;
    fileType: string;
};

export default function MediaList({ initialData }: { initialData: MediaItem[] }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast()

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
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            await deleteMedia(id, url);
            toast({ title: "Deleted", description: "Image deleted successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
        }
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Media Library</h1>
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
            </div>

            {initialData.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No media uploaded</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-2">
                        Upload images to use them in your social media posts.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {initialData.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden aspect-square border-none bg-muted/30 hover:shadow-lg transition-all">
                            <div className="relative w-full h-full">
                                <Image
                                    src={item.url}
                                    alt={item.fileName || 'Media'}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => handleDelete(item.id, item.url)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-6 text-xs text-white truncate">
                                {item.fileName}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}
