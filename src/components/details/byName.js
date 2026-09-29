// 폴더의 이미지를 파일 이름으로 꺼내 쓸 수 있게 바꾼다 (import.meta.glob 결과 → { 파일이름: 주소 })
export const byName = (files) => Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url]))
