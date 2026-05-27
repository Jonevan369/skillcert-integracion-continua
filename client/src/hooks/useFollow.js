import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function useFollow(initialFollowing = false) {
  const [following, setFollowing] = useState(initialFollowing);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  async function toggle(userId) {
    if (following) {
      await api.unfollow(userId);
      setFollowing(false);
    } else {
      await api.follow(userId);
      setFollowing(true);
    }
  }

  return { following, toggle };
}
