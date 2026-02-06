import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../../components';
import { getAppScheme } from '../../services/urlDetect';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme';
import { colors } from '../../theme/colors';
import { DetectionResult, Platform } from '../../types';
import { t } from '../../utils/translations';

interface DetectCardProps {
    result: DetectionResult;
    onDownload: () => void;
    isDownloading: boolean;
}

export function DetectCard({ result, onDownload, isDownloading }: DetectCardProps) {
    const { theme } = useTheme();
    const { settings } = useAppStore();

    const getPlatformIcon = (platform: Platform): keyof typeof Ionicons.glyphMap => {
        switch (platform) {
            case 'youtube':
                return 'logo-youtube';
            case 'tiktok':
                return 'logo-tiktok';
            case 'instagram':
                return 'logo-instagram';
            case 'facebook':
                return 'logo-facebook';
            default:
                return 'document';
        }
    };

    const getPlatformColor = (platform: Platform): string => {
        switch (platform) {
            case 'youtube':
                return theme.youtube;
            case 'tiktok':
                return theme.tiktok;
            case 'instagram':
                return theme.instagram;
            case 'facebook':
                return theme.facebook;
            default:
                return colors.primary.green;
        }
    };

    const getPlatformName = (platform: Platform): string => {
        switch (platform) {
            case 'youtube':
                return t('youtube', settings.language);
            case 'tiktok':
                return t('tiktok', settings.language);
            case 'instagram':
                return t('instagram', settings.language);
            case 'facebook':
                return t('facebook', settings.language);
            default:
                return result.isDirectFile
                    ? t('directFile', settings.language)
                    : t('other', settings.language);
        }
    };

    const handleOpenInApp = async () => {
        const appScheme = getAppScheme(result.platform);

        // If we have an app scheme, try opening the platform URL directly.
        // (Most apps handle https links; the scheme check is just a hint.)
        try {
            await Linking.openURL(result.normalizedUrl);
            return;
        } catch {
            // continue to scheme fallback below
        }

        // Optional: scheme fallback (won't open the specific video unless you build a deep link)
        if (appScheme) {
            try {
                const canOpen = await Linking.canOpenURL(appScheme);
                if (canOpen) {
                    await Linking.openURL(appScheme);
                    return;
                }
            } catch {
                // Fall through
            }
        }
    };


    return (
        <Card elevated style={styles.card}>
            <View style={styles.header}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: getPlatformColor(result.platform) + '20' },
                    ]}
                >
                    <Ionicons
                        name={getPlatformIcon(result.platform)}
                        size={32}
                        color={getPlatformColor(result.platform)}
                    />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.platform, { color: theme.text }]}>
                        {getPlatformName(result.platform)}
                    </Text>
                    <Text
                        style={[styles.url, { color: theme.textSecondary }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {result.normalizedUrl}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <Text style={[styles.message, { color: theme.textSecondary }]}>
                {result.message}
            </Text>

            <View style={styles.actions}>
                {result.canDownload ? (
                    <Button
                        title={isDownloading ? t('downloading', settings.language) : t('download', settings.language)}
                        onPress={onDownload}
                        variant="primary"
                        loading={isDownloading}
                        icon={
                            !isDownloading ? (
                                <Ionicons name="download" size={20} color="#FFFFFF" />
                            ) : undefined
                        }
                        style={styles.button}
                    />
                ) : (
                    <Button
                        title={t('openInApp', settings.language)}
                        onPress={handleOpenInApp}
                        variant="secondary"
                        icon={<Ionicons name="open-outline" size={20} color={theme.text} />}
                        style={styles.button}
                    />
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    platform: {
        fontSize: 18,
        fontWeight: '700',
    },
    url: {
        fontSize: 13,
        marginTop: 4,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    actions: {
        marginTop: 16,
    },
    button: {
        width: '100%',
    },
});
