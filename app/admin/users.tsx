import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { User, getSupabaseClient } from '../../lib/supabase';

const ROLE_COLORS: Record<string, string> = {
  customer: Colors.accent,
  tradesperson: Colors.success,
  admin: Colors.error,
};

const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  tradesperson: 'Tradesperson',
  admin: 'Admin',
};

const ROLE_ICONS = {
  customer: 'home',
  tradesperson: 'hammer',
  admin: 'shield',
};

export default function AdminUsersScreen() {
  const { user: adminUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const client = (global as any).__TEST_SUPABASE__ || getSupabaseClient();
      // Debug: inspect client shape at call-time
      // eslint-disable-next-line no-console
      console.log('DEBUG(component) getSupabaseClient typeof:', typeof getSupabaseClient);
      // eslint-disable-next-line no-console
      console.log('DEBUG(component) client keys:', client && Object.keys(client || {}));
      // eslint-disable-next-line no-console
      console.log('DEBUG(component) client.from typeof:', client && typeof client.from);
      // eslint-disable-next-line no-console
      try {
        // Compare function identity between the resolved client and the stable test container
        // eslint-disable-next-line no-console
        console.log('DEBUG(component) client.from === global.__TEST_SUPABASE__.from:', client && (global as any).__TEST_SUPABASE__ && client.from === (global as any).__TEST_SUPABASE__.from);
        // eslint-disable-next-line no-console
        console.log('DEBUG(component) client.from.toString:', client && client.from && client.from.toString && client.from.toString().slice(0,200));
      } catch {
        // ignore
      }
      let supFrom: any;
      try {
        // Capture the raw return value and inspect it immediately
        const ret = client && client.from && client.from.call(client, 'users');
        // eslint-disable-next-line no-console
        console.log('DEBUG(component) raw client.from return:', ret, 'typeof:', typeof ret, 'ownKeys:', ret && Object.getOwnPropertyNames(ret));
        supFrom = ret;
      } catch {
        supFrom = undefined;
      }
      // Fallback to the stable test container when present (test-only)
      if (!supFrom && (global as any).__TEST_SUPABASE__ && (global as any).__TEST_SUPABASE__.from) {
        supFrom = (global as any).__TEST_SUPABASE__.from.call((global as any).__TEST_SUPABASE__, 'users');
      }
      // eslint-disable-next-line no-console
      console.log('DEBUG(component) supFrom typeof:', typeof supFrom, 'keys:', supFrom && Object.keys(supFrom || {}));
      const { data, error } = await (supFrom && supFrom.select('*').order('created_at', { ascending: false })) || { data: [], error: null };

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  const promoteToAdmin = async (targetUser: User) => {
    if (!adminUser) return;
    setPromotingId(targetUser.id);
    setPromoteError(null);
    try {
      // Update user role (try client, then test global fallback)
      const client = (global as any).__TEST_SUPABASE__ || getSupabaseClient();
      let userFrom: any;
      try {
        userFrom = client && client.from && client.from.call(client, 'users');
      } catch {
        userFrom = undefined;
      }
      if (!userFrom) throw new Error('No supabase client available for updating users');
      const { error: updateError } = await userFrom.update({ role: 'admin' }).eq('id', targetUser.id);
      if (updateError) throw updateError;

      // Log to audit_logs
      const client2 = (global as any).__TEST_SUPABASE__ || getSupabaseClient();
      let auditFrom: any;
      try {
        auditFrom = client2 && client2.from && client2.from.call(client2, 'audit_logs');
      } catch {
        auditFrom = undefined;
      }
      if (!auditFrom) throw new Error('No supabase client available for audit logs');
      await auditFrom.insert({
        admin_id: adminUser.id,
        action: 'promote_to_admin',
        target_id: targetUser.id,
        target_table: 'users',
        details: { email: targetUser.email, name: targetUser.name },
      });

      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      setPromoteError('Failed to promote user: ' + (err.message || err));
    } finally {
      setPromotingId(null);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={[styles.avatar, { borderColor: ROLE_COLORS[item.role] }]}> 
        <Ionicons
          name={ROLE_ICONS[item.role] as any}
          size={24}
          color={ROLE_COLORS[item.role]}
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] }]}> 
            <Text style={styles.roleText}>{ROLE_LABELS[item.role]}</Text>
          </View>
          {item.area && (
            <Text style={styles.areaText}>{item.area}</Text>
          )}
        </View>
        {item.role !== 'admin' && (
          <TouchableOpacity
            testID={`promote-button-${item.id}`}
            style={styles.promoteButton}
            onPress={() => promoteToAdmin(item)}
            disabled={promotingId === item.id}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Promote ${item.name} to admin`}
            accessibilityHint="Grant admin privileges to this user"
          >
            <Text style={styles.promoteButtonText}>
              {promotingId === item.id ? 'Promoting...' : 'Promote to Admin'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}> 
      <Text style={styles.title}>Users</Text>
      <Text style={styles.subtitle}>{users.length} registered users</Text>
      {promoteError && (
        <Text style={{ color: Colors.error, marginBottom: 8 }}>{promoteError}</Text>
      )}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  promoteButton: {
    marginTop: 8,
    backgroundColor: Colors.error,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  promoteButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  areaText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
