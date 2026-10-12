// Reading and writing object instances and their events in Supabase, as
// js/object-instances.js does. Every call needs a signed-in person and gives
// back null (or nothing) when it can't reach the table, like the website, so
// a failed lifecycle write never blocks saving the thing itself.

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../supabase';
import { eventRow, instanceRow, type EventInput, type InstanceEvent, type InstanceInput, type ObjectInstance } from './instances';

const INSTANCES = 'object_instances';
const EVENTS = 'object_instance_events';

export async function createObjectInstance(userId: string, input: InstanceInput): Promise<ObjectInstance | null> {
  try {
    const { data, error } = await supabase.from(INSTANCES).insert(instanceRow(userId, input, new Date())).select().single();
    return error ? null : (data as ObjectInstance);
  } catch {
    return null;
  }
}

export async function getObjectInstance(userId: string, instanceId: string): Promise<ObjectInstance | null> {
  if (!instanceId) return null;
  try {
    const { data, error } = await supabase.from(INSTANCES).select('*').eq('id', instanceId).eq('user_id', userId).maybeSingle();
    return error ? null : ((data as ObjectInstance | null) ?? null);
  } catch {
    return null;
  }
}

export async function updateObjectInstance(userId: string, instanceId: string, updates: Record<string, unknown>): Promise<ObjectInstance | null> {
  if (!instanceId) return null;
  try {
    const { data, error } = await supabase
      .from(INSTANCES)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', instanceId)
      .eq('user_id', userId)
      .select()
      .single();
    return error ? null : (data as ObjectInstance);
  } catch {
    return null;
  }
}

/** Add an event to an instance (addObjectInstanceEvent). Pass the instance when it's already loaded. */
export async function addObjectInstanceEvent(
  userId: string,
  instance: string | Pick<ObjectInstance, 'id' | 'entity_id'>,
  event: EventInput,
): Promise<InstanceEvent | null> {
  const target = typeof instance === 'string' ? await getObjectInstance(userId, instance) : instance;
  if (!target) return null;
  try {
    const { data, error } = await supabase.from(EVENTS).insert(eventRow(userId, target, event, new Date())).select().single();
    return error ? null : (data as InstanceEvent);
  } catch {
    return null;
  }
}

export async function getObjectInstanceEvents(userId: string, instanceId: string): Promise<InstanceEvent[]> {
  if (!instanceId) return [];
  try {
    const { data, error } = await supabase
      .from(EVENTS)
      .select('*')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .order('occurred_at', { ascending: false });
    return error ? [] : ((data ?? []) as InstanceEvent[]);
  } catch {
    return [];
  }
}

/** The instance behind a selected object and its events, reloaded on demand after a change. */
export function useObjectInstance(userId: string | null, instanceId: string | null | undefined) {
  const [instance, setInstance] = useState<ObjectInstance | null>(null);
  const [events, setEvents] = useState<InstanceEvent[]>([]);
  const [version, setVersion] = useState(0);
  const key = userId && instanceId ? `${userId}:${instanceId}` : '';
  const [shownFor, setShownFor] = useState(key);
  // A different object: drop the last one's details straight away (a reload keeps them until the new ones arrive).
  if (shownFor !== key) {
    setShownFor(key);
    setInstance(null);
    setEvents([]);
  }
  useEffect(() => {
    if (!userId || !instanceId) return;
    let active = true;
    Promise.all([getObjectInstance(userId, instanceId), getObjectInstanceEvents(userId, instanceId)]).then(([found, list]) => {
      if (!active) return;
      setInstance(found);
      setEvents(found ? list : []);
    });
    return () => {
      active = false;
    };
  }, [userId, instanceId, version]);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { instance, events, reload };
}
