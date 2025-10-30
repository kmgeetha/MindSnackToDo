// src/components/TaskItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
    return (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} style={styles.container}>
            <TouchableOpacity style={styles.row} onPress={onToggle} onLongPress={onEdit}>
                <View style={[styles.checkbox, task.is_completed && styles.checked]} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, task.is_completed && styles.completedText]}>{task.title}</Text>
                    {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}
                </View>
                <TouchableOpacity onPress={onDelete}>
                    <Text style={{ color: 'red' }}>Delete</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: { marginVertical: 6 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
    checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, marginRight: 12 },
    checked: { backgroundColor: '#4caf50', borderWidth: 0 },
    title: { fontSize: 16, fontWeight: '600' },
    completedText: { textDecorationLine: 'line-through', color: '#888' },
    desc: { color: '#666', marginTop: 6 }
});
