import styles from './WildfixDetail.module.scss'

// WILDFIX 폴더의 이미지를 파일 이름으로 꺼내 쓴다 (예: img['logo01'])
const files = import.meta.glob('../../assets/image/project/WILDFIX/*.png', { eager: true, import: 'default' })
const img = Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop().replace('.png', ''), url]))

/*
 * 좌표는 모두 Figma 시안(너비 1920px) 기준 px 값이다.
 * 화면에서는 SCSS의 --u(= 컨테이너 너비 / 1920)를 곱해 팝업 너비에 맞게 같은 비율로 줄어든다.
 *   x, y  왼쪽 위 위치 (글자는 y가 글줄의 세로 가운데)
 *   w, h  너비, 높이
 */
const pos = (style) => Object.fromEntries(Object.entries(style).map(([key, value]) => [`--${key}`, value]))

// 이미지 한 장
function Pic({ name, x, y, w, className = '', alt = '' }) {
    return <img className={`wf-pic ${className}`} src={img[name]} alt={alt} loading="lazy" draggable="false" style={pos({ x, y, w })} />
}

// 글자 한 줄. align: left(x가 왼쪽) | center(x가 가운데) | right(x가 오른쪽 끝)
function Text({ x, y, size = 24, align = 'left', className = '', children }) {
    return <p className={`wf-text is-${align} ${className}`} style={pos({ x, y, size })}>{children}</p>
}

// 섹션 제목 (OVERVIEW, FLOWCHAT …). x를 주면 그 위치에서 왼쪽 정렬 (LOGO, FONT)
function Heading({ x, y, className = '', children }) {
    return <h3 className={`wf-heading ${x === undefined ? 'is-center' : ''} ${className}`} style={pos({ x: x ?? 960, y })}>{children}</h3>
}

// 왼쪽 정렬 큰 제목 (상품 페이지, 결제 페이지 …)
function Title({ y, children }) {
    return <h3 className="wf-title" style={pos({ x: 180, y })}>{children}</h3>
}

// 네모 상자 (배경색 · 테두리 · 모눈 등은 className으로)
function Box({ x, y, w, h, className = '', children }) {
    return <div className={`wf-box ${className}`} style={pos({ x, y, w, h })}>{children}</div>
}

// 로고 뒤 모눈 (cw, ch: 칸 너비 · 높이)
function Grid({ x, y, w, h, cw, ch }) {
    return <div className="wf-box wf-grid" style={pos({ x, y, w, h, cw, ch })} />
}

// FLOWCHAT의 둥근 노드와 주황 연결선
const node = (label, x, y) => ({ label, x, y })
const flowNodes = [
    node('WildFix', 833, 6204), node('Main Page', 832, 6327), node('회원 로그인', 1358, 6327),
    node('Top', 180, 6463), node('Bottom', 506, 6463), node('Outer', 832, 6463), node('회원가입', 1211, 6463), node('아이디 찾기', 1486, 6463),
    node('Knit', 180, 6588), node('Denimopaint', 506, 6588), node('Jacket', 832, 6588), node('회원가입 완료', 1211, 6588), node('PW 찾기', 1486, 6588),
    node('T-shirts', 180, 6688), node('Trousers', 506, 6688), node('Coat', 832, 6688),
    node('shirts', 180, 6788), node('Short pants', 506, 6788), node('Padding', 832, 6788),
    node('제품 구매', 506, 6917), node('배송지 정보', 506, 7017), node('제품구매 완료', 506, 7117),
]
// [x, y, 길이, 방향] 방향: 'v' 세로 | 'h' 가로
const flowLines = [
    [959, 6267, 60, 'v'], [1086, 6359, 272, 'h'], [959, 6391, 30, 'v'], [306, 6420, 653, 'h'],
    [306, 6420, 465, 'v'], [632, 6420, 730, 'v'], [959, 6420, 400, 'v'], [306, 6884, 326, 'h'],
    [1485, 6391, 30, 'v'], [1337, 6420, 286, 'h'], [1337, 6420, 170, 'v'], [1623, 6420, 170, 'v'],
]

// 로그인 화면 옆 확대 설명 상자와, 화면에서 상자로 이어지는 회색 쐐기
function Callout({ points, children, ...box }) {
    return (
        <>
            <svg className="wf-svg" viewBox="0 0 1920 18810" preserveAspectRatio="none" aria-hidden="true">
                <polygon points={points} fill="#9a9a9a" opacity=".75" />
            </svg>
            <Box {...box} className="wf-callout">{children}</Box>
        </>
    )
}

/**
 * WILDFIX 세부정보 팝업 내용 (Figma 상세페이지를 코드로 옮긴 것).
 * 위에서부터 히어로 → OVERVIEW · BRAND KEYWORD → WEB CONCEPT · TARGET → LOGO → 컬러/폰트 → 목업 → FLOWCHAT
 * → DESIGN(메인/로그인) → 상품 페이지 → TOP/BOTTOM/OUTER → 상품 상세 페이지 → 결제 페이지
 */
export default function WildfixDetail() {
    return (
        <div className={`${styles.scope} wf`}>
            <div className="wf-canvas">
                {/* OVERVIEW · BRAND KEYWORD 검은 배경 — 히어로 아래 가장자리(반투명)까지 깔아 틈이 비치지 않게 */}
                <Box x={0} y={1200} w={1920} h={1161} className="wf-black" />

                {/* 히어로 (WILDFIX 제목은 이미지에 포함) */}
                <Pic name="top" x={0} y={0} w={1920} alt="WILDFIX" />

                {/* 키워드 카드 글자는 이미지에 포함 */}
                <Heading y={1336} className="is-muted">OVERVIEW</Heading>
                <Text x={960} y={1422} size={27.7} align="center" className="is-white">WildFix의 브랜드 아이덴티티를 효과적으로 전달하기 위해</Text>
                <Text x={960} y={1460} size={27.7} align="center" className="is-white">레트로 감성과 모던한 UI를 조화롭게 구성한 웹사이트입니다.</Text>
                <Text x={960} y={1498} size={27.7} align="center" className="is-white">직관적인 사용성과 차별화된 비주얼을 통해 브랜드의 개성을 표현했습니다.</Text>
                <Heading y={1641} className="is-muted">BRAND KEYWORD</Heading>
                <Pic name="keyword01" x={46} y={1734} w={597} alt="Retro Mood → Modern Balance" />
                <Pic name="keyword02" x={661} y={1734} w={597} alt="Intuitive UI → Simple Interaction" />
                <Pic name="keyword03" x={1276} y={1734} w={597} alt="Brand Point → Distinct Identity" />

                {/* WEB CONCEPT · TARGET */}
                <Box x={0} y={2361} w={1920} h={490} className="wf-fill" />
                <Text x={609} y={2570} size={46} align="center" className="wf-strong is-white">WEB CONCEPT</Text>
                <Text x={609} y={2674} size={29.8} align="center" className="is-white">자유로운 정신을 조화롭게 정비하다</Text>
                <Box x={959} y={2558} w={2} h={108} className="wf-divider" />
                <Text x={1309} y={2570} size={46} align="center" className="wf-strong is-white">TARGET</Text>
                <Text x={1309} y={2674} size={29.8} align="center" className="is-white">20~30대 남성 고객</Text>

                {/* LOGO: 왼쪽 설명, 오른쪽·아래 모눈 위 로고 */}
                <Grid x={910} y={2851} w={1010} h={657} cw={32.5} ch={50.5} />
                <Grid x={0} y={3507} w={1920} h={434} cw={29.6} ch={32.8} />
                <Heading x={106} y={3018}>LOGO</Heading>
                <Text x={106} y={3110} size={31.7}>전체적으로 자유로운 느낌의 폰트 넣어 “정비하다”</Text>
                <Text x={106} y={3155} size={31.7}>라는 뜻의 정비 일러스트를 사용하여 폰트와 조화롭게</Text>
                <Text x={106} y={3200} size={31.7}>사용하였다. 메인 색상을 기준으로 보색 배경을 사용하여</Text>
                <Text x={106} y={3245} size={31.7}>빈티지한 느낌을 살려주었다.</Text>
                <Pic name="logo03" x={1044} y={3022} w={327} alt="Wildfix 로고 글자" />
                <Box x={1475} y={3059} w={42} h={1.5} className="wf-fill" />
                <Box x={1496} y={3038} w={1.5} h={42} className="wf-fill" />
                <Pic name="logo04" x={1651} y={3015} w={101} alt="정비 도구 일러스트" />
                <Pic name="logo05" x={1052} y={3255} w={695} alt="Wildfix 로고" />
                <Pic name="logo01" x={138} y={3621} w={614} alt="Wildfix 로고 (주황 배경)" />
                <Pic name="logo02" x={1109} y={3621} w={614} alt="Wildfix 로고 (남색 배경)" />
                <Text x={46} y={3969} size={17}>*웹 전체적으로 사용한 컬러는 빈티지 느낌을 살리기 위해 초록계열 위주의 컬러 사용하였다</Text>

                {/* COLOR · FONT */}
                <Pic name="color01" x={185} y={4114} w={393} alt="#25414C" />
                <Pic name="color02" x={185} y={4314} w={393} alt="#0C3248" />
                <Pic name="color03" x={185} y={4514} w={393} alt="#ED711A" />
                <Heading x={1055} y={4114}>FONT</Heading>
                <Text x={1055} y={4209} size={30} className="wf-font is-300">Yaldevi Colombo light</Text>
                <Text x={1055} y={4284} size={30} className="wf-font is-400">Yaldevi Colombo regular</Text>
                <Text x={1055} y={4359} size={30} className="wf-font is-500">Yaldevi Colombo medium</Text>
                <Text x={1055} y={4434} size={30} className="wf-font is-600">Yaldevi Colombo semibold</Text>

                {/* 목업 (티셔츠는 오른쪽 끝에서 잘린다) */}
                <Pic name="mokup01" x={93} y={4903} w={675} alt="쇼핑백 목업" />
                <Pic name="mokup02" x={797} y={4764} w={467} alt="택 목업" />
                <Pic name="mokup03" x={795} y={5120} w={1209} alt="티셔츠 목업" />

                {/* FLOWCHAT */}
                <Pic name="flowchatBackground" x={6} y={6001} w={1908} />
                <Heading y={6064}>FLOWCHAT</Heading>
                {flowLines.map(([x, y, length, dir]) => (
                    <Box key={`${x}-${y}-${dir}`} x={x} y={y} w={dir === 'h' ? length : 1.5} h={dir === 'v' ? length : 1.5} className="wf-line" />
                ))}
                {flowNodes.map(({ label, x, y }) => <Box key={label} x={x} y={y} w={254} h={64} className="wf-node">{label}</Box>)}

                {/* DESIGN · 메인 페이지 */}
                <Heading y={7466}>DESIGN</Heading>
                <Text x={1109} y={7699}>검색, 장바구니, 마이페이지를 아이콘으로 구성하였다</Text>
                <Pic name="icon01" x={1109} y={7752} w={60} alt="검색 아이콘" />
                <Pic name="icon02" x={1189} y={7752} w={60} alt="찜 아이콘" />
                <Pic name="icon03" x={1269} y={7752} w={60} alt="마이페이지 아이콘" />
                <Pic name="mainPage" x={518} y={7864} w={835} alt="메인 페이지 화면" />
                <Pic name="box" x={514} y={7860} w={835} />
                <Pic name="banner01" x={0} y={7932} w={514} alt="메인 배너 1" />
                <Pic name="banner02" x={1349} y={7932} w={571} alt="메인 배너 2" />
                <Text x={1389} y={8239}>slide를 이용해 메인 배너 를 보여준다</Text>
                <Text x={372} y={8475} align="right">Best 상품 ,New상품을</Text>
                <Text x={372} y={8514} align="right">나열하여 보여준다</Text>
                <svg className="wf-svg" viewBox="0 0 1920 18810" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points="630,8365 403,8500 632,8626" fill="none" stroke="#111" strokeWidth="1.5" />
                    <polygon points="636,8629 618,8626 626,8615" fill="#111" />
                </svg>
                <Pic name="box" x={514} y={9229} w={835} />
                <Pic name="productCard03" x={534} y={9343} w={1386} alt="베스트 상품 목록" />

                {/* 검색 · 마이페이지 · 로그인 */}
                <Text x={315} y={10257}>원하는 상품을 검색할 수 있다</Text>
                <Pic name="search" x={230} y={10328} w={434} alt="검색 화면" />
                <Pic name="icon03" x={827} y={10227} w={60} />
                <Text x={912} y={10257}>마이페이에서 포인트 내역과 여러가지 설정들을 볼 수 있다</Text>

                <Pic name="login01" x={827} y={10327} w={434} alt="로그인 전 화면" />
                <Callout points="1252,10352 1377,10375 1377,10437 1252,10374" x={1377} y={10375} w={149} h={62}>
                    <span className="is-head">로그인</span>
                    <span>회원가입</span>
                </Callout>
                <Text x={1386} y={10495} size={34} className="is-dark">로그인 전</Text>
                <Text x={1386} y={10550}>로그인, 회원가입을 할 수 있다</Text>

                <Pic name="login02" x={827} y={10664} w={434} alt="로그인 후 화면" />
                <Callout points="1255,10690 1377,10645 1377,10827 1255,10756" x={1377} y={10645} w={149} h={182}>
                    <span className="is-head"><b>김현수</b> 님 환영합니다.</span>
                    <span>장바구니</span>
                    <span>찜</span>
                    <span>결제내역</span>
                    <span>계정 설정</span>
                    <span className="is-red">로그아웃</span>
                </Callout>
                <Text x={1386} y={10890} size={34} className="is-dark">로그인 후</Text>
                <Text x={1386} y={10943}>장바구니, 결제 내역등이 있다</Text>

                <Pic name="login03" x={827} y={11000} w={433} alt="알림 창 화면" />
                <Callout points="1142,11005 1347,11012 1347,11135 1142,11080" x={1347} y={11012} w={311} h={123}>
                    <span className="is-bar">Wildfix</span>
                    <span className="is-alert"><b>김현수</b>님 회원가입을 환영합니다<br /><b>10,000 Point</b>가 적립되었습니다</span>
                    <span className="is-button">닫기</span>
                </Callout>
                <Text x={1386} y={11227} size={34} className="is-dark">alert 창</Text>
                <Text x={1386} y={11279}>적립, 오류, 확인 페이지 등이 있다</Text>

                {/* 상품 페이지 */}
                <Title y={11540}>상품 페이지</Title>
                <Pic name="productPage" x={176} y={11610} w={570} alt="상품 목록 페이지" />
                <Pic name="order01" x={837} y={11616} w={961} alt="분류 메뉴" />
                <Text x={840} y={11745}>마이페이에서 포인트 내역과 여러가지 설정들을 볼 수 있다</Text>
                <Pic name="order02" x={840} y={11798} w={267} alt="정렬 기준 메뉴" />
                <Text x={840} y={12092}>마이페이에서 포인트 내역과 여러가지 설정들을 볼 수 있다</Text>
                <Pic name="productCard02" x={834} y={12170} w={261} alt="상품 카드" />
                <Pic name="productCard01" x={1118} y={12170} w={261} alt="베스트 상품 카드" />
                <Pic name="icon04" x={839} y={12550} w={35} />
                <Pic name="Vector" x={883} y={12566} w={51} />
                <Pic name="icon05" x={942} y={12550} w={35} />
                <Pic name="Vector" x={987} y={12566} w={51} />
                <Pic name="icon02" x={1045} y={12550} w={35} />
                <Text x={964} y={12617} align="center">하트를 눌러 원하는 상품을</Text>
                <Text x={964} y={12649} align="center">저장 할 수 있다</Text>
                <Pic name="icon06" x={1222} y={12555} w={53} alt="BEST 표시" />
                <Text x={1248} y={12617} align="center">가장 잘 팔리는 물품을 베스</Text>
                <Text x={1248} y={12649} align="center">트로 선정하였다</Text>

                {/* TOP · BOTTOM · OUTER */}
                <Text x={433} y={13171} size={32} align="center" className="is-dark">TOP</Text>
                <Text x={958} y={13171} size={32} align="center" className="is-dark">BOTTOM</Text>
                <Text x={1488} y={13171} size={32} align="center" className="is-dark">OUTER</Text>
                <Pic name="TopPage" x={179} y={13251} w={504} alt="TOP 페이지" />
                <Pic name="BottomPage" x={707} y={13251} w={504} alt="BOTTOM 페이지" />
                <Pic name="OuterPage" x={1235} y={13251} w={504} alt="OUTER 페이지" />

                {/* 상품 상세 페이지 */}
                <Title y={14647}>상품 상세 페이지</Title>
                <Pic name="image 92" x={180} y={14735} w={709} alt="상품 상세 페이지" />
                <Pic name="box" x={180} y={14803} w={727} />
                <Pic name="image 93" x={1032} y={14821} w={688} alt="장바구니 페이지" />
                <Pic name="box" x={1013} y={14803} w={727} />
                <Box x={202} y={15376} w={666} h={1355} className="wf-frame" />
                <Text x={425} y={15578} className="is-white">1. 상품 설명(Description)</Text>
                <Text x={1018} y={15451} className="is-dark">2. 상품 상세보기 (Additional Information)</Text>
                <Pic name="AdditionalInformation" x={1016} y={15497} w={723} alt="사이즈 표" />
                <Box x={1014} y={15495} w={726} h={233} className="wf-frame" />
                <Text x={1018} y={15915} className="is-dark">3. 상품 리뷰(Review)</Text>
                <Pic name="review" x={1016} y={15960} w={723} alt="상품 리뷰" />
                <Box x={1014} y={15958} w={726} h={215} className="wf-frame" />

                {/* 결제 페이지 */}
                <Title y={17418}>결제 페이지</Title>
                <Pic name="payMenu" x={180} y={17542} w={1560} alt="결제 단계: Address · Payment Method · Delivery" />
                <Pic name="payPage01" x={182} y={17820} w={330} className="is-blur" alt="주문하기 페이지" />
                <Pic name="vector02" x={603} y={18095} w={82} />
                <Pic name="payPage02" x={796} y={17820} w={330} alt="결제하기 페이지" />
                <Pic name="vector02" x={1217} y={18095} w={82} />
                <Pic name="payPage03" x={1410} y={17820} w={330} alt="배송 정보 페이지" />
            </div>
        </div>
    )
}
