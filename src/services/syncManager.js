// src/services/syncManager.js
import { supabase } from './supabase';
import {
    getQueue,
    setQueue,
    runSql,
    fetchLocalTodosByUser,
    upsertLocalTodo,
    deleteLocalTodo
} from './localDb';

/**
 * ✅ Push queued offline changes to Supabase
 */
export const pushQueueToSupabase = async (user_id) => {
    try {
        const queue = await getQueue();
        if (!queue.length) return;

        console.log('Sync: pushing', queue.length, 'changes to Supabase...');

        for (const change of queue) {
            const { type, payload, id } = change;

            // Normalize boolean before sending to Supabase
            const isCompleted =
                payload?.is_completed === true ||
                payload?.is_completed === 'true' ||
                payload?.is_completed === 1;

            if (type === 'insert' || type === 'update') {
                const { error } = await supabase
                    .from('todos')
                    .upsert({
                        id,
                        user_id,
                        title: payload.title,
                        description: payload.description,
                        group_id: payload.group_id || null,
                        is_completed: isCompleted,
                        created_at: payload.created_at,
                        updated_at: payload.updated_at
                    });

                if (error) console.warn('Push update error:', error.message);
            }

            if (type === 'delete') {
                const { error } = await supabase.from('todos').delete().eq('id', id);
                if (error) console.warn('Delete error:', error.message);
            }
        }

        // ✅ Clear queue after successful push
        await setQueue([]);
        console.log('✅ Supabase sync complete.');
    } catch (e) {
        console.error('pushQueueToSupabase error:', e);
    }
};

/**
 * ✅ Pull remote todos from Supabase and merge with local DB
 */
export const pullRemoteAndMerge = async (user_id) => {
    try {
        console.log('Sync: pulling remote data...');
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user_id);

        if (error) {
            console.error('Pull error:', error);
            return;
        }

        if (!data || !data.length) {
            console.log('No remote todos found.');
            return;
        }

        for (const t of data) {
            // Normalize values before saving locally
            const normalized = {
                id: t.id,
                user_id: t.user_id,
                title: t.title,
                description: t.description || '',
                group_id: t.group_id || null,
                is_completed:
                    t.is_completed === true ||
                    t.is_completed === 'true' ||
                    t.is_completed === 1,
                created_at: Number(t.created_at) || Date.now(),
                updated_at: Number(t.updated_at) || Date.now()
            };

            await upsertLocalTodo(normalized);
        }

        console.log('✅ Pull + merge complete.');
    } catch (e) {
        console.error('pullRemoteAndMerge error:', e);
    }
};

/**
 * ✅ Force manual resync (optional helper)
 */
export const resyncAll = async (user_id) => {
    console.log('Performing full sync...');
    await pushQueueToSupabase(user_id);
    await pullRemoteAndMerge(user_id);
    console.log('✅ Full sync done!');
};
