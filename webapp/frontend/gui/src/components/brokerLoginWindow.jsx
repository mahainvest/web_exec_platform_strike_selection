import { Component } from "react";

class BrokerLoginWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totp: 0
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.generateShoonyaAccessToken(this.state.totp);
  }

  handleChange = e => {
    const name = e.target.name;
    const val = e.target.value;

    this.setState(prevState => {
      const newState = { ...prevState };
      newState[name] = val;
      return newState;
    });
  }

  render() {
    return (
      <div className={this.props.showBrokerLoginWindow ? "modal is-active" : "modal"}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <h5 className="modal-card-title">Finvasia API Login Form</h5>
          </header>

          <section className="modal-card-body">
            <form onSubmit={this.handleSubmit} id="finvasia-login-form">
              <div className="field">
                <label htmlFor="totp" className="label">TOTP:</label>
                <div className="control">
                  <input
                    id="totp"
                    name="totp"
                    type="number"
                    className="input"
                    value={this.state.totp}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </form>
          </section>

          <footer className="modal-card-foot">
            <button type="submit" className="button is-link" form="finvasia-login-form">Login</button>
          </footer>
        </div>
      </div>
    );
  }
}

export default BrokerLoginWindow;