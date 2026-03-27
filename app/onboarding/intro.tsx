import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'document-text-outline',
    title: 'Post a Job\nin Minutes',
    subtitle: 'Need something fixed? Post your job and let local tradespeople come to you.',
    forRole: 'Customers',
  },
  {
    id: '2',
    icon: 'swap-horizontal-outline',
    title: 'Swipe Jobs\nThat Suit You',
    subtitle: 'Browse available jobs and accept the ones that match your skills and schedule.',
    forRole: 'Tradespeople',
  },
  {
    id: '3',
    icon: 'location-outline',
    title: 'Built for\nCauseway Coast',
    subtitle: 'Connecting local people with local tradespeople. Supporting our community.',
    forRole: 'Local',
  },
];

export default function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const { setHasSeenOnboarding } = useAuth();

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await setHasSeenOnboarding(true);
      router.replace('/onboarding/role-select');
    }
  };

  const handleSkip = async () => {
    await setHasSeenOnboarding(true);
    router.replace('/onboarding/role-select');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={48} color={Colors.white} />
        </View>
        <Text style={styles.forRole}>{item.forRole}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/hero-handyman.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)', '#000000']}
        locations={[0, 0.35, 0.65, 0.85]}
        style={styles.gradient}
      />

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 140,
  },
  slideContent: {
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  forRole: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '800',
    fontStyle: 'italic',
    lineHeight: 42,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginRight: 8,
  },
  activeDot: {
    backgroundColor: Colors.white,
    width: 24,
  },
  nextButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nextText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
});
