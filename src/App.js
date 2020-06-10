import React from "react";
import Vis from "./components/vis";
import "./App.css";
import axios from "axios";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: "",
      error: null,
      userID: 1,
      tree: {},
      height: null,
      width: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updatePredicate = this.updatePredicate.bind(this);
  }

  componentDidMount() {
    this.updatePredicate();
    window.addEventListener("resize", this.updatePredicate);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updatePredicate);
  }

  updatePredicate() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  async initTonicpow() {
    // check for local cookie
    try {
      await this.checkCookie();
    } catch (e) {
      throw e;
    }
  }

  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  async checkCookie() {
    var session = this.getCookie("session_token");
    if (!session) {
      try {
        await this.authTonicPow();
      } catch (e) {
        throw e;
      }
    }
  }

  async authTonicPow() {
    let url = `https://api.tonicpow.com/v1/auth/session`;
    let headers = {
      "Content-Type": "application/json",
    };
    let data = {
      api_key: this.state.apiKey,
    };
    try {
      return await axios(url, {
        method: "post",
        withCredentials: true,
        data,
        headers,
      });
    } catch (e) {
      throw e;
    }
  }

  async fetchUserTree() {
    let url =
      `https://api.tonicpow.com/v1/users/referred?id=` + this.state.userID;
    // `https://my-json-server.typicode.com/rohenaz/users-demo-data/referred`
    let headers = {
      "Content-Type": "application/json",
    };

    return await axios(url, {
      method: "get",
      withCredentials: true,
      headers,
    }).then((res) => {
      this.setState({ users: res.data });
    });
  }

  handleChange(event) {
    console.log("changed", event.target.value, this.state, event.target.name);
    let state = {};
    state[event.target.name] = event.target.value;
    this.setState(state);
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (!this.state.apiKey) {
      alert("API Key is required");
      return;
    }

    try {
      await this.initTonicpow();
    } catch (e) {
      console.error("Failed to init TonicPow", e);
      this.setState({ error: "Unfortunately, there was an error :(" });
    }

    try {
      await this.fetchUserTree();
      if (!Object.keys(this.state.tree).length) {
        this.initTree();
        console.log("got a tree", this.state.tree);
      }
    } catch (e) {
      console.error("Failed to fetch user tree", e);
    }
  }

  // Set tree to root node, recursively resolving children
  initTree() {
    // Start tree with root node
    let tree = {
      id: parseInt(this.state.userID),
      payout_address: "ROOT",
      children: [],
    };

    // Resolve children
    tree.children = this.getChildren(
      parseInt(this.state.userID),
      this.state.users
    );
    this.setState({ tree });
  }

  // getChildren resolves children for the a node recursively
  getChildren(nodeID, users) {
    return users
      .filter((u) => {
        return u.referred_by_user_id === nodeID;
      })
      .map((n) => {
        n.children = this.getChildren(n.id, users);
        return n;
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <form onSubmit={this.handleSubmit}>
            {this.state.error && <p>{this.state.error}</p>}
            <label htmlFor="apiKey">
              API Key:{" "}
              <input
                type="text"
                name="apiKey"
                placeholder="XVGJKYP..."
                value={this.state.apiKey}
                onChange={this.handleChange}
              ></input>
            </label>
            <br />
            <label htmlFor="apiKey">
              User ID:{" "}
              <input
                type="text"
                name="userID"
                placeholder="14"
                value={this.state.userID}
                onChange={this.handleChange}
              ></input>
            </label>
            <input type="submit" value="Submit" />
          </form>
        </header>
        <Vis
          width={this.state.width}
          height={Math.floor((this.state.height * 80) / 100)}
          tree={this.state.tree}
        ></Vis>
      </div>
    );
  }
}

export default App;
