'use client';

import { useState } from 'react';

interface ImageWithFallbackProps {
    src: string | null | undefined;
    alt: string;
    fallback?: string;
    className?: string;
}

const DEFAULT_AVATAR = '/images/default-avatar.svg';
const DEFAULT_IMAGE = '/images/default-placeholder.svg';

export function ImageWithFallback({
    src,
    alt,
    fallback,
    className = '',
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src || fallback || DEFAULT_IMAGE);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallback || DEFAULT_IMAGE);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}

export function AvatarWithFallback({
    src,
    alt,
    className = '',
}: Omit<ImageWithFallbackProps, 'fallback'>) {
    const [imgSrc, setImgSrc] = useState(src || DEFAULT_AVATAR);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(DEFAULT_AVATAR);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}
