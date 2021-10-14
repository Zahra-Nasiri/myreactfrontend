import React, { useState, useReducer, useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { useImmerReducer } from 'use-immer';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Axios from 'axios';
Axios.defaults.baseURL = process.env.BACKENDURL || "https://backendformyfirstappinreact.herokuapp.com"

import StateContext from './StateContext';
import DispatchContext from './DispatchContext'

//my components
import Header from './component/Header';
import HomeGust from './component/HomeGust';
import Footer from './component/Footer';
import Terms from './component/Terms';
import About from './component/About';
import Home from './component/Home';
const CreatePost = React.lazy(() => import("./component/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./component/ViewSinglePost"))
const Search = React.lazy(() => import("./component/Search"))
import Chat from './component/Chat';
import FlashMessages from './component/FlashMessages';
import Profile from './component/Profile';
import EditPost from './component/EditPost';
import NotFound from './component/NotFound';
import LoadingDotsIcon from './component/LoadingDotsIcon';

function Main() {
  const initailState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar')
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  const ourReducer = (draft, action) => {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        return
      case 'logout':
        draft.loggedIn = false
        return
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        return
      case 'openSearch':
        draft.isSearchOpen = true
        return
      case 'closeSearch':
        draft.isSearchOpen = false
        return
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        return
      case 'closeChat':
        draft.isChatOpen = false
        return
      case 'increamentUnreadChatCount':
        draft.unreadChatCount++
        return
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initailState)
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token)
      localStorage.setItem("complexappUsername", state.user.username)
      localStorage.setItem("complexappAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("complexappToken")
      localStorage.removeItem("complexappUsername")
      localStorage.removeItem("complexappAvatar")
    }
  }, [state.loggedIn])

  //Check if token has ecpired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      const fetchResults = async () => {
        try {
          const response = await Axios.post('/checkToken', { token: state.user.token }, { CancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: 'logout' })
            dispatch({ type: 'flashMessage', value: 'Your session has expired. please log in agian' })
          }
        } catch (error) {
          console.log('There was a problem or the request was cancelled');
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [])


  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path={`/profile/:username`}>
                <Profile />
              </Route>
              <Route path='/' exact>
                {state.loggedIn ? <Home /> : <HomeGust />}
              </Route>
              <Route path='/about-us'>
                <About />
              </Route>
              <Route path='/terms'>
                <Terms />
              </Route>
              <Route path='/post/:id' exact>
                <ViewSinglePost />
              </Route>
              <Route path='/post/:id/edit' exact>
                <EditPost />
              </Route>
              <Route path='/create-post'>
                <CreatePost />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames='search-overlay' unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Chat />
          <Footer />

        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.getElementById('app'))

if (module.hot) {
  module.hot.accept();
}