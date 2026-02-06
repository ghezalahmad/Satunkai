import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components';
import { DownloadItem } from '../../src/features/downloads';
import { cancelDownload, removeDownload } from '../../src/services/downloadManager';
import { useAppStore } from '../../src/store/appStore';
import { useTheme } from '../../src/theme';
import { Download } from '../../src/types';
import { t } from '../../src/utils/translations';

export default function DownloadsScreen() {
    const { theme } = useTheme();
    const {
        downloads,
        settings,
        refreshDownloads,
        searchDownloads,
        removeDownload: removeFromStore,
    } = useAppStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        refreshDownloads();
    }, [refreshDownloads]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshDownloads();
        setRefreshing(false);
    }, [refreshDownloads]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        searchDownloads(query);
    }, [searchDownloads]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await removeDownload(id);
            removeFromStore(id);
        } catch (error) {
            console.error('Failed to delete download:', error);
        }
    }, [removeFromStore]);

    const handleCancel = useCallback(async (id: string) => {
        try {
            await cancelDownload(id);
        } catch (error) {
            console.error('Failed to cancel download:', error);
        }
    }, []);

    const renderItem = ({ item }: { item: Download }) => (
        <DownloadItem
            download={item}
            onDelete={handleDelete}
            onCancel={handleCancel}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="cloud-download-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {t('noDownloads', settings.language)}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {t('noDownloadsDesc', settings.language)}
            </Text>
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
            edges={['bottom']}
        >
            <View style={styles.searchContainer}>
                <Input
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholder={t('search', settings.language)}
                    leftIcon={<Ionicons name="search" size={20} color={theme.textMuted} />}
                />
            </View>

            <FlatList
                data={downloads}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    downloads.length === 0 && styles.emptyList,
                ]}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.textMuted}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
