import { Component } from "react";

class Accounts extends Component {
  componentDidMount() {
    this.props.getAccounts();
  }

  render() {
    return (
      <div>
        <div className="card m-2">
          <header className="card-header has-text-centered">
            <h5 className="card-header-title">Accounts</h5>
          </header>

          <section className="card-content overflow-auto">
            <table className="table is-striped is-hoverable has-text-centered is-fullwidth">
              <thead>
                <tr>
                  <th align="center">ID</th>
                  <th align="center">Name</th>
                  <th align="center">Type</th>
                  <th align="center">Total P&L</th>
                  <th align="center">API Key</th>
                  <th align="center">API Secret</th>
                  <th align="center">Root URL</th>
                  <th align="center">WS Root URL</th>
                  <th align="center">Lots Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.props.accounts.map((acc, i) => (
                    <tr key={i}>
                      <th align="center" scope="row">{acc.id}</th>
                      <td align="center">{acc.name}</td>
                      <td align="center">{acc.type}</td>
                      <td align="center">{acc.totalPnl}</td>
                      <td align="center">{acc.apiKey}</td>
                      <td align="center">{acc.apiSecret}</td>
                      <td align="center">{acc.rootURL}</td>
                      <td align="center">{acc.wsRootURL}</td>
                      <td align="center">{acc.lotsMultiplier}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </section>
        </div>
      </div>
    );
  }
}

export default Accounts;