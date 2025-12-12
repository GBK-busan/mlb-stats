🎉 MLB Stats Dashboard

React + Vite 기반의 MLB 경기/선수/팀/구장 정보 조회 웹 애플리케이션

MLB 공식 StatsAPI 데이터를 활용해

📅 경기 일정 조회

🧾 경기 상세 스코어/로그/하이라이트 영상

🧑‍🤝‍🧑 선수 상세 스탯 조회 (타격/투구)

🏟️ 구장 정보 조회 및 상세 페이지

🏳️ 팀 목록 / 팀 상세 / 시즌 경기 기록
을 한 곳에서 확인할 수 있는 대시보드입니다.

Netlify 또는 GitHub Pages로 쉽게 배포할 수 있으며,
React Router를 사용한 SPA 구조로 구현되었습니다.

🚀 주요 기능
🏟 경기 일정 & 상세 정보

날짜별 경기 검색

팀 필터링

Linescore(이닝별 점수)

플레이 로그

승/패/세이브 투수 표시

하이라이트 영상 제공 (StatsAPI → MLB.com 영상 링크)

👤 선수 정보

사진, 생년월일, 신체 정보 등 기본 데이터

시즌별 스탯 (타격/투구) 조회

시즌 선택 기능

선수별 하이라이트 영상 (계획 가능)

🏳️ 팀 정보

팀 로고 + 한글 팀명 매핑

리그/지구별 정렬

팀 상세 정보 (팀 색상 / 주요 선수 / 시즌 경기 기록)

홈구장 바로가기 버튼

🏟 구장 정보

MLB 팀이 사용하는 모든 Ballpark 목록

각 구장의 상세 설명(위키 기반)

대표 이미지 + 위치 아이콘

홈 팀 표시

🎨 UI/UX 특징

MLB 컬러 테마 반영 (Navy + Red accent)

어두운 모드 스타일

반응형 레이아웃

컴포넌트 기반 구조로 확장성 높음

🛠 기술 스택
분야 사용 기술
Frontend React, Vite, React Router
Styling CSS Modules / Custom CSS
Data MLB StatsAPI
Build & Deploy Vite, Netlify / GitHub Pages
기타 Axios, useEffect/useMemo Hooks, Icon Packs
📂 프로젝트 구조
src/
│
├── api/
│ └── mlbApi.js # StatsAPI 호출 함수
│
├── components/
│ ├── Games/ # 경기 리스트, 상세, 로그 등
│ ├── Players/ # 선수 목록/상세
│ ├── Teams/ # 팀 목록/상세
│ ├── Venues/ # 구장 목록/상세
│ └── Utils/ # 공용 컴포넌트 (LinescoreTable 등)
│
├── common/
│ ├── teamsNameKo.js # 팀 한글 매핑
│ └── divisionNameKo.js # 지구명 한글 매핑
│
├── App.jsx
└── main.jsx

🐞 이슈 & 개선 계획

팀/선수 하이라이트 영상 더 정교하게 매칭하기

구장 상세 페이지에 지도(Map API) 연동

즐겨찾기 기능 (선수/팀)

시즌 선택 시 더 많은 통계 연동
