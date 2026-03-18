




export async function hasBrowserAgent(ua: string | null | undefined): Promise<boolean> {
    // 1. Fail fast: Browsers have significant UA strings. 
    // Most scripts/bots use very short strings or none at all.
    if (!ua || ua.length < 11) return false;

    const agent = ua.toLowerCase();

    // 2. The "Modern Standard" Check
    // Chrome, Edge, Safari, Brave, and Firefox all use the 'mozilla' prefix.
    if (agent.startsWith('mozilla')) {
        // High-performance bot filtering
        const botMarkers = ['bot', 'crawler', 'spider', 'headless', 'python', 'axios', 'node'];
        for (const marker of botMarkers) {
            if (agent.includes(marker)) return false;
        }
        return true;
    }

    // 3. Fallback for non-standard or legacy browser identification
    // Covers Opera Mini, UC Browser, and standalone Chrome/Safari identification
    const browserMarkers = [
        'chrome', 
        'safari', 
        'opera mini', 
        'opera mobi', 
        'ucbrowser', 
        'crios', // Chrome on iOS
        'fxios'  // Firefox on iOS
    ];

    for (const browser of browserMarkers) {
        if (agent.includes(browser)) {
            // Still verify it's not a bot spoofing these strings
            if (agent.includes('bot') || agent.includes('spider')) return false;
            return true;
        }
    }

    return false;
}