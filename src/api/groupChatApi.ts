import type { GroupChat } from '../types/chat';

const BASE_URL = import.meta.env.VITE_CYREX_URL || 'http://localhost:8000';

export async function getGroupChats(): Promise<GroupChat[]> {
  const res = await fetch(`${BASE_URL}/api/agent/group-chat/list`);
  if (!res.ok) {
    throw new Error(`Failed to fetch group chats: ${res.status}`);
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((item: any) => ({
    groupChatId: item.groupChatId ?? item.group_chat_id ?? '',
    name: item.name ?? '',
    agentCount: item.agentCount ?? item.agent_count ?? 0,
  }));
}
