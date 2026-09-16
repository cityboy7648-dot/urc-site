# URC 사이트

연세대학교 도시공학과 부동산학회 URC 홈페이지. 빌드 도구 없이 정적 HTML/CSS/JS로만 구성되어 GitHub Pages에 바로 올라갑니다.

## 구성

```
index.html            Network 페이지 (tools/build.py 가 생성)
data/network.json     페이지 내용 (멘토·기수별 멤버·연락처). 여기만 고치면 됩니다
tools/build.py        data → index.html 생성 스크립트
assets/css/style.css  스타일
assets/js/main.js     네비게이션·탭·스크롤 리빌·배경 셰이더
assets/img/           사진·로고
```

## 내용 수정하기

1. `data/network.json` 을 수정합니다. (멤버 추가 시 사진은 `assets/img/` 에 넣고 경로를 적습니다)
2. 아래 명령으로 `index.html` 을 다시 만듭니다. Python 3만 있으면 됩니다.

```bash
python3 tools/build.py
```

3. 커밋 후 푸시하면 끝입니다.

## 배포 (GitHub Pages)

GitHub 저장소 → **Settings → Pages** → Source 를 `Deploy from a branch`, Branch 를 `main` / `/ (root)` 로 설정하면
`https://<계정>.github.io/urc-site/` 에서 열립니다. 모든 경로가 상대 경로라 하위 경로 배포에도 문제 없습니다.

## 로컬에서 보기

```bash
python3 -m http.server 8000
# http://localhost:8000
```
