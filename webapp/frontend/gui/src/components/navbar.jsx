import { Component } from "react";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar is-dark">
        <div className="navbar-brand">
          <a className="navbar-item" href="/#">Hi, {this.props.username}</a>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <button
              className="button is-danger"
              onClick={this.props.handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
