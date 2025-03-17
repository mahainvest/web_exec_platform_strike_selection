import { Component, Fragment } from "react";

class Logs extends Component {
  componentDidMount() {
    this.props.getLogs();
  }

  render() {
    const logs = [];

    this.props.logs.map((log, i) => {
      if (log.level === "ERROR") {
        logs.push(
          <Fragment>
            <code key={i} className="error-log has-background-dark">{`${log.timestamp} [ERROR] ${log.text} (#${log.strategyNum})`}</code>
            <br />
          </Fragment>
        );
      } else if (log.level === "SUCCESS") {
        logs.push(
          <Fragment>
            <code key={i} className="success-log has-background-dark">{`${log.timestamp} [SUCCESS] ${log.text} (#${log.strategyNum})`}</code>
            <br />
          </Fragment>
        );
      } else if (log.level === "INFO") {
        logs.push(
          <Fragment>
            <code key={i} className="info-log has-background-dark">{`${log.timestamp} [INFO] ${log.text} (#${log.strategyNum})`}</code>
            <br />
          </Fragment>
        );
      }
    });

    return (
      <div className="columns">
        <div className="column">
          <div className="card m-2">
            <div className="card-header has-text-centered">
              <h5 className="card-header-title">Logs</h5>
            </div>

            <section className="card-content overflow-auto">
              <div className="columns is-mobile">
                <span className="column is-half py-0"><button className="is-fullwidth button is-info" onClick={this.props.getLogs}>Refresh</button></span>
                <span className="column is-half py-0"><button className="is-fullwidth button is-danger" onClick={this.props.clearLogs}>Clear</button></span>
              </div>

              <hr />

              <div className="has-background-dark has-text-white p-2">
                {logs.map(log => log)}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default Logs;
