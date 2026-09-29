export default function ProjectHero({ title, summary, image }) {
  return <section>{image && <img src={image} alt="" />}<h1>{title}</h1><p>{summary}</p></section>
}

