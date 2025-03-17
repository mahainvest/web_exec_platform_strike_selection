import { Component } from "react";

import PortLogs from "./portLogs.jsx";
import { GrClose } from "react-icons/gr";
import PortInfoBox from "./portInfoBox.jsx";
import PortOrderbook from "./portOrderbook.jsx";
import PortAddDialog from "./portAddDialog.jsx";
import DataTable from "react-data-table-component";
import { FaCode, FaBook, FaInfo, FaTrash, FaPlay, FaPause, FaPen, FaExclamation, FaExternalLinkAlt } from "react-icons/fa";

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

class Ports extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPort: {logs: [], orders: [], legs: []},

      addDialogOpen: false,
      editDialogOpen: false,
      isLogsOpen: false,
      isOrderbookOpen: false,
      isInfoBoxOpen: false
    }

    this.updateIntervalID = null;
    this.URL = process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";
  }

  componentDidMount() {
    var intervalId = setInterval(this.props.getPorts, 1000);
    this.updateIntervalID = intervalId;
  }

  componentWillUnmount() {
    clearInterval(this.updateIntervalID);
    this.updateIntervalID = null;
  }

  openAddDialog = () => {
    this.setState(prevState => {
      const newState = { ...prevState };
      newState.addDialogOpen = true;
      return newState;
    });
  }

  closeAddDialog = () => {
    this.setState(prevState => {
      const newState = { ...prevState };
      newState.addDialogOpen = false;
      return newState;
    });
  }

  openLogs = port => {
    this.setState({
      isLogsOpen: true,
      selectedPort: port
    });
  }

  closeLogs = () => {
    this.setState({
      isLogsOpen: false
    });
  }

  openOrderbook = port => {
    this.setState({
      isOrderbookOpen: true,
      selectedPort: port
    });
  }

  closeOrderbook = port => {
    this.setState({
      isOrderbookOpen: false
    });
  }

  openInfoBox = port => {
    this.setState({
      isInfoBoxOpen: true,
      selectedPort: port
    });
  }

  closeInfoBox = () => {
    this.setState({
      isInfoBoxOpen: false
    });
  }

  openEditDialog = port => {
    this.setState({
      editDialogOpen: true,
      selectedPort: port
    });
  }

  closeEditDialog = () => {
    this.setState({
      editDialogOpen: false
    });
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
      localStorage.setItem("execution-platform-ports-input", stateToSave);
    });
  }

  handleImport = e => {
    const file = e.target.files[0];

    let formData = new FormData();
    formData.append("file", file);

    this.props.importPorts(formData);

    document.getElementById("import-ports-button").value = null;
  }

  render() {
    const columns = [
      {
        name: "ID",
        selector: row => row.id,
        sortable: true
      },
      {
        name: "Name",
        selector: row => row.name,
        sortable: true
      },
      {
        name: "Strategy",
        selector: row => row.strategyName,
        sortable: true
      },
      {
        name: "Scrip",
        selector: row => row.scrip,
        sortable: true
      },
      {
        name: "Running P&L",
        selector: row => row.runningPnl,
        sortable: true,
        cell: (row) => (
          <span className={row.runningPnl >= 0 ? "has-text-success has-text-weight-bold" : "has-text-danger has-text-weight-bold"}>{row.runningPnl}</span>
        ),
      },
      {
        name: "Booked P&L",
        selector: row => row.bookedPnl,
        sortable: true,
        cell: (row) => (
          <span className={row.bookedPnl >= 0 ? "has-text-success has-text-weight-bold" : "has-text-danger has-text-weight-bold"}>{row.bookedPnl}</span>
        ),
      },
      {
        name: "Logs",
        cell: (row) => (
          <button
            className="button is-dark"
            onClick={() => this.openLogs(row)}
          >
            <FaCode />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Orders",
        cell: (row) => (
          <button
            className="button is-primary"
            onClick={() => this.openOrderbook(row)}
          >
            <FaBook />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Execute",
        cell: (row) => (
          <button
            className="button is-success is-inverted"
            onClick={() => this.props.executePort(row.id)}
          >
            <FaExternalLinkAlt />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Squareoff",
        cell: (row) => (
          <button
            className="button is-danger is-inverted"
            onClick={() => this.props.squareoffPort(row.id)}
          >
            <GrClose />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Info Box",
        cell: (row) => (
          <button
            className="button is-info"
            onClick={() => this.openInfoBox(row)}
          >
            <FaInfo />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Resume/Pause",
        cell: (row) => {
          if (!row.stopButton) {
            return (
              <button
                className="button is-success"
                onClick={() => this.props.stopPort(row.id)}
              >
                <FaPause />
              </button>
            );
          } else {
            return (
              <button
                className="button is-danger"
                onClick={() => this.props.startPort(row.id)}
              >
                <FaPlay />
              </button>
            );
          }
        },
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Edit",
        cell: (row) => (
          <button
            className="button is-warning"
            onClick={() => this.openEditDialog(row)}
          >
            <FaPen />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      {
        name: "Delete",
        cell: (row) => (
          <button
            className="button is-danger"
            onClick={() => this.props.deletePort(row.id)}
          >
            <FaTrash />
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      },
      // {
      //   name: "Rejection",
      //   cell: (row) => {
      //     if (row.rejection) {
      //       return (
      //         <button
      //           onClick={() => this.openRejection(row.id)}
      //           className="button is-inverted is-rounded is-danger is-small"
      //         >
      //           <FaExclamation />
      //         </button>
      //       );
      //     } else {
      //       return null;
      //     }
      //   },
      //   ignoreRowClick: true,
      //   allowOverflow: true,
      //   button: true
      // },
    ];

    return (
      <div>
        <div className="card m-2">
          <header className="card-header has-text-centered">
            <h5 className="card-header-title">PORTS</h5>
          </header>

          <section className="card-content overflow-auto">
            <DataTable
              striped
              pagination
              highlightOnHover
              columns={columns}
              data={this.props.ports}
              customStyles={customStyles}
              // selectableRows
            />
          </section>

          <footer className="card-footer">
            <button onClick={this.openAddDialog} className="button is-success card-footer-item">Add</button>
            <a
              download
              target="_blank"
              rel="noreferrer"
              className="button is-info card-footer-item"
              href={`${this.URL}/api/ports/export/?access-token=${localStorage.getItem('jwt-token')}`}
            >
              Export
            </a>
            <div className="file is-primary card-footer-item p-0">
              <label className="file-label">
                <input
                  type="file"
                  accept=".json"
                  name="portsFile"
                  className="file-input"
                  id="import-ports-button"
                  onChange={this.handleImport}
                />

                <span className="file-cta">
                  <span className="file-label has-text-weight-semibold">Import</span>
                </span>
              </label>
            </div>
          </footer>
        </div>

        <PortAddDialog
          close={this.closeAddDialog}
          addPort={this.props.addPort}
          isOpen={this.state.addDialogOpen}

          accounts={this.props.accounts}
          getAccounts={this.props.getAccounts}
          strategies={this.props.strategies}
          getStrategies={this.props.getStrategies}
          expiries={this.props.expiries}
          getExpiries={this.props.getExpiries}
        />

        <PortInfoBox
          close={this.closeInfoBox}
          port={this.state.selectedPort}
          isOpen={this.state.isInfoBoxOpen}
        />

        <PortLogs
          close={this.closeLogs}
          port={this.state.selectedPort}
          isOpen={this.state.isLogsOpen}
        />

        <PortOrderbook
          close={this.closeOrderbook}
          port={this.state.selectedPort}
          isOpen={this.state.isOrderbookOpen}
        />
      </div>
    );
  }
}

export default Ports;