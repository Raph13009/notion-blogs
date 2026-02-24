interface AuthorCardProps {
  author?: string;
}

export function AuthorCard({ author: _author }: AuthorCardProps) {
  void _author;
  return null;
}
