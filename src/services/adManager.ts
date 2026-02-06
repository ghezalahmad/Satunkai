/**
 * AdMob Integration Service - Multi-Format Ads
 * Supports: Banner, Interstitial, Rewarded, Rewarded Interstitial, App Open Ads
 * 
 * Note: Requires development build (not Expo Go) for native module access
 */

// Ad module references
let BannerAd: any = null;
let BannerAdSize: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let RewardedInterstitialAd: any = null;
let AppOpenAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    APP_OPEN: 'ca-app-pub-3940256099942544/9257395921',
};

// Module availability
let isAdModuleAvailable = false;

// Initialize module
try {
    const adModule = require('react-native-google-mobile-ads');
    BannerAd = adModule.BannerAd;
    BannerAdSize = adModule.BannerAdSize;
    InterstitialAd = adModule.InterstitialAd;
    RewardedAd = adModule.RewardedAd;
    RewardedInterstitialAd = adModule.RewardedInterstitialAd;
    AppOpenAd = adModule.AppOpenAd;
    AdEventType = adModule.AdEventType;
    RewardedAdEventType = adModule.RewardedAdEventType;
    TestIds = adModule.TestIds;
    isAdModuleAvailable = true;
    console.log('AdMob module loaded successfully');
} catch {
    console.log('AdMob module not available - running in Expo Go or ads disabled');
    isAdModuleAvailable = false;
}

// ============================================================================
// AD UNIT IDS - Replace with your real IDs in production
// ============================================================================

export const AD_UNIT_IDS = {
    // Test IDs (safe for development)
    BANNER: 'ca-app-pub-4649559627643296/5113227151',
    INTERSTITIAL: 'ca-app-pub-4649559627643296/4921655465',
    REWARDED: 'ca-app-pub-4649559627643296/9898649977',
    APP_OPEN: 'ca-app-pub-4649559627643296/2901996784',
    REWARDED_INTERSTITIAL: 'ca-app-pub-4649559627643296/2355928221',
};

// ============================================================================
// AD STATE
// ============================================================================

interface AdState {
    interstitial: {
        ad: any;
        loaded: boolean;
        loading: boolean;
    };
    rewarded: {
        ad: any;
        loaded: boolean;
        loading: boolean;
    };
    appOpen: {
        ad: any;
        loaded: boolean;
        loading: boolean;
    };
    rewardedInterstitial: {
        ad: any;
        loaded: boolean;
        loading: boolean;
    };
}

const adState: AdState = {
    interstitial: { ad: null, loaded: false, loading: false },
    rewarded: { ad: null, loaded: false, loading: false },
    rewardedInterstitial: { ad: null, loaded: false, loading: false },
    appOpen: { ad: null, loaded: false, loading: false },
};

// Analytics tracking
let analytics = {
    bannerImpressions: 0,
    interstitialsShown: 0,
    rewardedAdsShown: 0,
    rewardedInterstitialsShown: 0,
    appOpenAdsShown: 0,
    totalRevenue: 0, // Estimated
    downloadCount: 0,
};

// ============================================================================
// BANNER ADS
// ============================================================================

/**
 * Get Banner Ad component props
 * Use this to render a BannerAd in your components
 */
export function getBannerAdProps(size: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'FULL_BANNER' = 'BANNER') {
    if (!isAdModuleAvailable || !BannerAd || !BannerAdSize) {
        return null;
    }

    const sizeMap: Record<string, any> = {
        BANNER: BannerAdSize.BANNER,
        LARGE_BANNER: BannerAdSize.LARGE_BANNER,
        MEDIUM_RECTANGLE: BannerAdSize.MEDIUM_RECTANGLE,
        FULL_BANNER: BannerAdSize.FULL_BANNER,
    };

    return {
        unitId: AD_UNIT_IDS.BANNER,
        size: sizeMap[size] || BannerAdSize.BANNER,
        requestOptions: {
            requestNonPersonalizedAdsOnly: true,
        },
        onAdLoaded: () => {
            analytics.bannerImpressions++;
            console.log('Banner ad loaded');
        },
        onAdFailedToLoad: (error: any) => {
            console.log('Banner ad failed to load:', error);
        },
    };
}

/**
 * Export BannerAd component for use in screens
 */
export function getBannerAdComponent() {
    return isAdModuleAvailable ? BannerAd : null;
}

export function getBannerAdSize() {
    return isAdModuleAvailable ? BannerAdSize : null;
}

// ============================================================================
// INTERSTITIAL ADS
// ============================================================================

/**
 * Load an interstitial ad
 */
export async function loadInterstitialAd(): Promise<boolean> {
    if (!isAdModuleAvailable || !InterstitialAd) {
        console.log('Interstitial ads not available');
        return false;
    }

    if (adState.interstitial.loading || adState.interstitial.loaded) {
        return adState.interstitial.loaded;
    }

    adState.interstitial.loading = true;

    try {
        adState.interstitial.ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
            requestNonPersonalizedAdsOnly: true,
        });

        return new Promise((resolve) => {
            const unsubscribeLoaded = adState.interstitial.ad.addAdEventListener(
                AdEventType.LOADED,
                () => {
                    adState.interstitial.loaded = true;
                    adState.interstitial.loading = false;
                    unsubscribeLoaded();
                    console.log('Interstitial ad loaded');
                    resolve(true);
                }
            );

            const unsubscribeError = adState.interstitial.ad.addAdEventListener(
                AdEventType.ERROR,
                (error: any) => {
                    console.log('Interstitial ad failed to load:', error);
                    adState.interstitial.loaded = false;
                    adState.interstitial.loading = false;
                    unsubscribeError();
                    resolve(false);
                }
            );

            adState.interstitial.ad.load();
        });
    } catch (error) {
        console.log('Error loading interstitial:', error);
        adState.interstitial.loading = false;
        return false;
    }
}

/**
 * Show interstitial ad
 * Best times: After download completes, between screens, every N downloads
 */
export async function showInterstitialAd(): Promise<boolean> {
    if (!isAdModuleAvailable) {
        console.log('Interstitial ads not available');
        return false;
    }

    if (!adState.interstitial.loaded) {
        await loadInterstitialAd();
        if (!adState.interstitial.loaded) return false;
    }

    return new Promise((resolve) => {
        const unsubscribeClosed = adState.interstitial.ad.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                adState.interstitial.loaded = false;
                unsubscribeClosed();
                analytics.interstitialsShown++;
                // Preload next
                loadInterstitialAd();
                resolve(true);
            }
        );

        adState.interstitial.ad.show();
    });
}

export function isInterstitialReady(): boolean {
    return isAdModuleAvailable && adState.interstitial.loaded;
}

// ============================================================================
// REWARDED ADS
// ============================================================================

/**
 * Load a rewarded ad
 */
export async function loadRewardedAd(): Promise<boolean> {
    if (!isAdModuleAvailable || !RewardedAd) {
        console.log('Rewarded ads not available');
        return false;
    }

    if (adState.rewarded.loading || adState.rewarded.loaded) {
        return adState.rewarded.loaded;
    }

    adState.rewarded.loading = true;

    try {
        adState.rewarded.ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
            requestNonPersonalizedAdsOnly: true,
        });

        return new Promise((resolve) => {
            const unsubscribeLoaded = adState.rewarded.ad.addAdEventListener(
                RewardedAdEventType.LOADED,
                () => {
                    adState.rewarded.loaded = true;
                    adState.rewarded.loading = false;
                    unsubscribeLoaded();
                    console.log('Rewarded ad loaded');
                    resolve(true);
                }
            );

            const unsubscribeError = adState.rewarded.ad.addAdEventListener(
                AdEventType.ERROR,
                (error: any) => {
                    console.log('Rewarded ad failed to load:', error);
                    adState.rewarded.loaded = false;
                    adState.rewarded.loading = false;
                    unsubscribeError();
                    resolve(false);
                }
            );

            adState.rewarded.ad.load();
        });
    } catch (error) {
        console.log('Error loading rewarded ad:', error);
        adState.rewarded.loading = false;
        return false;
    }
}

/**
 * Show rewarded ad
 * Returns true if user earned reward, false if skipped/failed
 */
export async function showRewardedAd(): Promise<boolean> {
    if (!isAdModuleAvailable) {
        console.log('Rewarded ads not available');
        return false;
    }

    if (!adState.rewarded.loaded) {
        await loadRewardedAd();
        if (!adState.rewarded.loaded) return false;
    }

    return new Promise((resolve) => {
        let rewarded = false;

        const unsubscribeClosed = adState.rewarded.ad.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                adState.rewarded.loaded = false;
                unsubscribeClosed();
                // Preload next
                loadRewardedAd();
                resolve(rewarded);
            }
        );

        const unsubscribeEarned = adState.rewarded.ad.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => {
                rewarded = true;
                analytics.rewardedAdsShown++;
                unsubscribeEarned();
            }
        );

        adState.rewarded.ad.show();
    });
}

export function isRewardedAdReady(): boolean {
    return isAdModuleAvailable && adState.rewarded.loaded;
}

// ============================================================================
// REWARDED INTERSTITIAL ADS (Auto-show at natural breaks - higher eCPM)
// ============================================================================

/**
 * Load a rewarded interstitial ad
 */
export async function loadRewardedInterstitialAd(): Promise<boolean> {
    if (!isAdModuleAvailable || !RewardedInterstitialAd) {
        console.log('Rewarded interstitial ads not available');
        return false;
    }

    if (adState.rewardedInterstitial.loading || adState.rewardedInterstitial.loaded) {
        return adState.rewardedInterstitial.loaded;
    }

    adState.rewardedInterstitial.loading = true;

    try {
        return new Promise((resolve) => {
            const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
                AD_UNIT_IDS.REWARDED_INTERSTITIAL,
                { requestNonPersonalizedAdsOnly: true }
            );

            const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
                AdEventType.LOADED,
                () => {
                    adState.rewardedInterstitial.ad = rewardedInterstitial;
                    adState.rewardedInterstitial.loaded = true;
                    adState.rewardedInterstitial.loading = false;
                    unsubscribeLoaded();
                    console.log('Rewarded interstitial ad loaded');
                    resolve(true);
                }
            );

            const unsubscribeError = rewardedInterstitial.addAdEventListener(
                AdEventType.ERROR,
                (error: any) => {
                    adState.rewardedInterstitial.loading = false;
                    unsubscribeError();
                    console.log('Rewarded interstitial ad failed to load:', error);
                    resolve(false);
                }
            );

            rewardedInterstitial.load();
        });
    } catch (error) {
        console.log('Error loading rewarded interstitial ad:', error);
        adState.rewardedInterstitial.loading = false;
        return false;
    }
}

/**
 * Show rewarded interstitial ad
 * Unlike regular rewarded ads, this can auto-show at natural breaks
 * Returns true if user earned reward
 */
export async function showRewardedInterstitialAd(): Promise<boolean> {
    if (!isAdModuleAvailable) {
        console.log('Rewarded interstitial ads not available');
        return false;
    }

    if (!adState.rewardedInterstitial.loaded) {
        await loadRewardedInterstitialAd();
        if (!adState.rewardedInterstitial.loaded) return false;
    }

    return new Promise((resolve) => {
        let rewarded = false;

        const unsubscribeClosed = adState.rewardedInterstitial.ad.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                adState.rewardedInterstitial.loaded = false;
                unsubscribeClosed();
                // Preload next
                loadRewardedInterstitialAd();
                resolve(rewarded);
            }
        );

        const unsubscribeEarned = adState.rewardedInterstitial.ad.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => {
                rewarded = true;
                analytics.rewardedInterstitialsShown++;
                unsubscribeEarned();
            }
        );

        adState.rewardedInterstitial.ad.show();
    });
}

export function isRewardedInterstitialReady(): boolean {
    return isAdModuleAvailable && adState.rewardedInterstitial.loaded;
}

// ============================================================================
// APP OPEN ADS
// ============================================================================

/**
 * Load an app open ad
 */
export async function loadAppOpenAd(): Promise<boolean> {
    if (!isAdModuleAvailable || !AppOpenAd) {
        console.log('App open ads not available');
        return false;
    }

    if (adState.appOpen.loading || adState.appOpen.loaded) {
        return adState.appOpen.loaded;
    }

    adState.appOpen.loading = true;

    try {
        adState.appOpen.ad = AppOpenAd.createForAdRequest(AD_UNIT_IDS.APP_OPEN, {
            requestNonPersonalizedAdsOnly: true,
        });

        return new Promise((resolve) => {
            const unsubscribeLoaded = adState.appOpen.ad.addAdEventListener(
                AdEventType.LOADED,
                () => {
                    adState.appOpen.loaded = true;
                    adState.appOpen.loading = false;
                    unsubscribeLoaded();
                    console.log('App open ad loaded');
                    resolve(true);
                }
            );

            const unsubscribeError = adState.appOpen.ad.addAdEventListener(
                AdEventType.ERROR,
                (error: any) => {
                    console.log('App open ad failed to load:', error);
                    adState.appOpen.loaded = false;
                    adState.appOpen.loading = false;
                    unsubscribeError();
                    resolve(false);
                }
            );

            adState.appOpen.ad.load();
        });
    } catch (error) {
        console.log('Error loading app open ad:', error);
        adState.appOpen.loading = false;
        return false;
    }
}

/**
 * Show app open ad when app comes to foreground
 */
export async function showAppOpenAd(): Promise<boolean> {
    if (!isAdModuleAvailable) {
        console.log('App open ads not available');
        return false;
    }

    if (!adState.appOpen.loaded) {
        await loadAppOpenAd();
        if (!adState.appOpen.loaded) return false;
    }

    return new Promise((resolve) => {
        const unsubscribeClosed = adState.appOpen.ad.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                adState.appOpen.loaded = false;
                unsubscribeClosed();
                analytics.appOpenAdsShown++;
                // Preload next
                loadAppOpenAd();
                resolve(true);
            }
        );

        adState.appOpen.ad.show();
    });
}

// ============================================================================
// PRELOAD ALL ADS
// ============================================================================

/**
 * Preload all ad types at app start
 */
export async function preloadAllAds(): Promise<void> {
    if (!isAdModuleAvailable) {
        console.log('Ads not available, skipping preload');
        return;
    }

    console.log('Preloading all ads...');

    // Load in parallel
    await Promise.all([
        loadInterstitialAd().catch(() => { }),
        loadRewardedAd().catch(() => { }),
        loadRewardedInterstitialAd().catch(() => { }),
        loadAppOpenAd().catch(() => { }),
    ]);

    console.log('Ad preload complete');
}

// ============================================================================
// AD STRATEGY HELPERS
// ============================================================================

let downloadsSinceLastAd = 0;
const DOWNLOADS_BETWEEN_INTERSTITIALS = 2; // Show interstitial every N downloads

/**
 * Smart ad selection based on context
 * Call this after each download to decide which ad to show
 */
export async function showAdAfterDownload(): Promise<void> {
    downloadsSinceLastAd++;
    analytics.downloadCount++;

    // Every N downloads, show an interstitial
    if (downloadsSinceLastAd >= DOWNLOADS_BETWEEN_INTERSTITIALS) {
        downloadsSinceLastAd = 0;
        await showInterstitialAd();
    }
}

/**
 * Show rewarded ad before allowing download
 * Returns true if download should proceed
 */
export async function showAdBeforeDownload(): Promise<boolean> {
    // If rewarded ad is available, show it
    if (isRewardedAdReady()) {
        const rewarded = await showRewardedAd();
        return rewarded; // Only proceed if user watched
    }

    // If no rewarded ad, show interstitial instead
    if (isInterstitialReady()) {
        await showInterstitialAd();
    }

    // Allow download even if no ad shown
    return true;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export function isAdModuleLoaded(): boolean {
    return isAdModuleAvailable;
}

export function trackDownloadStarted(): void {
    analytics.downloadCount++;
}

export function getAdAnalytics() {
    return {
        bannerImpressions: analytics.bannerImpressions,
        interstitialsShown: analytics.interstitialsShown,
        rewardedAdsShown: analytics.rewardedAdsShown,
        appOpenAdsShown: analytics.appOpenAdsShown,
        downloadCount: analytics.downloadCount,
        // Rough eCPM estimates (replace with actual data)
        estimatedRevenue: {
            banner: analytics.bannerImpressions * 0.001, // ~$1 eCPM
            interstitial: analytics.interstitialsShown * 0.01, // ~$10 eCPM
            rewarded: analytics.rewardedAdsShown * 0.02, // ~$20 eCPM
            rewardedInterstitial: analytics.rewardedInterstitialsShown * 0.015, // ~$15 eCPM
            appOpen: analytics.appOpenAdsShown * 0.015, // ~$15 eCPM
        },
    };
}

export function resetAnalytics(): void {
    analytics = {
        bannerImpressions: 0,
        interstitialsShown: 0,
        rewardedAdsShown: 0,
        rewardedInterstitialsShown: 0,
        appOpenAdsShown: 0,
        totalRevenue: 0,
        downloadCount: 0,
    };
}

// Backward compatibility
export function getLocalAnalytics() {
    return {
        downloadsStarted: analytics.downloadCount,
        adsShown: analytics.interstitialsShown + analytics.rewardedAdsShown,
        adsFailed: 0,
    };
}
