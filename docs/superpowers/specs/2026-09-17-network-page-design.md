# URC 사이트 — 디자인 스펙 (2026-09-17, 3차 개정)

## 목표
urcyonsei.com 의 여섯 페이지(Home / About us / Curriculum / Research / Network / Join us) 내용을 **한 글자도 더하거나 빼지 않고** 새 디자인으로 재구성한다.

## 디자인 원칙 (사용자 지시 반영)
1. 배경 WebGL 영상 없음. 정적 다크 그라데이션 + 옅은 그리드.
2. 페이지는 100vh 섹션의 연속. 휠 한 번에 한 섹션 이동(데스크톱), 모바일은 scroll-snap proximity.
3. 모든 페이지 첫 섹션은 히어로. 배경은 어두운 네이비 그라데이션 + 느리게 움직이는 글로우 2개.
4. 톤 다운: 네온 시안/바이올렛 대신 네이비(#0a0f1c) · 슬레이트 텍스트 · 소프트 블루(#7ea6e4) 한 가지 강조색. 참고 사이트 YRP(yrp.co.kr)의 차분한 기업형 톤을 따르되 서체는 YRP(Inter/Playfair)와 다르게 **Pretendard 단일**.
5. 마지막 섹션은 Contact(원본 푸터 내용).
6. 히어로에 URC 원본 탭 이름(예: Advisors / Members / URC Network)을 섹션 바로가기 알약으로 배치, 오른쪽 점 네비게이션으로도 이동.

## 내용 매핑
- Home: "Urban Real-estate Club", "Chasing the Metropolitan Utopia" (원본 히어로 문구) + 페이지 디렉토리
- About us: Introduction(문단 3 + 아이콘 카드 3 + People/Professional) / Greetings(학회장 인사)
- Curriculum: Senior·Alumni·Study·Project Session(각 섹션, 다이어그램+사진) / External Activities(로고 6) / Networking
- Research: Market·Issue·REITs Report 각 4칸 (원본이 placeholder라 링크 있는 칸만 PDF 태그)
- Network: Advisors / Members(Founders~6th 기수 스트립) / URC Network
- Join us: 지원자격·지원일정 / 지원방법·지원문의 / FAQ(아코디언)

## 구조
- 정적 HTML, `tools/build.py` 가 `data/*.json` 에서 생성. GitHub Pages 상대 경로.
