import { lazy } from 'react'

/**
 * 세부정보 팝업에 코드로 만든 상세페이지를 보여줄 프로젝트 목록 (slug → 컴포넌트).
 * 여기 없는 프로젝트는 데이터의 images(상세 이미지)를, 그것도 없으면 썸네일을 보여준다.
 * 새 상세페이지는 이 폴더에 컴포넌트를 만들고 한 줄 추가하면 된다. (팝업을 열 때만 불러온다)
 */
export const projectDetails = {
    wildfix: lazy(() => import('./WildfixDetail.jsx')),
    divetours: lazy(() => import('./DivetoursDetail.jsx')),
    'mountain-equipment': lazy(() => import('./MountainDetail.jsx')),
    'advertising-banner': lazy(() => import('./AdvertisingBannerDetail.jsx')),
}
