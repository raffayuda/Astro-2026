'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SkeletonImageProps {
  src: string;
  alt: string;
  /** Unique key that changes when the image changes — forces a fresh skeleton + load state. */
  imgKey: string | number;
  className?: string;
  imgClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  skeletonClassName?: string;
  objectFit?: 'cover' | 'contain';
}

/**
 * Image that shows an animated shimmer skeleton until the actual image has
 * decoded/loaded. State is keyed by `imgKey`, so when you switch to a new
 * image (e.g. next/prev in a lightbox), the skeleton resets and the new image
 * fades in — while the surrounding data updates instantly.
 */
export default function SkeletonImage({
  src,
  alt,
  imgKey,
  className,
  imgClassName,
  fill = true,
  width,
  height,
  sizes,
  priority,
  skeletonClassName,
  objectFit = 'cover',
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-slate-900/60', className)}>
      {!loaded && (
        <div className={cn('absolute inset-0 z-10 h-full w-full shimmer', skeletonClassName)} />
      )}
      {fill ? (
        <Image
          key={imgKey}
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            'relative z-20 transition-opacity duration-500',
            objectFit === 'contain' ? 'object-contain' : 'object-cover',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) setLoaded(true);
          }}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <Image
          key={imgKey}
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={cn(
            'relative z-20 transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          ref={(img) => {
            if (img?.complete && img.naturalWidth > 0) setLoaded(true);
          }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
