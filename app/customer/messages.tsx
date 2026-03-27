import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase, Message, Job } from '../../lib/supabase';

type Conversation = {
  job: Job;
  lastMessage: Message;
  tradieName: string;
};

export default function CustomerMessagesScreen() {
  
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('customer_id', user.id)
        .in('status', ['accepted', 'completed'])
        .order('updated_at', { ascending: false });

      if (jobsError) throw jobsError;

      const conversationsData: Conversation[] = [];

      for (const job of jobs || []) {
        if (!job.tradie_id) continue;

        const { data: tradie } = await supabase
          .from('users')
          .select('name')
          .eq('id', job.tradie_id)
          .single();

        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1);

        conversationsData.push({
          job,
          lastMessage: messages?.[0] || null,
          tradieName: tradie?.name || 'Unknown',
        });
      }

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchConversations();
  };

  const openChat = (item: Conversation) => {
    router.push({
      pathname: '/chat/[jobId]',
      params: {
        jobId: item.job.id,
        recipientName: item.tradieName,
        jobCategory: item.job.category,
      },
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.conversationCard} onPress={() => openChat(item)}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color={Colors.accent} />
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.tradieName}>{item.tradieName}</Text>
          <Text style={styles.time}>
            {item.lastMessage
              ? new Date(item.lastMessage.created_at).toLocaleDateString()
              : new Date(item.job.updated_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.jobCategory}>{item.job.category}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.content || 'No messages yet - tap to start!'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={styles.chevron} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Spacing.md }]}>
      <Text style={styles.title}>Messages</Text>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            Messages will appear here once a{'\n'}tradesperson accepts your job
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.job.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  conversationCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradieName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  jobCategory: {
    color: Colors.accent,
    fontSize: 12,
    marginTop: 2,
  },
  lastMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
