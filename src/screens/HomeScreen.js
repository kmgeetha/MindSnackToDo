// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { fetchLocalTodosByUser, upsertLocalTodo, deleteLocalTodo, queueChange } from '../services/localDb';
import { pushQueueToSupabase, pullRemoteAndMerge } from '../services/syncManager';
import { useNetwork } from '../hooks/useNetwork';
import uuid from 'react-native-uuid';
import TaskItem from '../components/TaskItem';
import GroupPill from '../components/GroupPill';
import { supabase } from '../services/supabase';

export default function HomeScreen({ navigation }) {
    const { user } = useUser();
    const isConnected = useNetwork();
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);

    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;
        loadLocal();
        loadGroups();

        // if connected -> sync then pull remote
        if (isConnected) {
            (async () => {
                await pushQueueToSupabase(userId);
                await pullRemoteAndMerge(userId);
                await loadLocal();
            })();
        }
    }, [userId, isConnected]);

    const loadLocal = async () => {
        setLoading(true);
        const local = await fetchLocalTodosByUser(userId);
        setTodos(sortTasks(local));
        setLoading(false);
    };

    const loadGroups = async () => {
        // pull groups from supabase if online; otherwise fetch local groups (not implemented local groups table retrieval for brevity)
        if (isConnected) {
            const { data, error } = await supabase.from('groups').select('*').eq('user_id', userId);
            if (!error) {
                setGroups(data || []);
            }
        }
    };

    const sortTasks = (tasks) => {
        // Incomplete first; within each group sort by created_at (newest first)
        // We'll return as grouped or flat list — for now flat with grouping disabled in UI example
        return tasks.sort((a, b) => {
            if (a.is_completed === b.is_completed) {
                return b.created_at - a.created_at;
            }
            return a.is_completed ? 1 : -1; // incomplete (false) before completed (true)
        });
    };

    const toggleComplete = async (t) => {
        const updated = { ...t, is_completed: !t.is_completed, updated_at: Date.now() };
        await upsertLocalTodo({
            ...updated,
            is_completed: updated.is_completed ? 1 : 0,
        });
        await queueChange({
            id: updated.id,
            type: 'update',
            payload: {
                ...updated,
                is_completed: updated.is_completed,
            },
            ts: Date.now(),
        });
        setTodos(prev => sortTasks(prev.map(x => x.id === updated.id ? { ...updated, is_completed: !!updated.is_completed } : x)));
    };

    const handleDelete = async (t) => {
        await deleteLocalTodo(t.id);
        await queueChange({ id: t.id, type: 'delete', ts: Date.now() });
        setTodos(prev => prev.filter(x => x.id !== t.id));
    };

    if (!user) return <ActivityIndicator />;

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>My TODOs</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>{isConnected ? 'Online' : 'Offline'}</Text>
                </View>
            </View>

            <Button title="Add Task" onPress={() => navigation.navigate('AddEdit', { groups })} />
            <View style={{ height: 8 }} />
            <Button title="Groups" onPress={() => navigation.navigate('Groups')} />

            {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> :
                <FlatList
                    data={todos}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TaskItem
                            task={item}
                            onToggle={() => toggleComplete(item)}
                            onDelete={() => handleDelete(item)}
                            onEdit={() => navigation.navigate('AddEdit', { task: item, groups })}
                        />
                    )}
                    ListEmptyComponent={() => <Text style={{ marginTop: 20 }}>No tasks yet.</Text>}
                />
            }
        </View>
    );
}
