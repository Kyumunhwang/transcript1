# Lighthouse International School - SIS & Counseling System

등대국제학교(Lighthouse International School) 전 학년(G1~G12) 학생정보시스템(SIS), 공식 성적표(Transcript) AI 비전 파싱 데이터베이스 및 교사용 1:1 진로진학 상담 대시보드입니다.

---

## 🚀 빠른 시작 (Quick Start)

### 1. 레포지토리 클론 및 이동
```bash
git clone https://github.com/Kyumunhwang/transcript1.git
cd transcript1
```

### 2. 의존성 설치
#### Node.js (프론트엔드 / 웹 대시보드)
```bash
npm install
```

#### Python 가상환경 (AI 성적표 파싱 파이프라인)
```bash
# uv 사용 시 (권장)
uv venv .venv
uv pip install google-genai pymupdf pydantic sqlalchemy psycopg2-binary psycopg[binary] python-dotenv rich --python .venv\Scripts\python.exe

# 또는 일반 pip
python -m venv .venv
.venv\Scripts\activate
pip install google-genai pymupdf pydantic sqlalchemy psycopg2-binary psycopg[binary] python-dotenv rich
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 키를 입력합니다 (`.env.example` 참조):
```env
GEMINI_API_KEY=your_gemini_api_key_here
# DATABASE_URL=postgresql://user:pass@host:5432/lighthouse_db (선택 사항: 미입력 시 data/lighthouse_sis.db SQLite 자동 사용)
```

### 4. 개발 서버 실행
```bash
npm run dev:lighthouse-sis
```
브라우저에서 `http://localhost:3036` 접속.

---

## 📁 주요 화면 및 기능

1. **[첫 화면] 전 학년 누락 현황 대시보드 (`/`)**
   - 초등 1학년부터 고등 12학년까지 성적표 업로드율 및 미등록(Missing) 데이터 실시간 모니터링
2. **[학년별 명부] Grade 1 ~ 12 학생 선택 (`/grades/[grade]`)**
   - 학년별 학생 명부 및 GPA, 이수 학점 요약
3. **[교사용 뷰 종합 화면] 학생 올인원 상담 페이지 (`/students/[id]`)**
   - 학업 성적표 아코디언 및 과목별 학점
   - 학기 중간 개별 학생 Credit Make-up 성적 실시간 갱신
   - 공인시험(PSAT, SAT, TOEFL, AP) 및 교내외 수상 기록
   - 1:1 진로진학 상담 기록부 누적 타임라인
   - 가상 GPA 시뮬레이터 (+1.0/+0.5 가산점 계산)
   - A4 1페이지 인쇄 전용 공식 학부모 상담 종합 리포트 뷰
4. **[업로드 센터] 공식 Transcript 일괄 업로드 (`/upload`)**
   - 학년 선택 후 다중 PDF 드래그 앤 드롭 업로드 및 Gemini Vision AI 자동 파싱 적재

---

## 🛠️ 주요 스크립트

* `npm run dev:lighthouse-sis`: Next.js 개발 서버 실행 (고유 포트 3036)
* `npm run build:lighthouse-sis`: Next.js 프로덕션 빌드 (Vercel 배포 지원)
* `npm run ingest:transcripts`: `docs/` 폴더 내 성적표 일괄 파싱 및 DB 적재 CLI
