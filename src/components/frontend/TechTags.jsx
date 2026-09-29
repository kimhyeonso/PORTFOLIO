export default function TechTags({ tags = [] }) {
  return <ul>{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
}

