# LunchDinner 비교하기 개선 작업 체크리스트

이 문서는 `compare_review_report.md` 개정판을 실제 구현 작업으로 옮기기 위한 실행용 체크리스트다.
작업은 작은 단위로 끊고, 각 단계마다 `typecheck + test + 핵심 흐름 확인` 후 다음 단계로 진행한다.

## 공통 원칙

- 한 번에 구조를 다 바꾸지 않는다.
- 도메인 타입 변경이 UI 변경보다 먼저다.
- compare 핵심 흐름을 깨지 않는 범위에서 단계적으로 개선한다.
- 지도 연동은 이번 체크리스트 범위에서 제외한다.
- 각 단계 종료 후 `npm run typecheck`와 `npm run test`를 우선 실행한다.

## 진행 단계

### 1) 결과 데이터 구조 확장

- [x] `src/domain/types.ts`의 `Result` 타입 확장
- [x] ranking 항목에 기준별 점수 정보 구조 추가
- [x] 필요 시 총점 외 보조 필드 추가 (`scoreByKey`, `weightedScoreByKey`, `scoreGap`, `isTie` 등)
- [x] 새 타입 구조를 기준으로 화면 컴포넌트 타입 오류 정리

완료 기준
- [x] `Result` 타입만 읽어도 결과 화면에 필요한 데이터가 무엇인지 드러난다.
- [x] 결과 설명용 데이터를 UI가 별도 계산 없이 받을 수 있다.

### 2) `buildCompareResult()` 확장

- [x] `src/domain/recommendation.ts`에서 기준별 원점수 계산 분리
- [x] 기준별 가중 반영값 계산 추가
- [x] 1위와 2위 점수 차이 계산 추가
- [x] 동점 여부 및 동점 그룹 정보 계산 추가
- [x] 변경된 결과 구조에 맞춰 반환값 정리

완료 기준
- [x] `buildCompareResult()`만으로 결과 설명에 필요한 도메인 데이터가 모두 나온다.
- [x] 결과 화면에서 추가 계산 로직이 최소화된다.

### 3) compare 도메인 테스트 보강

- [x] `src/domain/recommendation.test.ts`에 결과 구조 확장 케이스 추가
- [x] 기준별 점수 합산 검증 테스트 추가
- [x] 1위와 2위 점수 차이 검증 테스트 추가
- [x] 동점 케이스 상세 검증 추가
- [x] 후보 2개 / 3개 / 4개 케이스 최소 샘플 확보

완료 기준
- [x] 결과 구조 변경이 테스트로 고정된다.
- [x] 동점/근소한 차이/일반 승리 케이스가 모두 검증된다.

### 4) 결과 화면 설명력 강화

- [x] `src/screens/ResultScreen.tsx`에 기준별 breakdown 영역 추가
- [x] 1위 vs 2위 비교 영역 추가
- [x] 동점 시 문구와 다음 액션 안내 개선
- [x] 근소한 승부일 때 요약 문구 차별화
- [x] 상위 3개 목록 표시 방식을 새 데이터 구조에 맞게 정리

완료 기준
- [x] 사용자가 "왜 1위인지"를 화면만 보고 이해할 수 있다.
- [x] 동점과 일반 승리 화면이 같은 문구로 뭉개지지 않는다.

### 5) 후보 수 상한 제한

- [x] `src/screens/CandidateInputScreen.tsx`에 최대 후보 수 상한 추가
- [x] 권장 후보 수 (`2~3개`) 안내 문구 추가
- [x] 상한 도달 시 입력 버튼/엔터 동작 차단
- [x] 상한 초과 시 명확한 안내 메시지 표시
- [x] 기존 상태에 후보가 많을 경우 방어 동작 확인

권장 기본값
- [x] 최대 후보 수: 4개

완료 기준
- [x] 사용자가 무제한 후보를 넣어 compare를 과도하게 무겁게 만들 수 없다.
- [x] 후보 입력 단계에서 compare의 사용 범위가 명확히 드러난다.

### 6) 점수평가 화면 단기 보강

- [x] `src/screens/ScoringBoardScreen.tsx`에 탭별 진행 상태 표시 추가
- [x] 현재 기준에서 미입력 후보 강조 표시 추가
- [x] 각 기준 의미 설명 문구 추가
- [x] 1~5점 의미를 짧은 텍스트로 보강
- [x] 후보 수가 4개일 때도 모바일 화면 가독성 확인

완료 기준
- [x] 현재 구조를 유지하더라도 사용자가 덜 멈추고 입력할 수 있다.
- [x] 점수 기준이 지금보다 명확해진다.

### 7) 점수평가 재설계안 탐색

- [x] 기준별 승자 선택 방식의 상태 구조 초안 작성
- [x] 현재 `weights + scores` 구조와 충돌 지점 정리
- [x] `절대점수 x 가중치` 대비 `기준별 승리 x 가중치` 계산 규칙 비교
- [x] UI 시안 수준으로 질문형 compare 흐름 정리
- [x] 재설계 전환 여부를 결정하기 위한 장단점 표 정리

완료 기준
- [x] 재설계를 할지, 현 구조를 유지 보강할지 근거가 문서화된다.
- [x] 실제 구현 전에 상태/도메인 변경 범위가 명확해진다.

### 8) 후보 입력 품질 개선

- [x] 공백/표기 차이를 고려한 중복 입력 방지
- [x] 후보 수정 기능 추가 여부 결정 및 반영
- [x] 예시 후보 칩 또는 힌트 문구 추가
- [x] 삭제 후 재입력 흐름 불편 여부 점검

완료 기준
- [x] 후보 입력 단계에서 사소한 입력 품질 문제로 UX가 흔들리지 않는다.

### 9) 거리 정보 보조화 설계

- [x] 지도 없이 거리 기준을 다루는 방식 초안 작성
- [x] 후보별 `가깝다 / 보통 / 멀다` 입력 방식 검토
- [x] 현재 점수평가 구조와 결합 방식 정리
- [x] 위치 기반 보조정보를 나중에 붙일 수 있는 확장 포인트 기록

완료 기준
- [x] 지도 없이도 `distance` 기준을 더 설득력 있게 다룰 수 있는 방향이 정리된다.

## 단계별 검증 체크

- [x] 각 단계 종료 시 `npm run typecheck`
- [x] 각 단계 종료 시 `npm run test`
- [ ] compare 핵심 흐름 수동 확인: `compare1 -> compare2 -> compare3 -> compare4`
- [x] 동점 케이스와 일반 승리 케이스 모두 확인
- [ ] 새로고침 후 상태 복원 시 compare 흐름이 깨지지 않는지 확인

## 권장 작업 순서

1. Step 1
2. Step 2
3. Step 3
4. Step 4
5. Step 5
6. Step 6
7. Step 7
8. Step 8
9. Step 9

## 작업 기록 템플릿

```md
### Step N 완료
- 변경 파일:
- 핵심 변경:
- 검증 결과:
- 남은 이슈:
```

### Step 1 완료
- 변경 파일: `src/domain/types.ts`, `src/domain/recommendation.ts`, `src/domain/recommendation.test.ts`
- 핵심 변경: `Result` 타입에 기준별 점수 맵, 순위 아이템 타입, 총점 외 설명 필드를 추가하고 기존 결과 생성 로직이 새 구조를 채우도록 맞춤.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: 결과 화면이 아직 새 필드를 사용하지 않음.

### Step 2 완료
- 변경 파일: `src/domain/types.ts`, `src/domain/recommendation.ts`, `src/domain/recommendation.test.ts`
- 핵심 변경: `buildCompareResult()`에 `runnerUp`, `topCandidates`, `comparisonByKey`, `leading/trailing/tied/decidingCriteria`, `summaryTone` 계산을 추가해 1위 vs 2위 비교 데이터를 직접 반환하도록 확장함.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: `ResultScreen`에서 이 비교 데이터를 아직 렌더하지 않음.

### Step 3 완료
- 변경 파일: `src/domain/recommendation.test.ts`
- 핵심 변경: 일반 승리, 근소한 승부, 공동 1위, 2후보, 3후보, 4후보 케이스를 포함하도록 compare 도메인 테스트를 보강함.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: Step 4에서 새 결과 구조를 실제 결과 화면 UX로 연결해야 함.

### Step 4 완료
- 변경 파일: `src/screens/ResultScreen.tsx`
- 핵심 변경: 결과 화면을 기준별 1위 점수, 1위 vs 2위 비교, 공동 1위 분기, 박빙/명확 승부 문구, 상위 3개 순위 표시까지 포함하는 설명형 UI로 재구성함.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: compare 핵심 흐름 수동 확인 및 Step 5 후보 수 상한 제한 작업 필요.

### Step 5 완료
- 변경 파일: `src/screens/CandidateInputScreen.tsx`, `src/App.tsx`
- 핵심 변경: compare 후보 수를 최대 4개로 제한하고, 후보 수 카운터/권장 범위 안내/상한 초과 메시지를 추가함. 또한 compare3·compare4 직접 진입 시 후보 수가 4개를 넘으면 compare2로 되돌리는 가드를 연결함.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: Step 6에서 점수평가 화면의 진행 상태와 기준 설명을 보강해야 함.

### Step 6 완료
- 변경 파일: `src/screens/ScoringBoardScreen.tsx`
- 핵심 변경: 탭별 완료 수 표시, 현재 기준 설명 카드, 1점/5점 의미 안내, 미입력 후보 상태 강조, 후보별 완료 배지를 추가해 점수평가 화면의 진행 감각과 판단 기준을 보강함.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: compare 핵심 흐름 수동 확인과 Step 7 재설계 탐색 또는 Step 8 입력 품질 개선 진행 필요.

### Step 7 완료
- 변경 파일: `compare_redesign_exploration.md`
- 핵심 변경: 현재 `weights + scores` 구조와 기준별 승자 선택 방식, 질문형 상대비교 구조를 비교하고 상태 구조 초안/계산 규칙 초안/추천 결론을 문서화함.
- 검증 결과: 문서 작성 완료, 기존 코드 영향 없음.
- 남은 이슈: 실제 구조 전환 여부 결정 필요.

### Step 8 완료
- 변경 파일: `src/screens/CandidateInputScreen.tsx`
- 핵심 변경: 후보명 정규화 중복 방지, 인라인 수정, 빠른 예시 칩, 피드백 메시지를 추가해 삭제 후 재입력에 의존하지 않도록 후보 입력 UX를 보강함.
- 검증 결과: `node node_modules\\typescript\\bin\\tsc --noEmit` 통과, `node node_modules\\vitest\\vitest.mjs run` 통과.
- 남은 이슈: 후보명 정규화 기준을 더 강하게 가져갈지 여부는 실제 사용 피드백으로 조정 가능.

### Step 9 완료
- 변경 파일: `compare_distance_strategy.md`
- 핵심 변경: 지도 없이 거리 기준을 다루는 1차 권장안(3단계 체감 거리), 문구 대안(`이동 편의`), 예상 이동 시간 보조정보 확장안을 문서화함.
- 검증 결과: 문서 작성 완료, 기존 코드 영향 없음.
- 남은 이슈: 실제 distance 입력 구조를 언제 바꿀지 결정 필요.

## 이번 사이클의 최소 목표

- [x] 결과 데이터 구조 확장 완료
- [x] 결과 화면 설명력 강화 완료
- [x] 후보 수 상한 제한 완료
- [x] 점수평가 화면 단기 보강 완료

최소 목표까지 끝나면 compare는 "작동하는 기능"에서 "설명 가능한 기능"으로 올라간다.
