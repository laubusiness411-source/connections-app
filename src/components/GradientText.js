import React from 'react';
import { Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

// Renders text filled with a left-to-right gradient (for hero moments like
// the logo and the match title).
export default function GradientText({
  children,
  style,
  colors = ['#A99CF0', '#6C5CE7', '#5BC0EB'],
}) {
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Transparent copy sizes the gradient to the text. */}
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
