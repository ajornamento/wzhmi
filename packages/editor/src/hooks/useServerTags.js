import { useState, useEffect } from 'react';
export function useServerTags(serverBase = 'http://localhost:3001') {
    const [tags, setTags] = useState([]);
    useEffect(() => {
        fetch(`${serverBase}/api/tags`)
            .then((r) => r.json())
            .then(setTags)
            .catch(() => { });
    }, [serverBase]);
    return tags;
}
