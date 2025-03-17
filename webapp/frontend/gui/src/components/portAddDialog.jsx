import { Component } from "react";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";

class Input extends Component {
  render() {
    let displayName = this.props.displayName === undefined ? this.props.name.toUpperCase() : this.props.displayName

    return (
      <>
        <label htmlFor={this.props.name} className="label is-size-7">{displayName}:</label>
        <input
          type={this.props.type}
          step={this.props.step}
          name={this.props.name}
          value={this.props.value}
          disabled={this.props.disabled}
          onChange={this.props.handleEdit}
          className="input is-small is-primary"
          placeholder={this.props.name.toUpperCase()}
        />
      </>
    );
  }
}

class Select extends Component {
  render() {
    let displayName = this.props.displayName === undefined ? this.props.name.toUpperCase() : this.props.displayName

    return (
      <>
        <label htmlFor={this.props.name} className="label is-size-7">{displayName}:</label>
        <div className="control">
          <div className="select is-small is-fullwidth is-primary">
            <select
              id={this.props.name}
              name={this.props.name}
              onChange={this.props.handleEdit}
            >
              <option value="" selected={!this.props.values.includes(this.props.curValue)}>-----</option>
              {
                this.props.values.map(val => (
                  <option selected={val === this.props.curValue} value={val}>{val}</option>
                ))
              }
            </select>
          </div>
        </div>
      </>
    );
  }
}

class PortAddDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      strategyName: "",
      name: "",

      scrip: "NIFTY",
      scripType: "INDEX",
      startTime: "09:15",
      stopTime: "15:30",
      squareoffTime: "15:20",
      combinedSL: 0,
      combinedTarget: 0,
      toReExecute: "No",
      tradingMode: "Paper",

      lots: 1,
      insType: "FUT",
      strikeDistance: 0,
      expiry: "2024-01-01",
      tradeType: "BUY",
      orderType: "MARKET",
      limitPct: 0,
      numModifications: 0,
      modificationWaitTime: 0,
      slOn: "UNDERLYING",
      sl: 0,
      target: 0,
    }

    this.legs = []
  }

  componentDidMount() {
    let localStorageState = localStorage.getItem("execution-platform-port-inputs");

    if (localStorageState === undefined || localStorageState === null || localStorageState === "") {
      let stateToSave = JSON.stringify(this.state);
      localStorage.setItem("execution-platform-port-inputs", stateToSave);

    } else {
      localStorageState = JSON.parse(localStorageState);
      this.setState(localStorageState);
    }

    this.props.getStrategies();
    // this.props.getExpiries(this.state.scrip, this.state.insType);
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
      localStorage.setItem("execution-platform-port-inputs", stateToSave);

      if ((name === "scrip") || (name === "insType")) {
        this.refreshExpiries();
      }
    });
  }

  handleAdd = async () => {
    await this.props.addPort({ ...this.state, legs: this.legs });
    this.props.close();
  }

  handleAddLeg = async e => {
    e.preventDefault();

    this.legs.push({
      lots: this.state.lots,
      insType: this.state.insType,
      strikeDistance: ["CE", "PE"].includes(this.state.insType) ? this.state.strikeDistance : 0,
      expiry: this.state.expiry,
      tradeType: this.state.tradeType,
      orderType: this.state.orderType,
      limitPct: this.state.orderType === "LIMIT" ? this.state.limitPct : 0,
      numModifications: this.state.orderType === "LIMIT" ? this.state.numModifications : 0,
      modificationWaitTime: this.state.orderType === "LIMIT" ? this.state.modificationWaitTime : 0,
      slOn: this.state.slOn,
      sl: this.state.sl,
      target: this.state.target
    });
  }

  deleteLeg = async leg => {
    // let legsToDelete = [];

    // for (let i=0; i < this.legs.length; i++) {
    //   if (this.legs[i].name === name) {
    //     legsToDelete.push(i);
    //   }
    // }

    // legsToDelete.forEach(j => {
    //   this.legs.splice(j, 1);
    // });

    const idx = this.legs.indexOf(leg);
    console.log(idx);
    this.legs.splice(idx, 1);
  }

  refreshExpiries = () => {
    // e.preventDefault();
    this.props.getExpiries(this.state.scrip, this.state.insType);
  }

  render() {
    return (
      <div className={this.props.isOpen ? "modal is-active" : "modal"}>
        <div className="modal-background" onClick={this.props.close}></div>

        <div className="modal-card full-width">
          <header className="modal-card-head">
            <h5 className="modal-card-title">Add a new Port</h5>
            <button className="delete" onClick={this.props.close}></button>
          </header>

          <section className="modal-card-body">
            <form onSubmit={this.handleAdd}>
              <div className="grid">
                <div className="cell">
                  <Select
                    name="strategyName"
                    displayName="STRATEGY-NAME"
                    handleEdit={this.handleEdit}
                    curValue={this.state.strategyName}
                    values={this.props.strategies.map(x => x.name)}
                  />
                </div>

                <div className="cell">
                  <Input
                    name="name"
                    value={this.state.name}
                    handleEdit={this.handleEdit}
                  />
                </div>

                <div className="cell">
                  <Select
                    name="scrip"
                    curValue={this.state.scrip}
                    handleEdit={this.handleEdit}
                    values={["NIFTY", "BANKNIFTY", "FINNIFTY", "CRUDEOIL", "NATURALGAS"]}
                  />
                </div>

                <div className="cell">
                  <Select
                    name="scripType"
                    displayName="SCRIP-TYPE"
                    values={["INDEX", "FUT"]}
                    handleEdit={this.handleEdit}
                    curValue={this.state.scripType}
                  />
                </div>

                <div className="cell">
                  <Input
                    step="60"
                    type="time"
                    name="startTime"
                    displayName="START-TIME"
                    value={this.state.startTime}
                    handleEdit={this.handleEdit}
                  />
                </div>

                <div className="cell">
                  <Input
                    step="60"
                    type="time"
                    name="stopTime"
                    displayName="STOP-TIME"
                    value={this.state.stopTime}
                    handleEdit={this.handleEdit}
                  />
                </div>

                <div className="cell">
                  <Input
                    step="60"
                    type="time"
                    name="squareoffTime"
                    displayName="SQUAREOFF-TIME"
                    handleEdit={this.handleEdit}
                    value={this.state.squareoffTime}
                  />
                </div>

                <div className="cell">
                  <Input
                    type="number"
                    name="combinedSL"
                    displayName="Combined-SL"
                    handleEdit={this.handleEdit}
                    value={this.state.combinedSL}
                  />
                </div>

                <div className="cell">
                  <Input
                    type="number"
                    name="combinedTarget"
                    handleEdit={this.handleEdit}
                    displayName="Combined-Target"
                    value={this.state.combinedTarget}
                  />
                </div>

                <div className="cell">
                  <Select
                    name="toReExecute"
                    values={["Yes", "No"]}
                    displayName="To Re-Execute"
                    handleEdit={this.handleEdit}
                    curValue={this.state.toReExecute}
                  />
                </div>

                <div className="cell">
                  <Select
                    name="tradingMode"
                    displayName="TRADING-MODE"
                    values={["Paper", "Live"]}
                    handleEdit={this.handleEdit}
                    curValue={this.state.tradingMode}
                  />
                </div>
              </div>

              <hr />

              <h5 className="is-size-5 mb-3">Add Legs</h5>

              <div className="grid">
                <div className="cell">
                  <Input
                    name="lots"
                    type="number"
                    value={this.state.lots}
                    handleEdit={this.handleEdit}
                  />
                </div>
                <div className="cell">
                  <Select
                    name="insType"
                    displayName="INS-TYPE"
                    values={["FUT", "CE", "PE"]}
                    handleEdit={this.handleEdit}
                    curValue={this.state.insType}
                  />
                </div>
                <div className="cell">
                  <Input
                    type="number"
                    name="strikeDistance"
                    handleEdit={this.handleEdit}
                    displayName="STRIKE-DISTANCE"
                    value={this.state.strikeDistance}
                    disabled={this.state.insType === "FUT"}
                  />
                </div>
                <div className="cell">
                  <label htmlFor="expiry" className="label is-size-7">EXPIRY:</label>
                  {/* <div className="field has-addons"> */}
                  <div className="control">
                    <div className="select is-small is-fullwidth is-primary">
                      <select
                        id="expiry"
                        name="expiry"
                        value={this.state.expiry}
                        onChange={this.handleEdit}
                      >
                        <option value="" selected={!Object.values(this.props.expiries).includes(this.state.expiry)}>-----</option>
                        {
                          Object.keys(this.props.expiries).map(n => (
                            <option value={this.props.expiries[n]}>{n} ({this.props.expiries[n]})</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                    {/* <div className="control">
                      <button className="button is-info" onClick={this.refreshExpiries}><FaSearch /></button>
                    </div>
                  </div> */}
                </div>
                <div className="cell">
                  <Select
                    name="tradeType"
                    displayName="TRADE-TYPE"
                    values={["BUY", "SELL"]}
                    handleEdit={this.handleEdit}
                    curValue={this.state.tradeType}
                  />
                </div>
                <div className="cell">
                  <Select
                    name="orderType"
                    displayName="ORDER-TYPE"
                    values={["MARKET", "LIMIT"]}
                    handleEdit={this.handleEdit}
                    curValue={this.state.orderType}
                  />
                </div>
                <div className="cell">
                  <Input
                    type="number"
                    name="limitPct"
                    displayName="Limit %"
                    value={this.state.limitPct}
                    handleEdit={this.handleEdit}
                    disabled={this.state.orderType !== "LIMIT"}
                  />
                </div>
                <div className="cell">
                  <Input
                    type="number"
                    name="numModifications"
                    handleEdit={this.handleEdit}
                    displayName="No. of Modifications"
                    value={this.state.numModifications}
                    disabled={this.state.orderType !== "LIMIT"}
                  />
                </div>
                <div className="cell">
                  <Input
                    type="number"
                    name="modificationWaitTime"
                    handleEdit={this.handleEdit}
                    displayName="Modification Wait Time"
                    value={this.state.modificationWaitTime}
                    disabled={this.state.orderType !== "LIMIT"}
                  />
                </div>
                <div className="cell">
                  <Select
                    name="slOn"
                    displayName="SL-ON"
                    curValue={this.state.slOn}
                    handleEdit={this.handleEdit}
                    values={["UNDERLYING", "PREMIUM"]}
                  />
                </div>
                <div className="cell">
                  <Input
                    name="sl"
                    value={this.state.sl}
                    handleEdit={this.handleEdit}
                  />
                </div>
                <div className="cell">
                  <Input
                    name="target"
                    value={this.state.target}
                    handleEdit={this.handleEdit}
                  />
                </div>
                <div className="cell has-text-centered pt-3">
                  <button onClick={this.handleAddLeg} className="button is-warning is-rounded is-outlined py-3"><FaPlus /></button>
                </div>
              </div>
            </form>

            <hr />

            <table className="table is-striped is-hoverable is-fullwidth has-text-centered">
              <thead>
                <tr>
                  <th align="center">ID</th>
                  <th align="center">Name</th>
                  <th align="center">IT</th>
                  <th align="center">Str. Dis.</th>
                  <th align="center">Expiry</th>
                  <th align="center">TT</th>
                  <th align="center">OT</th>
                  <th align="center">Limit %</th>
                  <th align="center">Num Mod.</th>
                  <th align="center">Mod. WT</th>
                  <th align="center">SL On</th>
                  <th align="center">SL</th>
                  <th align="center">Target</th>
                  <th align="center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.legs.map((leg, n) => (
                    <tr key={n+1}>
                      <td>{n+1}</td>
                      <td>{leg.name}</td>
                      <td>{leg.insType}</td>
                      <td>{leg.strikeDistance}</td>
                      <td>{leg.expiry}</td>
                      <td>{leg.tradeType}</td>
                      <td>{leg.orderType}</td>
                      <td>{leg.limitPct}</td>
                      <td>{leg.numModifications}</td>
                      <td>{leg.modificationWaitTime}</td>
                      <td>{leg.slOn}</td>
                      <td>{leg.sl}</td>
                      <td>{leg.target}</td>
                      <td><button className="button is-small is-danger" onClick={() => this.deleteLeg(leg)}><FaTrash /></button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </section>

          <footer className="modal-card-foot">
            <button onClick={this.handleAdd} className="button is-primary">Add</button>
            <button onClick={this.props.close} className="button is-danger mx-2">Cancel</button>
          </footer>
        </div>
      </div>
    );
  }
}

export default PortAddDialog;