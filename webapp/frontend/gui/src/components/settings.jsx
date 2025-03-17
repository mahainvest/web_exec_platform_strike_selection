import { Component } from "react";

class Settings extends Component {
  componentDidMount() {
    this.props.fetchStrategyStatus(1);
  }

  render() {
    return (
      <div className="columns">
        <div className="column is-three-fifths-tablet is-offset-one-fifth-tablet">
          <div className="card mt-2 text-center">
            <header className="card-header">
              <h5 className="card-header-title">Server Settings</h5>
            </header>

            <section className="card-content">
              <p className={this.props.strategyStatus1 === "running" ? "has-text-success" : "has-text-danger"}>
                {
                  this.props.strategyStatus1 === "running" ? "Running" : "Stopped"
                }
              </p>
            </section>

            <footer className="card-footer">
              <button className="button is-info card-footer-item" onClick={() => this.props.fetchStrategyStatus(1)}>Refresh</button>
              {
                this.props.strategyStatus1 === "running" &&
                <button className="button is-danger card-footer-item" onClick={() => this.props.stopStrategy(1)}>Stop</button>
              }
              {
                this.props.strategyStatus1 === "stopped" &&
                <button className="button is-success card-footer-item" onClick={() => this.props.startStrategy(1)}>Start</button>
              }
            </footer>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;