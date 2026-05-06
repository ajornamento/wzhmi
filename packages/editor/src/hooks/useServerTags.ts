import { useState, useEffect } from 'react';

interface TagInfo {
  tagId: string;
  description: string;
}

export function useServerTags(serverBase = 'http://localhost:3001') {
  const [tags, setTags] = useState<TagInfo[]>([]);

  useEffect(() => {
    fetch(`${serverBase}/api/tags`)
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {});
  }, [serverBase]);

  return tags;
}
