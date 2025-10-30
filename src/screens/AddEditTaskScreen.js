// src/screens/AddEditTaskScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Picker, Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { upsertLocalTodo, queueChange } from '../services/localDb';

export default function AddEditTaskScreen({ route, navigation }) {
    const { task, groups = [] } = route.params || {};
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [groupId, setGroupId] = useState(task?.group_id || (groups[0]?.id || null));

    const save = async () => {
        if (!title.trim()) {
            Alert.alert('Validation', 'Title cannot be empty');
            return;
        }
        const now = Date.now();
        const id = task?.id || uuid.v4();
        const todo = {
            id,
            user_id: task?.user_id || 'me', // replace with real user id when integrating
            title,
            description,
            is_completed: task?.is_completed ? 1 : 0,
            group_id: groupId,
            created_at: task?.created_at || now,
            updated_at: now
        };
        await upsertLocalTodo(todo);
        await queueChange({ id: todo.id, type: task ? 'update' : 'create', payload: todo, ts: now });
        navigation.goBack();
    };

    return (
        <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18 }}>{task ? 'Edit' : 'Add'} Task</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ marginTop: 12, borderBottomWidth: 1, padding: 8 }} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={{ marginTop: 12, borderBottomWidth: 1, padding: 8 }} />
            <Text style={{ marginTop: 12 }}>Group</Text>
            <Picker selectedValue={groupId} onValueChange={(v) => setGroupId(v)} style={{ height: 50 }}>
                {groups.length === 0 && <Picker.Item label="Default" value={null} />}
                {groups.map(g => <Picker.Item key={g.id} label={g.name} value={g.id} />)}
            </Picker>
            <View style={{ height: 12 }} />
            <Button title="Save" onPress={save} />
        </View>
    );
}
