# He Is Coming Bot

특정 사용자가 Slack에 접속하면 알림을 보내주는 봇입니다.

## 설정 방법

### 1. Slack App 생성

1. [Slack API](https://api.slack.com/apps) 접속
2. **Create New App** > **From scratch**
3. App 이름 입력 (예: "He Is Coming Bot"), 워크스페이스 선택

### 2. OAuth & Permissions 설정

1. 좌측 메뉴 **Features** > **OAuth & Permissions**
2. **Scopes** > **Bot Token Scopes** 에서 추가:
   - `users:read` - 사용자 정보 조회
   - `chat:write` - 메시지 전송
3. 페이지 상단 **Install to Workspace** 클릭
4. 생성된 `xoxb-` 토큰 복사 → `.env`의 `SLACK_BOT_TOKEN`에 저장

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
WATCH_USER_IDS=U01234567
NOTIFY_CHANNEL=C01234567
```

### 4. 사용자 ID / 채널 ID 찾는 법

**사용자 ID:**
1. Slack에서 해당 사용자 프로필 클릭
2. 점 세 개 메뉴 (**⋮**) 클릭
3. **멤버 ID 복사** 선택

**채널 ID:**
1. 채널 이름 클릭 (상단)
2. 스크롤 내려서 채널 ID 확인 (C로 시작)

**DM으로 받고 싶으면:** `NOTIFY_CHANNEL`에 본인 사용자 ID 입력

### 5. 봇을 채널에 초대

알림을 받을 채널에서:
```
/invite @He Is Coming Bot
```

## 실행

```bash
# 의존성 설치
npm install

# 실행
npm start

# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev
```

## 상시 실행 (선택)

### PM2 사용

```bash
npm install -g pm2
pm2 start app.js --name he-is-coming-bot
pm2 save
pm2 startup
```

## 동작 방식

- 30초마다 감시 대상 사용자의 상태를 체크
- `away` → `active` 상태 변경 감지 시 알림
- 체크 주기는 `CHECK_INTERVAL` 환경변수로 조정 가능

## 주의사항

- Slack 무료 플랜에서도 동작합니다
- 봇은 계속 실행 중이어야 합니다 (서버 또는 PM2 사용 권장)
- 첫 실행 시 이미 접속 중인 사용자는 알림이 가지 않습니다 (이후 재접속 시 알림)
