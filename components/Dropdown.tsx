import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

export default function Dropdown({
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
    <View style={ddStyles.fieldContainer}>
      <Text style={ddStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[ddStyles.dropdown, !!error && ddStyles.inputError]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={[ddStyles.dropdownText, !value && ddStyles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      {error && <Text style={ddStyles.errorText}>{error}</Text>}
      {isOpen && (
        <View style={ddStyles.dropdownList}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  ddStyles.dropdownItem,
                  value === option && ddStyles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    ddStyles.dropdownItemText,
                    value === option && ddStyles.dropdownItemTextSelected,
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

const ddStyles = StyleSheet.create({
  fieldContainer: { marginBottom: Spacing.md, zIndex: 1 },
  label: { color: Colors.white, fontSize: 14, fontWeight: '600', marginBottom: Spacing.xs },
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
  dropdownText: { color: Colors.white, fontSize: 16 },
  placeholder: { color: Colors.textSecondary },
  dropdownList: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dropdownItem: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dropdownItemSelected: { backgroundColor: Colors.background },
  dropdownItemText: { color: Colors.white, fontSize: 16 },
  dropdownItemTextSelected: { color: Colors.accent },
  inputError: { borderColor: Colors.error },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 4, marginLeft: 2 },
});
