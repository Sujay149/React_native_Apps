import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

type Patient = {
  id: string;
  name: string;
  age: number;
  medicalIssue: string;
  status: 'active' | 'recovery' | 'completed';
  lastVisit: string;
};

export default function HomeCareScreen() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'Ramesh Kumar',
      age: 65,
      medicalIssue: 'Hypertension',
      status: 'active',
      lastVisit: '2 days ago',
    },
    {
      id: '2',
      name: 'Lakshmi Devi',
      age: 58,
      medicalIssue: 'Diabetes Management',
      status: 'active',
      lastVisit: '1 day ago',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [medicalIssue, setMedicalIssue] = useState('');

  const handleAddPatient = () => {
    if (patientName && patientAge && medicalIssue) {
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: patientName,
        age: parseInt(patientAge, 10),
        medicalIssue,
        status: 'active',
        lastVisit: 'Just now',
      };
      setPatients([newPatient, ...patients]);
      setPatientName('');
      setPatientAge('');
      setMedicalIssue('');
      setShowModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.info;
      case 'recovery':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Home Care Patients</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Add Button */}
        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.addBtnText}>Add Patient</Text>
        </Pressable>

        {/* Patients List */}
        {patients.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="heart-outline"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyText}>No patients added yet</Text>
            <Text style={styles.emptySubtext}>Start by adding your first patient</Text>
          </View>
        ) : (
          <View style={styles.patientsList}>
            {patients.map((patient) => (
              <Pressable
                key={patient.id}
                style={({ pressed }) => [
                  styles.patientCard,
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <View style={styles.patientContent}>
                  <View style={styles.patientHeader}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(patient.status)}20` },
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(patient.status) },
                        ]}>
                        {patient.status.charAt(0).toUpperCase() +
                          patient.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.patientDetails}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="cake-variant-outline"
                        size={16}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.detailText}>{patient.age} years old</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons
                        name="medical-bag-outline"
                        size={16}
                        color={theme.colors.textMuted}
                      />
                      <Text style={styles.detailText}>{patient.medicalIssue}</Text>
                    </View>
                    <Text style={styles.lastVisit}>Last visit: {patient.lastVisit}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Patient Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modal}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </Pressable>
              <Text style={styles.modalTitle}>Add New Patient</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Patient Name</Text>
                <TextInput
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Enter patient name"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  value={patientAge}
                  onChangeText={setPatientAge}
                  placeholder="Enter age"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Medical Issue</Text>
                <TextInput
                  value={medicalIssue}
                  onChangeText={setMedicalIssue}
                  placeholder="Enter medical issue"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  style={[styles.input, styles.textAreaInput]}
                />
              </View>

              <Pressable
                onPress={handleAddPatient}
                style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.8 : 1 }]}>
                <Text style={styles.submitBtnText}>Add Patient</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: theme.typography.h2,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addBtnText: {
    color: 'white',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  patientsList: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  patientContent: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  statusText: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  patientDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  lastVisit: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnText: {
    color: 'white',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
