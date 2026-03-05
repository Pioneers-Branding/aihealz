'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface MediaItem {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    alt?: string;
    caption?: string;
}

interface MediaGalleryProps {
    /** Main cover image URL */
    coverImage?: string | null;
    /** Array of image URLs */
    images?: string[];
    /** Video URL (YouTube, Vimeo, or direct video) */
    videoUrl?: string | null;
    /** Video thumbnail */
    videoThumbnail?: string | null;
    /** Alt text for images */
    alt?: string;
    /** Show image count badge */
    showCount?: boolean;
    /** Compact mode for smaller displays */
    compact?: boolean;
    /** Maximum images to show in grid before "See all" */
    maxVisible?: number;
}

/**
 * Extract video ID and platform from URL
 */
function parseVideoUrl(url: string): { platform: 'youtube' | 'vimeo' | 'direct'; id: string } | null {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (ytMatch) {
        return { platform: 'youtube', id: ytMatch[1] };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (vimeoMatch) {
        return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    // Direct video
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
        return { platform: 'direct', id: url };
    }

    return null;
}

/**
 * Get video embed URL
 */
function getVideoEmbedUrl(url: string): string | null {
    const parsed = parseVideoUrl(url);
    if (!parsed) return null;

    switch (parsed.platform) {
        case 'youtube':
            return `https://www.youtube.com/embed/${parsed.id}?autoplay=1&rel=0`;
        case 'vimeo':
            return `https://player.vimeo.com/video/${parsed.id}?autoplay=1`;
        case 'direct':
            return parsed.id;
        default:
            return null;
    }
}

/**
 * Get YouTube thumbnail
 */
function getYouTubeThumbnail(url: string): string | null {
    const parsed = parseVideoUrl(url);
    if (parsed?.platform === 'youtube') {
        return `https://img.youtube.com/vi/${parsed.id}/maxresdefault.jpg`;
    }
    return null;
}

export default function MediaGallery({
    coverImage,
    images = [],
    videoUrl,
    videoThumbnail,
    alt = 'Gallery image',
    showCount = true,
    compact = false,
    maxVisible = 4,
}: MediaGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(false);

    // Build media items array (memoized)
    const mediaItems = useMemo(() => {
        const items: MediaItem[] = [];

        // Add video first if present
        if (videoUrl) {
            const thumbnail = videoThumbnail || getYouTubeThumbnail(videoUrl);
            items.push({
                type: 'video',
                url: videoUrl,
                thumbnail: thumbnail || undefined,
                alt: `${alt} video`,
            });
        }

        // Add cover image
        if (coverImage) {
            items.push({
                type: 'image',
                url: coverImage,
                alt: `${alt} cover`,
            });
        }

        // Add gallery images
        images.forEach((img, i) => {
            if (img && img !== coverImage) {
                items.push({
                    type: 'image',
                    url: img,
                    alt: `${alt} ${i + 1}`,
                });
            }
        });

        return items;
    }, [videoUrl, videoThumbnail, coverImage, images, alt]);

    const hasMedia = mediaItems.length > 0;
    const visibleItems = mediaItems.slice(0, maxVisible);
    const remainingCount = mediaItems.length - maxVisible;
    const mediaItemsLength = mediaItems.length;

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxOpen(false);
                setShowVideo(false);
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItemsLength - 1));
                setShowVideo(false);
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex((prev) => (prev < mediaItemsLength - 1 ? prev + 1 : 0));
                setShowVideo(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, mediaItemsLength]);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        setShowVideo(mediaItems[index]?.type === 'video');
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setShowVideo(false);
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev < mediaItemsLength - 1 ? prev + 1 : 0));
        setShowVideo(false);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItemsLength - 1));
        setShowVideo(false);
    };

    if (!hasMedia) {
        return null;
    }

    const currentItem = mediaItems[currentIndex];

    return (
        <>
            {/* Gallery Grid */}
            <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
                {visibleItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => openLightbox(index)}
                        className={`relative overflow-hidden rounded-xl bg-slate-800 border border-white/5 hover:border-cyan-500/30 transition-all group ${
                            index === 0 && !compact ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
                        }`}
                    >
                        {item.type === 'video' ? (
                            <>
                                {item.thumbnail ? (
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.alt || 'Video thumbnail'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                )}
                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Image
                                src={item.url}
                                alt={item.alt || 'Gallery image'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>

                        {/* Show remaining count on last visible item */}
                        {index === maxVisible - 1 && remainingCount > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">+{remainingCount}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Image count badge */}
            {showCount && mediaItems.length > 1 && (
                <button
                    onClick={() => openLightbox(0)}
                    className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View all {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
                </button>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && currentItem && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        aria-label="Close lightbox"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Navigation arrows */}
                    {mediaItems.length > 1 && (
                        <>
                            <button
                                onClick={goPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label="Previous image"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={goNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label="Next image"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Current item counter */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium">
                        {currentIndex + 1} / {mediaItems.length}
                    </div>

                    {/* Main content */}
                    <div className="relative w-full max-w-5xl max-h-[85vh] mx-4">
                        {currentItem.type === 'video' ? (
                            showVideo ? (
                                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
                                    {parseVideoUrl(currentItem.url)?.platform === 'direct' ? (
                                        <video
                                            src={currentItem.url}
                                            controls
                                            autoPlay
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <iframe
                                            src={getVideoEmbedUrl(currentItem.url) || ''}
                                            title="Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowVideo(true)}
                                    className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
                                >
                                    {currentItem.thumbnail && (
                                        <Image
                                            src={currentItem.thumbnail}
                                            alt={currentItem.alt || 'Video'}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            )
                        ) : (
                            <div className="relative w-full h-[85vh]">
                                <Image
                                    src={currentItem.url}
                                    alt={currentItem.alt || 'Gallery image'}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {mediaItems.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
                            {mediaItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setShowVideo(false);
                                    }}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                                        index === currentIndex
                                            ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black'
                                            : 'opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    {item.type === 'video' && item.thumbnail ? (
                                        <Image
                                            src={item.thumbnail}
                                            alt="Video thumbnail"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : item.type === 'video' ? (
                                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <Image
                                            src={item.url}
                                            alt={item.alt || 'Thumbnail'}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Click outside to close */}
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={closeLightbox}
                    />
                </div>
            )}
        </>
    );
}
