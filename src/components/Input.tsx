import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../theme';

interface InputProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    showClearButton?: boolean;
    onClear?: () => void;
}

export function Input({
    value,
    onChangeText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    showClearButton = true,
    onClear,
    ...props
}: InputProps) {
    const { theme } = useTheme();

    const handleClear = () => {
        onChangeText('');
        onClear?.();
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
            ]}
        >
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <TextInput
                style={[
                    styles.input,
                    {
                        color: theme.text,
                    },
                    leftIcon ? styles.inputWithLeftIcon : null,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor={theme.textMuted}
                {...props}
            />
            {showClearButton && value.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                </TouchableOpacity>
            )}
            {rightIcon && (
                <TouchableOpacity
                    onPress={onRightIconPress}
                    style={styles.rightIcon}
                    disabled={!onRightIconPress}
                >
                    {rightIcon}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        minHeight: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    inputWithLeftIcon: {
        marginLeft: 8,
    },
    leftIcon: {
        marginRight: 4,
    },
    rightIcon: {
        marginLeft: 8,
    },
    clearButton: {
        marginLeft: 4,
        padding: 4,
    },
});
