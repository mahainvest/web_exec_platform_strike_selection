import { Component } from "react";

class PortLogs extends Component {
  render() {
    return (
      <div className={this.props.isOpen ? "modal is-active" : "modal"}>
        <div className="modal-background" onClick={this.props.close}></div>

        <div className="modal-card wide-modal">
          <header className="modal-card-head">
            <p className="modal-card-title">Logs - Port #{this.props.port.name} (Strategy #{this.props.port.strategyName})</p>
            <button className="delete" onClick={this.props.close}></button>
          </header>

          <section className="modal-card-body has-background-black-bis">
            {
              this.props.port.logs.map((log, i) => (
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
          </section>

          <footer className="modal-card-foot"></footer>
        </div>
      </div>
    );
  }
}

export default PortLogs;