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

// 가운데 정렬 섹션 제목 (OVERVIEW, LOGO …)
function Heading({ y, children }) {
    return <h3 className="wf-heading" style={pos({ x: 960, y })}>{children}</h3>
}

// 왼쪽 정렬 큰 제목 (상품 페이지, 결제 페이지 …)
function Title({ y, children }) {
    return <h3 className="wf-title" style={pos({ x: 180, y })}>{children}</h3>
}

// 네모 상자 (배경색 · 테두리 · 모눈 등은 className으로)
function Box({ x, y, w, h, className = '', children }) {
    return <div className={`wf-box ${className}`} style={pos({ x, y, w, h })}>{children}</div>
}

// FLOWCHAT의 둥근 노드와 주황 연결선
const node = (label, x, y) => ({ label, x, y })
const flowNodes = [
    node('WildFix', 833, 5997), node('Main Page', 832, 6120), node('회원 로그인', 1358, 6120),
    node('Top', 180, 6256), node('Bottom', 506, 6256), node('Outer', 832, 6256), node('회원가입', 1211, 6256), node('아이디 찾기', 1486, 6256),
    node('Knit', 180, 6381), node('Denimopaint', 506, 6381), node('Jacket', 832, 6381), node('회원가입 완료', 1211, 6381), node('PW 찾기', 1486, 6381),
    node('T-shirts', 180, 6481), node('Trousers', 506, 6481), node('Coat', 832, 6481),
    node('shirts', 180, 6581), node('Short pants', 506, 6581), node('Padding', 832, 6581),
    node('제품 구매', 506, 6710), node('배송지 정보', 506, 6810), node('제품구매 완료', 506, 6910),
]
// [x, y, 길이, 방향] 방향: 'v' 세로 | 'h' 가로
const flowLines = [
    [959, 6060, 60, 'v'], [1086, 6152, 272, 'h'], [959, 6184, 30, 'v'], [306, 6213, 653, 'h'],
    [306, 6213, 465, 'v'], [632, 6213, 730, 'v'], [959, 6213, 400, 'v'], [306, 6677, 326, 'h'],
    [1485, 6184, 30, 'v'], [1337, 6213, 286, 'h'], [1337, 6213, 170, 'v'], [1623, 6213, 170, 'v'],
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
 * 위에서부터 OVERVIEW → WEB CONCEPT → LOGO → 컬러/폰트 → MOKUP → FLOWCHAT → DESIGN(메인/로그인)
 * → 상품 페이지 → TOP/BOTTOM/OUTER → 상품 상세 페이지 → 결제 페이지
 */
export default function WildfixDetail() {
    return (
        <div className={`${styles.scope} wf`}>
            <div className="wf-canvas">
                {/* OVERVIEW */}
                <Heading y={221}>OVERVIEW</Heading>
                <Box x={774} y={377} w={371} h={106} className="wf-design-box">DESIGN</Box>
                <Box x={960} y={555} w={1.5} h={82} className="wf-fill" />
                <Text x={960} y={723} size={22} align="center">자유롭고 깔끔한 디자인</Text>
                <Text x={960} y={824} size={22} align="center">간단하고 한눈에 알아 볼 수 있는 UI</Text>
                <Text x={960} y={925} size={22} align="center">스타일의 빈티지스러움과 모던함이 잘 조화된된 “모던 빈틴지”</Text>
                <Box x={180} y={1192} w={283} h={136} className="wf-pill is-filled">차별화</Box>
                <Box x={543} y={1192} w={330} h={136} className="wf-pill">레트로한 감성</Box>
                <Box x={955} y={1192} w={384} h={136} className="wf-pill">Wildfix만의 가치관</Box>
                <Box x={1419} y={1192} w={318} h={136} className="wf-pill">POINT 구매</Box>
                <Text x={572} y={1162} size={96} className="wf-number">1</Text>
                <Text x={993} y={1162} size={96} className="wf-number">2</Text>
                <Text x={1462} y={1162} size={96} className="wf-number">3</Text>

                {/* WEB CONCEPT */}
                <Box x={0} y={1521} w={1920} h={490} className="wf-fill" />
                <Text x={671} y={1729} size={28} align="center" className="wf-strong is-white">WEB CONCEPT</Text>
                <Text x={671} y={1827} size={22} align="center" className="is-white">자유로운 정신을 조화롭게 정비하다</Text>
                <Text x={1247} y={1729} size={28} align="center" className="wf-strong is-white">WEB CONCEPT</Text>
                <Text x={1247} y={1827} size={22} align="center" className="is-white">20~30대 남성 고객</Text>

                {/* LOGO */}
                <Heading y={2349}>LOGO</Heading>
                <Box x={180} y={2620} w={720} h={110} className="wf-paragraph">
                    전체적으로 자유로운 느낌의 폰트 넣어 “정비하다”라는 뜻의 정비 일러스트를 사용하여 폰트와 조화롭게 사용하였다. 메인 색상을 기준으로 보색 배경을 사용하여 빈티지한 느낌을 살려주었다.
                </Box>
                <Pic name="logo03" x={180} y={2787} w={327} alt="Wildfix 로고 글자" />
                <Box x={612} y={2845} w={42} h={1.5} className="wf-fill" />
                <Box x={632} y={2824} w={1.5} h={42} className="wf-fill" />
                <Pic name="logo04" x={787} y={2781} w={101} alt="정비 도구 일러스트" />
                <Box x={1083} y={2606} w={658} h={284} className="wf-grid" />
                <Pic name="logo05" x={1241} y={2711} w={320} alt="Wildfix 로고" />
                <Box x={180} y={2983} w={1561} h={320} className="wf-grid" />
                <Pic name="logo01" x={289} y={3059} w={501} alt="Wildfix 로고 (주황 배경)" />
                <Pic name="logo02" x={1082} y={3059} w={501} alt="Wildfix 로고 (남색 배경)" />

                {/* COLOR · FONT */}
                <Pic name="color01" x={181} y={3640} w={243} alt="#25414C" />
                <Pic name="color02" x={486} y={3640} w={243} alt="#0C3248" />
                <Pic name="color03" x={791} y={3640} w={243} alt="#ED711A" />
                <Text x={181} y={3911} size={16}>*웹 전체적으로 사용한 컬러는 빈티지 느낌을 살리기 위해 초록계열 위주의 컬러 사용하였다</Text>
                <Text x={1282} y={3469} size={28} className="wf-strong is-dark">FONT</Text>
                <Text x={1282} y={3564} size={32} className="wf-font is-300">Yaldevi Colombo light</Text>
                <Text x={1282} y={3639} size={32} className="wf-font is-400">Yaldevi Colombo regular</Text>
                <Text x={1282} y={3714} size={32} className="wf-font is-500">Yaldevi Colombo medium</Text>
                <Text x={1282} y={3789} size={32} className="wf-font is-600">Yaldevi Colombo semibold</Text>

                {/* MOKUP */}
                <Heading y={4176}>MOKUP</Heading>
                <Pic name="mokup01" x={307} y={4505} w={399} alt="쇼핑백 목업" />
                <Pic name="mokup02" x={1000} y={4440} w={514} alt="택 목업" />
                <Pic name="mokup03" x={794} y={4851} w={946} alt="티셔츠 목업" />

                {/* FLOWCHAT */}
                <Heading y={5751}>FLOWCHAT</Heading>
                <Pic name="flowchatBackground" x={6} y={5794} w={1908} />
                {flowLines.map(([x, y, length, dir]) => (
                    <Box key={`${x}-${y}-${dir}`} x={x} y={y} w={dir === 'h' ? length : 1.5} h={dir === 'v' ? length : 1.5} className="wf-line" />
                ))}
                {flowNodes.map(({ label, x, y }) => <Box key={label} x={x} y={y} w={254} h={64} className="wf-node">{label}</Box>)}

                {/* DESIGN · 메인 페이지 */}
                <Heading y={7426}>DESIGN</Heading>
                <Text x={1109} y={7659}>검색, 장바구니, 마이페이지를 아이콘으로 구성하였다</Text>
                <Pic name="icon01" x={1109} y={7712} w={60} alt="검색 아이콘" />
                <Pic name="icon02" x={1189} y={7712} w={60} alt="찜 아이콘" />
                <Pic name="icon03" x={1269} y={7712} w={60} alt="마이페이지 아이콘" />
                <Pic name="mainPage" x={518} y={7824} w={835} alt="메인 페이지 화면" />
                <Pic name="box" x={514} y={7820} w={835} />
                <Pic name="banner01" x={0} y={7892} w={514} alt="메인 배너 1" />
                <Pic name="banner02" x={1349} y={7892} w={571} alt="메인 배너 2" />
                <Text x={1389} y={8199}>slide를 이용해 메인 배너 를 보여준다</Text>
                <Text x={372} y={8435} align="right">Best 상품 ,New상품을</Text>
                <Text x={372} y={8474} align="right">나열하여 보여준다</Text>
                <svg className="wf-svg" viewBox="0 0 1920 18810" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points="630,8325 403,8460 632,8586" fill="none" stroke="#111" strokeWidth="1.5" />
                    <polygon points="636,8589 618,8586 626,8575" fill="#111" />
                </svg>
                <Pic name="box" x={514} y={9189} w={835} />
                <Pic name="productCard03" x={534} y={9303} w={1386} alt="베스트 상품 목록" />

                {/* 검색 · 마이페이지 · 로그인 */}
                <Text x={315} y={10217}>원하는 상품을 검색할 수 있다</Text>
                <Pic name="search" x={230} y={10288} w={434} alt="검색 화면" />
                <Pic name="icon03" x={827} y={10187} w={60} />
                <Text x={912} y={10217}>마이페이에서 포인트 내역과 여러가지 설정들을 볼 수 있다</Text>

                <Pic name="login01" x={827} y={10287} w={434} alt="로그인 전 화면" />
                <Callout points="1252,10312 1377,10335 1377,10397 1252,10334" x={1377} y={10335} w={149} h={62}>
                    <span className="is-head">로그인</span>
                    <span>회원가입</span>
                </Callout>
                <Text x={1386} y={10455} size={34} className="is-dark">로그인 전</Text>
                <Text x={1386} y={10510}>로그인, 회원가입을 할 수 있다</Text>

                <Pic name="login02" x={827} y={10624} w={434} alt="로그인 후 화면" />
                <Callout points="1255,10650 1377,10605 1377,10787 1255,10716" x={1377} y={10605} w={149} h={182}>
                    <span className="is-head"><b>김현수</b> 님 환영합니다.</span>
                    <span>장바구니</span>
                    <span>찜</span>
                    <span>결제내역</span>
                    <span>계정 설정</span>
                    <span className="is-red">로그아웃</span>
                </Callout>
                <Text x={1386} y={10850} size={34} className="is-dark">로그인 후</Text>
                <Text x={1386} y={10903}>장바구니, 결제 내역등이 있다</Text>

                <Pic name="login03" x={827} y={10960} w={433} alt="알림 창 화면" />
                <Callout points="1142,10965 1347,10972 1347,11095 1142,11040" x={1347} y={10972} w={311} h={123}>
                    <span className="is-bar">Wildfix</span>
                    <span className="is-alert"><b>김현수</b>님 회원가입을 환영합니다<br /><b>10,000 Point</b>가 적립되었습니다</span>
                    <span className="is-button">닫기</span>
                </Callout>
                <Text x={1386} y={11187} size={34} className="is-dark">alert 창</Text>
                <Text x={1386} y={11239}>적립, 오류, 확인 페이지 등이 있다</Text>

                {/* 상품 페이지 */}
                <Title y={11500}>상품 페이지</Title>
                <Pic name="productPage" x={176} y={11570} w={570} alt="상품 목록 페이지" />
                <Pic name="order01" x={837} y={11576} w={961} alt="분류 메뉴" />
                <Text x={840} y={11705}>마이페이에서 포인트 내역과 여러가지 설정들을 볼 수 있다</Text>
                <Pic name="order02" x={840} y={11758} w={267} alt="정렬 기준 메뉴" />
                <Text x={840} y={12052}>마이페이에서 포인트 내역과 여러가지 설정들을 볼 수 있다</Text>
                <Pic name="productCard02" x={834} y={12130} w={261} alt="상품 카드" />
                <Pic name="productCard01" x={1118} y={12130} w={261} alt="베스트 상품 카드" />
                <Pic name="icon04" x={839} y={12510} w={35} />
                <Pic name="Vector" x={883} y={12526} w={51} />
                <Pic name="icon05" x={942} y={12510} w={35} />
                <Pic name="Vector" x={987} y={12526} w={51} />
                <Pic name="icon02" x={1045} y={12510} w={35} />
                <Text x={964} y={12577} align="center">하트를 눌러 원하는 상품을</Text>
                <Text x={964} y={12609} align="center">저장 할 수 있다</Text>
                <Pic name="icon06" x={1222} y={12515} w={53} alt="BEST 표시" />
                <Text x={1248} y={12577} align="center">가장 잘 팔리는 물품을 베스</Text>
                <Text x={1248} y={12609} align="center">트로 선정하였다</Text>

                {/* TOP · BOTTOM · OUTER */}
                <Text x={433} y={13131} size={32} align="center" className="is-dark">TOP</Text>
                <Text x={958} y={13131} size={32} align="center" className="is-dark">BOTTOM</Text>
                <Text x={1488} y={13131} size={32} align="center" className="is-dark">OUTER</Text>
                <Pic name="TopPage" x={179} y={13211} w={504} alt="TOP 페이지" />
                <Pic name="BottomPage" x={707} y={13211} w={504} alt="BOTTOM 페이지" />
                <Pic name="OuterPage" x={1235} y={13211} w={504} alt="OUTER 페이지" />

                {/* 상품 상세 페이지 */}
                <Title y={14607}>상품 상세 페이지</Title>
                <Pic name="image 92" x={180} y={14695} w={709} alt="상품 상세 페이지" />
                <Pic name="box" x={180} y={14763} w={727} />
                <Pic name="image 93" x={1032} y={14781} w={688} alt="장바구니 페이지" />
                <Pic name="box" x={1013} y={14763} w={727} />
                <Box x={202} y={15336} w={666} h={1355} className="wf-frame" />
                <Text x={425} y={15538} className="is-white">1. 상품 설명(Description)</Text>
                <Text x={1018} y={15411} className="is-dark">2. 상품 상세보기 (Additional Information)</Text>
                <Pic name="AdditionalInformation" x={1016} y={15457} w={723} alt="사이즈 표" />
                <Box x={1014} y={15455} w={726} h={233} className="wf-frame" />
                <Text x={1018} y={15875} className="is-dark">3. 상품 리뷰(Review)</Text>
                <Pic name="review" x={1016} y={15920} w={723} alt="상품 리뷰" />
                <Box x={1014} y={15918} w={726} h={215} className="wf-frame" />

                {/* 결제 페이지 */}
                <Title y={17378}>결제 페이지</Title>
                <Pic name="payMenu" x={180} y={17502} w={1560} alt="결제 단계: Address · Payment Method · Delivery" />
                <Pic name="payPage01" x={182} y={17780} w={330} className="is-blur" alt="주문하기 페이지" />
                <Pic name="vector02" x={603} y={18055} w={82} />
                <Pic name="payPage02" x={796} y={17780} w={330} alt="결제하기 페이지" />
                <Pic name="vector02" x={1217} y={18055} w={82} />
                <Pic name="payPage03" x={1410} y={17780} w={330} alt="배송 정보 페이지" />
            </div>
        </div>
    )
}
