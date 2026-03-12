import { Category, Tag } from "../lib/types";

export function SearchBar({
  query,
  categories,
  tags,
  selectedCategory,
  selectedTag
}: {
  query: string;
  categories: Category[];
  tags: Tag[];
  selectedCategory: string;
  selectedTag: string;
}) {
  return (
    <form method="get" className="card">
      <label>Search products</label>
      <input name="q" placeholder="Search by name or keyword" defaultValue={query} />
      <label>Category</label>
      <select name="category" defaultValue={selectedCategory}>
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
      <label>Tag</label>
      <select name="tag" defaultValue={selectedTag}>
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.slug}>
            {tag.name}
          </option>
        ))}
      </select>
      <button className="button" type="submit">Search</button>
    </form>
  );
}
