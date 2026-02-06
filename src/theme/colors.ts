// Afghan flag inspired color palette
// Black (top stripe), Red (middle stripe), Green (bottom stripe)

export const colors = {
    // Primary colors from Afghan flag
    primary: {
        black: '#1A1A1A',
        red: '#CE1126',
        green: '#007A3D',
    },

    // Light theme
    light: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        surfaceElevated: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666',
        textMuted: '#999999',
        border: '#E0E0E0',
        divider: '#EEEEEE',

        // Semantic colors
        success: '#007A3D',
        error: '#CE1126',
        warning: '#F5A623',
        info: '#2196F3',

        // Platform colors
        youtube: '#FF0000',
        tiktok: '#000000',
        instagram: '#E1306C',
        facebook: '#1877F2',
    },

    // Dark theme
    dark: {
        background: '#121212',
        surface: '#1E1E1E',
        surfaceElevated: '#2C2C2C',
        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        textMuted: '#757575',
        border: '#333333',
        divider: '#2C2C2C',

        // Semantic colors
        success: '#4CAF50',
        error: '#EF5350',
        warning: '#FFB74D',
        info: '#64B5F6',

        // Platform colors
        youtube: '#FF4444',
        tiktok: '#FFFFFF',
        instagram: '#E1306C',
        facebook: '#1877F2',
    },
};

export type ColorScheme = typeof colors.light;
