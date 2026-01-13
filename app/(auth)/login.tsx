import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>(
        {}
    );

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        // if (!email.trim()) {
        //     newErrors.email = 'Vui lòng nhập email';
        // } else if (!email.includes('@')) {
        //     newErrors.email = 'Email không hợp lệ';
        // }

        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            await login(email, password);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Đăng nhập thất bại';
            Alert.alert('Lỗi', message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🏥</Text>
                        <Text style={styles.title}>Đăng nhập</Text>
                        <Text style={styles.subtitle}>
                            Chào mừng bạn đến với Clinic App
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.email && styles.inputError,
                                ]}
                                placeholder="Nhập email của bạn"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email)
                                        setErrors({
                                            ...errors,
                                            email: undefined,
                                        });
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>
                                    {errors.email}
                                </Text>
                            )}
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.password && styles.inputError,
                                ]}
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password)
                                        setErrors({
                                            ...errors,
                                            password: undefined,
                                        });
                                }}
                                secureTextEntry
                            />
                            {errors.password && (
                                <Text style={styles.errorText}>
                                    {errors.password}
                                </Text>
                            )}
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Chưa có tài khoản?{' '}
                            <Text style={styles.linkText}>Đăng ký</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FB',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#64748b',
    },
    linkText: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
