// src/screens/GroupsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import uuid from 'react-native-uuid';

export default function GroupsScreen({ navigation }) {
    const [groups, setGroups] = useState([]);
    const [newName, setNewName] = useState('');
    const userId = 'me'; // replace with real user id via Clerk

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const { data, error } = await supabase.from('groups').select('*').eq('user_id', userId);
        if (!error) setGroups(data || []);
    };

    const add = async () => {
        if (!newName.trim()) return;
        const id = uuid.v4();
        const { data, error } = await supabase.from('groups').insert([{ id, user_id: userId, name: newName, created_at: new Date().toISOString() }]);
        if (error) return Alert.alert('Error', error.message);
        setNewName('');
        load();
    };

    const del = async (id) => {
        await supabase.from('groups').delete().eq('id', id);
        load();
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20 }}>Groups</Text>
            <TextInput placeholder="New group name" value={newName} onChangeText={setNewName} style={{ borderBottomWidth: 1, marginTop: 12 }} />
            <Button title="Add Group" onPress={add} />
            <FlatList
                data={groups}
                keyExtractor={g => g.id}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
                        <Text>{item.name}</Text>
                        <Button title="Delete" onPress={() => del(item.id)} />
                    </View>
                )}
            />
            <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
    );
}
