import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import { useParams } from "react-router";
import Axios from "axios";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import LoadingDotsIcon from './LoadingDotsIcon';
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from './../StateContext';
import DispatchContext from './../DispatchContext';

const ViewSinglePost = (props) => {
  const { id } = useParams();
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    const fetchPost = async () => {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token })
        setPost(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log('there was a problem or the request was cancelled');
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    }
  }, [id])

  if (!isLoading && !post) {
    return (
      <NotFound />
    )
  }

  if (isLoading) {
    return <Page title='...'><LoadingDotsIcon /></Page>
  }
  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  const isOwner = () => {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username
    }
    return false
  }

  const deleteHandler = async () => {
    const areYouSure = window.confirm('Do you want to delete tha post?')
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
        if (response.data == 'Success') {
          //1.display a flash message
          appDispatch({ type: 'flashMessage', value: 'Post was successfully deleted.' })
          //2.redirect back to the user profile
          props.history.push(`/profile/${appState.user.username}`)
        }
      } catch (error) {
        console.log('There was a problem');
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for='edit' className="text-primary mr-2"><i className="fas fa-edit"></i></Link>
            <ReactTooltip id='edit' className='custom-tooltip' />{' '}
            <a onClick={deleteHandler} data-tip='Delete' data-for='delete' className="delete-post-button text-danger"><i className="fas fa-trash"></i></a>
            <ReactTooltip id='delete' className='custom-tooltip' />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown source={post.body} allowedTypes={['paragraph', 'strong', 'text', 'heading', 'list', 'listItem']} />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)