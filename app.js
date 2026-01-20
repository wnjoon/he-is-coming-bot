require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// List of user IDs to watch (comma-separated)
const WATCH_USER_IDS = process.env.WATCH_USER_IDS?.split(',').map(id => id.trim()) || [];

// Channel or user ID to send notifications to
const NOTIFY_CHANNEL = process.env.NOTIFY_CHANNEL;

// Presence check interval (milliseconds) - default 30 seconds
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 30000;

// Store last presence status per user
const lastPresence = new Map();

// User name cache
const userNames = new Map();

async function getUserName(userId) {
  if (userNames.has(userId)) {
    return userNames.get(userId);
  }

  try {
    const userInfo = await web.users.info({ user: userId });
    const name = userInfo.user.real_name || userInfo.user.name;
    userNames.set(userId, name);
    return name;
  } catch (error) {
    return userId;
  }
}

async function checkPresence() {
  for (const userId of WATCH_USER_IDS) {
    try {
      const result = await web.users.getPresence({ user: userId });
      const currentPresence = result.presence;
      const previousPresence = lastPresence.get(userId);

      // Update presence status
      lastPresence.set(userId, currentPresence);

      // Notify only when status changes from away to active (not on first check)
      if (previousPresence && previousPresence === 'away' && currentPresence === 'active') {
        const displayName = await getUserName(userId);
        const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });

        await web.chat.postMessage({
          channel: NOTIFY_CHANNEL,
          text: `🟢 *${displayName}* is now online!\n⏰ ${now}`,
          unfurl_links: false,
        });

        console.log(`[${now}] Notification sent: ${displayName} is online`);
      }
    } catch (error) {
      console.error(`Failed to check presence for user ${userId}:`, error.message);
    }
  }
}

async function initialize() {
  if (WATCH_USER_IDS.length === 0) {
    console.error('❌ No users to watch. Please check WATCH_USER_IDS.');
    process.exit(1);
  }

  if (!NOTIFY_CHANNEL) {
    console.error('❌ Notification channel not set. Please check NOTIFY_CHANNEL.');
    process.exit(1);
  }

  console.log('⚡️ He Is Coming Bot started!');
  console.log(`📢 Notification channel: ${NOTIFY_CHANNEL}`);
  console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000} seconds`);

  // Initialize presence status and load user names
  for (const userId of WATCH_USER_IDS) {
    try {
      const result = await web.users.getPresence({ user: userId });
      lastPresence.set(userId, result.presence);

      const name = await getUserName(userId);
      console.log(`👀 Watching: ${name} (current: ${result.presence})`);
    } catch (error) {
      console.error(`Failed to initialize user ${userId}:`, error.message);
    }
  }

  console.log('🔄 Waiting for presence changes...\n');

  // Check presence periodically
  setInterval(checkPresence, CHECK_INTERVAL);
}

initialize();
