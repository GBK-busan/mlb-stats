# 🎉 MLB Stats Dashboard

React + Vite 기반의 MLB 경기/선수/팀/구장 정보 조회 웹 애플리케이션

MLB 공식 **StatsAPI** 데이터를 활용해

- 📅 경기 일정 조회
- 🧾 경기 상세 스코어 / 라인스코어 / 플레이 로그
- 🎬 하이라이트 영상
- 🧑‍🤝‍🧑 선수 상세 정보 및 시즌별 스탯
- 🏟️ 구장 목록 및 상세 페이지
- 🏳️ 팀 목록 / 팀 상세 / 시즌 경기 기록  
  을 확인할 수 있는 대시보드입니다.

---

## 📸 미리보기 (Screenshots)

> ⚠️ 배포가 완료된 후 이미지 또는 GIF를 추가하세요.

---

## 🚀 주요 기능

### 🏟 경기 정보

- 날짜 선택 → 해당 날짜 경기 모두 조회
- 팀 필터
- 경기 상세페이지:
  - 점수 요약
  - 이닝별 라인스코어
  - 플레이 로그(이닝별 필터링 가능)
  - 승/패/세이브 투수
  - 타자 주요 기록
  - 하이라이트 영상 (캐러셀)

---

### 👤 선수 정보

- 선수 검색
- 시즌별 통계 조회 (타격/투구)
- 선수 상세 페이지
- 팀/포지션/키/몸무게 등 기본 프로필
- 시즌 선택 기능

---

### 🏳️ 팀 정보

- 팀 로고 + 한글 팀명
- 리그/지구별 자동 그룹화
- 팀 상세 정보
- 시즌별 경기가 한 번에 보임
- 경기별 승/패 배지
- 홈구장 상세 페이지 링크

---

### 🏟 구장 정보

- 모든 MLB Ballpark 리스트
- 구장 상세 (이미지, 설명, 홈팀 정보)
- 구장 정보는 StatsAPI + Wikipedia 혼합 데이터 기반

---

### 🎨 UI/UX 특징

- MLB 네이비 + 레드 강조 컬러
- 반응형
- 컴포넌트 구조 명확하게 구조화
- 깨끗한 카드/그리드 UI

---

## 🛠 기술 스택

| 분야     | 사용 기술                                |
| -------- | ---------------------------------------- |
| Frontend | React, Vite, React Router                |
| Styling  | CSS, Custom MLB Theme                    |
| Data     | MLB StatsAPI                             |
| Build    | Vite                                     |
| Deploy   | Netlify 또는 GitHub Pages                |
| 기타     | Axios, Hooks(useEffect/useMemo/useState) |

---

## 📂 프로젝트 구조

```bash
src/
│
├── api/
│   └── mlbApi.js
│
├── components/
│   ├── Games/
│   │   ├── GameList.jsx
│   │   ├── GameDetail.jsx
│   │   └── PlayLog.jsx
│   ├── Players/
│   │   ├── PlayerTable.jsx
│   │   └── PlayerDetail.jsx
│   ├── Teams/
│   │   ├── TeamsList.jsx
│   │   └── TeamDetail.jsx
│   ├── Venues/
│   │   ├── VenuesList.jsx
│   │   └── VenueDetail.jsx
│   └── Utils/
│       ├── LinescoreTable.jsx
│       ├── DatePicker.jsx
│       └── TeamSelect.jsx
│
├── common/
│   ├── teamsNameKo.js
│   ├── divisionNameKo.js
│   └── teamColors.js
│
├── App.jsx
└── main.jsx
```

🐞 개선 예정 기능

팀/선수별 하이라이트 자동 필터링 강화

구장 지도(Map API) 추가

즐겨찾기(팀/선수) 기능

모바일 UI 최적화

📜 라이선스 안내

본 프로젝트는 MLB StatsAPI 기반으로 동작하며,
데이터 및 영상 링크는 MLB Advanced Media의 저작권 규정을 따릅니다.
