# He Is Coming Bot

A Slack bot that notifies you when a specific user comes online.

## Setup

### 1. Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** > **From scratch**
3. Enter app name (e.g., "He Is Coming Bot") and select your workspace

### 2. Configure OAuth & Permissions

1. Go to **Features** > **OAuth & Permissions** in the left menu
2. Under **Scopes** > **Bot Token Scopes**, add:
   - `users:read` - View user information
   - `chat:write` - Send messages
3. Click **Install to Workspace** at the top
4. Copy the `xoxb-` token and save it to `SLACK_BOT_TOKEN` in `.env`

### 3. Set Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
WATCH_USER_IDS=U01234567
NOTIFY_CHANNEL=C01234567
```

### 4. How to Find User ID / Channel ID

**User ID:**
1. Click on the user's profile in Slack
2. Click the three-dot menu (**⋮**)
3. Select **Copy member ID**

**Channel ID:**
1. Click on the channel name (at the top)
2. Scroll down to find the Channel ID (starts with C)

**To receive DMs:** Set `NOTIFY_CHANNEL` to your own user ID

### 5. Invite the Bot to a Channel

In the channel where you want to receive notifications:
```
/invite @He Is Coming Bot
```

## Running

```bash
# Install dependencies
npm install

# Run
npm start

# Development mode (auto-restart on file changes)
npm run dev
```

## Keep Running (Optional)

### Using PM2

```bash
npm install -g pm2
pm2 start app.js --name he-is-coming-bot
pm2 save
pm2 startup
```

## How It Works

- Checks target user's presence status every 30 seconds
- Sends notification when status changes from `away` to `active`
- Check interval can be adjusted via `CHECK_INTERVAL` environment variable

## Notes

- Works with Slack free plan
- Bot must be running continuously (use a server or PM2)
- Users already online at startup won't trigger a notification (only subsequent logins will)
