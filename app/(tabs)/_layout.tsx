import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';
import { c } from '@/theme';

function Icon({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 21, opacity: color === c.primary ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { height: 82, paddingBottom: 22, paddingTop: 8, borderTopColor: c.line },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: '홈', tabBarIcon: ({ color }) => <Icon emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="record"
        options={{ title: '기록', tabBarIcon: ({ color }) => <Icon emoji="📖" color={color} /> }}
      />
      <Tabs.Screen
        name="my"
        options={{ title: '마이', tabBarIcon: ({ color }) => <Icon emoji="🙂" color={color} /> }}
      />
    </Tabs>
  );
}
