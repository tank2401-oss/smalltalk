# 마음을 열어주는 스몰토크 — 학과별 JSON 버전

사용 중인 C:/smalltalk/smalltalk-github-pages 소스를 기준으로 데이터를 분리한 GitHub Pages용 소스입니다. 화면과 개인 학습기록의 저장 방식은 유지합니다.

## 교체 방법

1. 현재 폴더를 별도로 백업합니다.
2. 수정본 ZIP을 풀고 안의 파일을 기존 smalltalk-github-pages 폴더에 덮어씁니다. data 폴더만 바꾸지 말고 assets, index.html, preview.html, update-preview.mjs도 함께 교체하세요.
3. 예전 data/catalog.json은 더 이상 사용하지 않으므로, 폴더 밖에 백업한 뒤 제거해도 됩니다. 두 데이터 구조를 섞어 관리하지 마세요.
4. index.html을 Chrome/Edge에서 다시 열거나 기존 화면을 새로고침합니다.

## 데이터 구조

```text
data/
├── common.json       앱 공통 설정과 학과 목록
├── beauty.json       뷰티 표현 100개
├── electric.json     전기전자통신 표현 100개
├── it-sw.json        IT·SW 표현 100개
└── machine.json      기계 표현 100개
```

### common.json

| 구역 | 항목과 역할 |
|---|---|
| schemaVersion | 현재 파일 형식 번호 1. 유지하세요. |
| app | title(앱 제목), shortTitle(짧은 이름), tagline(부제), footer(하단 문구), storageKey(개인 기록 저장 키) |
| learning | timezone(날짜 기준, 기본 Asia/Seoul), defaultSpeechRate(처음 사용자의 발음 속도, 기본 0.85), quizOptionCount(보기 수, 기본 4) |
| navigation | 학습·퀴즈·학습기록·설정의 표시 이름과 순서 |
| departments | 학과 ID, 이름, 영문 이름, 설명, 아이콘, 색상, 표현 파일 이름, 표시 여부 |

메뉴의 label과 배열 순서는 바꿀 수 있지만 기능 ID(study, quiz, history, settings)는 유지하세요. 현재 기능은 하루에 새 표현 하나씩 학습하는 방식입니다. JSON은 설정과 콘텐츠를 담고, 기능의 실제 동작은 assets/app.js가 처리합니다.

app.storageKey는 기존과 같은 `smalltalk.v1`입니다. 바꾸면 기존 기록이 다른 저장 공간에 남아 앱에서 보이지 않으므로 유지하세요. 기존 사용자가 저장한 발음 속도는 기본값보다 우선합니다. quizOptionCount는 2~4를 지원하며, 각 학과에 그 수 이상의 서로 다른 뜻이 있어야 합니다.

### 학과 파일

예를 들어 it-sw.json의 구조는 다음과 같습니다.

```json
{
  "schemaVersion": 1,
  "departmentId": "it",
  "expressions": [
    {
      "id": "it-1",
      "departmentId": "it",
      "day": 1,
      "task": "check the code",
      "text": "Could you help me check the code?",
      "meaning": "코드를 확인하는 것을 도와주시겠어요?",
      "similar": [
        "Can you help me check the code?",
        "Could you give me a hand as I check the code?"
      ],
      "tip": "동료에게 정중하게 도움을 요청하는 표현이에요.",
      "reply": "Of course. Let’s take a look together.",
      "replyKo": "물론이죠. 같이 살펴봐요."
    }
  ]
}
```

위 코드는 필드 설명용 한 표현 예시입니다. 실제 파일에는 학과별 100개 표현이 들어 있습니다. 퀴즈에 필요한 최소 표현 수는 유지하세요.

- 각 선생님은 담당 학과 JSON의 expressions만 수정하면 됩니다.
- id는 기존 학습기록과 연결되므로 유지합니다. day는 학과 안에서 중복되지 않는 양의 정수로 지정합니다. 앱이 day 순으로 정렬합니다.
- 영어와 뜻, 사용 팁, 영어 답변과 답변 뜻은 필수입니다. 유사 표현(similar)은 2~3개입니다.
- task는 참고용 작업 설명이며 선택 항목입니다.
- JSON 문법, 중복 ID, 중복 학습 순서, 학과 ID 불일치 등을 검증하며 오류가 있으면 파일 또는 표현 ID를 표시합니다.

## 학과 추가·순서 변경

1. 새로운 학과 JSON 파일을 data에 만듭니다. 파일의 departmentId와 각 표현의 departmentId를 같은 새 ID로 지정합니다.
2. common.json의 departments에 학과 정보와 file(예: new-major.json)을 추가합니다. file은 data 폴더 안의 파일명만 적습니다.
3. 배열 순서가 선택 화면의 순서입니다. active:false는 새 학과 선택 목록에서 숨깁니다. 기존에 선택한 학과나 오늘의 잠금 기록은 복습을 위해 계속 접근할 수 있습니다.
4. 미리보기를 갱신하고 확인합니다.

학과 파일명은 영문 소문자·숫자·하이픈과 .json을 사용합니다. 학과 파일을 common.json에 등록하지 않으면 읽지 않습니다.

## PC 실행과 갱신

index.html과 preview.html을 더블클릭하면 파일 안에 포함된 데이터 사본을 사용합니다. **JSON 또는 코드를 수정한 뒤에는** 이 폴더에서 다음을 실행해 데이터 사본을 갱신하세요.

```text
node update-preview.mjs
```

Node.js가 필요합니다. 이 명령은 common.json과 등록된 학과 JSON을 읽어 검증한 다음 index.html과 preview.html을 갱신합니다. 데이터 오류가 있으면 갱신을 중단합니다.

수정하면서 확인하려면 다음을 실행하고 http://127.0.0.1:8080 을 엽니다.

```text
node serve.mjs
```

또는 Python이 있다면 `python -m http.server 8080 --bind 127.0.0.1`을 실행합니다. HTTP 실행 시에는 common.json과 학과별 파일을 직접 읽으므로 JSON 변경 후 화면을 새로고침하면 됩니다. preview.html은 HTTP로 열어도 항상 포함된 데이터 사본을 사용합니다.

## GitHub 배포

이 폴더의 내용을 저장소 최상위에 올립니다. Settings → Pages → Deploy from a branch → main, /(root)를 선택합니다. .nojekyll도 포함하세요. 모든 경로는 상대 경로이므로 프로젝트 사이트의 하위 경로에서도 동작합니다. JSON과 코드 수정 후 update-preview.mjs도 실행해서 PC용 사본과 배포 파일이 일치하도록 올리는 것을 권장합니다.

## 기타 소스와 저장

- assets/style.css: 색상·글자 크기·화면 배치
- assets/app.js: 화면, 학습, 퀴즈, 기록 동작
- assets/data.js: 분리된 데이터 로딩 및 검증. 브라우저와 갱신 스크립트가 함께 사용합니다.
- 학과 4개와 표현 400개의 기존 ID·내용을 그대로 유지했습니다.
- 학생별 진도는 현재 주소의 브라우저 localStorage에 저장합니다. 같은 주소에서 파일을 교체하면 같은 저장 키를 계속 사용합니다. file:// 직접 열기의 저장 방식은 브라우저에 따라 다릅니다.
- 주소·기기·브라우저가 바뀌면 기록이 자동 이전되지 않습니다. JSON 내보내기는 있고 가져오기 기능은 없습니다.
- 영어 발음은 브라우저 음성 합성을 사용하고 글꼴은 Google Fonts에서 읽습니다. 글꼴 연결이 안 되면 기본 글꼴을 사용합니다.
