export default function BrowserPreview({ image, title }) {
  return <div>{image ? <img src={image} alt={`${title} preview`} /> : <span>{title}</span>}</div>
}

