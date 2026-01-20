require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// 감시할 사용자 ID 목록 (쉼표로 구분)
const WATCH_USER_IDS = process.env.WATCH_USER_IDS?.split(',').map(id => id.trim()) || [];

// 알림을 보낼 채널 또는 사용자 ID
const NOTIFY_CHANNEL = process.env.NOTIFY_CHANNEL;

// 상태 체크 주기 (밀리초) - 기본 30초
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 30000;

// 사용자별 마지막 상태 저장
const lastPresence = new Map();

// 사용자 이름 캐시
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

      // 상태 업데이트
      lastPresence.set(userId, currentPresence);

      // 첫 체크가 아니고, away → active 변경 시 알림
      if (previousPresence && previousPresence === 'away' && currentPresence === 'active') {
        const displayName = await getUserName(userId);
        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        await web.chat.postMessage({
          channel: NOTIFY_CHANNEL,
          text: `🟢 *${displayName}* 님이 접속했습니다!\n⏰ ${now}`,
          unfurl_links: false,
        });

        console.log(`[${now}] ${displayName} 접속 알림 전송 완료`);
      }
    } catch (error) {
      console.error(`사용자 ${userId} 상태 확인 실패:`, error.message);
    }
  }
}

async function initialize() {
  if (WATCH_USER_IDS.length === 0) {
    console.error('❌ 감시할 사용자가 설정되지 않았습니다. WATCH_USER_IDS를 확인하세요.');
    process.exit(1);
  }

  if (!NOTIFY_CHANNEL) {
    console.error('❌ 알림 채널이 설정되지 않았습니다. NOTIFY_CHANNEL을 확인하세요.');
    process.exit(1);
  }

  console.log('⚡️ He Is Coming Bot 시작됨!');
  console.log(`📢 알림 채널: ${NOTIFY_CHANNEL}`);
  console.log(`⏱️  체크 주기: ${CHECK_INTERVAL / 1000}초`);

  // 초기 상태 확인 및 사용자 이름 로드
  for (const userId of WATCH_USER_IDS) {
    try {
      const result = await web.users.getPresence({ user: userId });
      lastPresence.set(userId, result.presence);

      const name = await getUserName(userId);
      console.log(`👀 감시 중: ${name} (현재: ${result.presence})`);
    } catch (error) {
      console.error(`사용자 ${userId} 초기화 실패:`, error.message);
    }
  }

  console.log('🔄 접속 감지 대기 중...\n');

  // 주기적으로 상태 체크
  setInterval(checkPresence, CHECK_INTERVAL);
}

initialize();
