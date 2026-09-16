# URC Network 페이지 — 디자인 스펙

## 목표
urcyonsei.com/network 의 내용을 **한 글자도 더하거나 빼지 않고**, kaic-cau.com/curriculum 의 디자인 언어(다크 테마, 모노 아이브로우, 스크롤 리빌, 고정 배경 셰이더, 숨는 네비게이션)로 다시 구성한다. 다만 그대로 베끼지 않고 URC 브랜드에 맞게 변주한다.

## 내용 (URC 기준, 변경 금지)
- 헤더 네비: Home / About us / Curriculum / Research / Network(현재) / Join us → urcyonsei.com 절대 링크
- 상단 배너 이미지: 연세대학교 도시공학과 로고 (logo4.jpg)
- 제목: Network
- 탭 1 **Advisors**: Mentor(강승범 교수님, 3줄), Admin(도승우 선배님, 2줄)
- 탭 2 **Members**: 서브탭 Founders / 1st / 2nd / 3rd / 4th / 5th / 6th, 각 멤버 카드(사진, 이름/직책, 학과 학번, 경력 회사 목록)
- 탭 3 **URC Network**: 안내 문단 1개 + 신년회 사진
- 푸터: 학회명, 주소, Copyright, Contact Us(회장/부회장/부회장/E-Mail)

## 디자인 (KAIC 언어 + URC 변주)
| 항목 | KAIC | URC 변주 |
|---|---|---|
| 배경색 | #04060b | #05070d (약간 더 차가운 네이비) |
| 강조색 | 하늘색 #7fb4ff | URC 로고의 시안 #62d3f7 + 바이올렛 #8b6cf0 그라데이션 |
| 고정 배경 | WebGL 은하·우주선 셰이더 | WebGL 도시 야경 셰이더 (원근 그리드 + 빛 입자 + 시안/바이올렛 안개), 스크롤 진행에 따라 카메라 전진 |
| 폰트 | Pretendard + IBM Plex Mono + Space Grotesk | Pretendard + IBM Plex Mono |
| 리빌 | opacity/translateY(24px) .75s | 동일 계열, 카드 스태거 |
| 스텝 진행바 | 학기 3단계 | Members 기수 스트립(Founders→6th)에 진행바 채움 애니메이션, 클릭 시 기수 전환 |
| 네비 | 스크롤 다운 시 숨김 | 동일 + 탭바는 sticky |
| 카드 | 둥근 테두리 카드, hover 글로우 | 동일, 사진 카드 hover 시 살짝 떠오름 |

## 구조
- `index.html` (정적, 빌드 없음), `assets/css/style.css`, `assets/js/main.js`, `assets/img/*`
- 스크롤: Lenis(CDN) 부드러운 스크롤, reduced-motion 시 비활성
- 탭: 해시(#advisors/#members/#network)로 딥링크, 키보드 접근 가능
- 배포: GitHub Pages(상대 경로 사용)
