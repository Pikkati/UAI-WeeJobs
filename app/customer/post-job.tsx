import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { AREAS, JOB_CATEGORIES, TIMING_OPTIONS, GARAGE_TIMING_OPTIONS } from '../../constants/data';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// DropdownOption type removed (unused)

function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, !!error && styles.inputError]}
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
      {error && <Text style={styles.errorText}>{error}</Text>}
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

export default function PostJobScreen() {
  const { category: preselectedCategory } = useLocalSearchParams<{ category: string }>();
  const { user: _user } = useAuth();

  const [name, setName] = useState(_user?.name || '');
  const [phone, setPhone] = useState(_user?.phone || '');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState(_user?.area || '');
  const [category, setCategory] = useState(preselectedCategory || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timing, setTiming] = useState('');
  const [budget, setBudget] = useState('');
  const [needsQuotation, setNeedsQuotation] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    budget?: string;
    timing?: string;
    area?: string;
    category?: string;
  }>({});

  const isGarageClearance = category === 'Garage Clearance';
  const timingOptions = isGarageClearance ? GARAGE_TIMING_OPTIONS : TIMING_OPTIONS;

  useEffect(() => {
    if (preselectedCategory) {
      setCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

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

  const validate = () => {
    const newErrors: typeof errors = {};
    if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    if (description.trim().length < 30) {
      newErrors.description = 'Description must be at least 30 characters';
    }
    if (!timing) {
      newErrors.timing = 'Please select when you need this done';
    }
    if (!area) {
      newErrors.area = 'Please select your area';
    }
    if (!category) {
      newErrors.category = 'Please select a job category';
    }
    if (!needsQuotation) {
      if (!budget) {
        newErrors.budget = 'Please enter a budget amount or select "Need Quotation"';
      } else if (parseFloat(budget) < 10) {
        newErrors.budget = 'Budget must be at least £10';
      }
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      Alert.alert('Required Fields', 'Please fill in your name and phone number');
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isGarageClearance && photos.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo for garage clearance jobs');
      return;
    }

    setIsSubmitting(true);

    try {
      const budgetValue = needsQuotation ? 'Need Quotation' : `£${budget}`;

      const { error } = await supabase.from('jobs').insert({
        customer_id: _user?.id,
        name,
        phone,
        email: email || null,
        area,
        category,
        title: title.trim(),
        description: description.trim(),
        timing,
        budget: budgetValue,
        photos: photos.length > 0 ? photos : null,
        status: 'open',
        is_garage_clearance: isGarageClearance,
      });

      if (error) throw error;

      Alert.alert('Success', 'Your job has been posted!', [
        { text: 'OK', onPress: () => router.push('/customer/jobs') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Spacing.md }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Post a Job</Text>
      <Text style={styles.subtitle}>Tell us what you need help with</Text>

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

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Job Title *</Text>
        <TextInput
          style={[styles.input, !!errors.title && styles.inputError]}
          value={title}
          onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: undefined })); }}
          placeholder="e.g. Fix leaking kitchen tap"
          placeholderTextColor={Colors.textSecondary}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <Dropdown
        label="Area *"
        options={AREAS}
        value={area}
        onChange={(v) => { setArea(v); setErrors((e) => ({ ...e, area: undefined })); }}
        placeholder="Select your area"
        error={errors.area}
      />

      <Dropdown
        label="Job Category *"
        options={JOB_CATEGORIES}
        value={category}
        onChange={(v) => { setCategory(v); setErrors((e) => ({ ...e, category: undefined })); }}
        placeholder="Select job category"
        error={errors.category}
      />

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, !!errors.description && styles.inputError]}
          value={description}
          onChangeText={(v) => { setDescription(v); setErrors((e) => ({ ...e, description: undefined })); }}
          placeholder="Describe the job in detail (at least 30 characters)..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      <Dropdown
        label="When do you need this? *"
        options={timingOptions}
        value={timing}
        onChange={(v) => { setTiming(v); setErrors((e) => ({ ...e, timing: undefined })); }}
        placeholder="Select timing"
        error={errors.timing}
      />

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Budget *</Text>
        <TouchableOpacity
          style={styles.quotationToggle}
          onPress={() => {
            setNeedsQuotation(!needsQuotation);
            setBudget('');
            setErrors((e) => ({ ...e, budget: undefined }));
          }}
        >
          <View style={[styles.checkbox, needsQuotation && styles.checkboxChecked]}>
            {needsQuotation && <Ionicons name="checkmark" size={16} color={Colors.background} />}
          </View>
          <Text style={styles.quotationText}>Need Quotation</Text>
        </TouchableOpacity>
        {!needsQuotation && (
          <View style={[styles.budgetInputContainer, !!errors.budget && styles.inputError]}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={(v) => { setBudget(v); setErrors((e) => ({ ...e, budget: undefined })); }}
              placeholder="Enter your budget (min £10)"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        )}
        {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
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
            <Text style={styles.submitButtonText}>Post Job</Text>
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
  content: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
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
