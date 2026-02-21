import React from 'react';
import { View } from 'react-native';

import { Design } from '@/constants/design';

export default function SkeletonLoader() {
  return (
    <View>
      <View
        style={{
          height: 20,
          width: 140,
          backgroundColor: Design.colors.line,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />
      <View
        style={{
          height: 140,
          borderRadius: 16,
          backgroundColor: Design.colors.line,
          marginBottom: 12,
        }}
      />
      <View style={{ height: 90, borderRadius: 16, backgroundColor: Design.colors.line }} />
    </View>
  );
}
