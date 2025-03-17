import { Component } from "react";

import Ports from "./ports.jsx";
import Navbar from "./navbar.jsx";
import Accounts from "./accounts.jsx";
import Settings from "./settings.jsx";
import Strategies from "./strategies.jsx";
import MasterLogs from "./masterLogs.jsx";
// import BrokerLoginWindow from "./brokerLoginWindow.jsx";


class PageLink extends Component {
  render() {
    return (
      <li
        className={this.props.currentPage === this.props.page ? "is-active" : ""}
      >
        <a
          href="/#"
          onClick={() => this.props.changePage(this.props.page)}
        >
          {this.props.page.toUpperCase()}
        </a>
      </li>
    );
  }
}

class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: "strategies"
    }
  }

  changePage = page => {
    console.log(`Changing to ${page}`);

    this.setState({
      currentPage: page
    });
  }

  render() {
    let page;

    if (this.state.currentPage === "strategies") {
      page = <Strategies
        accounts={this.props.accounts}
        getAccounts={this.props.getAccounts}
        strategies={this.props.strategies}
        getStrategies={this.props.getStrategies}
        addStrategy={this.props.addStrategy}
        deleteStrategy={this.props.deleteStrategy}
        importStrategies={this.props.importStrategies}
      />
    } else if (this.state.currentPage === "ports") {
      page = <Ports
        ports={this.props.ports}
        getPorts={this.props.getPorts}
        addPort={this.props.addPort}
        editPort={this.props.editPort}
        deletePort={this.props.deletePort}
        startPort={this.props.startPort}
        stopPort={this.props.stopPort}
        executePort={this.props.executePort}
        squareoffPort={this.props.squareoffPort}
        importPorts={this.props.importPorts}

        accounts={this.props.accounts}
        getAccounts={this.props.getAccounts}
        strategies={this.props.strategies}
        getStrategies={this.props.getStrategies}
        expiries={this.props.expiries}
        getExpiries={this.props.getExpiries}
      />
    } else if (this.state.currentPage === "accounts") {
      page = <Accounts
        accounts={this.props.accounts}
        addAccount={this.props.addAccount}
        getAccounts={this.props.getAccounts}
        // handleBrokerLogin={this.props.handleBrokerLogin}
      />
    } else if (this.state.currentPage === "master-logs") {
      page = <MasterLogs
        masterLogs={this.props.masterLogs}
        getMasterLogs={this.props.getMasterLogs}
        clearMasterLogs={this.props.clearMasterLogs}
      />
    } else if (this.state.currentPage === "server-settings") {
      page = <Settings
        stopStrategy={this.props.stopStrategy}
        startStrategy={this.props.startStrategy}
        strategyStatus1={this.props.strategyStatus1}
        fetchStrategyStatus={this.props.fetchStrategyStatus}
      />
    }

    return (
      <div>
        <Navbar
          username={this.props.username}
          handleLogout={this.props.handleLogout}
        />

        <div className="tabs is-toggle is-toggle-rounded is-fullwidth p-2 m-2">
          <ul>
            <PageLink page="strategies" changePage={this.changePage} currentPage={this.state.currentPage} />
            <PageLink page="ports" changePage={this.changePage} currentPage={this.state.currentPage} />
            <PageLink page="accounts" changePage={this.changePage} currentPage={this.state.currentPage} />
            <PageLink page="master-logs" changePage={this.changePage} currentPage={this.state.currentPage} />
            <PageLink page="server-settings" changePage={this.changePage} currentPage={this.state.currentPage} />
          </ul>
        </div>

        {/* <BrokerLoginWindow
          showBrokerLoginWindow={this.props.showBrokerLoginWindow}
          generateShoonyaAccessToken={this.props.generateShoonyaAccessToken}
        /> */}

        {page}
      </div>
    );
  }
}

export default MainPage;