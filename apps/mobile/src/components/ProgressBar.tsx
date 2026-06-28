import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

type ProgressBarProps = {
  progress: number;
  height?: number;
  style?: ViewStyle;
};

export function ProgressBar({ progress, height = 10, style }: ProgressBarProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const animatedProgress = useRef(new Animated.Value(normalizedProgress)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      duration: 360,
      toValue: normalizedProgress,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, normalizedProgress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            borderRadius: height,
            width,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: '#B7FF4A',
    height: '100%',
  },
});
