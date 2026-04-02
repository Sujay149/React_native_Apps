import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  Modal,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';

import { useAppHydration, useAppStore, TaskPriority } from '@/stores/use-app-store';
import { trackTaskCompleted, trackTaskCreated } from '@/utils/analytics';
import { theme } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIORITY_META: Record<TaskPriority, { text: string; bg: string; color: string }> = {
  high: { text: 'High', bg: theme.colors.dangerSoft, color: theme.colors.danger },
  medium: { text: 'Medium', bg: theme.colors.warningSoft, color: theme.colors.warning },
  low: { text: 'Low', bg: theme.colors.successSoft, color: theme.colors.success },
};

const STATUS_META = {
  open: { label: 'Open', color: theme.colors.info },
  'in-progress': { label: 'In Progress', color: theme.colors.warning },
  completed: { label: 'Completed', color: theme.colors.success },
} as const;

function TaskSkeletonCard() {
  return (
    <View style={styles.taskCard}>
      <View style={styles.skeletonCircle} />
      <View style={{ flex: 1 }}>
        <View style={styles.skeletonLineLarge} />
        <View style={styles.skeletonLineSmall} />
      </View>
      <View style={styles.skeletonPill} />
    </View>
  );
}

export default function TaskListScreen() {
  const router = useRouter();
  const { hasHydrated } = useAppHydration();
  const {
    isAuthenticated,
    userName,
    tasks,
    filter,
    setFilter,
    createTask,
    toggleTask,
    deleteTask,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createInputRef = useRef<TextInput | null>(null);

  const filteredTasks = useMemo(() => {
    if (filter === 'open') {
      return tasks.filter((task) => !task.completed);
    }
    if (filter === 'done') {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  }, [tasks, filter]);

  const openCount = useMemo(() => tasks.filter((task) => !task.completed).length, [tasks]);
  const doneCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const titleError = title.trim().length === 0 ? 'Task title is required.' : '';
  const canSaveTask = title.trim().length > 0;

  useEffect(() => {
    if (!showCreateModal) {
      return;
    }
    const timer = setTimeout(() => createInputRef.current?.focus(), 160);
    return () => clearTimeout(timer);
  }, [showCreateModal]);

  const handleCreateTask = () => {
    const trimmedTitle = title.trim();
    if (!canSaveTask) {
      return;
    }
    createTask(trimmedTitle, description.trim(), priority);
    trackTaskCreated(trimmedTitle, priority);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setShowCreateModal(false);
  };

  const completeTask = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleTask(taskId);
    trackTaskCompleted(taskId);
  };

  const removeTask = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    deleteTask(taskId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientC]}
          locations={[0, 0.4, 0.8]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={{ flex: 1, paddingTop: theme.spacing.md }} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <View style={styles.skeletonLineLarge} />
          </View>
          <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.md }}>
            <TaskSkeletonCard />
            <TaskSkeletonCard />
            <TaskSkeletonCard />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientC]}
        locations={[0, 0.4, 0.8]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1, paddingTop: theme.spacing.md }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSub}>{getGreeting()}</Text>
              <Text style={styles.headerTitle}>{userName?.trim() || 'User'}</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          >
            <View style={styles.overviewCard}>
              <View>
                <Text style={styles.overviewTitle}>Task Overview</Text>
                <Text style={styles.overviewSub}>Plan and complete your field work efficiently.</Text>
              </View>

              <View style={styles.overviewStatsRow}>
                <View style={styles.overviewStatBox}>
                  <Text style={styles.overviewStatValue}>{tasks.length}</Text>
                  <Text style={styles.overviewStatLabel}>All</Text>
                </View>
                <View style={styles.overviewStatBox}>
                  <Text style={styles.overviewStatValue}>{openCount}</Text>
                  <Text style={styles.overviewStatLabel}>Open</Text>
                </View>
                <View style={styles.overviewStatBox}>
                  <Text style={styles.overviewStatValue}>{doneCount}</Text>
                  <Text style={styles.overviewStatLabel}>Done</Text>
                </View>
              </View>

              <View style={styles.filterRow}>
                {(['all', 'open', 'done'] as const).map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setFilter(value)}
                    style={[styles.filterChip, filter === value && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filter === value && styles.filterChipTextActive]}>
                      {value === 'all' ? 'All' : value === 'open' ? 'Open' : 'Done'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Tasks</Text>

            {filteredTasks.map((item, index) => {
              const priorityMeta = PRIORITY_META[item.priority];
              const statusMeta = STATUS_META[item.status as keyof typeof STATUS_META] ?? STATUS_META.open;
              const iconName =
                index % 3 === 0
                  ? 'briefcase-check-outline'
                  : index % 3 === 1
                    ? 'clipboard-text-outline'
                    : 'calendar-check-outline';

              return (
                <Swipeable
                  key={item.id}
                  overshootLeft={false}
                  overshootRight={false}
                  renderLeftActions={() => (
                    <Pressable style={styles.swipeDone} onPress={() => completeTask(item.id)}>
                      <MaterialCommunityIcons name="check" size={18} color={theme.colors.surface} />
                      <Text style={styles.swipeText}>Complete</Text>
                    </Pressable>
                  )}
                  renderRightActions={() => (
                    <Pressable style={styles.swipeDelete} onPress={() => removeTask(item.id)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.colors.surface} />
                      <Text style={styles.swipeText}>Delete</Text>
                    </Pressable>
                  )}
                >
                  <Pressable
                    onPress={() => router.push(`/(tabs)/task/${item.id}`)}
                    style={[styles.taskCard, item.completed && styles.taskCardDone]}
                  >
                    <View style={styles.taskIconWrap}>
                      <MaterialCommunityIcons name={iconName} size={18} color={theme.colors.primary} />
                    </View>

                    <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                      <View style={styles.taskMetaRow}>
                        <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                        <Text style={styles.statusLabel}>{statusMeta.label}</Text>
                      </View>
                      <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.taskSub} numberOfLines={1}>
                        {item.description || 'No description added yet.'}
                      </Text>
                    </View>

                    <View style={[styles.priorityBadge, { backgroundColor: priorityMeta.bg }]}>
                      <Text style={[styles.priorityBadgeText, { color: priorityMeta.color }]}>{priorityMeta.text}</Text>
                    </View>
                  </Pressable>
                </Swipeable>
              );
            })}

            {filteredTasks.length === 0 && (
              <View style={styles.empty}>
                <View style={styles.emptyIconWrap}>
                  <MaterialCommunityIcons name="clipboard-text-clock-outline" size={28} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No tasks in this view</Text>
                <Text style={styles.emptySub}>Start by creating your first task to plan your next visit.</Text>
                <Pressable onPress={() => setShowCreateModal(true)} style={styles.emptyCta}>
                  <MaterialCommunityIcons name="plus" size={16} color={theme.colors.surface} />
                  <Text style={styles.emptyCtaText}>Create your first task</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create task"
            onPress={() => setShowCreateModal(true)}
            style={styles.fab}
          >
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.surface} />
          </Pressable>

          <Modal
            visible={showCreateModal}
            animationType="slide"
            transparent
            onRequestClose={() => setShowCreateModal(false)}
          >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                  <View style={styles.modalHandle} />

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Create Task</Text>
                    <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalClose}>
                      <MaterialCommunityIcons name="close" size={20} color={theme.colors.primary} />
                    </Pressable>
                  </View>

                  <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
                    <View style={styles.inputWrap}>
                      <Text style={[styles.inputLabel, title.length > 0 && styles.inputLabelActive]}>Task title</Text>
                      <TextInput
                        ref={createInputRef}
                        value={title}
                        onChangeText={setTitle}
                        style={styles.modalInput}
                        placeholder={title.length > 0 ? '' : 'Task title'}
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="sentences"
                        returnKeyType="next"
                      />
                    </View>
                    {title.length > 0 && titleError ? <Text style={styles.inputErr}>{titleError}</Text> : null}

                    <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
                      <Text style={[styles.inputLabel, description.length > 0 && styles.inputLabelActive]}>Description</Text>
                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        style={[styles.modalInput, styles.modalInputMultiline]}
                        placeholder={description.length > 0 ? '' : 'Description'}
                        placeholderTextColor={theme.colors.textMuted}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.prioritySelectorWrap}>
                      <Text style={styles.fieldTitle}>Priority</Text>
                      <View style={styles.prioritySelectorRow}>
                        {(['low', 'medium', 'high'] as TaskPriority[]).map((value) => {
                          const meta = PRIORITY_META[value];
                          const active = priority === value;
                          return (
                            <Pressable
                              key={value}
                              onPress={() => setPriority(value)}
                              style={[
                                styles.priorityOption,
                                active && { borderColor: meta.color, backgroundColor: meta.bg },
                              ]}
                            >
                              <Text style={[styles.priorityOptionText, active && { color: meta.color }]}>{meta.text}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <Pressable
                      onPress={handleCreateTask}
                      disabled={!canSaveTask}
                      style={[styles.createBtn, !canSaveTask && styles.createBtnDisabled]}
                    >
                      <Text style={[styles.createBtnText, !canSaveTask && styles.createBtnTextDisabled]}>Save Task</Text>
                    </Pressable>
                  </ScrollView>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  headerSub: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemibold,
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.h1,
    fontWeight: theme.typography.weightExtrabold,
    color: theme.colors.primary,
    letterSpacing: -0.6,
  },
  overviewCard: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  overviewTitle: {
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.weightExtrabold,
    color: theme.colors.primary,
  },
  overviewSub: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
    marginTop: 2,
  },
  overviewStatsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  overviewStatBox: {
    flex: 1,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: theme.typography.weightExtrabold,
    color: theme.colors.primary,
  },
  overviewStatLabel: {
    marginTop: 2,
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemibold,
  },
  filterRow: { flexDirection: 'row', gap: theme.spacing.sm },
  filterChip: {
    height: 36,
    borderRadius: theme.radii.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightBold,
  },
  filterChipTextActive: { color: theme.colors.surface },
  sectionTitle: {
    fontSize: theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: theme.typography.weightExtrabold,
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    minHeight: 84,
    ...theme.shadows.soft,
  },
  taskCardDone: { opacity: 0.72 },
  taskIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: {
    fontSize: theme.typography.micro,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemibold,
  },
  taskTitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weightBold,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  taskSub: {
    marginTop: 2,
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
  },
  priorityBadge: {
    borderRadius: theme.radii.round,
    paddingHorizontal: theme.spacing.sm,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadgeText: {
    fontSize: theme.typography.micro,
    fontWeight: theme.typography.weightBold,
  },
  swipeDone: {
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    backgroundColor: theme.colors.success,
  },
  swipeDelete: {
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 98,
    backgroundColor: theme.colors.danger,
  },
  swipeText: {
    marginTop: 2,
    color: theme.colors.surface,
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightBold,
  },
  empty: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.sm,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  emptyTitle: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: theme.typography.weightExtrabold,
  },
  emptySub: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  emptyCta: {
    marginTop: theme.spacing.lg,
    height: 44,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyCtaText: {
    color: theme.colors.surface,
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightBold,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: theme.spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: theme.typography.weightExtrabold,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  fieldTitle: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemibold,
    marginBottom: theme.spacing.xs,
  },
  inputWrap: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    minHeight: 62,
    justifyContent: 'center',
  },
  inputWrapMultiline: {
    minHeight: 120,
    paddingTop: 12,
  },
  inputLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightSemibold,
  },
  inputLabelActive: {
    color: theme.colors.primary,
  },
  modalInput: {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weightSemibold,
    paddingTop: 2,
  },
  modalInputMultiline: {
    minHeight: 86,
  },
  inputErr: {
    fontSize: theme.typography.caption,
    color: theme.colors.danger,
    marginTop: -6,
    marginLeft: 4,
    fontWeight: theme.typography.weightSemibold,
  },
  prioritySelectorWrap: {
    marginTop: 2,
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityOption: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  priorityOptionText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightBold,
  },
  createBtn: {
    marginTop: theme.spacing.sm,
    height: 54,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  createBtnText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightBold,
  },
  createBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
  skeletonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.skeletonBase,
    marginRight: theme.spacing.md,
  },
  skeletonLineLarge: {
    width: 170,
    height: 14,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.skeletonBase,
  },
  skeletonLineSmall: {
    width: 110,
    height: 10,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.skeletonHighlight,
    marginTop: 8,
  },
  skeletonPill: {
    width: 62,
    height: 24,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.skeletonBase,
  },
});
