import React, { useEffect, useState } from "react"
import Axios from 'axios';
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import LoadingDotsIcon from './LoadingDotsIcon';

const ProfileFollowing = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    const fetchPosts = async () => {
      try {
        const response = await Axios.get(`./profile/${username}/following`, { cancelToken: ourRequest.token })
        setIsLoading(false);
        setPosts(response.data);
      } catch (error) {
        console.log('there was a problem or the request was cencelled');
      }
    }
    fetchPosts();
    return () => {
      ourRequest.cancel();
    }
  }, [username])

  if (isLoading) { return (<LoadingDotsIcon />) }
  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} />{follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowing