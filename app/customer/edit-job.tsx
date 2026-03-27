import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { AREAS, JOB_CATEGORIES, TIMING_OPTIONS, GARAGE_TIMING_OPTIONS } from '../../constants/data';
// removed unused useAuth import
import { supabase, Job } from '../../lib/supabase';

function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  value === option && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === option && styles.dropdownItemTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function EditJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [timing, setTiming] = useState('');
  const [budget, setBudget] = useState('');
  const [needsQuotation, setNeedsQuotation] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGarageClearance = category === 'Garage Clearance';
  const timingOptions = isGarageClearance ? GARAGE_TIMING_OPTIONS : TIMING_OPTIONS;

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        Alert.alert('Error', 'No job ID provided');
        router.back();
        return;
      }

      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;

        if (!data) {
          Alert.alert('Error', 'Job not found');
          router.back();
          return;
        }

        const job = data as Job;
        setName(job.name || '');
        setPhone(job.phone || '');
        setEmail(job.email || '');
        setArea(job.area || '');
        setCategory(job.category || '');
        setDescription(job.description || '');
        setTiming(job.timing || '');
        setPhotos(job.photos || []);

        if (job.budget === 'Need Quotation') {
          setNeedsQuotation(true);
          setBudget('');
        } else if (job.budget) {
          setNeedsQuotation(false);
          setBudget(job.budget.replace('£', ''));
        }
      } catch (error) {
        console.error('Error loading job:', error);
        Alert.alert('Error', 'Failed to load job');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name || !phone || !area || !category || !timing) {
      Alert.alert('Required Fields', 'Please fill in all required fields');
      return;
    }

    if (isGarageClearance && photos.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo for garage clearance jobs');
      return;
    }

    setIsSubmitting(true);

    try {
      const budgetValue = needsQuotation ? 'Need Quotation' : (budget ? `£${budget}` : null);
      
      const { error } = await supabase
        .from('jobs')
        .update({
          name,
          phone,
          email: email || null,
          area,
          category,
          description: description || null,
          timing,
          budget: budgetValue,
          photos: photos.length > 0 ? photos : null,
          is_garage_clearance: isGarageClearance,
        })
        .eq('id', jobId);

      if (error) throw error;

      Alert.alert('Success', 'Your job has been updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update job. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Spacing.md }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Job</Text>
      </View>
      <Text style={styles.subtitle}>Update your job details</Text>

      {isGarageClearance && (
        <View style={styles.garageNote}>
          <Ionicons name="car" size={24} color={Colors.accent} />
          <View style={styles.garageNoteText}>
            <Text style={styles.garageNoteTitle}>Garage Clearance</Text>
            <Text style={styles.garageNotePrice}>Starting from £199</Text>
          </View>
        </View>
      )}

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Your Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Dropdown
        label="Area *"
        options={AREAS}
        value={area}
        onChange={setArea}
        placeholder="Select your area"
      />

      <Dropdown
        label="Job Category *"
        options={JOB_CATEGORIES}
        value={category}
        onChange={setCategory}
        placeholder="Select job category"
      />

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the job in detail..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <Dropdown
        label="When do you need this? *"
        options={timingOptions}
        value={timing}
        onChange={setTiming}
        placeholder="Select timing"
      />

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Budget</Text>
        <TouchableOpacity
          style={styles.quotationToggle}
          onPress={() => {
            setNeedsQuotation(!needsQuotation);
            if (!needsQuotation) setBudget('');
          }}
        >
          <View style={[styles.checkbox, needsQuotation && styles.checkboxChecked]}>
            {needsQuotation && <Ionicons name="checkmark" size={16} color={Colors.background} />}
          </View>
          <Text style={styles.quotationText}>Need Quotation</Text>
        </TouchableOpacity>
        {!needsQuotation && (
          <View style={styles.budgetInputContainer}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              placeholder="Enter your budget"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Photos {isGarageClearance ? '*' : '(optional)'} - Max 5
        </Text>
        <View style={styles.photoGrid}>
          {photos.map((uri, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photo} contentFit="cover" />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Ionicons name="camera" size={32} color={Colors.textSecondary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.background} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={24} color={Colors.background} />
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl * 2 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  garageNote: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  garageNoteText: {
    marginLeft: Spacing.md,
  },
  garageNoteTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  garageNotePrice: {
    color: Colors.accent,
    fontSize: 14,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
    zIndex: 1,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
  },
  quotationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  quotationText: {
    color: Colors.white,
    fontSize: 16,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: Spacing.md,
  },
  budgetInput: {
    flex: 1,
    padding: Spacing.md,
    color: Colors.white,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownText: {
    color: Colors.white,
    fontSize: 16,
  },
  placeholder: {
    color: Colors.textSecondary,
  },
  dropdownList: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.background,
  },
  dropdownItemText: {
    color: Colors.white,
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: Colors.accent,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
