import kakaoBankThumbnail from '../assets/image/project/Frontend/kakaoBankThumnail.webp'
import woodinThumbnail from '../assets/image/project/Frontend/WoodinThumnail.webp'
import souvenirThumbnail from '../assets/image/project/Frontend/SouvenirThumnail.webp'
import damumThumbnail from '../assets/image/project/Frontend/DamumThumnail.webp'
import aevoraThumbnail from '../assets/image/project/Frontend/AevoraThumnail.webp'
import dashboardThumbnail from '../assets/image/project/Frontend/DashBoardThumnail.webp'
import guestBookThumbnail from '../assets/image/project/Frontend/GuestBookThumnail.webp'
import aiChatbotThumbnail from '../assets/image/project/Frontend/AIChatbot.webp'
import nodeThumbnail from '../assets/image/project/Frontend/NodeThumnail.webp'
import chemverseThumbnail from '../assets/image/project/Frontend/ChemverseThumnail.webp'
import lcodeThumbnail from '../assets/image/project/Frontend/LcodeThumnail.webp'
// 팀 프로젝트 와이어프레임 ([미리보기] 팝업에 보여준다)
import nodeWireframe from '../assets/image/project/Frontend/Nodewireframe.PNG'
import chemverseWireframe from '../assets/image/project/Frontend/Chemversewireframe.PNG'
import lcodeWireframe from '../assets/image/project/Frontend/Lcodewireframe.PNG'
// 팀 프로젝트 발표 자료 (세부정보 팝업에서 PDF로 보여준다, 팝업을 열 때만 받는다)
import nodePdf from '../assets/image/project/NODE/NODE.pdf'
import chemversePdf from '../assets/image/project/CHEMVERSE/CHAMBERS.pdf'
import lcodePdf from '../assets/image/project/LCODE/LcodePPT.pdf'

/*
 * pdf  세부정보 팝업에 보여줄 PDF (import한 주소). 있으면 images · 상세페이지 대신 PDF 뷰어로 연다.
 * toolCols  도구 아이콘을 한 줄에 놓을 개수 (생략하면 4개 이하 한 줄, 5개 이상 두 줄)
 * account  카드 정보(역할 아래)에 보여줄 체험 계정 { label, email, password } — 이메일 · 비밀번호마다 복사 버튼
 * pdfPreview  [미리보기] 버튼 → 팝업에 이미지 한 장 (import한 이미지, 아직 없으면 true → 썸네일을 대신 보여준다)
 */

export const frontendProjects = [
  {
    id: '01',
    slug: 'kakaobank',
    detail: false, // 세부정보 버튼 없음
    category: 'copy-site',
    title: 'KAKAOBANK',
    type: 'Copy Site',
    year: 2024,
    period: { start: '2024.07', end: '2024.07', duration: '2주' },
    contribution: 100,
    description: '카카오뱅크 main 페이지 카피 사이트 입니다 주로 이미지 슬라이드를 기능을 공부하였습니다',
    thumbnail: kakaoBankThumbnail,
    tools: ['VS Code', 'GitHub'],
    link: 'https://kimhyeonso.github.io/kakao-bank_popol/',
    github: '',
    images: [],
  },
  {
    id: '02',
    slug: 'woodin',
    detail: false, // 세부정보 버튼 없음
    category: 'copy-site',
    title: 'WOODIN',
    type: 'Copy Site',
    year: 2026,
    period: { start: '2026.06', end: '2026.06', duration: '2주' },
    contribution: 80,
    description: '우딘 카피 사이트 입니다 AI , 기존 코드 도움 없이 하나부터 열까지 직접 코드를 작성하여 카피한 사이트 입니다',
    thumbnail: woodinThumbnail,
    tools: ['VS Code', 'GitHub'],
    link: 'https://kimhyeonso.github.io/WOODIN_COPYSITE/',
    github: '',
    images: [],
  },
  {
    id: '03',
    slug: 'souvenir',
    detail: false, // 세부정보 버튼 없음
    category: 'personal',
    title: 'SOUVENIR',
    type: 'Web Vibe Coding',
    year: 2026,
    period: { start: '2026.06', end: '2026.06', duration: '2일' },
    contribution: 100,
    description: 'Readme.md 파일을 이용한 바이브 코딩 웹 사이트 입니다 수베니아는 기념일에 특별한 선물을 하다 라는 의미의 악세사리 브랜드입니다',
    thumbnail: souvenirThumbnail,
    tools: ['VS Code', 'GitHub', 'Codex'],
    link: 'https://kimhyeonso.github.io/Souvenir/',
    github: '',
    images: [],
  },
  {
    id: '04',
    slug: 'damum',
    detail: false, // 세부정보 버튼 없음
    category: 'personal',
    title: 'DAMUM',
    type: 'Web Shopping Mall',
    year: 2026,
    period: { start: '2026.07', end: '2026.07', duration: '2주' },
    contribution: 100,
    description: '담음은 도자기 그릇에 마음을 담다라는 의미로 도자기 쇼핑몰 사이트 입니다 firebase의 Authentication을 이용하였습니다',
    thumbnail: damumThumbnail,
    tools: ['VS Code', 'GitHub', 'Vercel', 'React', 'Firebase', 'Codex'],
    link: 'https://damum-mqk1.vercel.app/',
    account: { label: '관리자 로그인', email: 'sales@a.com', password: '123456789' },
    github: '',
    images: [],
  },
  {
    id: '05',
    slug: 'aevora',
    detail: false, // 세부정보 버튼 없음
    category: 'personal',
    title: 'AEVORA',
    type: 'Web Brand Coding',
    year: 2026,
    period: { start: '2026.09', end: '2026.09', duration: '1개월' },
    contribution: 100,
    description: '자연에서 시작된 향의 이야기를 스크롤에 반응하는 시네마틱 애니메이션으로 제작하였습니다 숲, 비, 꽃에 담긴 자연의 기억을 탐험하고, 향이 탄생하는 순간을 시각적으로 경험할 수 있는 사이트 입니다',
    thumbnail: aevoraThumbnail,
    tools: ['Figma', 'Photoshop', 'VS Code', 'GitHub', 'Vercel', 'React', 'Codex'],
    link: 'https://aevora-green.vercel.app/',
    github: '',
    images: [],
  },
  {
    id: '06',
    slug: 'dashboard',
    detail: false, // 세부정보 버튼 없음
    category: 'personal',
    title: 'DASHBOARD',
    type: 'Admin page Coding',
    year: 2026,
    period: { start: '2026.09', end: '2026.09', duration: '2주' },
    contribution: 100,
    description: '관리자 페이지에 대한 대시 보드를 제작하였습니다',
    thumbnail: dashboardThumbnail,
    tools: ['VS Code', 'GitHub', 'Vercel', 'React'],
    link: 'https://dash-board-um12.vercel.app/',
    github: '',
    images: [],
  },
  {
    id: '07',
    slug: 'guest-book',
    detail: false, // 세부정보 버튼 없음
    category: 'personal',
    title: 'GUEST BOOK',
    type: 'Admin page Coding',
    year: 2026,
    period: { start: '2026.09', end: '2026.09', duration: '2주' },
    contribution: 100,
    description: 'firebase를 이용한 게스트 방명록을 남길 수 있는 사이트 입니다 최애 캐릭터 짱구를 주제로 사이트를 제작하였습니다',
    thumbnail: guestBookThumbnail,
    tools: ['VS Code', 'GitHub', 'Vercel', 'React', 'Firebase', 'Codex'],
    link: 'https://guestbook-phi-ochre.vercel.app/',
    github: '',
    images: [],
  },
    {
    id: '08',
    slug: 'ai-chatbot',
    detail: false,
    category: 'personal',
    title: 'AI CHATBOT',
    type: 'AI Chatbot',
    year: 2026,
    period: { start: '2025.09', end: '2025.10', duration: '1개월' },
    description: 'OpenAI API를 연동해 질문에 대한 답변과 API 날씨 정보를 제공하고, RAG 기반 챗봇을 구현해 맞춤형 답변을 제공했습니다.',
    contribution: 100,
    thumbnail: aiChatbotThumbnail,
    tools: ['VS Code', 'GitHub', 'Vercel'],
    link: 'https://chatbot-sage-six-15.vercel.app/',
    github: '',
    images: [],
  },
  {
    id: '09',
    slug: 'node',
    category: 'team',
    work: 'team', // 썸네일 왼쪽 위 TEAM PROJECT 뱃지
    title: 'NODE',
    type: 'Team Project',
    year: 2026,
    period: { start: '2025.07', end: '2025.07', duration: '3주' },
    contribution: [
      { role: '기획', value: 50 },
      { role: '디자인', value: 100 },
      { role: '개발', value: 40 },
    ],
    role: '팀장',
    description: '스피커 쇼핑몰 사이트 입니다 전체적으로 클래식 공연장에 들어온 컨셉으로 제작하였습니다',
    thumbnail: nodeThumbnail,
    tools: ['Figma', 'VS Code', 'GitHub'],
    link: 'https://kimhyeonso.github.io/NODE/',
    github: '',
    pdf: nodePdf,
    pdfPreview: nodeWireframe, // [미리보기] 팝업에 보일 와이어프레임
    images: [],
  },
  {
    id: '10',
    slug: 'chemverse',
    category: 'team',
    work: 'team',
    title: 'CHEMVERSE',
    type: 'Team Project',
    year: 2026,
    period: { start: '2025.05', end: '2025.05', duration: '2주' },
    contribution: [
      { role: '기획', value: 40 },
      { role: '디자인', value: 50 },
      { role: '개발', value: 40 },
    ],
    role: '팀장',
    description: '어렸을 적 자주보던 만화채널 챔프 + 투니버스를 합쳐 챔버스라는 아동용 만화 OTT 사이트를 제작하였습니다',
    thumbnail: chemverseThumbnail,
    tools: ['Figma', 'VS Code', 'GitHub'],
    link: 'https://kimhyeonso.github.io/CHAMVERSE/html/intro.html',
    github: '',
    pdf: chemversePdf,
    pdfPreview: chemverseWireframe, // [미리보기] 팝업에 보일 와이어프레임
    images: [],
  },
  {
    id: '11',
    slug: 'lcode',
    category: 'team',
    work: 'team',
    title: 'LCODE',
    type: 'Team Project',
    year: 2026,
    period: { start: '2025.08', end: '2025.09', duration: '1개월' },
    contribution: [
      { role: '기획', value: 80 },
      { role: '디자인', value: 80 },
      { role: '개발', value: 25 },
    ],
    role: '팀장',
    description: "계획은 틀어져도 여행은 계속된다 라는 주제로 '돌발상황'에 대비하는 여행 플랜 어플리케이션을 제작하였습니다",
    thumbnail: lcodeThumbnail,
    tools: ['Photoshop', 'Figma', 'VS Code', 'GitHub', 'Vercel', 'React', 'Firebase', 'OpenAI', 'Codex', 'Claude', 'ChatGPT'],
    toolCols: 4, // 도구 아이콘을 한 줄에 4개씩 (4 · 4 · 3)
    link: 'https://lcode-2.vercel.app/',
    account: { label: '관리자 로그인', email: 'admin@admin.com', password: '12345678' },
    github: '',
    pdf: lcodePdf,
    pdfPreview: lcodeWireframe, // [미리보기] 팝업에 보일 와이어프레임
    images: [],
  },

]
