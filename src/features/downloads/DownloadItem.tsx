import { Ionicons } from '@expo/vector-icons';
// FIX: Import from 'legacy' to use getInfoAsync in Expo SDK 52+
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, ProgressBar } from '../../components';
import { formatFileSize } from '../../services/downloadManager';
import { useAppStore } from '../../store/appStore';
import { useTheme } from '../../theme';
import { Download } from '../../types';
import { t } from '../../utils/translations';

interface DownloadItemProps {
    download: Download;
    onDelete: (id: string) => void;
    onCancel: (id: string) => void;
}

export function DownloadItem({ download, onDelete, onCancel }: DownloadItemProps) {
    const { theme } = useTheme();
    const { settings } = useAppStore();

    const getStatusColor = () => {
        switch (download.status) {
            case 'completed':
                return theme.success;
            case 'failed':
                return theme.error;
            case 'downloading':
                return theme.info;
            default:
                return theme.textMuted;
        }
    };

    const getStatusText = () => {
        switch (download.status) {
            case 'completed':
                return t('completed', settings.language);
            case 'failed':
                return t('failed', settings.language);
            case 'downloading':
                return `${Math.round(download.progress * 100)}%`;
            case 'cancelled':
                return t('cancel', settings.language);
            default:
                return t('pending', settings.language);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(settings.language === 'da' ? 'fa-AF' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleOpen = async () => {
        if (download.status !== 'completed') return;

        try {
            // FIX: This now calls the legacy API which supports getInfoAsync
            const fileInfo = await FileSystem.getInfoAsync(download.localPath);
            if (fileInfo.exists) {
                // On iOS/Android, we can share to open in another app
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(download.localPath);
                }
            } else {
                Alert.alert('Error', 'File not found');
            }
        } catch (error) {
            console.error('Error opening file:', error);
            Alert.alert('Error', 'Could not open file');
        }
    };

    const handleShare = async () => {
        if (download.status !== 'completed') return;

        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(download.localPath);
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Error sharing file:', error);
            Alert.alert('Error', 'Could not share file');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t('delete', settings.language),
            'Are you sure you want to delete this download?',
            [
                { text: t('cancel', settings.language), style: 'cancel' },
                {
                    text: t('delete', settings.language),
                    style: 'destructive',
                    onPress: () => onDelete(download.id),
                },
            ]
        );
    };

    return (
        <Card style={styles.card}>
            <TouchableOpacity
                style={styles.content}
                onPress={handleOpen}
                disabled={download.status !== 'completed'}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={download.status === 'completed' ? 'videocam' : 'cloud-download'}
                        size={24}
                        color={getStatusColor()}
                    />
                </View>

                <View style={styles.info}>
                    <Text
                        style={[styles.filename, { color: theme.text }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {download.filename}
                    </Text>

                    <View style={styles.meta}>
                        <Text style={[styles.date, { color: theme.textSecondary }]}>
                            {formatDate(download.createdAt)}
                        </Text>
                        {download.size > 0 && (
                            <Text style={[styles.size, { color: theme.textSecondary }]}>
                                • {formatFileSize(download.size)}
                            </Text>
                        )}
                        <Text style={[styles.status, { color: getStatusColor() }]}>
                            • {getStatusText()}
                        </Text>
                    </View>

                    {download.status === 'downloading' && (
                        <View style={styles.progress}>
                            <ProgressBar progress={download.progress} showPercentage={false} height={4} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <View style={styles.actions}>
                {download.status === 'downloading' ? (
                    <IconButton
                        icon={<Ionicons name="close" size={20} color={theme.error} />}
                        onPress={() => onCancel(download.id)}
                        size="small"
                    />
                ) : download.status === 'completed' ? (
                    <>
                        <IconButton
                            icon={<Ionicons name="share-outline" size={18} color={theme.text} />}
                            onPress={handleShare}
                            size="small"
                        />
                        <IconButton
                            icon={<Ionicons name="trash-outline" size={18} color={theme.error} />}
                            onPress={handleDelete}
                            size="small"
                        />
                    </>
                ) : (
                    <IconButton
                        icon={<Ionicons name="trash-outline" size={18} color={theme.error} />}
                        onPress={handleDelete}
                        size="small"
                    />
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    filename: {
        fontSize: 15,
        fontWeight: '600',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        flexWrap: 'wrap',
    },
    date: {
        fontSize: 12,
    },
    size: {
        fontSize: 12,
        marginLeft: 4,
    },
    status: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    progress: {
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 4,
    },
});