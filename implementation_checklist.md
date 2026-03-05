# LunchDinner 기능 구현 체크리스트

이 문서는 UI 뼈대 이후 기능 구현을 단계적으로 진행하기 위한 작업 기준서다.
새 채팅방에서 그대로 붙여서 실행할 수 있도록 작성했다.

## 공통 원칙
- 한 번에 다 만들지 않고 단계별로 완료한다.
- 각 단계는 `typecheck 통과 + 동작 확인` 후 다음 단계로 이동한다.
- 상태/계산 로직은 가능한 한 순수 함수로 분리한다.
- Ui/Ux는 최대한 유지할 것

## 진행 단계

### 1) TS/인코딩 정리 + typecheck 스크립트 추가
- [x] 문자열 깨짐(한글/특수문자) 정리
- [x] TypeScript 에러 정리 (`npx tsc --noEmit` 기준)
- [x] `package.json`에 `typecheck` 스크립트 추가

완료 기준
- [x] `npm run typecheck`가 에러 없이 통과한다.

### 2) 도메인 타입 먼저 정의
- [x] 공통 타입 파일 추가 (예: `src/domain/types.ts`)
- [x] 핵심 타입 정의: `Mode`, `FlowType`, `Step`, `Weights`, `Candidate`, `ScoreMatrix`, `QuickTag`, `Result`
- [x] 화면 컴포넌트에서 타입 재사용하도록 정리

완료 기준
- [x] 화면별 임시 타입/중복 타입이 최소화된다.

### 3) useReducer 도입 (currentStep 포함)
- [ ] 앱 상태를 reducer로 통합 (`currentStep`, `mode`, `flowType` 포함)
- [ ] 액션 타입 정의 (`NAVIGATE`, `SET_WEIGHTS`, `SET_CANDIDATES`, `SET_SCORE`, `SET_TAGS`, `RESET` 등)
- [ ] 초기 상태/리셋 동작 명확화

완료 기준
- [ ] 화면 이동/핵심 상태 변경이 reducer 액션으로만 수행된다.

### 4) 순수 계산 함수 먼저 작성
- [ ] 비교 플로우 점수 계산 함수 작성 (`weights + scores -> total`)
- [ ] 랭킹/동점 처리 함수 작성
- [ ] Quick/Random 추천용 선택 함수 작성 (입력: 태그/메뉴목록)
- [ ] 최소 샘플 케이스로 계산 결과 검증

완료 기준
- [ ] UI 없이 함수만으로 결과를 재현할 수 있다.

### 5) Weight / Candidate / Scoring를 reducer에 연결
- [ ] `WeightWizardScreen` -> reducer 상태/액션 연결
- [ ] `CandidateInputScreen` -> reducer 상태/액션 연결
- [ ] `ScoringBoardScreen` -> reducer 상태/액션 연결
- [ ] 뒤로가기 후 재진입 시 입력 상태 유지 확인

완료 기준
- [ ] compare 플로우 입력값이 화면 간 끊기지 않고 유지된다.

### 6) Result는 계산 함수 결과로 렌더
- [ ] `ResultScreen` 하드코딩 제거
- [ ] reducer 상태 + 계산 함수 결과로 우승 후보/근거 표시
- [ ] 점수/순위/요약 문구를 데이터 기반으로 렌더

완료 기준
- [ ] 입력이 바뀌면 결과 화면이 실제로 달라진다.

### 7) Quick/Random은 로컬 JSON 기반으로 연결
- [ ] 로컬 메뉴 데이터 파일 추가 (예: `src/data/menu-db.json`)
- [ ] `QuickTagScreen` 선택 태그를 reducer로 저장
- [ ] `QuickResultScreen`에 추천 결과 연결
- [ ] refetch/retry 시 재추천 동작 연결

완료 기준
- [ ] quick/random 플로우에서 더미 문구 대신 실제 추천 데이터가 표시된다.

### 8) 예외처리
- [ ] 후보 2개 미만, 태그 미선택, 점수 미입력 등 가드 처리
- [ ] 태그 매칭 결과 없음 케이스 처리
- [ ] 잘못된 상태 전이(직접 URL/예상 외 step) 방어

완료 기준
- [ ] 주요 실패 케이스에서 앱이 깨지지 않고 안내 메시지를 보여준다.

### 9) 로컬스토리지 저장/복원
- [ ] 상태 저장/복원 유틸 작성
- [ ] 앱 시작 시 복원 + 버전 키(`appState:v1`) 도입
- [ ] 복원 실패/버전 불일치 시 안전하게 초기화

완료 기준
- [ ] 새로고침 후에도 진행 상태가 복구된다.

## 단계별 검증 체크
- [x] 각 단계 종료 시 `npm run typecheck`
- [ ] 각 단계 종료 시 핵심 플로우 수동 점검 (intro -> flow -> compare/quick -> result)

## 작업 기록 템플릿
아래 형식으로 단계 완료 로그를 남긴다.

```md
### Step N 완료
- 변경 파일:
- 핵심 변경:
- 검증 결과:
- 남은 이슈:
```

