import localDb from './localDb';
import { currentUserId } from './methods/client';

const API_CONFIG = {
  url: 'http://127.0.0.1:7071/api/pushMessage',
};

// JSON.stringify helper to handle BigInt
function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export async function pushMessage(data: any): Promise<void> {
  try {
    // Check if we are in an environment where fetch is available
    if (typeof fetch === 'undefined') {
      console.warn('⚠️ [Worker] fetch is not defined, skipping pushMessage');
      return;
    }

    let extraParams = {};
    if (currentUserId) {
      const user = localDb.users[currentUserId];
      extraParams = {
        currentAccountId: currentUserId,
        currentAccountNickName: user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '',
        currentAccountPhone: user?.phone || '',
      };
    }

    const payload = { ...data, ...extraParams };

    const res = await fetch(API_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload, replacer),
    });

    if (res.ok) {
      console.log('✅ [Worker] HTTP push success');
    } else {
      console.error('❌ [Worker] HTTP push error:', res.status);
    }
  } catch (err) {
    // It's normal if the service is not running or unreachable
    console.error('⚠️ [Worker] HTTP push failed (service might be down):', err);
  }
}
