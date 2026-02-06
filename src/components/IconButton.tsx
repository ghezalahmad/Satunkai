import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface IconButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'primary' | 'danger';
    disabled?: boolean;
    style?: ViewStyle;
}

export function IconButton({
    icon,
    onPress,
    size = 'medium',
    variant = 'default',
    disabled = false,
    style,
}: IconButtonProps) {
    const { theme } = useTheme();

    const getSize = () => {
        switch (size) {
            case 'small':
                return 32;
            case 'medium':
                return 44;
            case 'large':
                return 56;
        }
    };

    const getBackgroundColor = () => {
        if (disabled) return theme.border;
        switch (variant) {
            case 'primary':
                return theme.success;
            case 'danger':
                return theme.error;
            default:
                return theme.surface;
        }
    };

    const buttonSize = getSize();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: buttonSize / 2,
                    backgroundColor: getBackgroundColor(),
                    borderColor: theme.border,
                },
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            {icon}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
