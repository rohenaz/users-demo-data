import React, { useState, useCallback, useEffect } from 'react'

import Vis from './components/vis'
import './App.css'
import axios from 'axios'
import { User, Tree } from 'ref-vis'

type Props = {}

type State = {
  apiKey: string
  users: User[]
  userID?: string
  tree: Tree
  width: number
  height: number
  [prop: string]: any
}

const App: React.FC<Props> = () => {
  const [state, setState] = useState<State | null>({
    apiKey: '',
    users: [],
    width: window.innerWidth,
    height: window.innerHeight,
    tree: {
      children: [],
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cookie, setCookie] = useState<string | null>(null)
  const [treeForUser, setTreeForUser] = useState<number>(0)
  // componentWillUnmount() {
  //   window.removeEventListener("resize", this.updatePredicate);
  // }

  const updatePredicate = useCallback(() => {
    if (state && (window.innerHeight !== state.height || window.innerWidth !== state?.width)) {
      let newState = Object.assign({}, state)
      newState.width = window.innerWidth
      newState.height = window.innerHeight
      setState(newState)
    }
  }, [state])

  useEffect(() => {
    console.log('effect')
    updatePredicate()
    window.addEventListener('resize', updatePredicate)
  }, [updatePredicate])

  useEffect(() => {
    var name = 'session_token='
    var decodedCookie = decodeURIComponent(document.cookie)
    var ca = decodedCookie.split(';')
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        setCookie(c.substring(name.length, c.length))
        return
      }
    }
    setCookie(null)
  }, [])

  const checkCookie = useCallback(() => {
    if (!cookie) {
      if (!state?.apiKey) {
        return
      }
      let url = `https://api.tonicpow.com/v1/auth/session`
      let headers = {
        'Content-Type': 'application/json',
      }

      let data = {
        api_key: state.apiKey,
      }

      axios(url, {
        method: 'post',
        withCredentials: true,
        data,
        headers,
      })
        .then(() => {
          setAuthenticated(true)
        })
        .catch((e) => {
          console.error(e)
        })
    }
  }, [state, cookie])

  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true)
      let url = `https://api.tonicpow.com/v1/users/referred?id=` + state?.userID
      let headers = {
        'Content-Type': 'application/json',
      }

      return await axios(url, {
        method: 'get',
        withCredentials: true,
        headers,
      })
        .then((res) => {
          let newState = Object.assign({}, state)
          newState.users = res.data
          setState(newState)
          setIsLoading(false)
        })
        .catch((e) => {
          setIsLoading(false)
          setError(e)
        })
    }
    if (!state?.users.length && authenticated && !error && !isLoading) {
      fetchTree()
    }
  }, [authenticated, error, state, isLoading])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('changed', event.target.value, state, event.target.name)
      if (!state) {
        return
      }
      let newState = Object.assign({}, state)
      console.log('set', event.target.name, 'to', event.target.value)
      if (state[event.target.name] !== event.target.value) {
        newState[event.target.name] = event.target.value
        setState(newState)
      }
    },
    [state]
  )

  // Set tree to root node, recursively resolving children
  const initTree = useCallback(() => {
    console.log('init tree', state?.userID)

    const getChildren = (nodeID: number, users: User[]) => {
      let childs = users
        .filter((u) => {
          return u.referred_by_user_id === nodeID
        })
        .map((n) => {
          n.children = getChildren(n.id, users)
          return n
        })
      console.log('childs!', childs)
      return childs
    }

    if (state && state.userID) {
      setTreeForUser(state?.userID ? parseInt(state?.userID) : 0)
      // Start tree with root node
      let tree = {
        id: state?.userID,
        payout_address: 'ROOT',
        children: [],
      } as Tree

      // Resolve children
      tree.children = getChildren(parseInt(state?.userID), state?.users)
      console.log('has been set', tree.children)
      let newState = Object.assign({}, state)
      newState.tree = tree
      setState(newState)
    }
  }, [state])

  const handleSubmit = useCallback(
    (event: React.ChangeEvent<HTMLFormElement>) => {
      event.preventDefault()

      const submit = async () => {
        if (!state?.apiKey) {
          alert('API Key is required')
          return
        }

        checkCookie()
      }
      submit()
    },
    [state, checkCookie]
  )

  useEffect(() => {
    if (!state) {
      return
    }

    if (
      state.userID &&
      treeForUser !== parseInt(state.userID) &&
      state.users.length &&
      !state.tree.children.length
    ) {
      initTree()
    } else {
      console.log('i got the goods', state.tree.children)
    }
  }, [treeForUser, isLoading, state, initTree])

  if (!state) {
    return <div>No State</div>
  }

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}
          <label htmlFor="apiKey">
            API Key:{' '}
            <input
              type="text"
              name="apiKey"
              placeholder="XVGJKYP..."
              value={state.apiKey}
              onChange={handleChange}
            ></input>
          </label>
          <br />
          <label htmlFor="apiKey">
            User ID:{' '}
            <input
              type="text"
              name="userID"
              placeholder="14"
              value={state.userID}
              onChange={handleChange}
            ></input>
          </label>
          <input type="submit" value="Submit" />
        </form>
      </header>
      {state.tree ? (
        <Vis
          width={state.width}
          height={Math.floor((state.height * 80) / 100)}
          tree={state.tree}
        ></Vis>
      ) : null}
    </div>
  )
}

export default App
