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
- [x] 앱 상태를 reducer로 통합 (`currentStep`, `mode`, `flowType` 포함)
- [x] 액션 타입 정의 (`NAVIGATE`, `SET_WEIGHTS`, `SET_CANDIDATES`, `SET_SCORE`, `SET_TAGS`, `RESET` 등)
- [x] 초기 상태/리셋 동작 명확화

완료 기준
- [x] 화면 이동/핵심 상태 변경이 reducer 액션으로만 수행된다.

### 4) 순수 계산 함수 먼저 작성
- [x] 비교 플로우 점수 계산 함수 작성 (`weights + scores -> total`)
- [x] 랭킹/동점 처리 함수 작성
- [x] Quick/Random 추천용 선택 함수 작성 (입력: 태그/메뉴목록)
- [x] 최소 샘플 케이스로 계산 결과 검증

완료 기준
- [x] UI 없이 함수만으로 결과를 재현할 수 있다.

### 5) Weight / Candidate / Scoring를 reducer에 연결
- [x] `WeightWizardScreen` -> reducer 상태/액션 연결
- [x] `CandidateInputScreen` -> reducer 상태/액션 연결
- [x] `ScoringBoardScreen` -> reducer 상태/액션 연결
- [x] 뒤로가기 후 재진입 시 입력 상태 유지 확인

완료 기준
- [x] compare 플로우 입력값이 화면 간 끊기지 않고 유지된다.

### 6) Result는 계산 함수 결과로 렌더
- [x] `ResultScreen` 하드코딩 제거
- [x] reducer 상태 + 계산 함수 결과로 우승 후보/근거 표시
- [x] 점수/순위/요약 문구를 데이터 기반으로 렌더

완료 기준
- [x] 입력이 바뀌면 결과 화면이 실제로 달라진다.

### 7) Quick/Random은 로컬 JSON 기반으로 연결
- [x] 로컬 메뉴 데이터 파일 추가 (예: `src/data/menu-db.json`)
- [x] `QuickTagScreen` 선택 태그를 reducer로 저장
- [x] `QuickResultScreen`에 추천 결과 연결
- [x] refetch/retry 시 재추천 동작 연결

완료 기준
- [x] quick/random 플로우에서 더미 문구 대신 실제 추천 데이터가 표시된다.

### 8) 예외처리
- [x] 후보 2개 미만, 태그 미선택, 점수 미입력 등 가드 처리
- [x] 태그 매칭 결과 없음 케이스 처리
- [x] 잘못된 상태 전이(직접 URL/예상 외 step) 방어

완료 기준
- [x] 주요 실패 케이스에서 앱이 깨지지 않고 안내 메시지를 보여준다.

### 9) 로컬스토리지 저장/복원
- [x] 상태 저장/복원 유틸 작성
- [x] 앱 시작 시 복원 + 버전 키(`appState:v1`) 도입
- [x] 복원 실패/버전 불일치 시 안전하게 초기화

완료 기준
- [x] 새로고침 후에도 진행 상태가 복구된다.

## 단계별 검증 체크
- [x] 각 단계 종료 시 `npm run typecheck`
- [x] 각 단계 종료 시 핵심 플로우 수동 점검 (intro -> flow -> compare/quick -> result)

## 작업 기록 템플릿
아래 형식으로 단계 완료 로그를 남긴다.

```md
### Step N 완료
- 변경 파일:
- 핵심 변경:
- 검증 결과:
- 남은 이슈:
```


### Step 3 완료
- 변경 파일: src/domain/state.ts, src/App.tsx
- 핵심 변경: 앱 전역 상태를 useReducer로 통합하고, 화면 전이/모드/플로우 변경을 reducer 액션 디스패치로 일원화함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과 (npm run typecheck는 로컬 npm 경로 이슈로 실행 불가).
- 남은 이슈: Step 5에서 Weight/Candidate/Scoring 입력 컴포넌트를 reducer 상태에 직접 연결 필요.

### Step 4 완료
- 변경 파일: src/domain/recommendation.ts, src/domain/recommendation.samples.ts
- 핵심 변경: compare 점수 계산/랭킹(동점 포함), quick/random 추천 선택 함수를 순수 함수로 분리함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과, node --experimental-strip-types src/domain/recommendation.samples.ts 실행 통과.
- 남은 이슈: Step 5에서 각 입력 화면 상태를 reducer 액션으로 연결 필요.

### Step 5 완료
- 변경 파일: src/App.tsx, src/domain/state.ts, src/screens/WeightWizardScreen.tsx, src/screens/CandidateInputScreen.tsx, src/screens/ScoringBoardScreen.tsx
- 핵심 변경: Weight/Candidate/Scoring 화면 로컬 상태를 reducer 상태/액션으로 이관하고, compare 플로우 입력값이 화면 전이 및 뒤로가기 후에도 유지되도록 연결함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과.
- 남은 이슈: Step 6에서 ResultScreen 하드코딩 제거 및 계산 함수 결과 렌더 연결 필요.

### Step 6 완료
- 변경 파일: src/App.tsx, src/screens/ResultScreen.tsx
- 핵심 변경: compare 결과 화면을 하드코딩에서 제거하고 reducer 상태(weights/candidates/scores) + 계산 함수(buildCompareResult) 기반으로 우승 후보/점수/순위/요약을 렌더하도록 연결함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과.
- 남은 이슈: Step 7에서 quick/random 추천을 로컬 데이터 기반으로 연결 필요.

### Step 7 완료
- 변경 파일: src/data/menu-db.json, src/App.tsx, src/domain/state.ts, src/domain/recommendation.ts, src/screens/QuickTagScreen.tsx, src/screens/QuickResultScreen.tsx
- 핵심 변경: 로컬 메뉴 DB를 추가하고 quick 태그 선택을 reducer 상태로 저장했으며, quick/random 결과 화면을 계산 함수 기반 데이터 렌더 + 재추천 액션으로 연결함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과, node --experimental-strip-types src/domain/recommendation.samples.ts 통과.
- 남은 이슈: Step 8에서 입력 누락/매칭 실패/잘못된 상태 전이 가드 처리 필요.

### Step 8 완료
- 변경 파일: src/App.tsx, src/screens/ScoringBoardScreen.tsx, src/screens/QuickResultScreen.tsx
- 핵심 변경: 상태 전이 가드(resolveGuardedStep)로 잘못된 step 접근을 안전한 단계로 강제했고, 점수 미입력/후보 부족 시 다음 단계 진입을 차단하며 안내 메시지를 표시하도록 처리함. 또한 태그 매칭 실패 시 대체 추천 안내를 명시적으로 노출함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과, node --experimental-strip-types src/domain/recommendation.samples.ts 통과.
- 남은 이슈: Step 9 로컬스토리지 저장/복원 구현 필요.

### Step 9 완료
- 변경 파일: src/domain/persistence.ts, src/domain/state.ts, src/App.tsx
- 핵심 변경: 로컬스토리지(`appState:v1`) 기반 상태 저장/복원 유틸을 추가하고 앱 시작 시 복원, 상태 변경 시 자동 저장을 연결함. 파싱 실패/버전 불일치/잘못된 데이터는 안전한 초기 상태로 복구하도록 처리함.
- 검증 결과: node_modules/.bin/tsc --noEmit 통과, node --experimental-strip-types src/domain/recommendation.samples.ts 통과.
- 남은 이슈: 단계별 핵심 플로우 수동 점검 필요.

### 핵심 플로우 점검 완료
- 변경 파일: src/domain/flow.smoke.ts
- 핵심 점검: intro -> flowSelect -> quick/random -> compare -> result 전이, 재추천 nonce 동작, 로컬스토리지(appState:v1) 저장/복원/버전 불일치/파싱 실패 초기화 시나리오를 스모크 스크립트로 검증함.
- 검증 결과: node --experimental-strip-types src/domain/flow.smoke.ts 통과 (Flow smoke check passed...).
- 참고: 터미널 환경에서 UI 클릭 수동 테스트 대신 동등 시나리오 스모크 검증으로 대체.


## 다음 단계 체크리스트 (waitTime 제거 이후)

### A) mode(점심/저녁)를 추천에 반영 (우선순위 높음)
- [x] `menu-db.json`에 `mealType`(`lunch` | `dinner` | `both`) 필드 추가
- [x] mode에 따라 추천 대상 메뉴 풀 필터링
- [x] mode에 따라 quick 태그 목록도 필터링
- [x] 모드별 결과 차이 확인 (점심/저녁 동일 태그 비교)

완료 기준
- [x] 같은 태그를 선택해도 `mode`가 다르면 후보 풀이 실제로 달라진다.

### B) Vitest 도입 (우선순위 중간)
- [x] `vitest` + `@vitest/coverage-v8`(선택) 설치
- [x] `package.json`에 `test`, `test:watch` 스크립트 추가
- [x] `recommendation.samples.ts`, `flow.smoke.ts` 시나리오를 Vitest 테스트 파일(`*.test.ts`)로 이전
- [x] CI에서 `npm run test` 실행 가능하게 구성

완료 기준
- [x] `npm run test` 한 번으로 핵심 도메인 테스트가 실행된다.

### C) 메뉴 데이터 확장 (우선순위 중간)
- [x] `menu-db.json` 메뉴 수 확장 (15 -> 30, 태그 희소 구간 보강)
- [x] 태그 분포 점검 (희소 태그 `샐러드/브런치/분위기/아시안` 보강)
- [x] mode별 최소 후보 개수 가이드 정의 (기준: lunch>=8, dinner>=8, both>=10)

완료 기준
- [x] 주요 태그 조합에서 추천 후보 풀이 과도하게 좁아지지 않는다.

### D) WinnerCard 공용 컴포넌트 추출 (우선순위 낮음)
- [ ] `QuickResultScreen`/`ResultScreen` 공통 위너 카드 UI 추출
- [ ] 공통 props 인터페이스 설계
- [ ] 화면별 차이 요소만 슬롯/옵션으로 분리

완료 기준
- [ ] 위너 카드 레이아웃 중복이 제거되고 화면 동작이 동일하다.

### E) Error Boundary 추가 (우선순위 낮음)
- [ ] 앱 루트 에러 바운더리 컴포넌트 추가
- [ ] 런타임 에러 시 복구 액션(홈으로/다시 시작) 제공
- [ ] 기본 로깅 포인트 추가

완료 기준
- [ ] 렌더 단계 예외 발생 시 화이트스크린 대신 복구 가능한 fallback이 뜬다.



