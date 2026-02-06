import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { colors } from '../theme/colors';

interface ProgressBarProps {
    progress: number; // 0 to 1
    showPercentage?: boolean;
    height?: number;
    animated?: boolean;
}

export function ProgressBar({
    progress,
    showPercentage = true,
    height = 8,
}: ProgressBarProps) {
    const { theme } = useTheme();
    const percentage = Math.round(progress * 100);
    const clampedProgress = Math.max(0, Math.min(1, progress));

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.track,
                    {
                        backgroundColor: theme.border,
                        height,
                    },
                ]}
            >
                <View
                    style={[
                        styles.fill,
                        {
                            backgroundColor: colors.primary.green,
                            width: `${clampedProgress * 100}%`,
                            height,
                        },
                    ]}
                />
            </View>
            {showPercentage && (
                <Text style={[styles.percentage, { color: theme.textSecondary }]}>
                    {percentage}%
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    track: {
        flex: 1,
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        borderRadius: 4,
    },
    percentage: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 36,
        textAlign: 'right',
    },
});
