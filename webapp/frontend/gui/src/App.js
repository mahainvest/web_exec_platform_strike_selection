// const json = await this.request("expiries/FINNIFTY/OPT/", "GET");

import "./App.css";
import Cookies from "js-cookie";
import { Component } from "react";
import queryString from "query-string";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

// Components
import MainPage from "./components/mainPage.jsx";
import LoginForm from "./components/loginForm.jsx";

// const qs = require("query-string");

const options = {
  position: "bottom-right",
  pauseOnHover: true,
  closeOnClick: true,
  theme: "colored",
  autoClose: 1500
}

class App extends Component {
  constructor(props) {
    super(props);

    console.log(process.env.NODE_ENV);
    this.URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";

    console.log(this.URL);

    this.state = {
      loggedIn: localStorage.getItem("jwt-token") ? true : false,
      username: "",
      strategies: [],
      ports: [],
      accounts: [],
      masterLogs: [],
      expiries: [],
      strategyStatus1: ""
      // showBrokerLoginWindow: false
    }
  }

  request = async (route, method, body=null, logoutOnElse=true, msgOnSuccess=true, toStringify=true) => {
    let res;

    // if (method === "POST") {
    if (body !== null) {
      res = await fetch(`${this.URL}/api/${route}`, {
        method: method,
        headers: {
          "Authorization": `jwt-token ${localStorage.getItem("jwt-token")}`,
          "X-CSRFToken": this.getCsrfCookie()
        },
        body: toStringify ? JSON.stringify(body) : body
      });
    } else {
      res = await fetch(`${this.URL}/api/${route}`, {
        method: method,
        headers: {
          "Authorization": `jwt-token ${localStorage.getItem("jwt-token")}`,
          "X-CSRFToken": this.getCsrfCookie()
        }
      });
    }

    const json = await res.json();
    console.log(json);

    if (json.type === "success") {
      if (msgOnSuccess) {
        toast.success(`Success: ${json.message}`, options);
      }

      return json

    } else if (json.type === "error") {
      toast.error(`Error: ${json.message}`, options);

      return json

    } else if (json.type === "generateToken") {
      console.log(`Redirecting to ${json.url}`);
      window.location = json.url;

      return json

    } else if (["takeTOTP"].includes(json.type)) {
      return json

    } else {
      toast.error(`${json.type}: ${json.message}`, options);
      if (logoutOnElse) {
        toast.error("Logged out !", options);
        this.handleLogout();
      }

      return json
    }
  }

  componentDidMount = async () => {
    let parsed = queryString.parse(window.location.search);
    let reqToken = parsed.request_token;

    console.log(reqToken);

    if (reqToken) {
      await this.request("set-access-token/", "POST", {requestToken: reqToken});
      window.location.search = "";
    }

    if (this.state.loggedIn) {
      const json = await this.request("current-user/", "GET");

      if (json.type === "success") {
        this.setState({
          username: json.username
        });
      }
    }
  }

  getCsrfCookie = () => {
    return Cookies.get("csrftoken");
  }

  handleLogin = async data => {
    console.log(data);
    const json = await this.request("login/", "POST", data, false);

    if (json.type === "success") {
      localStorage.setItem("jwt-token", json.jwtToken);

      this.setState({
        loggedIn: true,
        username: json.username
      });
    }
  }

  handleLogout = () => {
    localStorage.removeItem("jwt-token");
    this.setState({loggedIn: false});
  }

  getExpiries = async (scrip, insType) => {
    const json = await this.request(`expiries/${scrip}/${insType}`);
    this.setState({expiries: json.data});
  }

  getStrategies = async () => {
    const json = await this.request("strategies/", "GET", null, true, false);

    if (json.type === "success") {
      const strategies = json.data;
      this.setState({strategies: strategies});
    }
  }

  addStrategy = async state => {
    await this.request("strategies/add/", "POST", {data: state});
  }

  deleteStrategy = async id => {
    await this.request(`strategies/delete/${id}/`, "DELETE");
  }

  importStrategies = async data => {
    await this.request("strategies/import/", "POST", data, true, true, false);
  }

  getPorts = async () => {
    const json = await this.request("ports/", "GET", null, true, false);

    if (json.type === "success") {
      const ports = json.data;
      this.setState({ports: ports});
    }
  }

  addPort = async state => {
    await this.request("ports/add/", "POST", {data: state});
  }

  editPort = async (id, state) => {
    await this.request(`ports/edit/${id}/`, "PUT", {data: state});
  }

  deletePort = async id => {
    await this.request(`ports/delete/${id}/`, "DELETE");
  }

  startPort = async id => {
    await this.request(`ports/start/${id}/`, "PUT");
  }

  stopPort = async id => {
    await this.request(`ports/stop/${id}/`, "PUT");
  }

  executePort = async id => {
    const lots = prompt("Please enter Lots Multiplier for entry:", "1");
    if (lots !== null) {
      await this.request(`ports/execute/${id}/`, "PUT", {data: {lots: lots}});
    }
  }

  squareoffPort = async id => {
    await this.request(`ports/squareoff/${id}/`, "PUT");
  }

  importPorts = async data => {
    await this.request("ports/import/", "POST", data, true, true, false);
  }

  getAccounts = async () => {
    const json = await this.request("accounts/", "GET", null, true, false);

    this.setState({
      accounts: json.data
    });
  }

  addAccount = async state => {
    await this.request("accounts/add/", "POST", {data: state});
  }

  getMasterLogs = async () => {
    const json = await this.request("master-logs/", "GET", null, true, false);

    this.setState({
      masterLogs: json.data
    });
  }

  clearMasterLogs = async () => {
    await this.request("master-logs/clear/", "DELETE");
  }

  // handleBrokerLogin = async id => {
  //   const json = await this.request(`broker-token/${id}/`, "GET");

  //   if (json.type === "takeTOTP") {
  //     this.setState({
  //       showBrokerLoginWindow: true
  //     });
  //   }
  // }

  // generateShoonyaAccessToken = async totp => {
  //   const json = await this.request("set-access-token/", "POST", {requestToken: totp});

  //   if (json.type === "success") {
  //     this.setState({
  //       showBrokerLoginWindow: false
  //     });
  //   }
  // }

  fetchStrategyStatus = async num => {
    const json = await this.request(`strategy/status/${num}/`, "GET");

    if (json.type === "success") {
      if (json.data === 0) {
        this.setState(prevState => {
          const newState = { ...prevState };
          newState[`strategyStatus${num}`] = "running";
          return newState;
        });

      } else {
        this.setState(prevState => {
          const newState = { ...prevState };
          newState[`strategyStatus${num}`] = "stopped";
          return newState;
        });
      }
    }
  }

  startStrategy = async num => {
    const json = await this.request(`strategy/start/${num}/`, "PUT");

    if (json.type === "success") {
      this.fetchStrategyStatus(num);
    }
  }

  stopStrategy = async num => {
    const json = await this.request(`strategy/stop/${num}/`, "PUT");

    if (json.type === "success") {
      this.fetchStrategyStatus(num);
    }
  }

  render() {
    let page = null;

    if (!this.state.loggedIn) {
      page = <LoginForm
        handleLogin={this.handleLogin}
      />

    } else {
      page = <MainPage
        URL={this.URL}
        username={this.state.username}
        handleLogout={this.handleLogout}

        strategies={this.state.strategies}
        getStrategies={this.getStrategies}
        addStrategy={this.addStrategy}
        deleteStrategy={this.deleteStrategy}
        importStrategies={this.importStrategies}

        ports={this.state.ports}
        getPorts={this.getPorts}
        addPort={this.addPort}
        editPort={this.editPort}
        deletePort={this.deletePort}
        startPort={this.startPort}
        stopPort={this.stopPort}
        executePort={this.executePort}
        squareoffPort={this.squareoffPort}
        importPorts={this.importPorts}

        expiries={this.state.expiries}
        getExpiries={this.getExpiries}

        accounts={this.state.accounts}
        getAccounts={this.getAccounts}
        addAccount={this.addAccount}
        // handleBrokerLogin={this.handleBrokerLogin}
        // showBrokerLoginWindow={this.state.showBrokerLoginWindow}
        // generateShoonyaAccessToken={this.generateShoonyaAccessToken}

        masterLogs={this.state.masterLogs}
        getMasterLogs={this.getMasterLogs}
        clearMasterLogs={this.clearMasterLogs}

        stopStrategy={this.stopStrategy}
        startStrategy={this.startStrategy}
        strategyStatus1={this.state.strategyStatus1}
        strategyStatus2={this.state.strategyStatus2}
        strategyStatus3={this.state.strategyStatus3}
        strategyStatus4={this.state.strategyStatus4}
        strategyStatus5={this.state.strategyStatus5}
        fetchStrategyStatus={this.fetchStrategyStatus}
      />
    }

    return (
      <div className="App">
        {page}
        <ToastContainer />
      </div>
    );
  }
}

export default App;