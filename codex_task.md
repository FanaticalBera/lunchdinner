# 🎯 "결투장(직접 비교) 플로우 피벗" 작업 목록 (Codex 전용)

이 문서는 새롭게 피벗된 기획(`기획_방향성_피벗_제안.md`)에 따라 Codex가 작업을 수행하기 위한 명확한 체크리스트입니다.

## Step 1. 🗑️ 레거시 화면 제거 및 라우팅 수정 (Codex 작업 대상)
- [x] `src/screens/ScoringBoardScreen.tsx` 파일 삭제 
- [x] `src/screens/WeightWizardScreen.tsx` 파일 삭제
- [x] `src/App.tsx` 또는 라우팅 관여 구역에서 위 두 화면으로 가는 라우팅/스텝 로직 제거
- [x] `CandidateInputScreen`에서 `nextStep`을 점수판이 아닌 **새 랜덤 추첨 결과 화면(`CompareResultScreen`)**으로 바로 넘어가도록 연결 수정
- [x] `src/domain/types.ts`에서 더 이상 사용하지 않는 `Weights`, `ScoreMatrix` 관련 타입 제거

---
*아래 Step 2~4는 Step 1 완료 후 순차적으로 진행합니다.*

## Step 2. ⚡ 후보 입력 (Candidate Input) UI 고도화
- [x] `CandidateInputScreen.tsx`에서 후보가 2개 이상일 때 하단 버튼 텍스트를 "바로 결정하기 🎲"로 변경
- [x] 하단 버튼에 통통 튀는 넛지 액션(애니메이션) 추가

## Step 3. 🎲 새로운 결과 화면(`CompareResultScreen`) 기반 구현
- [x] `src/screens/CompareResultScreen.tsx` 신규 파일 생성
- [x] 후보 리스트(자율 입력 칩)를 받아서 랜덤으로 1개를 추첨하는 기본 로직 구현
- [x] 결과 도출 전 1~2초간 긴장감을 주는 팝/룰렛 형태의 초기 애니메이션 적용
- [x] 1등 결과 발표 UI 구현 (가장 크게 중앙에 강조)

## 4. 🔄 "후보 압축 (Candidate Compression)" 방식의 버튼 액션 적용 (CompareResultScreen 내)
- [x] 결과 화면에 "현재 남은 후보: X개" 상태 텍스트 예쁘게 표시
- [x] 버튼 1: `[ ✅ 이걸로 결정! ]` (확정 후 `onHome` 등으로 라우팅)
- [x] 버튼 2: `[ 🔄 이건 빼고 다시 돌릴래 ]` 
  - 누르면 현재 당첨된 후보를 후보 배열에서 소거(drop)
  - 소거 후 즉각적으로 재추첨 애니메이션 재실행
  - "방금 OOO 제외됨" 같은 안내 문구 자연스럽게 노출
- [x] 버튼 3: `[ 📝 후보 다시 수정하기 ]` (`CandidateInputScreen`으로 되돌아가기)

---

## Codex 작업 메모

- Step 1 범위대로 `ScoringBoardScreen`, `WeightWizardScreen`을 제거하고 compare 플로우를 `후보 입력 -> CompareResultScreen` 단일 흐름으로 축소했습니다.
- `src/App.tsx`, `src/domain/state.ts`, `src/domain/persistence.ts`, `src/domain/types.ts`를 함께 정리해 가중치/점수판 의존성을 앱 상태와 라우팅에서 제거했습니다.
- 앱이 바로 동작하도록 `src/screens/CompareResultScreen.tsx`는 Step 1용 최소 연결 화면으로 먼저 추가했습니다. Step 3에서 연출과 액션을 본격 확장하면 됩니다.
- 검증 결과: `tsc --noEmit` 통과. `vitest`는 현재 환경에서 `esbuild spawn EPERM`으로 실행되지 않아 테스트 전체 확인은 못 했습니다.

---

## Antigravity 작업 메모 (Step 2 완료)
- `CandidateInputScreen.tsx`의 하단 "바로 결정하기" 버튼 텍스트에 `🎲` 이모지를 추가했습니다.
- 후보가 2개 이상 입력되어 다음 스텝으로 넘어갈 수 있는 상태(`canProceed === true`)가 되면, Framer Motion의 `motion.div`를 사용하여 버튼 전체가 통통 튀는 넛지 애니메이션(`y: [0, -8, 0]`)이 무한 반복되도록 적용했습니다.
- 사용자가 버튼에 더 주목하고 클릭을 유도할 수 있도록 시각적 피드백(The Lubicant)을 한 스푼 추가했습니다.

## Antigravity 작업 메모 (Step 3 & 4 완료)
- `App.tsx`에서 `CompareResultScreen`에 `onRemoveCandidate` prop을 연결하여 후보 압축 기능을 라우팅 상태와 연동했습니다.
- `CompareResultScreen`에 `loading` 상태 동안 표시되는 "룰렛 효과" (0.07초마다 무작위 후보 이름이 빠르게 전환되는 모션)를 적용하여 시각적 쾌감과 긴장감을 주었습니다.
- 기획안에 따라 **"현재 남은 후보: X개"**를 화면 곳곳에 배치하고, `[ 🔄 이건 빼고 다시 돌릴래 ]` 액션 성공 시 **"방금 'OOO' 제외됨 💨"**이라는 메시지가 나타나도록 UX/UI를 완성했습니다.
- 3개의 거대한 액션 버튼(`이걸로 결정`, `빼고 다시 돌릴래`, `수정하기`)을 디자인 가이드에 맞춰 배치 완료했습니다.

## Codex 검증 메모 (Step 4 보완)
- Step 4 검증 중 `후보 압축`으로 2개에서 1개가 남는 순간 `compareResult`가 유지되지 않고 입력 화면으로 되돌아가는 라우팅 이슈를 확인했고 수정했습니다.
- `src/App.tsx`의 guarded step 조건을 조정해, compare 결과 화면은 후보가 1개 남아도 그대로 유지되도록 변경했습니다.
- 함께 `src/domain/flow.smoke.test.ts`, `src/domain/flow.smoke.ts`에 `후보 압축 후 1개만 남아도 compareResult 유지` 검증 케이스를 추가했습니다.
- 재검증 결과: `tsc --noEmit` 통과. Step 4의 핵심 흐름인 `빼고 다시 돌리기 -> 후보 1개 남음 -> 결과 화면 유지 -> 최종 확정 가능` 경로는 코드 기준으로 정상화되었습니다.

---

## Step 5. 🎯 서바이벌 팝 애니메이션 & 결과 페이지 리디자인
- [x] 기존 룰렛(텍스트 깜빡임) 애니메이션을 **서바이벌 팝**으로 전면 교체
  - 후보 칩들이 원형으로 배치되고 통통 튀다가, 한 명씩 폭발 이펙트와 함께 탈락
  - 최후의 1인만 남은 후 위너 페이즈로 전환
- [x] 위너 페이즈: 기존 단순 텍스트를 애니메이션 + 그라디언트 배경 + 콘페티 아이콘이 포함된 프리미엄 카드로 리디자인
- [x] 결과 페이지 버튼 리디자인
  - 딜레이 등장 모션으로 버튼들이 순차적으로 슬라이드업
  - "이건 빼고 다시" 버튼에 로즈 톤 색상 분리
  - `whileTap` 애니메이션으로 터치 피드백 추가
- [x] `tsc --noEmit` 통과 확인

---

## Antigravity 작업 메모 (Step 5 완료)

### 변경 파일
- `src/screens/CompareResultScreen.tsx` (전면 리라이트)

### 서바이벌 팝 애니메이션 상세
- **원형 배치**: `getChipPositions()` 함수로 후보 수에 따라 칩들을 원형으로 자동 배치
- **통통 튀는 모션**: 각 칩에 `y: [0, -6, 0]` Infinite 애니메이션 적용 (젤리 느낌)
- **탈락 이펙트**: `scale: 2.5 + opacity: 0 + rotate: ±180°` 조합으로 400ms 간격으로 한 명씩 "펑!" 하고 터져 사라짐
- **위너 전환**: 모든 탈락자가 사라지고 500ms 후 위너 페이즈로 전환 (`spring` 애니메이션)

### 결과 페이지 버튼 리디자인 상세 (1차)
- **계층적 CTA**: "이걸로 결정"(초록 PrimaryButton) > "빼고 다시"(로즈톤 보더 버튼) > "수정하기"(텍스트 링크) 순서로 시각적 우선순위를 명확히 분리
- **딜레이 등장**: 0.5초 → 0.65초 → 0.8초 간격으로 버튼들이 순차적으로 슬라이드업
- **터치 피드백**: `whileTap={{ scale: 0.97 }}`로 누르는 느낌 추가
- **검증**: `tsc --noEmit` 통과 ✅

---

## Antigravity 작업 메모 (Step 6: 유저 피드백 즉시 수용 및 최종 폴리싱)

### 1. 후보 입력 스크롤 버그 픽스 (`AppShell.tsx`, `CandidateInputScreen.tsx`)
- 증상: 후보를 하나씩 추가할 때마다 스크롤바가 생기며 버튼이 밑으로 밀려남.
- 원인: `AppShell`의 높이가 `min-h-[100dvh]`로 되어 있어 콘텐츠에 따라 화면 전체가 브라우저 스크롤을 유발함.
- **해결**:
  - `AppShell`의 높이를 `h-[100dvh] overflow-hidden`으로 강제 고정하여 네이티브 앱처럼 뷰포트를 가둠.
  - `CandidateInputScreen`의 메인 컨테이너 비율을 조정하고 버튼부(`BottomActionBar`)에는 `z-50`을 부여하여 완벽하게 하단에 고정된 상태로 내부 리스트만 스크롤되도록 개선.

### 2. 룰렛 시각 효과(서바이벌 → 고속 슬롯머신) & 버튼 UI 전면 리디자인 (`CompareResultScreen.tsx`)
- 증상: 서바이벌 팝 이펙트가 살짝 조잡하고, 빨간색 거대 버튼이 어색함.
- **해결**:
  - **프리미엄 슬롯 셔플 카드**: 원형 배치를 버리고 중앙에 거대한 카드 하나를 두어, 그 안에서 아이콘이 블러(blur) 효과와 함께 0.06초 간격으로 미친듯이 바뀌는 매끄러운 고속 릴(Slot) 애니메이션 적용.
  - **세련된 버튼 UI**: 
    - 🔴 로즈 톤 보더 → ⚪ 흰색 바탕 + 얇은 그레이 보더(Ghost type)로 변경하여 파괴적 액션이 아닌 '일반적인 플로우' 느낌 제공.
    - 버튼들을 세로로 길게 나열하는 대신, [이건 빼고 다시]와 [수정] 버튼을 가로로 배치하거나, 시각적 부피를 줄여 훨씬 깔끔하고 다루기 편한 레이아웃으로 변경.
