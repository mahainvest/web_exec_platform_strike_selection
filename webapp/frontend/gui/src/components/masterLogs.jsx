import { Component } from "react";

class MasterLogs extends Component {
  componentDidMount() {
    this.props.getMasterLogs();
  }

  render() {
    return (
      <div className="columns">
        <div className="column">
          <div className="card m-2">
            <div className="card-header has-text-centered">
              <h5 className="card-header-title">Master Logs</h5>
            </div>

            <section className="card-content overflow-auto">
              <div className="columns is-mobile">
                <span className="column is-half py-0"><button className="is-fullwidth button is-info" onClick={this.props.getMasterLogs}>Refresh</button></span>
                <span className="column is-half py-0"><button className="is-fullwidth button is-danger" onClick={this.props.clearMasterLogs}>Clear</button></span>
              </div>

              <hr />

              <div className="has-background-black-bis p-2">
                {
                  this.props.masterLogs.map((log, i) => (
                    <div>
                      <p
                        key={i}
                        className={`${log.level.toLowerCase()}-log has-background-black-bis is-family-code`}
                      >
                        {log.timestamp}; {log.text}
                      </p>
                    </div>
                  ))
                }
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default MasterLogs;