import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAdView, Button, Card, Input } from '../../src/components';
import { DetectCard } from '../../src/features/detect';
import { showRewardedAd, trackDownloadStarted } from '../../src/services/adManager';
import { setDownloadCallbacks, startDownload } from '../../src/services/downloadManager';
import { probeUrl } from '../../src/services/headProbe';
import { detectUrl } from '../../src/services/urlDetect';
import { useAppStore } from '../../src/store/appStore';
import { useTheme } from '../../src/theme';
import { colors } from '../../src/theme/colors';
import { t } from '../../src/utils/translations';

export default function HomeScreen() {
  const { theme } = useTheme();
  const {
    currentUrl,
    setCurrentUrl,
    detectionResult,
    setDetectionResult,
    isDetecting,
    setIsDetecting,
    settings,
    addDownload,
    updateDownload,
    clearDetection,
  } = useAppStore();

  const [isDownloading, setIsDownloading] = useState(false);

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setCurrentUrl(text);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  }, [setCurrentUrl]);

  const handleDetect = useCallback(async () => {
    if (!currentUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setIsDetecting(true);
    setDetectionResult(null);

    try {
      // First, detect based on URL pattern
      const result = detectUrl(currentUrl);

      // If it looks like a direct file, also probe to confirm
      if (result.isDirectFile) {
        const probeResult = await probeUrl(result.normalizedUrl);
        if (probeResult.success) {
          result.contentType = probeResult.contentType;
          if (!probeResult.isDownloadable && !result.fileExtension) {
            result.canDownload = false;
            result.message = 'This URL does not appear to be a downloadable media file.';
          }
        }
      }

      setDetectionResult(result);
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Error', 'Failed to detect URL');
    } finally {
      setIsDetecting(false);
    }
  }, [currentUrl, setIsDetecting, setDetectionResult]);

  const handleDownload = useCallback(async () => {
    if (!detectionResult?.canDownload) return;

    setIsDownloading(true);

    try {
      // Show rewarded ad first (proceed anyway if it fails)
      await showRewardedAd();

      // Track download event locally
      trackDownloadStarted();

      // Set up callbacks for progress updates
      setDownloadCallbacks(
        (id, progress, downloadedSize, totalSize) => {
          updateDownload(id, { progress, downloadedSize, size: totalSize });
        },
        (id, status, error) => {
          updateDownload(id, { status, error });
        }
      );

      // Start the download
      const download = await startDownload(detectionResult.normalizedUrl);
      addDownload(download);

      if (download.status === 'completed') {
        Alert.alert('Success', t('downloadComplete', settings.language));
        clearDetection();
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', t('downloadFailed', settings.language));
    } finally {
      setIsDownloading(false);
    }
  }, [detectionResult, settings.language, addDownload, updateDownload, clearDetection]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('appName', settings.language)}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('pasteUrl', settings.language)}
            </Text>
          </View>

          {/* URL Input */}
          <View style={styles.inputContainer}>
            <Input
              value={currentUrl}
              onChangeText={setCurrentUrl}
              placeholder="https://example.com/video.mp4"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleDetect}
              onClear={clearDetection}
              rightIcon={
                <Ionicons name="clipboard" size={20} color={theme.textMuted} />
              }
              onRightIconPress={handlePaste}
            />
            <Button
              title={isDetecting ? t('detecting', settings.language) : t('detect', settings.language)}
              onPress={handleDetect}
              loading={isDetecting}
              disabled={!currentUrl.trim()}
              style={styles.detectButton}
            />
          </View>

          {/* Detection Result */}
          {detectionResult && (
            <DetectCard
              result={detectionResult}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          )}

          {/* Compliance Notice */}
          <Card style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary.green} />
              <Text style={[styles.complianceTitle, { color: theme.text }]}>
                {t('complianceTitle', settings.language)}
              </Text>
            </View>
            <Text style={[styles.complianceText, { color: theme.textSecondary }]}>
              {t('complianceDesc', settings.language)}
            </Text>
          </Card>
        </ScrollView>

        {/* Banner Ad at bottom */}
        <BannerAdView size="BANNER" containerStyle={styles.bannerAd} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  inputContainer: {
    gap: 12,
  },
  detectButton: {
    marginTop: 4,
  },
  complianceCard: {
    marginTop: 24,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  complianceText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bannerAd: {
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
});
