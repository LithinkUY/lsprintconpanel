export type HeroMediaType = "youtube" | "video" | "image" | "none";

/**
 * Detects whether a given URL is a YouTube video, a direct video file, an image, or empty.
 */
export function getHeroMediaType(url?: string | null): HeroMediaType {
    if (!url || !url.trim()) return "none";
    const clean = url.trim();

    // Data URLs
    if (clean.startsWith("data:video/")) return "video";
    if (clean.startsWith("data:image/")) return "image";

    // YouTube URLs
    if (
        clean.includes("youtube.com/watch") ||
        clean.includes("youtu.be/") ||
        clean.includes("youtube.com/embed/") ||
        clean.includes("youtube.com/shorts/") ||
        clean.includes("youtube-nocookie.com/embed/")
    ) {
        return "youtube";
    }

    // Video extensions and Cloudinary video
    if (
        /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(clean) ||
        clean.includes("/video/upload/") ||
        clean.includes("/video/")
    ) {
        return "video";
    }

    // Image extensions and Cloudinary image
    if (
        /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i.test(clean) ||
        clean.includes("/image/upload/") ||
        clean.includes("images.unsplash.com") ||
        clean.includes("res.cloudinary.com")
    ) {
        return "image";
    }

    // If it starts with http/https and no video extension, default to image
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
        return "image";
    }

    return "video";
}

/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats.
 */
export function extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const clean = url.trim();
    const match = clean.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|youtube-nocookie\.com\/embed\/)([\w-]{11})/
    );
    return match ? match[1] : null;
}

/**
 * Builds a YouTube background embed URL with mute, autoplay, loop, and hidden controls.
 */
export function getYoutubeBgEmbedUrl(videoId: string): string {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&disablekb=1`;
}
