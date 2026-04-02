import { useEffect } from 'react';
// Initialize Sentry (safe no-op if not configured)
import '../lib/sentry';

import { View, StyleSheet, Dimensions , Text } from 'react-native';
// Use react-native Image for splash (workaround for ExpoImage runtime crash)
import { Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../constants/theme';

import { LinearGradient } from 'expo-linear-gradient';
// Ensure the fallback routes manifest runs at startup so inspector keys exist
try {
  // eslint-disable-next-line global-require
  require('./_routesManifest');
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('[routes-manifest] import failed', String(e));
}
// Simplify the import logic for expo-file-system
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';

// Log the usage of expo-file-system
console.log('[app] using expo-file-system');

// Very early, hard-to-strip markers: use console.error and attempt a quick write
try {
  // eslint-disable-next-line no-console
  console.error('[expo-router-inspector-init]');
  // eslint-disable-next-line no-console
  console.error('[expo-router-inspector-init-warn]');
} catch (_e) {}
(async () => {
  try {
    const _earlySd = '/sdcard/Download/expo-router-inspector-early.txt';
    const _earlyExt = '/sdcard/Android/data/com.weejobs.app/files/expo-router-inspector-early.txt';
    try {
      await FileSystem.writeAsStringAsync(_earlySd, JSON.stringify({ ts: Date.now() }));
      // eslint-disable-next-line no-console
      console.error('[expo-router-inspector-early-write] success', _earlySd);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[expo-router-inspector-early-write] fail', String(e));
      try {
        await FileSystem.writeAsStringAsync(_earlyExt, JSON.stringify({ ts: Date.now() }));
        // eslint-disable-next-line no-console
        console.error('[expo-router-inspector-early-write-external] success', _earlyExt);
      } catch (e2) {
        // eslint-disable-next-line no-console
        console.error('[expo-router-inspector-early-write-external] fail', String(e2));
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[expo-router-inspector-early-write] outer fail', String(e));
  }
})();
try {
  // eslint-disable-next-line no-console
  console.log('[app] image import:', typeof Image, Image ? 'present' : 'missing');
}
catch (_e) { }

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { user, isLoading, hasSeenOnboarding } = useAuth();

  useEffect(() => {
    try {
      console.log('[expo-router-inspector-debug] inspector useEffect start');
      const keys = globalThis.__EXPO_ROUTER_KEYS;
      const modules = globalThis.__EXPO_ROUTER_MODULES;
      console.log('[expo-router-inspector-debug] keys present:', Array.isArray(keys) ? keys.length : 'no-keys', 'modulesPresent:', !!modules);
      if (!Array.isArray(keys) || keys.length === 0) {
        console.log('[expo-router-inspector-debug] no keys found, skipping inspector');
        return;
      }
      // Expose a promise so other startup code can await the inspector write completing.
      (globalThis as any).__EXPO_ROUTER_INSPECTOR_PROMISE = (async () => {
        const results: Record<string, any> = {};
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          try {
            let mod: any = null;
            if (modules && typeof modules[key] === 'function') {
              mod = modules[key]();
            } else {
              // Skip dynamic require when bundling; rely on __EXPO_ROUTER_MODULES mapping.
            }
            results[key] = { ok: true, hasDefault: !!(mod && mod.default), defaultType: typeof (mod && mod.default) };
          } catch (err) {
            results[key] = { ok: false, error: String(err) };
          }
        }
        try {
          const docDir = Paths.document || '';
          const out = `${docDir}expo-router-inspect-all.json`;
          console.log('[expo-router-inspector-debug] write target:', out);
          try {
            await FileSystem.writeAsStringAsync(out, JSON.stringify({ ts: Date.now(), results }));
            console.log('[expo-router-inspector-debug] wrote to docDir');
            // Confirm file presence with retries to handle platform flush/delay
            for (let __attempt = 0; __attempt < 6; __attempt++) {
              try {
                // eslint-disable-next-line no-await-in-loop
                const info = await FileSystem.getInfoAsync(out);
                if (info && info.exists && (info.size || 0) > 0) {
                  console.log('[expo-router-inspector-debug] docDir file confirmed', info.size || 0);
                  break;
                } else {
                  console.log('[expo-router-inspector-debug] docDir file not found or empty', info);
                }
              } catch (_e) {
                console.log('[expo-router-inspector-debug] getInfoAsync error', String(_e));
              }
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 500));
            }
          } catch (e) {
            console.log('[expo-router-inspector-debug] write to docDir failed', String(e));
          }
          try {
            const _sdPath = '/sdcard/Download/expo-router-inspect-all.json';
            const _extPath = '/sdcard/Android/data/com.weejobs.app/files/expo-router-inspect-all.json';
            try {
              await FileSystem.writeAsStringAsync(_sdPath, JSON.stringify({ ts: Date.now(), resultsCount: Object.keys(results).length }));
              console.log('[expo-router-inspector-debug] wrote to sdcard/Download', _sdPath);
              try {
                for (let __attempt = 0; __attempt < 4; __attempt++) {
                  try {
                    // eslint-disable-next-line no-await-in-loop
                    const infoSd = await FileSystem.getInfoAsync(_sdPath);
                    if (infoSd && infoSd.exists) {
                      console.log('[expo-router-inspector-debug] sdcard file confirmed', infoSd.size || 0);
                      break;
                    } else {
                      console.log('[expo-router-inspector-debug] sdcard file not found or empty', infoSd);
                    }
                  } catch (_e) {
                    console.log('[expo-router-inspector-debug] getInfoAsync sdcard error', String(_e));
                  }
                  // eslint-disable-next-line no-await-in-loop
                  await new Promise((r) => setTimeout(r, 400));
                }
              } catch (_e) {
                console.log('[expo-router-inspector-debug] sdcard confirm error', String(_e));
              }
            } catch (e) {
              console.log('[expo-router-inspector-debug] write to sdcard/Download failed', String(e));
              // Try writing to app external files directory which is allowed on modern Android
              try {
                await FileSystem.writeAsStringAsync(_extPath, JSON.stringify({ ts: Date.now(), resultsCount: Object.keys(results).length }));
                console.log('[expo-router-inspector-debug] wrote to external app files', _extPath);
                try {
                  const infoExt = await FileSystem.getInfoAsync(_extPath);
                  console.log('[expo-router-inspector-debug] external file info', infoExt && infoExt.exists ? infoExt.size : 'no-info');
                } catch (_ie) {
                  console.log('[expo-router-inspector-debug] external getInfoAsync error', String(_ie));
                }
              } catch (_extErr) {
                console.log('[expo-router-inspector-debug] write to sdcard failed', String(_extErr));
              }
            }
          } catch (e) {
            console.log('[expo-router-inspector-debug] write to sdcard block failed', String(e));
          }
          // Also emit the full JSON to console in chunked messages so logcat can capture it when pulls fail
          try {
            const __dump = JSON.stringify({ ts: Date.now(), results });
            const __chunk = 8000;
            for (let __k = 0; __k < __dump.length; __k += __chunk) {
              try { console.log('[expo-router-inspector-json]' + __dump.slice(__k, __k + __chunk)); } catch (_) {}
            }
            console.log('[expo-router-inspector-debug] emitted console chunks, totalChars=' + __dump.length);
          } catch (e) {
            console.log('[expo-router-inspector-debug] emit console chunks failed', String(e));
          }
        } catch (e) {
          console.log('[expo-router-inspector-debug] write block failed', String(e));
        }
        console.log('[expo-router-inspector-debug] inspector promise resolved');
        return true;
      })();
    } catch (e) {
      console.log('[expo-router-inspector-debug] inspector main catch', String(e));
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      (async () => {
        try {
          const p = (globalThis as any).__EXPO_ROUTER_INSPECTOR_PROMISE;
          if (p && typeof p.then === 'function') {
            // Wait for the inspector write to finish, but don't block startup too long.
            await Promise.race([p, new Promise((r) => setTimeout(r, 4000))]);
            console.log('[expo-router-inspector-debug] waited for inspector write (or timeout)');
          } else {
            console.log('[expo-router-inspector-debug] no inspector promise present');
          }
        } catch (e) {
          console.log('[expo-router-inspector-debug] error waiting for inspector promise', String(e));
        }

        if (user) {
          if (user.role === 'customer') {
            router.replace('/customer');
          } else if (user.role === 'tradesperson') {
            router.replace('/tradie/home');
          } else if (user.role === 'admin') {
            router.replace('/admin');
          }
        } else {
          router.replace('/onboarding/intro');
        }
      })();
    }, 3500);

    return () => clearTimeout(timer);
  }, [isLoading, user, hasSeenOnboarding]);

  return (
    <View style={styles.container} accessible accessibilityLabel="WeeJobs splash screen">
      <Image
        source={require('../assets/images/hero-handyman.png')}
        style={styles.heroImage}
        resizeMode="cover"
        accessibilityLabel="Handyman hero image"
        accessible
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
        style={styles.gradient}
      />
      <View style={styles.content} accessible accessibilityLabel="WeeJobs logo and tagline">
        <Image
          source={require('../assets/images/weejobs-logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="WeeJobs logo"
          accessible
        />
        <Text style={styles.tagline} accessibilityRole="header">No Job Too Wee</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 120,
  },
  logo: {
    width: 220,
    height: 80,
  },
  tagline: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 2,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
  },
});
