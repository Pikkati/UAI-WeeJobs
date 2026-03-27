import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase, PricingType } from '../../lib/supabase';
import { AREAS } from '../../constants/data';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - Spacing.xl * 2 - Spacing.sm) / 3;

export default function TradieProfileScreen() {
  
  const { user, logout, refreshUser } = useAuth();

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [pricingType, setPricingType] = useState<PricingType>(user?.pricing_default || 'fixed');
  const [hourlyRate, setHourlyRate] = useState(user?.hourly_rate?.toString() || '');
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Bio
  const [bio, setBio] = useState(user?.bio || '');
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Areas covered
  const [areasCovered, setAreasCovered] = useState<string[]>(user?.areas_covered || []);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [isSavingAreas, setIsSavingAreas] = useState(false);

  // Portfolio photos
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>(user?.portfolio_photos || []);
  const [isSavingPhotos, setIsSavingPhotos] = useState(false);

  // ── Profile photo ─────────────────────────────────────────────────────────

  const handleProfilePhotoPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  // ── Pricing ──────────────────────────────────────────────────────────────

  const handlePricingTypeChange = async (newType: PricingType) => {
    setPricingType(newType);
    setIsSavingPricing(true);
    try {
      await supabase
        .from('users')
        .update({ pricing_default: newType })
        .eq('id', user?.id);
      await refreshUser();
    } catch (error) {
      console.error('Error updating pricing type:', error);
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleHourlyRateSave = async () => {
    if (!hourlyRate) return;
    setIsSavingPricing(true);
    try {
      await supabase
        .from('users')
        .update({ hourly_rate: parseFloat(hourlyRate) })
        .eq('id', user?.id);
      await refreshUser();
      Alert.alert('Saved', 'Your hourly rate has been updated.');
    } catch (error) {
      console.error('Error updating hourly rate:', error);
      Alert.alert('Error', 'Failed to save hourly rate.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  // ── Bio ───────────────────────────────────────────────────────────────────

  const handleBioSave = async () => {
    setIsSavingBio(true);
    try {
      await supabase
        .from('users')
        .update({ bio: bio.trim() || null })
        .eq('id', user?.id);
      await refreshUser();
      Alert.alert('Saved', 'Your bio has been updated.');
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to save bio.');
    } finally {
      setIsSavingBio(false);
    }
  };

  // ── Areas covered ─────────────────────────────────────────────────────────

  const toggleArea = (area: string) => {
    setAreasCovered((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleAreasSave = async () => {
    setIsSavingAreas(true);
    try {
      await supabase
        .from('users')
        .update({ areas_covered: areasCovered.length > 0 ? areasCovered : null })
        .eq('id', user?.id);
      await refreshUser();
      setShowAreaPicker(false);
      Alert.alert('Saved', 'Your service areas have been updated.');
    } catch (error) {
      console.error('Error updating areas:', error);
      Alert.alert('Error', 'Failed to save service areas.');
    } finally {
      setIsSavingAreas(false);
    }
  };

  // ── Portfolio photos ──────────────────────────────────────────────────────

  const handleAddPhoto = async () => {
    if (portfolioPhotos.length >= 12) {
      Alert.alert('Limit Reached', 'You can add up to 12 portfolio photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...portfolioPhotos, result.assets[0].uri];
      setPortfolioPhotos(newPhotos);
      await savePortfolioPhotos(newPhotos);
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Remove this photo from your portfolio?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const newPhotos = portfolioPhotos.filter((_, i) => i !== index);
          setPortfolioPhotos(newPhotos);
          await savePortfolioPhotos(newPhotos);
        },
      },
    ]);
  };

  const savePortfolioPhotos = async (photos: string[]) => {
    setIsSavingPhotos(true);
    try {
      await supabase
        .from('users')
        .update({ portfolio_photos: photos.length > 0 ? photos : null })
        .eq('id', user?.id);
      await refreshUser();
    } catch (error) {
      console.error('Error saving portfolio photos:', error);
      Alert.alert('Error', 'Failed to save portfolio photos.');
    } finally {
      setIsSavingPhotos(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/onboarding/role-select');
        },
      },
    ]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { paddingTop: Spacing.md }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Profile</Text>

      {/* ── Avatar Card ─────────────────────────────────────── */}
      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handleProfilePhotoPress} activeOpacity={0.8}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="hammer" size={40} color={Colors.accent} />
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={13} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Tradesperson</Text>
        </View>
      </View>

      {/* ── Account Details ──────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Service Area</Text>
            <Text style={styles.infoValue}>{user?.area || 'Not set'}</Text>
          </View>
        </View>
      </View>

      {/* ── Bio ──────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About You</Text>
        <View style={styles.bioCard}>
          <Text style={styles.bioHint}>
            Introduce yourself to customers. Mention your experience, qualifications, and what makes you stand out.
          </Text>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="e.g. Experienced plumber with 10 years on the Causeway Coast…"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={400}
          />
          <View style={styles.bioFooter}>
            <Text style={styles.charCount}>{bio.length}/400</Text>
            <TouchableOpacity
              style={[styles.saveSmallButton, isSavingBio && styles.saveButtonDisabled]}
              onPress={handleBioSave}
              disabled={isSavingBio}
            >
              <Text style={styles.saveSmallText}>{isSavingBio ? 'Saving…' : 'Save Bio'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Trade Categories (read-only) ─────────────────────── */}
      {user?.trade_categories && user.trade_categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trade Categories</Text>
          <View style={styles.tagsContainer}>
            {user.trade_categories.map((category, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Areas Covered ────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Areas</Text>

        {/* Selected chips */}
        {areasCovered.length > 0 && (
          <View style={styles.tagsContainer}>
            {areasCovered.map((area, i) => (
              <TouchableOpacity
                key={i}
                style={styles.areaChipSelected}
                onPress={() => {
                  setAreasCovered(areasCovered.filter((a) => a !== area));
                }}
              >
                <Text style={styles.areaChipSelectedText}>{area}</Text>
                <Ionicons name="close-circle" size={15} color={Colors.accent} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Toggle picker */}
        <TouchableOpacity
          style={styles.addAreaButton}
          onPress={() => setShowAreaPicker(!showAreaPicker)}
        >
          <Ionicons name={showAreaPicker ? 'chevron-up' : 'add-circle-outline'} size={18} color={Colors.accent} />
          <Text style={styles.addAreaText}>
            {showAreaPicker ? 'Done selecting' : 'Select areas you cover'}
          </Text>
        </TouchableOpacity>

        {showAreaPicker && (
          <View style={styles.areaPicker}>
            {AREAS.map((area) => {
              const selected = areasCovered.includes(area);
              return (
                <TouchableOpacity
                  key={area}
                  style={[styles.areaPickerItem, selected && styles.areaPickerItemSelected]}
                  onPress={() => toggleArea(area)}
                >
                  <Text style={[styles.areaPickerText, selected && styles.areaPickerTextSelected]}>
                    {area}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.saveSmallButton, { marginTop: Spacing.sm }, isSavingAreas && styles.saveButtonDisabled]}
              onPress={handleAreasSave}
              disabled={isSavingAreas}
            >
              <Text style={styles.saveSmallText}>{isSavingAreas ? 'Saving…' : 'Save Service Areas'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Portfolio Photos ─────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Photos</Text>
        <Text style={styles.portfolioHint}>
          Add photos of your previous work to showcase your skills to customers.
        </Text>

        <View style={styles.portfolioGrid}>
          {portfolioPhotos.map((uri, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.portfolioCell, { width: PHOTO_SIZE, height: PHOTO_SIZE }]}
              onLongPress={() => handleRemovePhoto(i)}
              activeOpacity={0.85}
            >
              <Image source={{ uri }} style={styles.portfolioImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(i)}
              >
                <Ionicons name="close-circle" size={20} color={Colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {portfolioPhotos.length < 12 && (
            <TouchableOpacity
              style={[styles.addPhotoCell, { width: PHOTO_SIZE, height: PHOTO_SIZE }]}
              onPress={handleAddPhoto}
              disabled={isSavingPhotos}
            >
              <Ionicons name="add" size={28} color={Colors.accent} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {portfolioPhotos.length === 0 && (
          <Text style={styles.portfolioEmpty}>
            Tap the + button to add your first portfolio photo
          </Text>
        )}
      </View>

      {/* ── Pricing Preference ───────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing Preference</Text>
        <View style={styles.pricingCard}>
          <Text style={styles.pricingDescription}>
            Choose how you prefer to price your work. This will be applied to new jobs you accept.
          </Text>

          <View style={styles.pricingOptions}>
            <TouchableOpacity
              style={[
                styles.pricingOption,
                pricingType === 'fixed' && styles.pricingOptionSelected,
              ]}
              onPress={() => handlePricingTypeChange('fixed')}
              disabled={isSavingPricing}
            >
              <Ionicons
                name="pricetag"
                size={24}
                color={pricingType === 'fixed' ? Colors.background : Colors.accent}
              />
              <Text style={[
                styles.pricingOptionTitle,
                pricingType === 'fixed' && styles.pricingOptionTitleSelected,
              ]}>Fixed Price</Text>
              <Text style={[
                styles.pricingOptionDesc,
                pricingType === 'fixed' && styles.pricingOptionDescSelected,
              ]}>Send a binding quote before starting work</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pricingOption,
                pricingType === 'hourly' && styles.pricingOptionSelected,
              ]}
              onPress={() => handlePricingTypeChange('hourly')}
              disabled={isSavingPricing}
            >
              <Ionicons
                name="time"
                size={24}
                color={pricingType === 'hourly' ? Colors.background : Colors.accent}
              />
              <Text style={[
                styles.pricingOptionTitle,
                pricingType === 'hourly' && styles.pricingOptionTitleSelected,
              ]}>Hourly Rate</Text>
              <Text style={[
                styles.pricingOptionDesc,
                pricingType === 'hourly' && styles.pricingOptionDescSelected,
              ]}>Send an estimate first, invoice after work</Text>
            </TouchableOpacity>
          </View>

          {pricingType === 'hourly' && (
            <View style={styles.hourlyRateSection}>
              <Text style={styles.hourlyRateLabel}>Your Hourly Rate</Text>
              <View style={styles.hourlyRateInput}>
                <Text style={styles.currencySymbol}>£</Text>
                <TextInput
                  style={styles.rateInput}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.perHour}>/hour</Text>
              </View>
              <TouchableOpacity
                style={styles.saveRateButton}
                onPress={handleHourlyRateSave}
                disabled={isSavingPricing || !hourlyRate}
              >
                <Text style={styles.saveRateText}>
                  {isSavingPricing ? 'Saving...' : 'Save Rate'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Subscription ─────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity
          style={styles.planCard}
          onPress={() => router.push('/tradie/pricing')}
        >
          <View style={styles.planInfo}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>PAYG</Text>
            </View>
            <Text style={styles.planTitle}>Pay As You Go</Text>
            <Text style={styles.planSubtitle}>Upgrade to PRO for unlimited leads</Text>
          </View>
          <View style={styles.changePlanButton}>
            <Text style={styles.changePlanText}>Change Plan</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.background} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Legal ────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity style={styles.linkItem}>
          <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.linkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}>
          <Ionicons name="shield-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>WeeJobs v1.0.0</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    paddingBottom: Spacing.xxl * 2,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  name: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: Spacing.md,
    flex: 1,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Bio
  bioCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  bioInput: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 110,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bioFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  saveSmallButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  saveSmallText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },

  // Tags & chips
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tag: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  tagText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },

  // Areas
  areaChipSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  areaChipSelectedText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  addAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  addAreaText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  areaPicker: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    gap: 2,
  },
  areaPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  areaPickerItemSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  areaPickerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  areaPickerTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Portfolio
  portfolioHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  portfolioCell: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BorderRadius.full,
  },
  addPhotoCell: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  portfolioEmpty: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
  },

  // Pricing
  pricingCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pricingDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  pricingOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pricingOption: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  pricingOptionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pricingOptionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  pricingOptionTitleSelected: {
    color: Colors.white,
  },
  pricingOptionDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  pricingOptionDescSelected: {
    color: Colors.white,
    opacity: 0.8,
  },
  hourlyRateSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  hourlyRateLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  hourlyRateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginRight: Spacing.sm,
  },
  rateInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  perHour: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  saveRateButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  saveRateText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Plan card
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  planInfo: {
    marginBottom: Spacing.md,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  planBadgeText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  planTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  planSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  changePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  changePlanText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Legal links
  linkItem: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: Spacing.md,
    flex: 1,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
