# Fantazzk

치지직 대회 모의 드래프트/경매 통합 플랫폼.

대회 템플릿을 만들고, 혼자(AI 상대) 또는 친구들과(링크 공유) 모의 경매/드래프트를 진행할 수 있다.

## 기술 스택

| 항목            | 기술                 |
| --------------- | -------------------- |
| Framework       | SvelteKit (Svelte 5) |
| Package Manager | bun                  |
| Styling         | Tailwind CSS v4      |
| Deploy          | GCP Cloud Run        |
| Language        | TypeScript (strict)  |

## 시작하기

```bash
bun install
bun run dev
```

## 스크립트

```bash
bun run dev        # 개발 서버
bun run build      # 프로덕션 빌드
bun run preview    # 빌드 미리보기
bun run check      # 타입 검사
bun run lint       # 린트
bun run format     # 코드 포맷
```

## 주요 기능

- **규칙 엔진** — 경매/드래프트를 설정값만으로 전환 가능한 모듈형 엔진
- **대회 템플릿** — 누구나 선수풀과 규칙을 만들어 공유
- **솔로 모드** — AI 상대와 혼자서 시뮬레이션
- **멀티플레이어** — 링크 하나로 실시간 경매/드래프트
- **결과 공유 카드** — 이미지 카드 자동 생성, 커뮤니티 바이럴

## 페이지 경로

| 경로                | 설명                  |
| ------------------- | --------------------- |
| `/`                 | 홈 (랜딩 페이지)      |
| `/templates/create` | 템플릿 생성           |
| `/lobby/[id]`       | 대기실 (방 입장/관리) |
| `/auction/[id]`     | 경매 진행 화면        |
| `/draft/[id]`       | 드래프트 진행 화면    |
| `/result/[id]`      | 결과 화면             |
