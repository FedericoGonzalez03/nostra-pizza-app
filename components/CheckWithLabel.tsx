import { Text, View } from "react-native";

export const CheckWithLabel = ({ label, checked, size, disabled }: { label: string | (() => string); checked: boolean; size: number; disabled: boolean }) => {
    return (
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: size }}>
            <View style={[{ width: size * 2 , height: size * 2, borderRadius: size / 3 }, checked ? { backgroundColor: '#D2C682' } : { backgroundColor: '#EED3' }, disabled && {backgroundColor: '#AAB3'}]} />
            <Text style={[{ color: '#F5F5DC', fontFamily: 'Coustard', fontSize: size }, disabled && { color: '#EED3' }]}>
                {typeof label === 'function' ? label() : label}
            </Text>
        </View>
    );
};
