import React, { useEffect, useContext } from "react"
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import DispatchContext from "../DispatchContext";
import StateContext from './../StateContext';

const HeaderLoggedIn = (props) => {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const handleLogOut = () => {
    appDispatch({ type: 'logout' })
    appDispatch({ type: 'flashMessage', value: 'You have successfully log out.' })
  }

  const handleSeatchIcon = (e) => {
    e.preventDefault();
    appDispatch({ type: 'openSearch' })
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a data-tip='Search' data-for='search' onClick={handleSeatchIcon} href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip id='search' place='bottom' className='custom-tooltip' />{' '}
      <span onClick={() => appDispatch({ type: 'toggleChat' })} data-tip='Chat' data-for='chat' className={"mr-2 header-chat-icon " + (appState.unreadChatCount ? "text-danger" : "text-white")}>
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount ? <span className="chat-count-badge text-white"> {appState.unreadChatCount < 10 ? appState.unreadChatCount : '9+'}</span> : ''}
      </span>
      <ReactTooltip id='chat' place='bottom' className='custom-tooltip' />
      {' '}<Link data-tip='My Profile' data-for='profile' to={`/profile/${appState.user.username}`} className="mr-2">
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactTooltip id='profile' place='bottom' className='custom-tooltip' />
      {' '}<Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      {' '}<button onClick={handleLogOut} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn