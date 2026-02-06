import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components';
import { useAppStore } from '../../src/store/appStore';
import { useTheme } from '../../src/theme';
import { colors } from '../../src/theme/colors';
import { Language, ThemeMode } from '../../src/types';
import { t } from '../../src/utils/translations';

export default function SettingsScreen() {
    const { theme, themeMode, setThemeMode } = useTheme();
    const { settings, setLanguage } = useAppStore();

    const themeOptions: { value: ThemeMode; label: string }[] = [
        { value: 'system', label: t('themeSystem', settings.language) },
        { value: 'light', label: t('themeLight', settings.language) },
        { value: 'dark', label: t('themeDark', settings.language) },
    ];

    const languageOptions: { value: Language; label: string }[] = [
        { value: 'en', label: t('english', settings.language) },
        { value: 'da', label: t('dari', settings.language) },
        { value: 'ps', label: t('pashto', settings.language) },
    ];

    const renderOption = (
        value: string,
        label: string,
        isSelected: boolean,
        onPress: () => void
    ) => (
        <TouchableOpacity
            key={value}
            style={[
                styles.option,
                {
                    backgroundColor: isSelected ? colors.primary.green + '20' : theme.surface,
                    borderColor: isSelected ? colors.primary.green : theme.border,
                },
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.optionLabel,
                    {
                        color: isSelected ? colors.primary.green : theme.text,
                        fontWeight: isSelected ? '600' : '400',
                    },
                ]}
            >
                {label}
            </Text>
            {isSelected && (
                <Ionicons name="checkmark" size={20} color={colors.primary.green} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
            edges={['bottom']}
        >
            <ScrollView contentContainerStyle={styles.content}>
                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('theme', settings.language)}
                    </Text>
                    <View style={styles.optionsContainer}>
                        {themeOptions.map((option) =>
                            renderOption(
                                option.value,
                                option.label,
                                themeMode === option.value,
                                () => setThemeMode(option.value)
                            )
                        )}
                    </View>
                </View>

                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('language', settings.language)}
                    </Text>
                    <View style={styles.optionsContainer}>
                        {languageOptions.map((option) =>
                            renderOption(
                                option.value,
                                option.label,
                                settings.language === option.value,
                                () => setLanguage(option.value)
                            )
                        )}
                    </View>
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('privacy', settings.language)}
                    </Text>
                    <Card>
                        <View style={styles.privacyHeader}>
                            <Ionicons name="lock-closed" size={20} color={colors.primary.green} />
                            <Text style={[styles.privacyTitle, { color: theme.text }]}>
                                {t('privacy', settings.language)}
                            </Text>
                        </View>
                        <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                            {t('privacyNote', settings.language)}
                        </Text>
                    </Card>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {t('about', settings.language)}
                    </Text>
                    <Card>
                        <View style={styles.aboutRow}>
                            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>
                                {t('appName', settings.language)}
                            </Text>
                            <Text style={[styles.aboutValue, { color: theme.text }]}>
                                {t('appName', settings.language)}
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                        <View style={styles.aboutRow}>
                            <Text style={[styles.aboutLabel, { color: theme.textSecondary }]}>
                                {t('version', settings.language)}
                            </Text>
                            <Text style={[styles.aboutValue, { color: theme.text }]}>
                                1.0.0
                            </Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    optionsContainer: {
        gap: 8,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    optionLabel: {
        fontSize: 16,
    },
    privacyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    privacyTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    privacyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    aboutLabel: {
        fontSize: 14,
    },
    aboutValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
});
