import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Defs, Pattern, Rect, Circle, G, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');
const C = { hot: '#ED64A6', mid: '#F59EC4', pale: '#FAC9E0', cream: '#FFEBE8', charcoal: '#171314', white: '#FFFFFF' };

const fits = [
  { id: '01', title: 'Vintage Varsity', detail: '90s wool varsity jacket', size: 'M', price: 118, tag: 'Vintage' },
  { id: '02', title: 'Washed Utility', detail: 'Heavyweight work jacket', size: 'M', price: 92, tag: 'Same Energy' },
  { id: '03', title: 'Quiet Luxury', detail: 'Italian wool overshirt', size: 'L', price: 164, tag: 'Your Type' },
];

function HeartBackground() {
  return <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
    <Defs>
      <Pattern id="hearts" width="94" height="88" patternUnits="userSpaceOnUse">
        <Path d="M47 58 C18 39 17 18 30 12 C39 8 46 14 47 22 C49 14 56 8 65 12 C78 18 77 39 47 58Z" fill="none" stroke={C.pale} strokeWidth="2.2" opacity="0.9" />
        <Path d="M8 28 C0 22 0 14 5 12 C9 11 12 14 13 17 C14 14 17 11 21 12 C26 14 26 22 17 28Z" fill="none" stroke={C.mid} strokeWidth="1.4" opacity="0.6" />
      </Pattern>
      <LinearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.cream}/><Stop offset="1" stopColor="#FFF7F5"/></LinearGradient>
    </Defs>
    <Rect width="390" height="844" fill="url(#wash)" />
    <Rect width="390" height="844" fill="url(#hearts)" />
    <Circle cx="330" cy="160" r="115" fill={C.pale} opacity="0.18" />
    <Circle cx="45" cy="610" r="150" fill={C.hot} opacity="0.055" />
  </Svg>;
}

function Garment({ color = '#252021' }: { color?: string }) {
  return <Svg width={W * 0.78} height={W * 0.9} viewBox="0 0 300 340">
    <Defs><LinearGradient id="cloth" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#474143"/><Stop offset="0.48" stopColor={color}/><Stop offset="1" stopColor="#111010"/></LinearGradient></Defs>
    <G>
      <Path d="M91 48 L132 24 Q150 18 168 24 L209 48 L276 96 L245 158 L211 139 L214 319 Q150 333 86 319 L89 139 L55 158 L24 96Z" fill="url(#cloth)" stroke={C.charcoal} strokeWidth="3" />
      <Path d="M132 25 Q150 54 168 25" fill="none" stroke="#8B8183" strokeWidth="3" />
      <Path d="M150 54 L150 317" stroke="#5D5557" strokeWidth="2" opacity="0.65" />
      <Path d="M91 76 L91 313 M209 76 L209 313" stroke="#5D5557" strokeWidth="1.5" opacity="0.5" />
      <Circle cx="150" cy="105" r="4" fill="#D6CCCE"/><Circle cx="150" cy="138" r="4" fill="#D6CCCE"/><Circle cx="150" cy="171" r="4" fill="#D6CCCE"/>
      <Path d="M63 117 L93 102 L93 177 L61 190Z M237 117 L207 102 L207 177 L239 190Z" fill="#2B2728" opacity="0.9" />
      <Path d="M120 54 Q150 69 180 54" fill="none" stroke="#211D1E" strokeWidth="5" opacity="0.7" />
    </G>
  </Svg>;
}

function App() {
  const [index, setIndex] = useState(0);
  const [moment, setMoment] = useState<'none'|'love'|'match'>('none');
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const transitioning = useRef(false);
  const current = fits[index % fits.length];

  const finishSwipe = (direction: number) => {
    if (transitioning.current) return;
    transitioning.current = true;
    Haptics.impactAsync(direction > 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    if (direction > 0) {
      setMoment('love');
      setTimeout(() => setMoment('match'), 230);
      setTimeout(() => { setMoment('none'); setIndex(v => v + 1); x.value = 0; y.value = 0; transitioning.current = false; }, 760);
    } else {
      setTimeout(() => { setIndex(v => v + 1); x.value = 0; y.value = 0; transitioning.current = false; }, 180);
    }
  };

  const pan = Gesture.Pan()
    .onUpdate(e => { if (!transitioning.current) { x.value = e.translationX; y.value = e.translationY * 0.18; } })
    .onEnd(e => {
      if (Math.abs(e.translationX) > 95 || Math.abs(e.velocityX) > 800) {
        const d = e.translationX > 0 ? 1 : -1;
        x.value = withTiming(d * (W + 120), { duration: 260 }, () => runOnJS(finishSwipe)(d));
      } else { x.value = withSpring(0); y.value = withSpring(0); }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-W, 0, W], [-10, 0, 10], Extrapolation.CLAMP)}deg` },
      { scale: interpolate(Math.abs(x.value), [0, W], [1, 0.93], Extrapolation.CLAMP) },
    ],
  }));
  const loveStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [20, 100], [0, 1], Extrapolation.CLAMP), transform: [{ scale: interpolate(x.value, [20, 140], [0.7, 1], Extrapolation.CLAMP) }] }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-20, -100], [0, 1], Extrapolation.CLAMP), transform: [{ scale: interpolate(x.value, [-20, -140], [0.7, 1], Extrapolation.CLAMP) }] }));

  const action = (d: number) => { x.value = withTiming(d * (W + 120), { duration: 260 }, () => runOnJS(finishSwipe)(d)); };

  return <GestureHandlerRootView style={styles.root}>
    <StatusBar style="dark" />
    <HeartBackground />
    <View style={styles.topBar}>
      <View><Text style={styles.eyebrow}>DISCOVER</Text><Text style={styles.question}>Meet your next Fit.</Text></View>
      <View style={styles.topPill}><Ionicons name="sparkles" size={13} color={C.charcoal}/><Text style={styles.pillText}>YOUR TYPE</Text></View>
    </View>

    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.fitCard, cardStyle]}>
        <View style={styles.cardImage}><Garment /><Animated.View style={[styles.signal, loveStyle]}><Text style={styles.signalText}>LOVE</Text></Animated.View><Animated.View style={[styles.signal, styles.passSignal, passStyle]}><Text style={styles.signalText}>PASS</Text></Animated.View></View>
        <View style={styles.info}>
          <View style={styles.tag}><Text style={styles.tagText}>{current.tag}</Text></View>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.detail}>{current.detail} · {current.size}</Text>
          <View style={styles.priceRow}><Text style={styles.price}>${current.price}</Text><Text style={styles.priceNote}>SET PRICE</Text></View>
        </View>
      </Animated.View>
    </GestureDetector>

    <View style={styles.controls}>
      <PressCircle icon="close" label="Pass" onPress={() => action(-1)} />
      <View style={styles.centerHint}><Text style={styles.hint}>SWIPE TO FEEL IT</Text><View style={styles.hintLine}/></View>
      <PressCircle icon="heart" label="Love" filled onPress={() => action(1)} />
    </View>

    {moment !== 'none' && <View pointerEvents="none" style={styles.matchOverlay}><View style={[styles.matchHeart, moment === 'match' && styles.matchHeartBig]}><Ionicons name="heart" size={54} color={C.hot}/></View><Text style={styles.matchKicker}>{moment === 'love' ? 'LOVE' : 'MATCH'}</Text><Text style={styles.matchTitle}>{moment === 'love' ? 'You felt it.' : 'Something clicked.'}</Text></View>}

    <View style={styles.bottomNav}>
      <Nav icon="compass" label="Discover" active/><Nav icon="heart-outline" label="Matches"/><Nav icon="bag-handle-outline" label="Closet"/><Nav icon="person-outline" label="You"/>
    </View>
  </GestureHandlerRootView>;
}

function PressCircle({ icon, label, filled, onPress }: { icon: any; label: string; filled?: boolean; onPress: () => void }) {
  return <View style={styles.actionWrap}><View style={[styles.actionCircle, filled && styles.actionCircleFilled]}><Ionicons.Button name={icon} onPress={onPress} backgroundColor="transparent" color={filled ? C.white : C.charcoal} size={27} iconStyle={{ marginRight: 0 }} /></View><Text style={styles.actionLabel}>{label}</Text></View>;
}
function Nav({ icon, label, active }: { icon: any; label: string; active?: boolean }) { return <View style={styles.navItem}><Ionicons name={icon} size={21} color={active ? C.charcoal : '#887F81'} /><Text style={[styles.navText, active && styles.navActive]}>{label}</Text></View>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  topBar: { paddingHorizontal: 24, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: 11, letterSpacing: 2.4, fontWeight: '700', color: '#6F6567' },
  question: { marginTop: 5, fontSize: 26, lineHeight: 31, letterSpacing: -0.8, fontWeight: '500', color: C.charcoal },
  topPill: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  pillText: { fontSize: 9, letterSpacing: 1.3, fontWeight: '800', color: C.charcoal },
  fitCard: { position: 'absolute', top: 115, left: 20, right: 20, height: H * 0.58, borderRadius: 30, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', shadowColor: C.charcoal, shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
  cardImage: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.22)' },
  info: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 17 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: C.pale },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1, color: '#6B4A57' },
  title: { marginTop: 8, fontSize: 23, fontWeight: '600', letterSpacing: -0.5, color: C.charcoal },
  detail: { marginTop: 3, fontSize: 13, color: '#706668' },
  priceRow: { marginTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  price: { fontSize: 20, fontWeight: '700', color: C.charcoal },
  priceNote: { fontSize: 9, letterSpacing: 1.3, fontWeight: '800', color: '#8C7B81' },
  signal: { position: 'absolute', top: 28, left: 24, borderWidth: 3, borderColor: C.hot, paddingHorizontal: 12, paddingVertical: 6, transform: [{ rotate: '-12deg' }], borderRadius: 7 },
  passSignal: { left: undefined, right: 24, borderColor: C.charcoal, transform: [{ rotate: '12deg' }] },
  signalText: { fontWeight: '900', fontSize: 18, letterSpacing: 1.5, color: C.hot },
  controls: { position: 'absolute', bottom: 91, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionWrap: { alignItems: 'center', gap: 5 },
  actionCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: C.charcoal, shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  actionCircleFilled: { backgroundColor: C.charcoal, borderColor: C.charcoal },
  actionLabel: { display: 'none' },
  centerHint: { alignItems: 'center', opacity: 0.55 },
  hint: { fontSize: 8, letterSpacing: 1.5, fontWeight: '800', color: '#756A6D' },
  hintLine: { marginTop: 4, width: 46, height: 1, backgroundColor: '#B8AEB0' },
  bottomNav: { position: 'absolute', left: 14, right: 14, bottom: 12, height: 59, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center', gap: 3, minWidth: 62 },
  navText: { fontSize: 9, color: '#887F81', letterSpacing: 0.2 },
  navActive: { color: C.charcoal, fontWeight: '700' },
  matchOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,235,232,0.88)' },
  matchHeart: { width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center', shadowColor: C.hot, shadowOpacity: 0.2, shadowRadius: 30 },
  matchHeartBig: { width: 142, height: 142, borderRadius: 71 },
  matchKicker: { marginTop: 20, fontSize: 10, letterSpacing: 3, fontWeight: '900', color: C.hot },
  matchTitle: { marginTop: 7, fontSize: 28, letterSpacing: -1, fontWeight: '500', color: C.charcoal },
});

export default App;
