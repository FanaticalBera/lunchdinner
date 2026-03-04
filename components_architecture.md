# 🍱 "대신 골라줘!" 프론트엔드 컴포넌트 구조 설계 명세서 

이 문서는 완성된 사전 기획(UI 골격)을 바탕으로, React/Vue 등 프론트엔드 프레임워크 기반 프론트엔드 구현 직전 화면을 효율적으로 쪼개고 조립하기 위한 **컴포넌트 설계서**입니다.

---

## A. 전체 컴포넌트 맵 (Component Map)

전체 애플리케이션 화면을 구성하기 위한 블록(컴포넌트) 리스트입니다.

### 🌐 공통 컴포넌트 (Common Components)
앱 전체에서 2번 이상 재사용되는 뼈대.
* **`AppShell`**: 전체 화면을 감싸는 최상위 컨테이너 (모바일 최대 너비 제한, 테마 배경색 관리)
* **`StepHeader`**: 상단 고정 영역 (뒤로가기 버튼 + 현재 텍스트 타이틀)
* **`ProgressBar`**: 진행률 표시기 (Step 1~4 시각화)
* **`BottomActionBar`**: 화면 최하단에 붙은 영역 (이전/다음 등 꽉 찬 버튼 컨테이너)
* **`PrimaryButton`**: [다음], [결과 보기] 등에 쓰이는 기본 인터랙션 버튼
* **`HelperText`**: 입력란 아래에 붙는 안내용 작은 회색 텍스트

### 🖥️ 화면 전용 컴포넌트 (Screen-specific Components)
특정 화면에서만 주요 기능을 수행하는 특수 블록.
* **[Intro] `ModeThemeCard`**: 점심/저녁 큼지막한 선택 카드
* **[Criteria] `FluidSliderGroup`**: 가중치를 100% 안에서 분배하는 4개 슬라이더 묶음 박스
* **[Criteria] `PercentageIndicator`**: 슬라이더 조작 시 남은/초과 비율을 보여주는 바
* **[Candidates] `TagInputField`**: 엔터 시 값이 칩(Chip)으로 쪼개지는 특수 인풋 베이스
* **[Candidates] `CandidateChip`**: [x] 삭제 버튼이 달린 낱개 태그
* **[Scoring] `CriteriaTabBar`**: 스코어 보드의 상단 탭 네비게이션 (맛, 거리 등 넘기기)
* **[Scoring] `ScoreRow`**: "식당 이름 + 5가지 표정 버튼" 한 줄 묶음
* **[Result] `WinnerCard`**: 1위 결과를 강조하는 화려한 카드
* **[Result] `StackedBarChart`**: 1~3위 순위와 가중치 기준별 득점을 보여주는 멀티 컬러 막대

---

## B. 화면별 컴포넌트 레이아웃 구성

각 화면이 어떤 컴포넌트들의 합성(Composition)으로 이뤄지는지를 명세합니다.

### 1) [Screen 1] Intro & Mode Select (상황 선택 화면)
* **목적**: 서비스 시작, 전체 CSS 테마(Theme) 결정 (점심/저녁)
* **구성 블록**:
  - `AppShell` (부모)
    - `ModeThemeCard` (점심 버튼) - **핵심**
    - `ModeThemeCard` (저녁 버튼) - **핵심**
* **특징**: 복잡한 헤더나 바텀바가 없는 유일한 진입 화면.

### 2) [Screen 2] Weight Wizard (가중치 설정 화면)
* **목적**: 4가지 기준의 중요도를 총합 100%로 설정
* **구성 블록**:
  - `StepHeader` ("제일 중요한 건 뭔가요?")
  - `ProgressBar` (Step 1)
  - `FluidSliderGroup` - **핵심** (내부적으로 4개의 슬라이더를 렌더링하고 동기화)
  - `PercentageIndicator` ("100%가 채워졌어요!")
  - `BottomActionBar` > `PrimaryButton` ("음식점 입력하기 ➔")

### 3) [Screen 3] Candidate Input (후보 입력 화면)
* **목적**: 비교할 식당(태그) 객체 수집
* **구성 블록**:
  - `StepHeader` ("어디어디 고민 중이신가요?")
  - `ProgressBar` (Step 2)
  - `TagInputField` - **핵심** (텍스트 필드)
    - `HelperText` ("2개 이상 입력해주세요")
  - `CandidateChip` 리스트 렌더링 존 
  - `BottomActionBar` > `PrimaryButton` ("점수 매기기 ➔")

### 4) [Screen 4] Scoring Board (점수 평가 보드 화면)
* **목적**: 후보별 x 항목별 스코어 행렬 데이터 수집
* **구성 블록**:
  - `StepHeader` ("만족도를 골라주세요")
  - `ProgressBar` (Step 3)
  - `CriteriaTabBar` - **핵심** (평가할 항목 전환용 탭)
  - `ScoreRow` 리스트 렌더링 존 - **핵심** (후보 수 만큼 반복)
  - `BottomActionBar` > `PrimaryButton` ("🔥 결과 보기")

### 5) [Screen 5] Result (결과 발표 화면)
* **목적**: 최종 랭킹 및 설득 차트 제공
* **구성 블록**:
  - `WinnerCard` - **핵심** (1위 강조)
  - `HelperText` (이유 설명 "가성비가 좋아서...!")
  - `StackedBarChart` - **핵심** (순위별 누적 차트)
  - `BottomActionBar` (복수 액션)
    - `PrimaryButton` ("가중치만 수정하기")
    - `PrimaryButton` ("새로하기")

---

## C. 컴포넌트 계층 트리를 포함한 저충실도 레이아웃

전반적인 화면 구성은 화면 상단(`Header`), 중앙 스크롤(`Main`), 화면 하단(`Footer`)으로 분리되어 조립됩니다. 

```text
[Screen 3] 후보 입력 화면의 계층/레이아웃 트리 예시

📦 ScreenCandidate
 ┣ 📌 [Header 고정 영역]
 ┃ ┣ 🧱 StepHeader (Props: title="어디어디 고민 중?", onBack={...})
 ┃ ┗ 🧱 ProgressBar (Props: step=2, total=4)
 ┃
 ┣ 📜 [Main 영역 - 스크롤 가능]
 ┃ ┣ 🧱 TagInputField (Props: value, onChange, onEnter, placeholder="식당 이름 입력")
 ┃ ┣ 🧱 HelperText (Props: message="최소 2개를 입력해주세요", isError=false)
 ┃ ┗ 🗂️ ChipListWrapper
 ┃   ┣ 🏷️ CandidateChip (Props: name="김치찌개", onDelete={...})
 ┃   ┗ 🏷️ CandidateChip (Props: name="돈까스", onDelete={...})
 ┃
 ┗ ⚓ [Footer 고정 영역]
   ┗ 🧱 BottomActionBar
     ┗ 🔘 PrimaryButton (Props: disabled=false, label="점수 매기기", onClick={...})
```
이런 식으로 상/하단을 고정하고 Main만을 스크롤 시키는 모바일 최적화 레이아웃이 만들어집니다.

---

## D. 상태 소유권 (State Ownership) 분배

각 상태 데이터 형식이 "누구에게 속해야 하는지(어디 선언되어야 하는지)"를 명확히 합니다.

1. **글로벌 상태 (전체 화면을 덮는 최상위 컨테이너 App.js 단위 소유)**
   - `mode` (점심/저녁): 결과 화면까지 테마 유지 필요.
   - `weights`: [가중치 화면]에서 세팅하여 [결과 화면] 랭킹식에서 사용.
   - `candidates`: [등록 화면]에서 만들어서 [스코어 보드], [결과 화면]에서 반복 사용.
   - `scoreMatrix`: [스코어 보드]에서 채우고 [결과 화면]에서 사용.

2. **로컬 상태 (특정 Screen 컴포넌트 내부에서만 들고 있으면 되는 것)**
   - `currentStep` (1~5): 부모가 스크린을 교체하는 데 씀.
   - `inputText`: 후보 화면 폼에 타이핑 중인 '현재 텍스트 값'. (엔터를 쳐서 리스트에 들어가기 전까지 찌꺼기 텍스트 데이터)
   - `activeTab`: 점수 평가 화면에서 지금 맛을 평가 중인지 거리를 평가 중인지만 관장.
   - `viewedTabs`: 점수 화면 하단 '결과 보기' 버튼을 잠금 해제하기 위한 임시 불리언 체크 배열.

---

## E. 주요 컴포넌트의 입력/출력 인터페이스 (I/O 설계)

공통 컴포넌트나 핵심 특수 블록들이 외부와 어떻게 소통하는지 설계합니다.

* **`FluidSliderGroup` (가중치 연동 슬라이더 팩)**
  - **입력받음(Props)**: 현재 글로벌 상태인 4개 가중치 숫자 배열 `[25, 25, 25, 25]`.
  - **전달함(Events)**: 사용자가 하나의 슬라이드 핸들을 잡고 드래그할 때마다, 즉각적으로 재보정(Total 100 마진 연산)된 새로운 4개의 숫자 배열을 위쪽으로 던짐.

* **`ScoreRow` (스코어보드 한 줄)**
  - **입력받음(Props)**: 식당 이름(`"김치찌개"`), 현재 찍혀있는 점수(`3`), 항목 유형(`"distance"`).
  - **보여줌(UI)**: 1~5점짜리 라디오 버튼 그룹. 3에 찍혀 있으면 보통(😐) 표정에 CSS 하이라이트.
  - **전달함(Events)**: 사용자가 1점(😡)을 누르면, `onScoreChange(후보ID, 기준ID, 1점)` 이벤트 트리거를 쏴서 부모 배열을 갈아끼우게 함.

* **`PrimaryButton` (기본 버튼)**
  - **입력받음(Props)**: 화면에 보일 문구(`"다음"`), 클릭 가능 여부 식별자 `isDisabled=true/false`
  - **전달함(Events)**: 단순 `onClick()` 액션 통보.

---

## F. 인터랙션 분배 (Interaction Flow)

각 컴포넌트 사용 시나리오입니다.

1. 사용자가 텍스트 인풋 폼 안에 글을 치고 **엔터키(Enter) 액션** 발생.
   - ➔ `TagInputField`에서 엔터 이벤트 감지. 컴포넌트 내 찌꺼기 상태 텍스트(`inputText`) 초기화 = 화면상 빈칸 됨.
   - ➔ 텍스트를 글로벌 상태(`candidates`) 배열 제일 뒤에 밀어 넣음.
   - ➔ 즉각적으로 화면 UI 렌더링 업데이트되며 하단 리스트에 예쁜 `CandidateChip` 모션 등장. 
   - ➔ `candidates`의 `.length >= 2`를 감지하여 하단의 찰싹 붙어있는 `PrimaryButton`이 회색 ➔ 브랜드 컬러로 활성화 점등됨.

2. 점수 평가 화면에서 사용자가 탭 버튼 **[ 가성비 ]** 를 터치함.
   - ➔ 스코어 보드 화면의 로컬 상태 `activeTab`이 "taste"에서 "price"로 바뀜.
   - ➔ 화면을 반분하고 있던 하단 영역 전체가 가로 슬라이더 애니메이션 처리. `ScoreRow`에 던져지던 기준 식별자 Props가 "taste점수"에서 "price점수"로 한 번에 교체 렌더링 됨.

---

## G. 1차 MVP 컴포넌트 개발 우선순위 구분

개발자(또는 본인)가 빈 폴더에 파일부터 만들 때의 우선순위.

**🚨 최우선 (Must Build First)**
- 앱 흐름 라우터(부모) 및 `BottomActionBar`, `PrimaryButton`. (화면 간 뼈대 전환 로딩을 위함)
- `ModeThemeCard` (시작 화면).
- 일반 텍스트 폼, `CandidateChip` (리스트 나열용).
- 스코어 렌더링용 단순 버튼 `ScoreRow`.

**🚧 중간 (Second Priority)**
- **`FluidSliderGroup`**: 단일 슬라이더 4개 배열은 쉽지만, "합이 100 유지"라는 알고리즘 로직이 빡셉니다. 우선순위를 두 번째로 두고 로직을 다듬어야 합니다.
- `StackedBarChart`: 오픈소스 차트 라이브러리(Chart.js나 Recharts 등) 도입 후 데이터 커스텀 연결.

**⏳ 보류 (Low Priority / Out of MVP)**
- 탭 스와이프 슬라이더 (애니메이션 래퍼): 애니메이션이 없어도 버튼 누르면 잘 넘어가는 로직부터 먼저 완성할 것.
- 컴포넌트 단위 에러 토스트(Toast) 팝업: 치명적인 에러가 없으므로 CSS 빨간색 에러 텍스트 표시로 1차 대체.

---

## H. 프론트엔드 구현 직전 체크리스트

모든 기획, 설계, 디자인 시스템(피그마 등)이 끝난 시점에서, 첫 `npm install`이나 `yarn create`를 치기 직전 점검.

1. [ ] **상태 중앙화 확인**: 결과계산에 동원되는 주요 항목(후보,기준,가중치,스코어)이 최상단 객체에 하나로 묶여 관리 될 준비가 되었는가?
2. [ ] **반응형 컨테이너 제약**: `AppShell` 컨테이너에 모바일 뷰어 최대 너비 규격(ex. max-width: 480px, auto 머진)이 기획상 정리되었는가?
3. [ ] **재사용성**: 삭제 태그 `CandidateChip`, 하단 `PrimaryButton` 처럼 앱 곳곳에 불려나올 공통 파츠들의 크기와 폰트 규격 묶음은 따로 모았는가?
4. [ ] **알고리즘 분리**: 화면 그리는 UI 컴포넌트 파일 안에 순위 계산(Ranking Math)이나 슬라이더 100% 보정 로직을 길게 섞지 않고, 별도의 Utils 순수 로직 함수로 돌려놓을 준비를 했는가?
5. [ ] **추천 제작 순서 결정**:
   ① 더미 레이아웃(`AppShell` + `Button` 등 껍데기들) 퍼블리싱.
   ② 스텝별 로컬 State를 통한 화면 5개 이동(라우팅) 검진.
   ③ 데이터(식당명, 점수 등)를 글로벌 State에 꽂고 뽑는 연결.
   ④ Fluid Slider, Chart 등 난이도 최상 컴포넌트 부착.
