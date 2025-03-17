import { Component } from "react";
import { FaTrash } from "react-icons/fa";
import DataTable from "react-data-table-component";

const customStyles = {
  table: {
    style: {
      textAlign: "center"
    }
  },
  headCells: {
    style: {
      paddingLeft: "5px", // override the cell padding for head cells
      paddingRight: "0px",
      fontSize: "14px"
    },
  },
  cells: {
    style: {
      paddingLeft: "5px", // override the cell padding for data cells
      paddingRight: "0px",
      textAlign: "center",
      fontSize: "14px"
    },
  }
};

class Strategies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // accounts: [],
      account: "",
      name: "",
      maxLoss: 0,
      lotsMultiplier: 1
    }

    this.updateIntervalID = null;
    this.URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";
  }

  componentDidMount() {
    let localStorageState = localStorage.getItem("execution-platform-strategy-inputs");

    if (localStorageState === undefined || localStorageState === null || localStorageState === "") {
      let stateToSave = JSON.stringify(this.state);
      localStorage.setItem("execution-platform-strategy-inputs", stateToSave);

    } else {
      localStorageState = JSON.parse(localStorageState);
      this.setState(localStorageState);
    }

    var intervalId = setInterval(() => {
      this.props.getAccounts();
      this.props.getStrategies();
    }, 1000);
    this.updateIntervalID = intervalId;
  }

  componentWillUnmount() {
    clearInterval(this.updateIntervalID);
    this.updateIntervalID = null;
  }

  handleAdd = async e => {
    await e.preventDefault();
    await this.props.addStrategy(this.state);
  }

  handleEdit = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState(prevState => {
      const newState = { ...prevState };
      newState[name] = value;
      return newState;
    }, () => {
      let stateToSave = JSON.stringify(this.state);
      localStorage.setItem("execution-platform-strategy-inputs", stateToSave);
    });
  }

  handleAccEdit = e => {
    const name = e.target.name;
    const value = [...e.target.selectedOptions].map(opt => opt.value);

    this.setState(prevState => {
      const newState = { ...prevState };
      newState[name] = value;
      return newState;
    }, () => {
      let stateToSave = JSON.stringify(this.state);
      localStorage.setItem("execution-platform-strategy-inputs", stateToSave);
    });
  }

  handleImport = e => {
    const file = e.target.files[0];

    let formData = new FormData();
    formData.append("file", file);

    this.props.importStrategies(formData);

    document.getElementById("import-strategies-button").value = null;
  }

  render() {
    const columns = [
      {
        name: "ID",
        selector: row => row.id,
        sortable: true
      },
      {
        // name: "Accounts",
        // selector: row => row.accounts,
        name: "Account",
        selector: row => row.account,
        sortable: true
      },
      {
        name: "Name",
        selector: row => row.name,
        sortable: true
      },
      {
        name: "Max Loss",
        selector: row => row.maxLoss,
        sortable: true
      },
      {
        name: "Lots Multiplier",
        selector: row => row.lotsMultiplier,
        sortable: true
      },
      {
        name: "Total P&L",
        selector: row => row.totalPnl,
        sortable: true,
        cell: (row) => (
          <span className={row.totalPnl >= 0 ? "has-text-success has-text-weight-bold" : "has-text-danger has-text-weight-bold"}>{row.totalPnl}</span>
        ),
      },
      {
        name: "Delete",
        cell: (row) => (
          <button
            className="button is-danger"
            onClick={() => this.props.deleteStrategy(row.id)}
          >
            <FaTrash />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      }
    ];

    return (
      <div>
        <div className="card m-2">
          <header className="card-header has-text-centered">
            <h5 className="card-header-title">STRATEGIES</h5>
          </header>

          <section className="card-content overflow-auto">
            <form onSubmit={this.handleAdd}>
              <div className="grid">
                <div className="cell">
                  <div className="field mb-3">
                    <div className="control">
                      <label htmlFor="account" className="label is-size-7">Account:</label>
                      {/* <div className="select is-small is-fullwidth is-multiple is-primary"> */}
                      <div className="select is-small is-fullwidth is-primary">
                        <select
                          // multiple
                          id="account"
                          name="account"
                          onChange={this.handleEdit}
                          className="input is-primary"
                        >
                          <option value="" selected={!this.props.accounts.map(acc => acc.name).includes(this.state.account)}>-----</option>
                          {
                            this.props.accounts.map((acc, i) => (
                              // <option key={i} selected={this.state.accounts.includes(acc.name)} value={acc.name}>{acc.name}</option>
                              <option key={i} selected={this.state.account === acc.name} value={acc.name}>{acc.name}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cell">
                  <div className="field mb-3">
                    <label htmlFor="name" className="label is-size-7">Name:</label>
                    <div className="control">
                      <input
                        id="name"
                        name="name"
                        placeholder="Name"
                        value={this.state.name}
                        onChange={this.handleEdit}
                        className="input is-small is-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="cell">
                  <div className="field mb-3">
                    <label htmlFor="max-loss" className="label is-size-7">Max Loss:</label>
                    <div className="control">
                      <input
                        id="max-loss"
                        type="number"
                        name="maxLoss"
                        placeholder="Max Loss"
                        value={this.state.maxLoss}
                        onChange={this.handleEdit}
                        className="input is-small is-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="cell">
                  <div className="field mb-3">
                    <label htmlFor="lots-multiplier" className="label is-size-7">Lots Multiplier:</label>
                    <div className="control">
                      <input
                        type="number"
                        id="lots-multiplier"
                        name="lotsMultiplier"
                        onChange={this.handleEdit}
                        placeholder="Lots Multiplier"
                        value={this.state.lotsMultiplier}
                        className="input is-small is-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="cell">
                  <button onClick={this.handleAdd} className="button is-primary is-fullwidth mt-3">Add</button>
                </div>
              </div>
            </form>

            <DataTable
              striped
              pagination
              highlightOnHover
              columns={columns}
              customStyles={customStyles}
              data={this.props.strategies}
              // selectableRows
            >
            </DataTable>
          </section>

          <footer className="card-footer">
            <a
              download
              target="_blank"
              rel="noreferrer"
              className="button is-info card-footer-item"
              href={`${this.URL}/api/strategies/export/?access-token=${localStorage.getItem('jwt-token')}`}
            >
              Export
            </a>
            <div className="file is-primary card-footer-item p-0">
              <label className="file-label">
                <input
                  type="file"
                  accept=".json"
                  name="strategiesFile"
                  className="file-input"
                  onChange={this.handleImport}
                  id="import-strategies-button"
                />

                <span className="file-cta">
                  <span className="file-label has-text-weight-semibold">Import</span>
                </span>
              </label>
            </div>
          </footer>
        </div>
      </div>
    );
  }
}

export default Strategies;