import { Component } from "react";

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    }
  }

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState(prevstate => {
      const newState = { ...prevstate };
      newState[name] = value;
      return newState;
    });
  }

  handleLoginFormSubmit = e => {
    e.preventDefault();
    this.props.handleLogin(this.state);
  }

  render() {
    return (
      <div className="columns has-text-centered">
        <div className="column is-three-fifths-tablet is-offset-one-fifth-tablet">
          <div className="card p-2 mt-10">
            <div className="has-text-centered">
              <img width="150" src="static/login_logo.png" alt="User Logo" className="login-logo" />
            </div>

            <h3 className="is-size-3 has-text-centered">Welcome back, please login</h3>
            <hr />
            <form className="p-2 has-text-left" onSubmit={this.handleLoginFormSubmit} id="login-form">
              <div className="field mb-3">
                <label className="label" htmlFor="username-input">Username:</label>
                <div className="control">
                  <input
                    required
                    autoFocus
                    type="text"
                    name="username"
                    className="input"
                    id="username-input"
                    placeholder="Username"
                    value={this.state.username}
                    onChange={this.handleChange}
                  />
                </div>
              </div>

              <div className="field mb-2">
                <label className="label" htmlFor="password-input">Password:</label>
                <div className="control">
                  <input
                    required
                    type="password"
                    name="password"
                    className="input"
                    id="password-input"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </form>

            <button
              type="submit"
              form="login-form"
              className="button is-primary is-fullwidth"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginForm;
