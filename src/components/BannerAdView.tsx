import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getBannerAdComponent, getBannerAdProps, isAdModuleLoaded } from '../services/adManager';

interface BannerAdViewProps {
    size?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'FULL_BANNER';
    containerStyle?: object;
}

/**
 * Reusable Banner Ad Component
 * Renders nothing in Expo Go, shows banner in development builds
 */
export function BannerAdView({ size = 'BANNER', containerStyle }: BannerAdViewProps) {
    const BannerAd = getBannerAdComponent();
    const props = getBannerAdProps(size);

    // If ads not available, render nothing
    if (!isAdModuleLoaded() || !BannerAd || !props) {
        return null;
    }

    return (
        <View style={[styles.container, containerStyle]}>
            <BannerAd {...props} />
        </View>
    );
}

/**
 * Placeholder banner for Expo Go testing
 * Shows what the banner will look like
 */
export function BannerAdPlaceholder({ size = 'BANNER' }: { size?: string }) {
    const heights: Record<string, number> = {
        BANNER: 50,
        LARGE_BANNER: 100,
        MEDIUM_RECTANGLE: 250,
        FULL_BANNER: 60,
    };

    return (
        <View style={[styles.placeholder, { height: heights[size] || 50 }]}>
            <Text style={styles.placeholderText}>Ad Banner ({size})</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        backgroundColor: '#2A2A2A',
        borderWidth: 1,
        borderColor: '#444',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    placeholderText: {
        color: '#888',
        fontSize: 12,
    },
});

export default BannerAdView;
