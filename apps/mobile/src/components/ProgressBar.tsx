import { StyleSheet, View, ViewStyle } from 'react-native';

type ProgressBarProps = {
  progress: number;
  height?: number;
  style?: ViewStyle;
};

export function ProgressBar({ progress, height = 10, style }: ProgressBarProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.track, { height, borderRadius: height }, style]}>
      <View
        style={[
          styles.fill,
          {
            borderRadius: height,
            width: `${normalizedProgress}%`,
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
